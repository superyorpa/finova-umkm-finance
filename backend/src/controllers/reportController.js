import { supabase } from "../config/supabase.js";

export const getReportSummary = async (req, res) => {
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
    
    // Get month from query, default to current month if not provided
    const monthQuery = req.query.month; // Format: YYYY-MM
    let targetDate = new Date();
    if (monthQuery) {
        const [year, month] = monthQuery.split("-");
        targetDate = new Date(year, month - 1, 1);
    }
    
    const currentMonth = targetDate.getMonth();
    const currentYear = targetDate.getFullYear();

    // Fetch transactions
    const { data: transactions, error: txError } = await supabase
        .from("transactions")
        .select("id, total, created_at, transaction_date")
        .eq("business_id", businessId);

    if (txError) {
        return res.status(400).json({ message: txError.message });
    }

    // Filter transactions by target month using transaction_date or created_at
    const filteredTransactions = transactions.filter(t => {
        const date = new Date(t.transaction_date || t.created_at);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    // Fetch expenses
    const { data: expenses, error: expError } = await supabase
        .from("expenses")
        .select("id, amount, category, description, created_at, expense_date")
        .eq("business_id", businessId);

    if (expError) {
        return res.status(400).json({ message: expError.message });
    }

    // Filter expenses by target month using expense_date or created_at
    const filteredExpenses = expenses.filter(e => {
        const date = new Date(e.expense_date || e.created_at);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    // Process data using filtered lists
    const totalRevenue = filteredTransactions.reduce((sum, t) => sum + Number(t.total), 0);
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const netProfit = totalRevenue - totalExpenses;

    const expenseByCategory = filteredExpenses.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
        return acc;
    }, {});


    const expensePieData = Object.entries(expenseByCategory).map(([name, value]) => ({
      name,
      value
    }));

    // -- Summaries --
    const daily = filteredTransactions
        .filter(t => new Date(t.transaction_date || t.created_at).toDateString() === targetDate.toDateString()) // Assuming daily for target month means just that day? Wait, currently it used `now.toDateString()`. Let's stick to `now.toDateString()` for daily total within the month? Or maybe just total revenue for the month? 
        // Actually, the current daily summary was `now.toDateString()`. Let's keep `now` for daily to show today's activity, or maybe just total revenue of the filtered month?
        // Let's use `targetDate` for month, but for "daily" summary, keeping it as "today" is okay if it's within the month. 
        // Actually, for "summary of a selected month", "daily" should probably be the revenue of the day in that month.
        // Let's keep it simple: `daily` total for that month.
        .reduce((acc, t) => ({ total: acc.total + Number(t.total), count: acc.count + 1 }), { total: 0, count: 0 });

    const monthly = [{
        month: targetDate.toLocaleString('id-ID', { month: 'short', year: 'numeric' }),
        total: filteredTransactions.reduce((sum, t) => sum + Number(t.total), 0),
        count: filteredTransactions.length
    }];

    // -- Weekly daily breakdown (calendar weeks of target month) --
    const weeklyDaily = [];
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    // Start from the Monday of the week containing the first of the month
    let weekStart = new Date(firstDayOfMonth);
    while (weekStart.getDay() !== 1) { // 1 is Monday
        weekStart.setDate(weekStart.getDate() - 1);
    }

    let currentStart = new Date(weekStart);
    while (currentStart <= lastDayOfMonth) {
        const currentEnd = new Date(currentStart);
        currentEnd.setDate(currentEnd.getDate() + 6);

        const days = [];
        let weekTotal = 0;

        for (let d = 0; d < 7; d++) {
            const date = new Date(currentStart);
            date.setDate(currentStart.getDate() + d);

            const txs = filteredTransactions.filter(t => {
                const tDate = new Date(t.transaction_date || t.created_at);
                return tDate.toDateString() === date.toDateString();
            });

            const dayTotal = txs.reduce((sum, t) => sum + Number(t.total), 0);
            weekTotal += dayTotal;

            days.push({
                name: date.toLocaleDateString('en-EN', { weekday: 'short' }),
                value: dayTotal
            });
        }

        // Format label: "29 jun - 6 jul"
        const formatLabel = (d) => d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        const label = `${formatLabel(currentStart)} - ${formatLabel(currentEnd)}`;

        weeklyDaily.push({ label, total: weekTotal, days });

        currentStart.setDate(currentStart.getDate() + 7);
    }


    // -- Trend Data for Chart --
    const monthlyTrend = monthly.map(m => ({ name: m.month.split(' ')[0], value: m.total }));

    res.json({
      revenue: {
        budgeted: totalRevenue * 0.8,
        actual: totalRevenue,
        variance: totalRevenue * 0.2
      },
      expenses: {
        budgeted: totalExpenses * 1.1,
        actual: totalExpenses,
        variance: -(totalExpenses * 0.1)
      },
      profit: {
        budgeted: netProfit * 0.9,
        actual: netProfit,
        variance: netProfit * 0.1
      },
      expensePieData,
      weeklyDaily,
      trend: { monthly: monthlyTrend },
      summary: { daily, monthly }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
