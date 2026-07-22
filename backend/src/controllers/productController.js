import { supabase } from "../config/supabase.js";

export const getProducts = async (req, res) => {
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
      .from("products")
      .select("*")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, category, price, stock } = req.body;

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
      .from("products")
      .insert({
        business_id: business.id,
        name,
        category,
        price,
        stock: stock || 0
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, category, price, stock } = req.body;

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
      .from("products")
      .update({ name, category, price, stock })
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

export const deleteProduct = async (req, res) => {
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
      .from("products")
      .delete()
      .eq("id", id)
      .eq("business_id", business.id);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
