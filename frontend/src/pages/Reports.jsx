import { useState, useEffect } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import api from "../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  Download, 
  Loader2, 
  AlertCircle 
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";

function Reports() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("Today");
  const [activeWeek, setActiveWeek] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return {
      value: d.toISOString().slice(0, 7),
      label: d.toLocaleString('id-ID', { month: 'long', year: 'numeric' })
    };
  });

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/reports/summary?month=${selectedMonth}`);
        setData(response.data);
      } catch (err) {
        setError("Failed to load reports");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [selectedMonth]);

  const formatRupiah = (amount) => {
    return "Rp " + new Intl.NumberFormat("id-ID").format(amount);
  };

  const formatYAxis = (value) => {
    if (value >= 1000000000) return (value / 1000000000).toFixed(1) + "B";
    if (value >= 1000000) return (value / 1000000).toFixed(1) + "M";
    if (value >= 1000) return (value / 1000).toFixed(0) + "k";
    return value;
  };

  const COLORS = ["#047857", "#c0392b", "#bdc3c7"];

  const handleDownload = () => {
    const isConfirmed = window.confirm("Apakah kamu yakin ingin download report ini?");
    if (isConfirmed) {
      const doc = new jsPDF();
      doc.text("Financial Performance Report", 14, 15);
      
      const revenue = data.revenue.actual;
      const expenses = data.expenses.actual;
      const profit = data.profit.actual;
      
      autoTable(doc, {
        startY: 25,
        head: [["Metrics", "Nominal (Rp)", "Kontribusi (%)"]],
        body: [
          ["Total Revenue", formatRupiah(revenue), "100%"],
          ["Total Expenses", formatRupiah(expenses), revenue ? ((expenses / revenue) * 100).toFixed(1) + "%" : "0%"],
          ["Net Profit", formatRupiah(profit), revenue ? ((profit / revenue) * 100).toFixed(1) + "%" : "0%"],
        ],
      });
      doc.save("financial-report.pdf");
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#161b19]">Financial Performance</h1>
        <p className="text-gray-500 mt-1">Review your business performance and spending analysis in IDR.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-[#047857]" size={48} />
          <p className="mt-4 text-gray-500">Loading reports...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="text-rose-500" size={48} />
          <p className="mt-4 text-rose-600 font-semibold">{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Grid Row: Ringkasan Pendapatan (left, 2 cols), Expenses by Category (right, 1 col) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ringkasan Pendapatan Card (2 Cols) */}
            <div className="lg:col-span-2 bg-white border border-[#dce5df] rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-[#161b19]">Income Summary</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {activeTab === "Today" ? "Today" : activeTab === "Weekly" ? "This Week" : "This Month"}
                  </p>
                </div>
                <div className="bg-gray-100 rounded-full p-1 flex">
                  {["Today", "Weekly", "Monthly"].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${activeTab === tab ? "bg-[#047857] text-white" : "text-gray-500 hover:text-gray-700"}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              
              {activeTab === "Today" ? (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500">Today's Total Income</p>
                  <h2 className="text-4xl font-bold my-2">{formatRupiah(data.summary.daily.total)}</h2>
                  <p className="text-sm text-gray-400">{data.summary.daily.count} Completed Orders</p>
                  {data.summary.daily.count === 0 && (
                    <div className="text-center py-6 text-gray-400 text-sm border-t border-gray-100 mt-4">
                      No completed orders to display yet.
                    </div>
                  )}
                </div>
              ) : activeTab === "Weekly" ? (
                <div>
                  <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    {data.weeklyDaily.map((w, i) => (
                      <button key={i} onClick={() => setActiveWeek(i)} className={`px-4 py-2 rounded-xl text-sm font-semibold border transition whitespace-nowrap ${activeWeek === i ? "bg-emerald-100 border-emerald-300 text-emerald-700" : "bg-white border-gray-200 text-gray-600"}`}>
                        {w.label}
                      </button>
                    ))}
                  </div>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.weeklyDaily[activeWeek].days}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} tickFormatter={formatYAxis} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#047857" radius={[6, 6, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-center mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500">Total {data.weeklyDaily[activeWeek].label}</p>
                    <h2 className="text-3xl font-bold my-1">{formatRupiah(data.weeklyDaily[activeWeek].total)}</h2>
                  </div>
                  {data.weeklyDaily[activeWeek].days.every(d => d.value === 0) && (
                    <div className="text-center py-4 text-gray-400 text-sm">There have been no orders for this period.</div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.weeklyDaily}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                        <YAxis axisLine={false} tickLine={false} tickFormatter={formatYAxis} />
                        <Tooltip />
                        <Bar dataKey="total" fill="#047857" radius={[6, 6, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-center mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500">Total Income This Month</p>
                    <h2 className="text-3xl font-bold my-1">{formatRupiah(data.weeklyDaily.reduce((sum, w) => sum + w.total, 0))}</h2>
                  </div>
                  {data.weeklyDaily.every(w => w.total === 0) && (
                    <div className="text-center py-4 text-gray-400 text-sm">There have been no orders yet this month.</div>
                  )}
                </div>
              )}
            </div>
            
            {/* Expenses by Category */}
            <div className="bg-white border border-[#dce5df] rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-6">Expenses by Category</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.expensePieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {data.expensePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {data.expensePieData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                            <span>{item.name}</span>
                        </div>
                        <span className="font-bold">{((item.value / data.expenses.actual) * 100).toFixed(0)}%</span>
                    </div>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-[#dce5df] rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">Monthly Financial Summary</h3>
              <div className="flex gap-4">
                <select 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-[#047857] transition bg-white"
                >
                  {months.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
                <button 
                  onClick={handleDownload}
                  className="flex items-center gap-2 bg-[#161b19] hover:bg-[#2d3436] text-white px-5 py-2.5 rounded-xl font-semibold transition">
                  <Download size={20} />
                  Download PDF Report
                </button>
              </div>
            </div>
            <table className="w-full text-left">
              <thead className="bg-[#f5f7f6]">
                <tr>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Metrics</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Nominal (Rp)</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Contribution (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { label: "Total Income", val: data.revenue.actual, contrib: 100 },
                  { label: "Total Expenses", val: data.expenses.actual, contrib: data.revenue.actual ? (data.expenses.actual / data.revenue.actual) * 100 : 0 },
                  { label: "Net Profit", val: data.profit.actual, contrib: data.revenue.actual ? (data.profit.actual / data.revenue.actual) * 100 : 0 }
                ].map((row, i) => (
                  <tr key={i}>
                    <td className="p-4 font-bold">{row.label}</td>
                    <td className="p-4 text-sm font-semibold">{formatRupiah(row.val)}</td>
                    <td className="p-4 text-sm font-bold text-gray-600">{row.contrib.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default Reports;
