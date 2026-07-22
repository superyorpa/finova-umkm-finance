import { supabase } from "../config/supabase.js";


export const getBusinessProfile = async (req, res) => {

    try {

        const userId = req.user.id;


        const { data, error } = await supabase
            .from("businesses")
            .select("*")
            .eq("user_id", userId)
            .single();


        if(error){
            return res.status(400).json({
                message:error.message
            });
        }


        res.json(data);


    } catch(error){

        res.status(500).json({
            message:error.message
        });

    }

};

export const updateBusinessProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, description } = req.body;

        const { data, error } = await supabase
            .from("businesses")
            .update({ name, description })
            .eq("user_id", userId)
            .select()
            .single();

        if (error) {
            return res.status(400).json({
                message: error.message
            });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
