import Sidebar from "./Sidebar";
import Navbar from "./Navbar";


function DashboardLayout({children}){


return (

<div
className="
flex
min-h-screen
bg-[#f5f7f6]
"
>


<Sidebar/>


<div
className="
flex-1
ml-64
flex
flex-col
"
>


<Navbar/>


<main
className="
p-8
flex-1
"
>

{children}

</main>


</div>


</div>

)

}


export default DashboardLayout;