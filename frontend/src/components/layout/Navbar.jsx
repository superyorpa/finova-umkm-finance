import { useAuth } from "../../context/AuthContext";
import { Menu } from "lucide-react";

function Navbar({ toggleSidebar }) {
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
        px-4
        md:px-8
        sticky
        top-0
        z-10
      "
    >
      <button onClick={toggleSidebar} className="md:hidden p-2 text-gray-600">
        <Menu size={24} />
      </button>

      {/* Right */}
      <div
        className="
        flex
        items-center
        gap-3
        md:gap-6
        ml-auto
        "
      >
        <div className="hidden md:block text-right">
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
            shrink-0
          "
        >
          {initial}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
