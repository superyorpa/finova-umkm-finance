import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";


function Login(){

    const { login } = useAuth();

    const navigate = useNavigate();


    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");


    const handleSubmit = async(e)=>{

        e.preventDefault();


        try{

            await login(
                email,
                password
            );


            navigate("/dashboard");


        }catch(error){

            console.log(error);

        }

    };


    return (

        <form onSubmit={handleSubmit}>

            <h1>
                Login
            </h1>


            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
            />


            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
            />


            <button>
                Login
            </button>

        </form>

    );

}


export default Login;