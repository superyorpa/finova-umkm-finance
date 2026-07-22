import { supabase } from "../config/supabase.js";

export const getTransactions = async (req, res) => {
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

    // Fetch transactions for this business
    const { data: transactions, error } = await supabase
      .from("transactions")
      .select(`
        id,
        business_id,
        total,
        payment_method,
        transaction_date,
        created_at,
        transaction_details (
          id,
          quantity,
          price,
          product_id,
          products (
            id,
            name,
            category
          )
        )
      `)
      .eq("business_id", business.id)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, quantity, payment_method } = req.body;

    if (!product_id || !quantity || quantity <= 0) {
      return res.status(400).json({ message: "Product and valid quantity are required" });
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

    // Get product and check stock
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", product_id)
      .eq("business_id", business.id)
      .single();

    if (productError || !product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: "Stock cannot exceed available stock" });
    }

    const total_price = Number(product.price) * Number(quantity);
    const today = new Date().toISOString().split("T")[0];

    // Insert transaction
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .insert({
        business_id: business.id,
        total: total_price,
        payment_method: payment_method || "Cash",
        transaction_date: today
      })
      .select()
      .single();

    if (txError) {
      return res.status(400).json({ message: txError.message });
    }

    // Insert transaction details
    const { error: detailError } = await supabase
      .from("transaction_details")
      .insert({
        transaction_id: transaction.id,
        product_id: product.id,
        quantity: Number(quantity),
        price: Number(product.price)
      });

    if (detailError) {
      // rollback or handle error
      return res.status(400).json({ message: detailError.message });
    }

    // Reduce product stock
    const newStock = product.stock - Number(quantity);
    const { error: stockError } = await supabase
      .from("products")
      .update({ stock: newStock })
      .eq("id", product.id);

    if (stockError) {
      return res.status(400).json({ message: stockError.message });
    }

    // Fetch full created transaction with details
    const { data: createdTx } = await supabase
      .from("transactions")
      .select(`
        id,
        business_id,
        total,
        payment_method,
        transaction_date,
        created_at,
        transaction_details (
          id,
          quantity,
          price,
          product_id,
          products (
            id,
            name,
            category
          )
        )
      `)
      .eq("id", transaction.id)
      .single();

    res.status(201).json(createdTx || transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { payment_method } = req.body;

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
      .from("transactions")
      .update({ payment_method })
      .eq("id", id)
      .eq("business_id", business.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTransaction = async (req, res) => {
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

    // Optional: restore product stock on delete
    const { data: details } = await supabase
      .from("transaction_details")
      .select("product_id, quantity")
      .eq("transaction_id", id);

    if (details && details.length > 0) {
      for (const d of details) {
        const { data: prod } = await supabase
          .from("products")
          .select("stock")
          .eq("id", d.product_id)
          .single();
        if (prod) {
          await supabase
            .from("products")
            .update({ stock: prod.stock + d.quantity })
            .eq("id", d.product_id);
        }
      }
    }

    // Delete details first
    await supabase.from("transaction_details").delete().eq("transaction_id", id);

    // Delete transaction
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("business_id", business.id);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
