import { supabase } from "../config/supabase.js";

export const getExpenses = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get business_id
    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (businessError) {
      return res.status(400).json({ message: businessError.message });
    }

    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    // Map payment_method if stored in description or default to Cash
    const expensesWithPayment = data.map((item) => {
      let pm = "Cash";
      let desc = item.description || "";
      if (desc.includes("[Payment:")) {
        const parts = desc.split("[Payment:");
        desc = parts[0].trim();
        pm = parts[1].replace("]", "").trim();
      }
      return {
        ...item,
        description: desc,
        payment_method: pm
      };
    });

    res.json(expensesWithPayment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, description, amount, payment_method, date } = req.body;

    if (!category) {
      return res.status(400).json({ message: "Category required" });
    }
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }
    if (!payment_method) {
      return res.status(400).json({ message: "Payment method required" });
    }

    // Get business_id
    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (businessError) {
      return res.status(400).json({ message: businessError.message });
    }

    const expenseDate = date || new Date().toISOString().split("T")[0];
    const fullDescription = description ? `${description} [Payment: ${payment_method}]` : `[Payment: ${payment_method}]`;

    const { data, error } = await supabase
      .from("expenses")
      .insert({
        business_id: business.id,
        category,
        amount: Number(amount),
        description: fullDescription,
        expense_date: expenseDate
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.status(201).json({
      ...data,
      description: description || "",
      payment_method
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { category, description, amount, payment_method, date } = req.body;

    if (!category) {
      return res.status(400).json({ message: "Category required" });
    }
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }
    if (!payment_method) {
      return res.status(400).json({ message: "Payment method required" });
    }

    // Get business_id
    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (businessError) {
      return res.status(400).json({ message: businessError.message });
    }

    const fullDescription = description ? `${description} [Payment: ${payment_method}]` : `[Payment: ${payment_method}]`;

    const { data, error } = await supabase
      .from("expenses")
      .update({
        category,
        amount: Number(amount),
        description: fullDescription,
        expense_date: date
      })
      .eq("id", id)
      .eq("business_id", business.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({
      ...data,
      description: description || "",
      payment_method
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Get business_id
    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (businessError) {
      return res.status(400).json({ message: businessError.message });
    }

    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id)
      .eq("business_id", business.id);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
