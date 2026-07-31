import { useState, useEffect } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import api from "../services/api";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Package, 
  X,
  AlertCircle,
  Loader2
} from "lucide-react";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    stock: ""
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [notification, setNotification] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/products");
      setProducts(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const showNotification = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        category: product.category || "",
        price: product.price,
        stock: product.stock
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        category: "",
        price: "",
        stock: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({
      name: "",
      category: "",
      price: "",
      stock: ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock)
      };
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
        showNotification("Product updated successfully");
      } else {
        await api.post("/products", payload);
        showNotification("Product created successfully");
      }
      fetchProducts();
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
      showNotification("Failed to save product", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter(p => p.id !== id));
      showNotification("Product deleted successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete product");
      showNotification("Failed to delete product", "error");
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: "Out of Stock", color: "text-red-500", dot: "bg-red-500" };
    if (stock <= 10) return { label: "Low Stock", color: "text-orange-500", dot: "bg-orange-500" };
    return { label: "Available", color: "text-green-500", dot: "bg-green-500" };
  };

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
          <h1 className="text-3xl font-bold text-[#161b19]">Product Management</h1>
          <p className="text-gray-500 mt-1">Manage your products, inventory, and pricing</p>
        </div>
      </div>

      {notification && (
        <div className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-center gap-3 ${notification.type === "error" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}>
          {notification.type === "error" ? <AlertCircle size={20} /> : <Package size={20} />}
          {notification.msg}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full border border-gray-300 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-[#047857] transition"
          />
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#047857] hover:bg-[#056b4f] text-white px-5 py-2.5 rounded-xl font-semibold transition"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      <div className="bg-white border border-[#dce5df] rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="font-medium">Loading your products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400">
            <Package size={60} className="mb-4 opacity-20" />
            <p className="text-lg font-bold text-gray-600">No products yet</p>
            <p className="text-sm mb-6">Start adding your first product</p>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-[#047857] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#056b4f] transition"
            >
              <Plus size={20} />
              Add Product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f5f7f6] border-b border-[#dce5df]">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Product Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dce5df]">
                {currentProducts.map((product) => {
                  const status = getStockStatus(product.stock);
                  return (
                  <tr key={product.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#161b19]">{product.name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-medium">
                        {product.category || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#161b19]">
                      {formatRupiah(product.price)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-[#161b19]">{product.stock} pcs</div>
                      <div className={`text-xs font-medium flex items-center gap-1.5 ${status.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                        {status.label}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleOpenModal(product)}
                          className="p-2 text-gray-400 hover:text-[#047857] hover:bg-emerald-50 rounded-lg transition"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>

            {filteredProducts.length > itemsPerPage && (
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-[#dce5df] flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#161b19]">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-[#161b19] transition">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              <div>
                <label className="block text-sm font-semibold mb-2">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl py-2.5 px-4 outline-none focus:border-[#047857] transition"
                  placeholder="e.g. Arabica Coffee Beans"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl py-2.5 px-4 outline-none focus:border-[#047857] transition"
                  placeholder="e.g. Raw Material"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Price (Rp)</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl py-2.5 px-4 outline-none focus:border-[#047857] transition"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Stock</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl py-2.5 px-4 outline-none focus:border-[#047857] transition"
                    placeholder="0"
                  />
                </div>
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
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (editingProduct ? "Save Changes" : "Create Product")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default Products;
