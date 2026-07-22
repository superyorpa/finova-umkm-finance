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
  Loader2
} from "lucide-react";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    product_id: "",
    quantity: 1,
    payment_method: "Cash"
  });

  const [searchTerm, setSearchTerm] = useState("");
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

  const handleOpenModal = () => {
    setError("");
    setFormData({
      product_id: products.length > 0 ? products[0].id : "",
      quantity: 1,
      payment_method: "Cash"
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setError("");
  };

  const selectedProduct = products.find(p => String(p.id) === String(formData.product_id));
  const calculatedTotal = selectedProduct ? Number(selectedProduct.price) * Number(formData.quantity || 0) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (!formData.product_id) {
      setError("Product is required");
      setIsSubmitting(false);
      return;
    }

    if (!formData.quantity || Number(formData.quantity) <= 0) {
      setError("Quantity must be greater than 0");
      setIsSubmitting(false);
      return;
    }

    if (selectedProduct && Number(formData.quantity) > Number(selectedProduct.stock)) {
      setError("Stock cannot exceed available stock");
      setIsSubmitting(false);
      return;
    }

    try {
      await api.post("/transactions", {
        product_id: Number(formData.product_id),
        quantity: Number(formData.quantity),
        payment_method: formData.payment_method
      });
      showNotification("Transaction created successfully");
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
    return productName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#161b19]">Transaction Management</h1>
          <p className="text-gray-500 mt-1">Manage your business sales transactions</p>
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
            placeholder="Search by product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-[#047857] transition"
          />
        </div>
        <button
          onClick={handleOpenModal}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#047857] hover:bg-[#056b4f] text-white px-5 py-2.5 rounded-xl font-semibold transition"
        >
          <Plus size={20} />
          Add Transaction
        </button>
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
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Total Price</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Payment Method</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dce5df]">
                {filteredTransactions.map((tx) => {
                  const detail = tx.transaction_details?.[0];
                  const product = detail?.products;
                  const dateStr = new Date(tx.created_at || tx.transaction_date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  });

                  return (
                    <tr key={tx.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#161b19]">{product?.name || "Unknown Product"}</div>
                        <div className="text-xs text-gray-400">{product?.category || ""}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-semibold">
                        {detail?.quantity || 0} pcs
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
                        <button 
                          onClick={() => handleDelete(tx.id)}
                          className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add Transaction */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-[#dce5df] flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#161b19]">Add New Transaction</h2>
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
              
              <div>
                <label className="block text-sm font-semibold mb-2">Product</label>
                <select
                  required
                  value={formData.product_id}
                  onChange={(e) => setFormData({...formData, product_id: e.target.value})}
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

              <div>
                <label className="block text-sm font-semibold mb-2">Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl py-2.5 px-4 outline-none focus:border-[#047857] transition"
                  placeholder="1"
                />
                {selectedProduct && (
                  <p className="text-xs text-gray-400 mt-1">Available stock: {selectedProduct.stock} pcs</p>
                )}
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

              {selectedProduct && (
                <div className="bg-[#f5f7f6] p-4 rounded-xl border border-gray-200 flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-600">Total Price:</span>
                  <span className="text-xl font-bold text-[#047857]">{formatRupiah(calculatedTotal)}</span>
                </div>
              )}
              
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
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Create Transaction"}
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
