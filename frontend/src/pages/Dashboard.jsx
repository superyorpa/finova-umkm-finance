import { useState, useEffect } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import api from "../services/api";
import {
  Calendar,
  ArrowDown,
  ArrowUp,
  TrendingUp,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  ShoppingCart,
  Receipt,
  PackageCheck,
  AlertTriangle,
} from "lucide-react";

function Dashboard() {
  const [data, setData] = useState({
    balance: 142500000,
    totalIncome: 58230000,
    totalExpenses: 24150000,
    targetReached: 85,
    weeklyTrend: [
      { day: "MON", value: 30 },
      { day: "TUE", value: 50 },
      { day: "WED", value: 40 },
      { day: "THU", value: 85, active: true },
      { day: "FRI", value: 25 },
      { day: "SAT", value: 65 },
      { day: "SUN", value: 35 },
    ],
    activities: [
      {
        id: 1,
        title: "Stock Purchase #882",
        time: "2 hours ago",
        amount: "-Rp 4.2M",
        type: "expense",
        icon: "cart",
      },
      {
        id: 2,
        title: "Invoice #1209",
        time: "5 hours ago",
        amount: "+Rp 12.5M",
        type: "income",
        icon: "invoice",
      },
      {
        id: 3,
        title: "Inventory Update",
        time: new Date().toISOString(),
        amount: null,
        type: "update",
        icon: "inventory",
      },
    ],
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
    
    return `Overview for ${firstDay.getDate()} ${monthNames[firstDay.getMonth()]} — ${lastDay.getDate()} ${monthNames[lastDay.getMonth()]}, ${firstDay.getFullYear()}`;
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
                  Total Saldo
                </p>
                <h2 className="text-3xl lg:text-4xl font-extrabold my-4 text-white tracking-tight">
                  {formatRupiah(data.balance)}
                </h2>
              </div>
              <div className="bg-[#036246]/70 border border-emerald-500/20 rounded-xl px-3 py-2 w-fit flex items-center gap-2 text-xs font-semibold text-emerald-100">
                <TrendingUp size={16} />
                <span>{data.incomeTrendPercentage}% vs last month</span>
              </div>
            </div>

            {/* Card 2: PEMASUKAN */}
            <div className="bg-white border border-[#dce5df] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                    Pemasukan
                  </p>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#047857] flex items-center justify-center">
                    <ArrowDown size={18} />
                  </div>
                </div>
                <h2 className="text-3xl font-extrabold text-[#161b19] my-4 tracking-tight">
                  {formatRupiah(data.totalIncome)}
                </h2>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                    Target Reached
                  </span>
                  <span className="font-extrabold text-[#047857]">
                    {data.targetReached || 85}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#047857] rounded-full transition-all duration-500"
                    style={{ width: `${data.targetReached || 85}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Card 3: PENGELUARAN */}
            <div className="bg-white border border-[#dce5df] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                    Pengeluaran
                  </p>
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                    <ArrowUp size={18} />
                  </div>
                </div>
                <h2 className="text-3xl font-extrabold text-[#161b19] my-4 tracking-tight">
                  {formatRupiah(data.totalExpenses)}
                </h2>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-600">
                <AlertTriangle size={16} />
                <span>{data.expenseTrendPercentage}% higher than last week</span>
              </div>
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
                    Tren Mingguan
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Daily revenue distribution
                  </p>
                </div>
              </div>

              {/* Bar Chart Visualization */}
              <div className="pt-8 pb-2">
                <div className="h-48 flex items-end justify-between px-2 gap-3 lg:gap-6 border-b border-gray-100 pb-2">
                  {data.weeklyTrend?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center h-full justify-end group"
                    >
                      <div
                        className={`w-full max-w-[56px] rounded-t-xl transition-all duration-300 ${
                          item.active
                            ? "bg-[#047857]"
                            : "bg-[#e2ebe6] group-hover:bg-[#d0dfd7]"
                        }`}
                        style={{ height: `${item.value}%` }}
                      />
                    </div>
                  ))}
                </div>
                {/* Day Labels */}
                <div className="flex justify-between px-2 gap-3 lg:gap-6 pt-3">
                  {data.weeklyTrend?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex-1 text-center text-xs font-bold uppercase tracking-wide"
                    >
                      <span
                        className={
                          item.active ? "text-[#161b19] font-extrabold" : "text-gray-400"
                        }
                      >
                        {item.day}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activities Card (1 Col) */}
            <div className="bg-white border border-[#dce5df] rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[380px]">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-[#161b19]">Last Activities</h3>
              </div>

              {/* Activity List */}
              <div className="space-y-5 my-auto">
                {data.activities?.map((activity) => (
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
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default Dashboard;
