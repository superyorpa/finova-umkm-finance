import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowUpRight,
  TrendingUp,
  Wallet,
} from "lucide-react";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const success = location.state?.message || "";

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Login failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7f6] flex">
      {/* LEFT SECTION */}
      <section
        className="
        hidden lg:flex
        w-1/2
        bg-white
        border-r
        border-[#dce5df]
        px-12
        py-10
        flex-col
        justify-between
      "
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="
            w-12 h-12
            rounded-xl
            bg-[#047857]
            flex
            items-center
            justify-center
            text-white
          "
          >
            <TrendingUp />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-[#047857]">Finova</h1>

            <p className="text-sm text-gray-500 font-medium">UMKM Finance</p>
          </div>
        </div>

        {/* Hero */}
        <div className="max-w-lg">
          <h2
            className="
            text-5xl
            font-bold
            leading-tight
            text-[#161b19]
          "
          >
            Manage your business finance smarter.
          </h2>

          <p
            className="
            mt-5
            text-gray-500
            text-lg
            leading-relaxed
          "
          >
            Track transactions, monitor cash flow, and understand your business
            performance in one simple platform.
          </p>

          {/* Mini Cards */}

          <div
            className="
            mt-10
            grid
            grid-cols-2
            gap-5
          "
          >
            <div
              className="
              bg-[#047857]
              rounded-2xl
              p-6
              text-white
            "
            >
              <Wallet size={28} />

              <p
                className="
                mt-6
                text-sm
                text-emerald-100
              "
              >
                Total Balance
              </p>

              <h3
                className="
                mt-2
                text-3xl
                font-bold
              "
              >
                Rp142.5M
              </h3>

              <div
                className="
                mt-5
                flex
                items-center
                gap-2
                text-sm
                text-emerald-100
              "
              >
                <ArrowUpRight size={16} />
                +12.5% this month
              </div>
            </div>

            <div
              className="
              bg-white
              border
              border-[#dce5df]
              rounded-2xl
              p-6
            "
            >
              <p
                className="
                text-sm
                text-gray-500
              "
              >
                Revenue
              </p>

              <h3
                className="
                mt-5
                text-3xl
                font-bold
              "
              >
                Rp58.2M
              </h3>

              <div
                className="
                mt-6
                h-2
                bg-gray-100
                rounded-full
              "
              >
                <div
                  className="
                    h-2
                    w-[85%]
                    bg-[#047857]
                    rounded-full
                  "
                />
              </div>

              <p
                className="
                mt-3
                text-sm
                text-[#047857]
                font-semibold
              "
              >
                Target 85%
              </p>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-400">© 2026 Finova UMKM Finance</p>
      </section>

      {/* RIGHT SECTION */}

      <main
        className="
        flex-1
        flex
        items-center
        justify-center
        px-6
      "
      >
        <div
          className="
          w-full
          max-w-md
        "
        >
          <div
            className="
            bg-white
            border
            border-[#dce5df]
            rounded-2xl
            p-8
            shadow-sm
          "
          >
            <div className="mb-8">
              <h2
                className="
                text-3xl
                font-bold
              "
              >
                Welcome back
              </h2>

              <p
                className="
                mt-2
                text-gray-500
              "
              >
                Sign in to manage your business
              </p>
            </div>

            {success && (
              <div
                className="
                mb-5
                bg-green-50
                text-green-700
                p-3
                rounded-lg
                text-sm
              "
              >
                {success}
              </div>
            )}

            {error && (
              <div
                className="
                mb-5
                bg-red-50
                text-red-600
                p-3
                rounded-lg
                text-sm
              "
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  className="
                  text-sm
                  font-semibold
                "
                >
                  Email
                </label>

                <div className="relative mt-2">
                  <Mail
                    className="
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-gray-400
                    "
                    size={20}
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
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
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  className="
                  text-sm
                  font-semibold
                "
                >
                  Password
                </label>

                <div className="relative mt-2">
                  <Lock
                    className="
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-gray-400
                    "
                    size={20}
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
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
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="
                      absolute
                      right-4
                      top-1/2
                      -translate-y-1/2
                      text-gray-400
                    "
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

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
                "
              >
                {loading ? "Loading..." : "Sign In"}
              </button>
            </form>

            <p
              className="
              mt-7
              text-center
              text-sm
              text-gray-500
            "
            >
              Don't have an account?
              <Link
                to="/register"
                className="
                  ml-1
                  text-[#047857]
                  font-semibold
                "
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Login;
