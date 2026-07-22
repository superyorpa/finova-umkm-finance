import { supabase } from "../config/supabase.js";

export const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (businessError) {
      return res.status(400).json({ message: businessError.message });
    }

    const businessId = business.id;

    const { data: transactions, error: transactionError } = await supabase
      .from("transactions")
      .select("id, total, transaction_date, created_at")
      .eq("business_id", businessId);

    if (transactionError) {
      return res.status(400).json({ message: transactionError.message });
    }

    const { data: expenses, error: expenseError } = await supabase
      .from("expenses")
      .select("id, amount, expense_date, description, created_at")
      .eq("business_id", businessId);

    if (expenseError) {
      return res.status(400).json({ message: expenseError.message });
    }

    const today = new Date().toISOString().split("T")[0];

    const totalIncome = transactions.reduce((sum, t) => sum + Number(t.total), 0);
    const todayIncome = transactions
      .filter((t) => t.transaction_date === today)
      .reduce((sum, t) => sum + Number(t.total), 0);

    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const todayExpenses = expenses
      .filter((e) => e.expense_date === today)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const balance = totalIncome - totalExpenses;

    // Helper: Compare dates
    const isSameMonth = (d1, d2) => d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
    const isLastMonth = (d1, d2) => {
        const lastMonth = new Date(d2);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        return d1.getMonth() === lastMonth.getMonth() && d1.getFullYear() === lastMonth.getFullYear();
    };

    const now = new Date();
    
    // Income Trend
    const currentMonthIncome = transactions.reduce((sum, t) => isSameMonth(new Date(t.created_at || t.transaction_date), now) ? sum + Number(t.total) : sum, 0);
    const lastMonthIncome = transactions.reduce((sum, t) => isLastMonth(new Date(t.created_at || t.transaction_date), now) ? sum + Number(t.total) : sum, 0);
    const incomeChange = lastMonthIncome === 0 ? 0 : ((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100;

    // Expense Trend
    const lastWeek = new Date(); lastWeek.setDate(now.getDate() - 7);
    const lastLastWeek = new Date(); lastLastWeek.setDate(now.getDate() - 14);
    
    const currentWeekExpenses = expenses.reduce((sum, e) => new Date(e.created_at || e.expense_date) >= lastWeek ? sum + Number(e.amount) : sum, 0);
    const lastWeekExpenses = expenses.reduce((sum, e) => new Date(e.created_at || e.expense_date) >= lastLastWeek && new Date(e.created_at || e.expense_date) < lastWeek ? sum + Number(e.amount) : sum, 0);
    const expenseChange = lastWeekExpenses === 0 ? 0 : ((currentWeekExpenses - lastWeekExpenses) / lastWeekExpenses) * 100;

    // Calculate weekly trend data
    const getDayName = (dateStr) => {
        const date = new Date(dateStr);
        return ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][date.getDay()];
    };

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const weeklyTransactions = transactions.filter(t => new Date(t.created_at || t.transaction_date) >= sevenDaysAgo);
    
    const weeklyTrendMap = { "MON": 0, "TUE": 0, "WED": 0, "THU": 0, "FRI": 0, "SAT": 0, "SUN": 0 };
    
    weeklyTransactions.forEach(t => {
        const day = getDayName(t.created_at || t.transaction_date);
        if (weeklyTrendMap.hasOwnProperty(day)) {
            weeklyTrendMap[day] += Number(t.total);
        }
    });

    const maxVal = Math.max(...Object.values(weeklyTrendMap), 1);
    let peakDay = "MON";
    let peakVal = -1;
    Object.entries(weeklyTrendMap).forEach(([day, val]) => {
        if (val > peakVal) { peakVal = val; peakDay = day; }
    });

    const weeklyTrend = Object.entries(weeklyTrendMap).map(([day, value]) => ({
        day,
        value: (value / maxVal) * 100,
        active: day === peakDay
    }));

    // Calculate activities
    const recentTransactions = transactions.map(t => ({
        id: 'tx-' + t.id,
        title: "Transaction #" + t.id,
        time: t.created_at ? new Date(t.created_at) : new Date(),
        amount: t.total,
        type: "income",
        icon: "invoice"
    }));
    
    const recentExpenses = expenses.map(e => ({
        id: 'ex-' + e.id,
        title: e.description || "Expense",
        time: e.created_at ? new Date(e.created_at) : new Date(),
        amount: e.amount,
        type: "expense",
        icon: "cart"
    }));
    
    const activities = [...recentTransactions, ...recentExpenses]
        .sort((a, b) => b.time - a.time)
        .slice(0, 3)
        .map(a => ({
            ...a,
            time: a.time.toISOString() // Send raw ISO date
        }));


    res.json({
      balance,
      totalIncome,
      totalExpenses,
      todayIncome,
      todayExpenses,
      transactionCount: transactions.length,
      expenseCount: expenses.length,
      targetReached: 85,
      incomeTrendPercentage: incomeChange.toFixed(1),
      expenseTrendPercentage: expenseChange.toFixed(1),
      weeklyTrend,
      activities
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
