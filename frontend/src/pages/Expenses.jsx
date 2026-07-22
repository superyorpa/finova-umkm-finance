import { useState, useEffect } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import api from "../services/api";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Wallet, 
  X,
  AlertCircle,
  Loader2
} from "lucide-react";

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  
  const [formData, setFormData] = useState({
    category: "Operational",
    description: "",
    amount: "",
    payment_method: "Cash"
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState(null);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await api.get("/expenses");
      setExpenses(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const showNotification = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleOpenModal = (expense = null) => {
    setError("");
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        category: expense.category || "Operational",
        description: expense.description || "",
        amount: expense.amount || "",
        payment_method: expense.payment_method || "Cash"
      });
    } else {
      setEditingExpense(null);
      setFormData({
        category: "Operational",
        description: "",
        amount: "",
        payment_method: "Cash"
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (!formData.category) {
      setError("Category required");
      setIsSubmitting(false);
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      setError("Amount must be greater than 0");
      setIsSubmitting(false);
      return;
    }
    if (!formData.payment_method) {
      setError("Payment method required");
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount)
      };

      if (editingExpense) {
        await api.put(`/expenses/${editingExpense.id}`, payload);
        showNotification("Expense updated successfully");
      } else {
        await api.post("/expenses", payload);
        showNotification("Expense created successfully");
      }
      fetchExpenses();
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
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses(expenses.filter(e => e.id !== id));
      showNotification("Expense deleted successfully");
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to delete expense";
      setError(errMsg);
      showNotification(errMsg, "error");
    }
  };

  const filteredExpenses = expenses.filter(e => 
    e.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.description && e.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          <h1 className="text-3xl font-bold text-[#161b19]">Expense Management</h1>
          <p className="text-gray-500 mt-1">Track your business operational expenses</p>
        </div>
      </div>

      {notification && (
        <div className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-center gap-3 ${notification.type === "error" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}>
          {notification.type === "error" ? <AlertCircle size={20} /> : <Wallet size={20} />}
          {notification.msg}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search expenses by category or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-[#047857] transition"
          />
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#047857] hover:bg-[#056b4f] text-white px-5 py-2.5 rounded-xl font-semibold transition"
        >
          <Plus size={20} />
          Add Expense
        </button>
      </div>

      <div className="bg-white border border-[#dce5df] rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="font-medium">Loading expenses...</p>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400">
            <Wallet size={60} className="mb-4 opacity-20" />
            <p className="text-lg font-bold text-gray-600">No expenses yet</p>
            <p className="text-sm mb-6">Start recording your business expenses</p>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-[#047857] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#056b4f] transition"
            >
              <Plus size={20} />
              Add Expense
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f5f7f6] border-b border-[#dce5df]">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Payment Method</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dce5df]">
                {filteredExpenses.map((exp) => {
                  const dateStr = new Date(exp.created_at || exp.expense_date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  });

                  return (
                    <tr key={exp.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-semibold text-[#161b19]">
                          {exp.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {exp.description || "-"}
                      </td>
                      <td className="px-6 py-4 font-bold text-rose-600">
                        {formatRupiah(exp.amount)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2.5 py-1 bg-emerald-50 text-[#047857] rounded-lg text-xs font-semibold">
                          {exp.payment_method || "Cash"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {dateStr}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => handleOpenModal(exp)}
                            className="p-2 text-gray-400 hover:text-[#047857] hover:bg-emerald-50 rounded-lg transition"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(exp.id)}
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
          </div>
        )}
      </div>

      {/* Modal Add/Edit Expense */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-[#dce5df] flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#161b19]">
                {editingExpense ? "Edit Expense" : "Add New Expense"}
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
              
              <div>
                <label className="block text-sm font-semibold mb-2">Category</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl py-2.5 px-4 outline-none focus:border-[#047857] transition bg-white"
                >
                  <option value="Operational">Operational</option>
                  <option value="Inventory">Inventory</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl py-2.5 px-4 outline-none focus:border-[#047857] transition"
                  placeholder="e.g. Buy coffee beans"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Amount (Rp)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl py-2.5 px-4 outline-none focus:border-[#047857] transition"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Payment Method</label>
                <select
                  required
                  value={formData.payment_method}
                  onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl py-2.5 px-4 outline-none focus:border-[#047857] transition bg-white"
                >
                  <option value="Cash">Cash</option>
                  <option value="QRIS">QRIS</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
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
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (editingExpense ? "Save Changes" : "Create Expense")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default Expenses;
