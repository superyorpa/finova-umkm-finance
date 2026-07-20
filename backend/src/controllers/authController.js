import { supabase } from "../config/supabase.js";


export const register = async (req, res) => {
  try {
    const {
      email,
      password,
      businessName
    } = req.body;


    const { data, error } =
      await supabase.auth.signUp({
        email,
        password
      });


    if (error) {
      return res.status(400).json({
        message: error.message
      });
    }


    const user = data.user;


    const { error: businessError } =
      await supabase
        .from("businesses")
        .insert({
          user_id: user.id,
          name: businessName
        });


    if (businessError) {
      return res.status(400).json({
        message: businessError.message
      });
    }


    res.json({
      message: "Register success",
      user
    });


  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};



export const login = async (req, res) => {

  const {
    email,
    password
  } = req.body;


  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password
    });


  if (error) {
    return res.status(400).json({
      message: error.message
    });
  }


  res.json({
    message: "Login success",
    session: data.session
  });

};



export const logout = async (req, res) => {
  try {

    const { error } = await supabase.auth.signOut();


    if (error) {
      return res.status(400).json({
        message: error.message
      });
    }


    res.json({
      message: "Logout success"
    });


  } catch(error){

    res.status(500).json({
      message:error.message
    });

  }
};