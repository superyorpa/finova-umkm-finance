import { useState, useEffect } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import api from "../services/api";
import { 
  Plus, 
  Search, 
  Trash2, 
  Receipt, 
  X,
  AlertCircle,
  Loader2,
  Edit2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown
} from "lucide-react";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  
  const [formData, setFormData] = useState({
    items: [{ product_id: "", quantity: 1 }],
    payment_method: "Cash",
    date: new Date().toISOString().split("T")[0]
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("Today");
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [notification, setNotification] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [txRes, prodRes] = await Promise.all([
        api.get("/transactions"),
        api.get("/products")
      ]);
      setTransactions(txRes.data);
      setProducts(prodRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showNotification = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleOpenModal = (tx = null) => {
    setError("");
    if (tx) {
      setEditingTransaction(tx);
      setFormData({
        items: tx.transaction_details.map(d => ({ product_id: d.product_id, quantity: d.quantity })),
        payment_method: tx.payment_method || "Cash",
        date: tx.transaction_date ? new Date(tx.transaction_date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]
      });
    } else {
      setEditingTransaction(null);
      setFormData({
        items: [{ product_id: products.length > 0 ? products[0].id : "", quantity: 1 }],
        payment_method: "Cash",
        date: new Date().toISOString().split("T")[0]
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
    setError("");
  };

  const addRow = () => {
    setFormData({ ...formData, items: [...formData.items, { product_id: products[0]?.id || "", quantity: 1 }] });
  };

  const removeRow = (index) => {
    if (formData.items.length > 1) {
      setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });
    }
  };

  const calculatedTotal = formData.items.reduce((sum, item) => {
    const product = products.find(p => String(p.id) === String(item.product_id));
    return sum + (product ? Number(product.price) * Number(item.quantity || 0) : 0);
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // Validate items
    for (const item of formData.items) {
        if (!item.product_id || Number(item.quantity) <= 0) {
            setError("Please select product and valid quantity for all items");
            setIsSubmitting(false);
            return;
        }
        const product = products.find(p => String(p.id) === String(item.product_id));
        if (product && Number(item.quantity) > Number(product.stock)) {
            setError(`Stock for ${product.name} cannot exceed ${product.stock}`);
            setIsSubmitting(false);
            return;
        }
    }

    try {
      const payload = {
        items: formData.items.map(item => ({
            product_id: Number(item.product_id),
            quantity: Number(item.quantity)
        })),
        payment_method: formData.payment_method,
        date: formData.date
      };

      if (editingTransaction) {
        // Edit only supports payment method and date for now as per backend
        await api.put(`/transactions/${editingTransaction.id}`, {
            payment_method: formData.payment_method,
            date: formData.date
        });
        showNotification("Transaction updated successfully");
      } else {
        await api.post("/transactions", payload);
        showNotification("Transaction created successfully");
      }
      fetchData();
      handleCloseModal();
    } catch (err) {
      const errMsg = err.response?.data?.message || "Something went wrong";
      setError(errMsg);
      showNotification(errMsg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;
    
    try {
      await api.delete(`/transactions/${id}`);
      setTransactions(transactions.filter(t => t.id !== id));
      showNotification("Transaction deleted successfully");
      fetchData(); // refresh products stock
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to delete transaction";
      setError(errMsg);
      showNotification(errMsg, "error");
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const detail = t.transaction_details?.[0];
    const productName = detail?.products?.name || "";
    const matchesSearch = productName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtering logic
    const txDate = new Date(t.transaction_date || t.created_at);
    txDate.setHours(0, 0, 0, 0); // Reset time for accurate date comparison
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    let matchesFilter = true;
    if (filterType === "Today") {
      matchesFilter = txDate.getTime() === now.getTime();
    } else if (filterType === "This Week") {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
      const startOfWeek = new Date(now);
      startOfWeek.setDate(diff);
      matchesFilter = txDate >= startOfWeek;
    } else if (filterType === "This Month") {
      matchesFilter = txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    } else if (filterType === "Custom") {
      if (customStartDate && customEndDate) {
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        matchesFilter = txDate >= start && txDate <= end;
      }
    }
    
    return matchesSearch && matchesFilter;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortConfig.key === 'date') {
        const dateA = new Date(a.transaction_date || a.created_at);
        const dateB = new Date(b.transaction_date || b.created_at);
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortConfig.key === 'total') {
        return sortConfig.direction === 'asc' ? a.total - b.total : b.total - a.total;
    }
    return 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = sortedTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const truncate = (str, n) => (str.length > n ? str.substr(0, n - 1) + "..." : str);
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(amount);
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <ChevronsUpDown size={14} className="text-gray-400" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#161b19]">Transaction Management</h1>
          <p className="text-gray-500 mt-1">Manage your business transactions</p>
        </div>
      </div>

      {notification && (
        <div className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-center gap-3 ${notification.type === "error" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}>
          {notification.type === "error" ? <AlertCircle size={20} /> : <Receipt size={20} />}
          {notification.msg}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search transactions by product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-[#047857] transition"
          />
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
          <div className="flex gap-2 w-full md:w-auto">
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#047857] transition bg-white w-full"
            >
              {["All", "Today", "This Week", "This Month", "Custom"].map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            
            {filterType === "Custom" && (
              <div className="flex gap-2 items-center">
                <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm" />
                <span className="text-gray-500 text-sm">to</span>
                <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm" />
              </div>
            )}
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#047857] hover:bg-[#056b4f] text-white px-5 py-2.5 rounded-xl font-semibold transition"
          >
            <Plus size={20} />
            Add Transaction
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#dce5df] rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="font-medium">Loading transactions...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400">
            <Receipt size={60} className="mb-4 opacity-20" />
            <p className="text-lg font-bold text-gray-600">No transactions yet</p>
            <p className="text-sm mb-6">Start recording your first sale</p>
            <button
              onClick={handleOpenModal}
              className="flex items-center gap-2 bg-[#047857] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#056b4f] transition"
            >
              <Plus size={20} />
              Add Transaction
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f5f7f6] border-b border-[#dce5df]">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-[#047857] flex items-center gap-1" onClick={() => handleSort('total')}>
                    Total Price <SortIcon columnKey="total" />
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Payment Method</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-[#047857] flex items-center gap-1" onClick={() => handleSort('date')}>
                    Date <SortIcon columnKey="date" />
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dce5df]">
                {currentTransactions.map((tx) => {
                  const details = tx.transaction_details || [];

  const productNames = details
    .map((d) => d.products?.name)
    .filter(Boolean)
    .join(", ");

  const categories = details
    .map((d) => d.products?.category)
    .filter(Boolean)
    .filter((value, index, self) => self.indexOf(value) === index)
    .join(", ");

  const totalQuantity = details.reduce(
    (sum, d) => sum + Number(d.quantity || 0),
    0
  );

  const dateStr = new Date(tx.transaction_date || tx.created_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

                  return (
                    <tr key={tx.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#161b19]" title={productNames}>
                          {truncate(productNames || "Unknown Product", 30)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {truncate(categories, 30)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-semibold">
  {totalQuantity} pcs
</td>
                      <td className="px-6 py-4 font-bold text-[#047857]">
                        {formatRupiah(tx.total)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2.5 py-1 bg-emerald-50 text-[#047857] rounded-lg text-xs font-semibold">
                          {tx.payment_method || "Cash"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {dateStr}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => handleOpenModal(tx)}
                            className="p-2 text-gray-400 hover:text-[#047857] hover:bg-emerald-50 rounded-lg transition"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(tx.id)}
                            className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {filteredTransactions.length > itemsPerPage && (
              <div className="px-6 py-4 border-t border-[#dce5df] flex justify-between items-center bg-gray-50">
                <button
                  onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-xl font-semibold bg-white disabled:opacity-50 hover:bg-gray-50 transition text-sm"
                >
                  Previous
                </button>
                <span className="text-sm font-semibold">Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-xl font-semibold bg-white disabled:opacity-50 hover:bg-gray-50 transition text-sm"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Add Transaction */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-[#dce5df] flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#161b19]">
                {editingTransaction ? "Edit Transaction" : "Add New Transaction"}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-[#161b19] transition">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
              
              {formData.items.map((item, index) => (
                <div key={index} className="flex items-end gap-2 border-b border-gray-100 pb-4 mb-2">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold mb-2">Product</label>
                    <select
                      required
                      value={item.product_id}
                      onChange={(e) => {
                        const newItems = [...formData.items];
                        newItems[index].product_id = e.target.value;
                        setFormData({...formData, items: newItems});
                      }}
                      className="w-full border border-gray-200 rounded-xl py-2.5 px-4 outline-none focus:border-[#047857] transition bg-white"
                    >
                      <option value="" disabled>Select product...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({formatRupiah(p.price)}) - Stock: {p.stock} pcs
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24">
                    <label className="block text-sm font-semibold mb-2">Qty</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={item.quantity}
                      onChange={(e) => {
                        const newItems = [...formData.items];
                        newItems[index].quantity = e.target.value;
                        setFormData({...formData, items: newItems});
                      }}
                      className="w-full border border-gray-200 rounded-xl py-2.5 px-4 outline-none focus:border-[#047857] transition"
                      placeholder="1"
                    />
                  </div>
                  {formData.items.length > 1 && (
                    <button type="button" onClick={() => removeRow(index)} className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl">
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              ))}
              
              <button
                type="button"
                onClick={addRow}
                className="text-sm font-semibold text-[#047857] hover:underline"
              >
                + Add Product
              </button>

              <div>
                <label className="block text-sm font-semibold mb-2">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl py-2.5 px-4 outline-none focus:border-[#047857] transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Payment Method</label>
                <div className="flex gap-6 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-sm">
                    <input
                      type="radio"
                      name="payment_method"
                      value="Cash"
                      checked={formData.payment_method === "Cash"}
                      onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                      className="accent-[#047857]"
                    />
                    Cash
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-sm">
                    <input
                      type="radio"
                      name="payment_method"
                      value="QRIS"
                      checked={formData.payment_method === "QRIS"}
                      onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                      className="accent-[#047857]"
                    />
                    QRIS
                  </label>
                </div>
              </div>

              <div className="bg-[#f5f7f6] p-4 rounded-xl border border-gray-200 flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-600">Total Price:</span>
                <span className="text-xl font-bold text-[#047857]">{formatRupiah(calculatedTotal)}</span>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-[#047857] hover:bg-[#056b4f] text-white rounded-xl font-semibold transition disabled:opacity-50 flex items-center justify-center"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (editingTransaction ? "Save Changes" : "Create Transaction")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default Transactions;
