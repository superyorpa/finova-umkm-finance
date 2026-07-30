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
    const { items, payment_method, date } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items are required" });
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

    let total_price = 0;
    const validatedItems = [];

    // Check stock for all items
    for (const item of items) {
        const { data: product, error: productError } = await supabase
            .from("products")
            .select("*")
            .eq("id", item.product_id)
            .eq("business_id", business.id)
            .single();

        if (productError || !product) {
            return res.status(404).json({ message: `Product ${item.product_id} not found` });
        }

        if (product.stock < item.quantity) {
            return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
        }
        
        total_price += Number(product.price) * Number(item.quantity);
        validatedItems.push({ ...item, product, price: product.price });
    }

    const transactionDate = date || new Date().toISOString().split("T")[0];

    // Insert transaction
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .insert({
        business_id: business.id,
        total: total_price,
        payment_method: payment_method || "Cash",
        transaction_date: transactionDate
      })
      .select()
      .single();

    if (txError) {
      return res.status(400).json({ message: txError.message });
    }

    // Insert transaction details
    for (const item of validatedItems) {
        await supabase
          .from("transaction_details")
          .insert({
            transaction_id: transaction.id,
            product_id: item.product_id,
            quantity: Number(item.quantity),
            price: Number(item.price)
          });

        // Reduce product stock
        await supabase
          .from("products")
          .update({ stock: item.product.stock - Number(item.quantity) })
          .eq("id", item.product_id);
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
    const { payment_method, date } = req.body;

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
      .update({ payment_method, transaction_date: date })
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
