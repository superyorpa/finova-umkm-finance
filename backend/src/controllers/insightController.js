import { supabase } from "../config/supabase.js";
import { generateInsights } from "../services/insightService.js";

export const getInsights = async (req, res) => {
    try {
        const userId = req.user.id;

        const { data: business, error: businessError } = await supabase
            .from("businesses")
            .select("id")
            .eq("user_id", userId)
            .single();

        if (businessError) return res.status(400).json({ message: businessError.message });
        const businessId = business.id;

        const [
            { data: transactions },
            { data: expenses },
            { data: products }
        ] = await Promise.all([
            supabase.from("transactions").select("total, transaction_date, transaction_details(product_id, quantity, products(name))").eq("business_id", businessId),
            supabase.from("expenses").select("amount, category, expense_date").eq("business_id", businessId),
            supabase.from("products").select("name, stock").eq("business_id", businessId)
        ]);

        const insights = generateInsights(transactions || [], expenses || [], products || [], req.query.period);
        res.json({ insights });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
