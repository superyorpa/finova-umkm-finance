import { Search, Bell } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const { user } = useAuth();

  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
<header
className="
h-20
bg-white
border-b
border-[#dce5df]
flex
items-center
justify-between
px-8
sticky
top-0
z-10
"
>
      {/* Search */}

      <div
        className="
flex
items-center
gap-3
bg-[#f5f7f6]
border
border-gray-200
rounded-full
px-5
py-3
w-96
"
      >
        <Search size={20} className="text-gray-400" />

        <input
          placeholder="
Search transactions, products...
"
          className="
bg-transparent
outline-none
text-sm
w-full
"
        />
      </div>

      {/* Right */}

      <div
        className="
flex
items-center
gap-6
"
      >
        <Bell size={22} className="text-gray-600" />

        <div className="text-right">
          <p
            className="
font-semibold
text-sm
"
          >
            {displayName}
          </p>

          <p
            className="
text-xs
text-gray-500
"
          >
            {user?.email}
          </p>
        </div>

        <div
          className="
w-11
h-11
rounded-full
bg-[#047857]
text-white
flex
items-center
justify-center
font-bold
"
        >
          {initial}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
