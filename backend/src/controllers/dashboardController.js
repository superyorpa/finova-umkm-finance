import { supabase } from "../config/supabase.js";
export const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Helper: Compare dates
    const isSameMonth = (d1, d2) => d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
    const isLastMonth = (d1, d2) => {
        const lastMonth = new Date(d2);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        return d1.getMonth() === lastMonth.getMonth() && d1.getFullYear() === lastMonth.getFullYear();
    };

    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select("id, monthly_target")
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
        .select("id, amount, expense_date, description, created_at, category")
        .eq("business_id", businessId);

    if (expenseError) {
      return res.status(400).json({ message: expenseError.message });
    }

    const today = new Date().toISOString().split("T")[0];
    const now = new Date();

    const totalIncome = transactions.reduce((sum, t) => sum + Number(t.total), 0);
    const monthlyIncome = transactions.reduce((sum, t) => isSameMonth(new Date(t.transaction_date || t.created_at), now) ? sum + Number(t.total) : sum, 0);
    const todayIncome = transactions
      .filter((t) => t.transaction_date === today)
      .reduce((sum, t) => sum + Number(t.total), 0);

    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const monthlyExpenses = expenses.reduce((sum, e) => isSameMonth(new Date(e.expense_date || e.created_at), now) ? sum + Number(e.amount) : sum, 0);
    const todayExpenses = expenses
      .filter((e) => e.expense_date === today)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const balance = totalIncome - totalExpenses;
    
    // Income Trend
    const currentMonthIncome = transactions.reduce((sum, t) => isSameMonth(new Date(t.transaction_date || t.created_at), now) ? sum + Number(t.total) : sum, 0);
    const lastMonthIncome = transactions.reduce((sum, t) => isLastMonth(new Date(t.transaction_date || t.created_at), now) ? sum + Number(t.total) : sum, 0);
    const incomeChange = lastMonthIncome === 0 ? "N/A" : (((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100).toFixed(1);

    // Expense Trend
    const currentMonthExpenses = expenses.reduce((sum, e) => isSameMonth(new Date(e.expense_date || e.created_at), now) ? sum + Number(e.amount) : sum, 0);
    const lastMonthExpenses_Trend = expenses.reduce((sum, e) => isLastMonth(new Date(e.expense_date || e.created_at), now) ? sum + Number(e.amount) : sum, 0);
    const expenseChange = lastMonthExpenses_Trend === 0 ? "N/A" : (((currentMonthExpenses - lastMonthExpenses_Trend) / lastMonthExpenses_Trend) * 100).toFixed(1);

    // Balance Trend
    const currentMonthBalance = currentMonthIncome - currentMonthExpenses;
    const lastMonthBalance = lastMonthIncome - lastMonthExpenses_Trend;
    const currentBalance = monthlyIncome - monthlyExpenses;
    const balanceChange = lastMonthBalance === 0 ? "N/A" : (((currentBalance - lastMonthBalance) / Math.abs(lastMonthBalance)) * 100).toFixed(1);


    // -- Current Week Breakdown --
    const day = now.getDay(); // 0 is Sunday
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(now);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);

    const days = [];
    let weekTotal = 0;

    for (let d = 0; d < 7; d++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + d);

        const txs = transactions.filter(t => {
            const tDate = new Date(t.transaction_date || t.created_at);
            return tDate.toDateString() === date.toDateString();
        });

        const dayTotal = txs.reduce((sum, t) => sum + Number(t.total), 0);
        weekTotal += dayTotal;

        // Mapping to Indonesian short day names, Sen-Min
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        
        days.push({
            name: dayNames[date.getDay()],
            value: dayTotal
        });
    }

    const currentWeekData = {
        label: "Minggu Ini",
        total: weekTotal,
        days: days
    };

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

    const monthlyTarget = business.monthly_target || 10000000;
    const targetReached = Math.min(Math.round((monthlyIncome / monthlyTarget) * 100), 100);

    res.json({
      balance,
      totalIncome,
      monthlyIncome,
      totalExpenses,
      monthlyExpenses,
      todayIncome,
      todayExpenses,
      transactionCount: transactions.length,
      expenseCount: expenses.length,
      targetReached,
      incomeTrendPercentage: incomeChange,
      balanceTrendPercentage: balanceChange,
      expenseTrendPercentage: expenseChange,
      currentWeekData,
      activities
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
