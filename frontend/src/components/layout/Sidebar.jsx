import {
  LayoutDashboard,
  Package,
  Receipt,
  Wallet,
  FileText,
  Sparkles,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";



const menu = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Products",
    path: "/products",
    icon: Package,
  },
  {
    name: "Transactions",
    path: "/transactions",
    icon: Receipt,
  },
  {
    name: "Expenses",
    path: "/expenses",
    icon: Wallet,
  },
  {
    name: "Reports",
    path: "/reports",
    icon: FileText,
  },
  {
    name: "AI Insight",
    path: "/insight",
    icon: Sparkles,
  },
];


function Sidebar(){

const { logout } = useAuth();
const navigate = useNavigate();

const handleLogout = async () => {
  const confirmLogout = window.confirm("Are you sure you want to logout?");

  if (!confirmLogout) return;
  
  try {
    await logout();
    navigate("/login");
  } catch (err) {
    localStorage.removeItem("token");
    navigate("/login");
  }
};

return (

<aside
className="
w-64
h-screen
fixed
left-0
top-0
bg-white
border-r
border-[#dce5df]
flex
flex-col
justify-between
p-5
overflow-y-auto
"
>


<div>


{/* Logo */}

<div className="
flex
items-center
gap-3
mb-10
">

<div className="
w-11
h-11
rounded-xl
bg-[#047857]
text-white
flex
items-center
justify-center
font-bold
">

F

</div>


<div>

<h1 className="
font-bold
text-xl
text-[#047857]
">
Finova
</h1>

<p className="
text-xs
text-gray-500
">
UMKM Finance
</p>

</div>


</div>





{/* Menu */}

<nav className="space-y-2">


{
menu.map((item)=>{

const Icon = item.icon;


return (

<NavLink
key={item.name}
to={item.path}

className={({isActive})=>

`
flex
items-center
gap-3
px-4
py-3
rounded-xl
text-sm
font-medium
transition

${
isActive

?

"bg-[#047857] text-white"

:

"text-gray-600 hover:bg-gray-100"

}

`

}

>


<Icon size={20}/>

{item.name}


</NavLink>

)


})

}


</nav>


</div>





{/* Bottom */}

<div className="space-y-2">


<NavLink
to="/settings"
className={({isActive})=>
  `
  flex
  items-center
  gap-3
  px-4
  py-3
  rounded-xl
  text-sm
  font-medium
  transition
  ${isActive ? "bg-[#047857] text-white" : "text-gray-600 hover:bg-gray-100"}
  `
}
>

<Settings size={20}/>
Settings

</NavLink>



<NavLink
to="/help"
className={({isActive})=>
  `
  flex
  items-center
  gap-3
  px-4
  py-3
  rounded-xl
  text-sm
  font-medium
  transition
  ${isActive ? "bg-[#047857] text-white" : "text-gray-600 hover:bg-gray-100"}
  `
}
>

<HelpCircle size={20}/>
Help

</NavLink>



<button
onClick={handleLogout}
className="
flex
items-center
gap-3
px-4
py-3
w-full
text-red-500
hover:bg-red-50
rounded-xl
cursor-pointer
"
>

<LogOut size={20}/>
Logout

</button>


</div>


</aside>

)

}


export default Sidebar;