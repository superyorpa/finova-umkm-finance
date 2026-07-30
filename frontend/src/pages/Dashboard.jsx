import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import api from "../services/api";
import {
  Calendar,
  ArrowDown,
  ArrowUp,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  ShoppingCart,
  Receipt,
  PackageCheck,
  AlertTriangle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Dashboard() {
  const [data, setData] = useState({
    balance: 0,
    totalIncome: 0,
    monthlyIncome: 0,
    totalExpenses: 0,
    monthlyExpenses: 0,
    targetReached: 0,
    currentWeekData: null,
    activities: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/dashboard");
        if (response.data) {
          setData((prev) => ({
            ...prev,
            ...response.data,
          }));
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const formatRelativeTime = (isoString) => {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString; // Fallback if invalid
    
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    }
  };

  const formatMonthRange = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    return `Overview from ${firstDay.getDate()} ${monthNames[firstDay.getMonth()]} — ${lastDay.getDate()} ${monthNames[lastDay.getMonth()]}, ${firstDay.getFullYear()}`;
  };

  const formatRupiah = (amount) => {
    return "Rp " + new Intl.NumberFormat("id-ID").format(amount);
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl lg:text-4xl font-extrabold text-[#161b19]">
          Business Performance
        </h1>
        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 font-medium">
          <Calendar size={16} className="text-gray-400" />
          <span>{formatMonthRange()}</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-500 font-medium">
          Loading dashboard performance...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top 3 Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: TOTAL SALDO */}
            <div className="bg-[#047857] text-white rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-[11px] font-bold tracking-wider text-emerald-200/90 uppercase">
                  Total Balance
                </p>
                <h2 className="text-3xl lg:text-4xl font-extrabold my-4 text-white tracking-tight">
                  {formatRupiah(data.balance)}
                </h2>
              </div>
              {data.balanceTrendPercentage !== "N/A" && (
                <div className={`border rounded-xl px-3 py-2 w-fit flex items-center gap-2 text-xs font-semibold ${data.balanceTrendPercentage >= 0 ? "bg-[#036246]/70 border-emerald-500/20 text-emerald-100" : "bg-orange-500/20 border-orange-600 text-yellow-500"}`}>
                  {data.balanceTrendPercentage >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  <span>{Math.abs(data.balanceTrendPercentage)}% {data.balanceTrendPercentage >= 0 ? "higher" : "lower"} than last month</span>
                </div>
              )}
            </div>

            {/* Card 2: PEMASUKAN */}
            <div className="bg-white border border-[#dce5df] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                    Income This Month
                  </p>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#047857] flex items-center justify-center">
                    <ArrowDown size={18} />
                  </div>
                </div>
                <h2 className="text-3xl font-extrabold text-[#161b19] my-4 tracking-tight">
                  {formatRupiah(data.monthlyIncome)}
                </h2>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                    Target Reached
                  </span>
                  <span className="font-extrabold text-[#047857]">
                    {data.targetReached || 0}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#047857] rounded-full transition-all duration-500"
                    style={{ width: `${data.targetReached || 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Card 3: PENGELUARAN */}
            <div className="bg-white border border-[#dce5df] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                    Expenses This Month
                  </p>
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                    <ArrowUp size={18} />
                  </div>
                </div>
                <h2 className="text-3xl font-extrabold text-[#161b19] my-4 tracking-tight">
                  {formatRupiah(data.monthlyExpenses)}
                </h2>
              </div>
              {data.expenseTrendPercentage !== "N/A" && (
                <div className={`flex items-center gap-2 text-xs font-semibold ${data.expenseTrendPercentage >= 0 ? "text-rose-600" : "text-emerald-600"}`}>
                  {data.expenseTrendPercentage >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  <span>{Math.abs(data.expenseTrendPercentage)}% {data.expenseTrendPercentage >= 0 ? "higher" : "lower"} than last month</span>
                </div>
              )}
            </div>
          </div>

          {/* Middle Section: Tren Mingguan & Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tren Mingguan Card (2 Cols) */}
            <div className="lg:col-span-2 bg-white border border-[#dce5df] rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[380px]">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[#161b19]">
                    Weekly Trend
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Daily revenue distribution
                  </p>
                </div>
                <Link
                  to="/reports"
                  className="text-sm font-semibold text-[#047857] hover:text-[#036246] hover:underline"
                >
                  Load more
                </Link>
              </div>

              {/* Bar Chart Visualization */}
              <div className="pt-8 pb-2">
                {data.currentWeekData ? (
                  <div>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.currentWeekData.days}>
                          <Tooltip 
                            formatter={(value, name, props) => [formatRupiah(value), 'Revenue']}
                            cursor={{fill: '#f0f9f6'}}
                          />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                          <Bar 
                            dataKey="value" 
                            fill="#047857"
                            radius={[6, 6, 0, 0]} 
                            barSize={40}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="text-center mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500">Total This Week</p>
                        <h2 className="text-3xl font-bold my-1">{formatRupiah(data.currentWeekData.total)}</h2>
                    </div>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-sm text-gray-400">
                    No transaction data for this week
                  </div>
                )}
              </div>
            </div>

            {/* Activities Card (1 Col) */}
            <div className="bg-white border border-[#dce5df] rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[380px]">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-[#161b19]">Recent Activities</h3>
              </div>

                {/* Activity List */}
                <div className="space-y-5 my-auto">
                  {data.activities && data.activities.length > 0 ? (
                    data.activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3.5">
                          {/* Icon */}
                          {activity.icon === "cart" && (
                            <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                              <ShoppingCart size={18} />
                            </div>
                          )}
                          {activity.icon === "invoice" && (
                            <div className="w-11 h-11 rounded-full bg-[#047857] text-white flex items-center justify-center shrink-0">
                              <Receipt size={18} />
                            </div>
                          )}
                          {activity.icon === "inventory" && (
                            <div className="w-11 h-11 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                              <PackageCheck size={18} />
                            </div>
                          )}

                          {/* Content */}
                          <div>
                            <h4 className="font-bold text-sm text-[#161b19] leading-snug">
                              {activity.title}
                            </h4>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {formatRelativeTime(activity.time)}
                            </p>
                          </div>
                        </div>

                        {/* Right side amount or chevron */}
                        <div>
                          {activity.amount ? (
                            <span
                              className={`font-bold text-sm ${
                                activity.type === "expense"
                                  ? "text-rose-600"
                                  : "text-[#047857]"
                              }`}
                            >
                              {activity.amount}
                            </span>
                          ) : (
                            <ChevronRight size={18} className="text-gray-400" />
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-400 text-center py-4">
                      No recent activities
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>  
      )}
    </DashboardLayout>
  );
}

export default Dashboard;
