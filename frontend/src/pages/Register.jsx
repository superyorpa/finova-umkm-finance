import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Wallet,
  Store,
  UserPlus,
  TrendingUp
} from "lucide-react";
import api from "../services/api";


function Register() {

  const navigate = useNavigate();

  const [formData,setFormData] = useState({
    email:"",
    password:"",
    confirmPassword:"",
    businessName:""
  });

  const [showPassword,setShowPassword] = useState(false);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("");


  const handleChange=(e)=>{
    setFormData({
      ...formData,
      [e.target.name]:e.target.value
    });
  };


  const handleSubmit=async(e)=>{
    e.preventDefault();

    setError("");

    if(formData.password !== formData.confirmPassword){
      setError("Passwords do not match.");
      return;
    }

    if(formData.password.length < 6){
      setError("Password must be at least 6 characters.");
      return;
    }


    setLoading(true);

    try{

      await api.post("/auth/register",{
        email:formData.email,
        password:formData.password,
        businessName:formData.businessName
      });


      navigate("/login",{
        state:{
          message:"Registration successful! Please sign in."
        }
      });


    }catch(error){

      setError(
        error.response?.data?.message ||
        "Registration failed. Please try again."
      );

    }finally{
      setLoading(false);
    }

  };



  return (

<div className="min-h-screen bg-[#f5f7f6] flex">


{/* LEFT */}

<section className="
hidden lg:flex
w-1/2
bg-white
border-r
border-[#dce5df]
px-12
py-10
flex-col
justify-between
">


<div className="flex items-center gap-3">

<div className="
w-12 h-12
bg-[#047857]
rounded-xl
flex
items-center
justify-center
text-white
">

<TrendingUp/>

</div>


<div>

<h1 className="
text-2xl
font-bold
text-[#047857]
">
Finova
</h1>

<p className="text-sm text-gray-500">
UMKM Finance
</p>

</div>


</div>




<div className="max-w-lg">


<h2 className="
text-5xl
font-bold
leading-tight
text-[#161b19]
">

Build your business
with better finance.

</h2>


<p className="
mt-5
text-gray-500
text-lg
leading-relaxed
">

Create your account and start managing
transactions, expenses, and business insights
in one place.

</p>



<div className="
mt-10
bg-[#047857]
rounded-2xl
p-6
text-white
">

<Wallet size={28}/>


<p className="
mt-5
text-emerald-100
text-sm
">

Smart financial management

</p>


<h3 className="
mt-2
text-3xl
font-bold
">

For UMKM Growth

</h3>


<div className="
mt-5
flex
items-center
gap-2
text-emerald-100
text-sm
">

✓ Track transactions

</div>


<div className="
mt-2
flex
items-center
gap-2
text-emerald-100
text-sm
">

✓ Monitor cash flow

</div>


</div>



</div>




<p className="text-xs text-gray-400">

© 2026 Finova UMKM Finance

</p>


</section>





{/* RIGHT */}

<main className="
flex-1
flex
items-center
justify-center
px-6
">


<div className="
w-full
max-w-md
bg-white
border
border-[#dce5df]
rounded-2xl
p-8
shadow-sm
">


<div className="mb-8">


<h2 className="
text-3xl
font-bold
">

Create Account

</h2>


<p className="
mt-2
text-gray-500
">

Start managing your business finance

</p>


</div>




{
error &&

<div className="
mb-5
bg-red-50
border
border-red-200
text-red-600
p-3
rounded-lg
text-sm
">

{error}

</div>

}




<form
onSubmit={handleSubmit}
className="space-y-5"
>



<Input
icon={<Store/>}
label="Business Name"
name="businessName"
placeholder="Your business name"
value={formData.businessName}
onChange={handleChange}
/>



<Input
icon={<Mail/>}
label="Email"
name="email"
type="email"
placeholder="email@example.com"
value={formData.email}
onChange={handleChange}
/>




<div>


<label className="text-sm font-semibold">

Password

</label>


<div className="relative mt-2">


<Lock className="
absolute
left-4
top-1/2
-translate-y-1/2
text-gray-400
"
size={18}
/>


<input
type={showPassword?"text":"password"}
name="password"
value={formData.password}
onChange={handleChange}
placeholder="Create password"
className="
w-full
border
border-gray-200
rounded-xl
py-3
pl-12
pr-12
outline-none
focus:border-[#047857]
"
/>


<button
type="button"
onClick={()=>setShowPassword(!showPassword)}
className="
absolute
right-4
top-1/2
-translate-y-1/2
text-gray-400
"
>

{
showPassword
?
<EyeOff size={18}/>
:
<Eye size={18}/>
}

</button>


</div>


</div>





<Input
icon={<Lock/>}
label="Confirm Password"
name="confirmPassword"
type="password"
placeholder="Confirm password"
value={formData.confirmPassword}
onChange={handleChange}
/>




<button
disabled={loading}
className="
w-full
bg-[#047857]
text-white
py-3
rounded-xl
font-semibold
hover:bg-[#056b4f]
transition
disabled:opacity-50
flex
justify-center
items-center
gap-2
"
>


{
loading
?
"Creating..."
:
<>
<UserPlus size={18}/>
Create Account
</>
}


</button>




</form>




<p className="
mt-7
text-center
text-sm
text-gray-500
">

Already have account?


<Link
to="/login"
className="
ml-1
text-[#047857]
font-semibold
"
>

Sign in

</Link>


</p>


</div>


</main>


</div>

  );

}


function Input({
icon,
label,
name,
type="text",
placeholder,
value,
onChange
}){


return (

<div>


<label className="
text-sm
font-semibold
">

{label}

</label>


<div className="relative mt-2">

<div className="
absolute
left-4
top-1/2
-translate-y-1/2
text-gray-400
">

{icon}

</div>


<input

type={type}
name={name}
value={value}
onChange={onChange}
placeholder={placeholder}

className="
w-full
border
border-gray-200
rounded-xl
py-3
pl-12
pr-4
outline-none
focus:border-[#047857]
"

/>


</div>


</div>

)

}


export default Register;