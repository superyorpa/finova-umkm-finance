export const generateInsights = (transactions, expenses, products, period = "all") => {
    const insights = [];
    const now = new Date();
    const isSameMonth = (d1, d2) => d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
    const isSameYear = (d1, d2) => d1.getFullYear() === d2.getFullYear();
    const isLastMonth = (d1, d2) => {
        const lastMonth = new Date(d2);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        return d1.getMonth() === lastMonth.getMonth() && d1.getFullYear() === lastMonth.getFullYear();
    };

    // Filter data based on period
    let filteredTransactions = transactions;
    let filteredExpenses = expenses;

    if (period === "this_month") {
        filteredTransactions = transactions.filter(t => isSameMonth(new Date(t.transaction_date || t.created_at), now));
        filteredExpenses = expenses.filter(e => isSameMonth(new Date(e.expense_date || e.created_at), now));
    } else if (period === "this_year") {
        filteredTransactions = transactions.filter(t => isSameYear(new Date(t.transaction_date || t.created_at), now));
        filteredExpenses = expenses.filter(e => isSameYear(new Date(e.expense_date || e.created_at), now));
    }

    // Prepare data based on filtered data
    const totalIncome = filteredTransactions.reduce((sum, t) => sum + Number(t.total), 0);
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const monthlyIncome = transactions.reduce((sum, t) => isSameMonth(new Date(t.transaction_date || t.created_at), now) ? sum + Number(t.total) : sum, 0);
    const lastMonthIncome = transactions.reduce((sum, t) => isLastMonth(new Date(t.transaction_date || t.created_at), now) ? sum + Number(t.total) : sum, 0);
    const monthlyExpenses = expenses.reduce((sum, e) => isSameMonth(new Date(e.expense_date || e.created_at), now) ? sum + Number(e.amount) : sum, 0);

    // 1. Low Stock Alert (Always all-time inventory based)
    const lowStockProducts = products.filter(p => p.stock < 5);
    if (lowStockProducts.length > 0) {
        insights.push({
            category: "Inventory & Products",
            type: "warning",
            title: "Low Stock Alert",
            message: `You have ${lowStockProducts.length} product(s) with low stock. Check your inventory.`
        });
    }

    // 2. High Expense Alert (Based on filtered period)
    if (totalIncome > 0 && (totalExpenses / totalIncome) > 0.7) {
        insights.push({
            category: "Profitability & Finance",
            type: "danger",
            title: "Cash Flow Warning",
            message: "Your expenses are over 70% of your income. Consider reviewing your spending."
        });
    }

    // 3. Positive Growth (Based on filtered period)
    if (totalIncome > 10000000) {
        insights.push({
            category: "Sales & Growth",
            type: "success",
            title: "Great Job!",
            message: "Your revenue has crossed Rp 10M. Keep up the good work!"
        });
    }

    // 4. Best Selling Product Insight (Based on filtered period)
    const productSales = {};
    filteredTransactions.forEach(t => {
        t.transaction_details?.forEach(detail => {
            const productName = detail.products?.name || "Unknown";
            productSales[productName] = (productSales[productName] || 0) + detail.quantity;
        });
    });
    const bestProduct = Object.entries(productSales).reduce((max, curr) => curr[1] > max[1] ? curr : max, ["", 0]);
    if (bestProduct[1] > 0) {
        insights.push({
            category: "Inventory & Products",
            type: "success",
            title: "Best Selling Product",
            message: `${bestProduct[0]} is your top seller with ${bestProduct[1]} units sold!`
        });
    }

    // 5. Expense Optimization Alert (Based on filtered period)
    const expenseCategories = filteredExpenses.reduce((acc, e) => {
        const category = e.category || "Uncategorized";
        acc[category] = (acc[category] || 0) + Number(e.amount);
        return acc;
    }, {});
    
    const highestCategory = Object.entries(expenseCategories).reduce((max, curr) => curr[1] > max[1] ? curr : max, ["", 0]);
    
    if (highestCategory[1] > 0) {
        insights.push({
            category: "Expense Analysis",
            type: "success",
            title: "Top Expense Category",
            message: `Your highest spending category is ${highestCategory[0]} with Rp ${highestCategory[1].toLocaleString('id-ID')}.`
        });
    }

    // 6. Profit Margin Insight (Based on filtered period)
    const netProfit = totalIncome - totalExpenses;
    if (totalIncome > 0) {
        const profitMargin = (netProfit / totalIncome) * 100;
        insights.push({
            category: "Profitability & Finance",
            type: profitMargin > 20 ? "success" : "warning",
            title: "Profit Margin",
            message: `Your current profit margin is ${profitMargin.toFixed(1)}%. ${profitMargin > 20 ? "Great performance!" : "Consider optimizing expenses to improve profitability."}`
        });
    }

    // 7. Activity Insight (Based on filtered period)
    const transactionCount = filteredTransactions.length;
    if (transactionCount > 0) {
         insights.push({
            category: "Sales & Growth",
            type: "success",
            title: "Business Activity",
            message: `You've recorded ${transactionCount} transactions in this period. Keep up the momentum!`
        });
    }

    // 8. Growth Insight (MoM - Always uses monthly context)
    if (lastMonthIncome > 0) {
        const growth = ((monthlyIncome - lastMonthIncome) / lastMonthIncome) * 100;
        insights.push({
            category: "Sales & Growth",
            type: growth >= 0 ? "success" : "warning",
            title: "Monthly Growth",
            message: `Revenue this month ${growth >= 0 ? "increased" : "decreased"} by ${Math.abs(growth).toFixed(1)}% compared to last month.`
        });
    }

    // 9. Expense Efficiency Ratio (Based on filtered period)
    if (totalIncome > 0) {
        const ratio = (totalExpenses / totalIncome) * 100;
        insights.push({
            category: "Profitability & Finance",
            type: ratio < 50 ? "success" : "warning",
            title: "Expense Efficiency",
            message: `Operating expenses are ${ratio.toFixed(1)}% of total revenue.`
        });
    }

    return insights;
};
