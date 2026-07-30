import { useState, useEffect } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import api from "../services/api";
import { Lightbulb, Loader2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

function Insights() {
  const [groupedInsights, setGroupedInsights] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({});
  const [period, setPeriod] = useState("all");

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/insights?period=${period}`);
        const insights = response.data.insights || [];
        
        // Group by category
        const grouped = insights.reduce((acc, insight) => {
            const cat = insight.category || "Uncategorized";
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(insight);
            return acc;
        }, {});
        
        setGroupedInsights(grouped);
        
        // Initialize all as expanded
        const initialExpanded = {};
        Object.keys(grouped).forEach(cat => initialExpanded[cat] = true);
        setExpandedCategories(initialExpanded);
      } catch (err) {
        setError("Failed to load AI insights");
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, [period]);

  const toggleCategory = (cat) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-[#161b19]">AI Business Insights</h1>
            <p className="text-gray-500 mt-1">Smart recommendations based on your business data.</p>
        </div>
        <select 
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-[#047857] transition bg-white"
        >
            <option value="all">All Time</option>
            <option value="this_month">This Month</option>
            <option value="this_year">This Year</option>
        </select>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-[#047857]" size={48} />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="text-rose-500" size={48} />
          <p className="mt-4 text-rose-600 font-semibold">{error}</p>
        </div>
      ) : Object.keys(groupedInsights).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedInsights).map(([category, items]) => (
            <div key={category} className="bg-white border border-[#dce5df] rounded-2xl p-6 shadow-sm">
                <button 
                    onClick={() => toggleCategory(category)}
                    className="flex w-full items-center justify-between mb-4"
                >
                    <h2 className="text-xl font-bold text-[#161b19]">{category}</h2>
                    {expandedCategories[category] ? <ChevronUp /> : <ChevronDown />}
                </button>
                
                {expandedCategories[category] && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {items.map((insight, index) => (
                        <div key={index} className={`p-6 rounded-2xl border ${
                            insight.type === "warning" ? "bg-amber-50 border-amber-200" :
                            insight.type === "danger" ? "bg-rose-50 border-rose-200" :
                            "bg-emerald-50 border-emerald-200"
                        }`}>
                            <div className="flex items-center gap-3 mb-4">
                            <Lightbulb size={24} className={
                                insight.type === "warning" ? "text-amber-600" :
                                insight.type === "danger" ? "text-rose-600" :
                                "text-emerald-600"
                            } />
                            <h4 className={`font-bold text-lg ${
                                insight.type === "warning" ? "text-amber-800" :
                                insight.type === "danger" ? "text-rose-800" :
                                "text-emerald-800"
                            }`}>{insight.title}</h4>
                            </div>
                            <p className="text-sm text-gray-700">{insight.message}</p>
                        </div>
                        ))}
                    </div>
                )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          No insights available for now. Keep recording your business activities!
        </div>
      )}
    </DashboardLayout>
  );
}

export default Insights;
