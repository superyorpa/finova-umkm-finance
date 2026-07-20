import { createContext, useContext, useState } from "react";
import api from "../services/api";


const AuthContext = createContext();


export const AuthProvider = ({children}) => {

    const [user, setUser] = useState(null);


    const login = async (email, password)=>{

        const response = await api.post(
            "/auth/login",
            {
                email,
                password
            }
        );


        const token = response.data.session.access_token;


        localStorage.setItem(
            "token",
            token
        );


        setUser(response.data.session.user);

        return response.data;

    };


    const logout = async ()=>{

        await api.post("/auth/logout");

        localStorage.removeItem("token");

        setUser(null);

    };


    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );

};


export const useAuth = ()=>{
    return useContext(AuthContext);
};