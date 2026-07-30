import { useState, useEffect } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { 
  Building2, 
  Lock, 
  Sliders, 
  Save, 
  AlertCircle, 
  Loader2,
  CheckCircle2
} from "lucide-react";

function Settings() {
  const { user } = useAuth();
  
  const [business, setBusiness] = useState({
    name: "",
    description: "",
    monthly_target: 10000000
  });
  
  const [preferences, setPreferences] = useState({
    currency: "IDR",
    timezone: "Asia/Jakarta",
    notifications: true
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(true);
  const [savingBusiness, setSavingBusiness] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get("/business/profile");
        if (res.data) {
            setBusiness({
            name: res.data.name || "",
            description: res.data.description || "",
            monthly_target: res.data.monthly_target || 10000000
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load business profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const showNotification = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveBusiness = async (e) => {
    e.preventDefault();
    setSavingBusiness(true);
    setError("");

    try {
      await api.put("/business/profile", {
        name: business.name,
        description: business.description,
        monthly_target: Number(business.monthly_target)
      });
      showNotification("Business profile updated successfully");
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to update business profile";
      setError(errMsg);
      showNotification(errMsg, "error");
    } finally {
      setSavingBusiness(false);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setSavingPassword(true);
    
    setTimeout(() => {
      setSavingPassword(false);
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        showNotification("New passwords do not match", "error");
        return;
      }
      showNotification("Password change feature is simulated (Placeholder)");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    }, 600);
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    showNotification("Preferences saved successfully");
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#161b19]">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your business profile, security, and preferences</p>
      </div>

      {notification && (
        <div className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-center gap-3 ${notification.type === "error" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}>
          {notification.type === "error" ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          {notification.msg}
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-gray-400">
          <Loader2 className="animate-spin mb-4" size={40} />
          <p className="font-medium">Loading settings...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Business Profile Section */}
          <div className="bg-white border border-[#dce5df] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#047857] flex items-center justify-center">
                <Building2 size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#161b19]">Business Profile</h2>
                <p className="text-xs text-gray-500">Update your UMKM information</p>
              </div>
            </div>

            <form onSubmit={handleSaveBusiness} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2">Business Name</label>
                <input
                  type="text"
                  required
                  value={business.name}
                  onChange={(e) => setBusiness({...business, name: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl py-2.5 px-4 outline-none focus:border-[#047857] transition"
                  placeholder="e.g. Toko Kopi Berkah"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Monthly Income Target (Rp)</label>
                <input
                  type="number"
                  required
                  value={business.monthly_target}
                  onChange={(e) => setBusiness({...business, monthly_target: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl py-2.5 px-4 outline-none focus:border-[#047857] transition"
                  placeholder="e.g. 10000000"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Business Description / Tagline</label>
                <textarea
                  value={business.description}
                  onChange={(e) => setBusiness({...business, description: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl py-2.5 px-4 outline-none focus:border-[#047857] transition resize-none h-24"
                  placeholder="e.g. Premium local coffee shop and roastery"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingBusiness}
                  className="flex items-center gap-2 bg-[#047857] hover:bg-[#056b4f] text-white px-6 py-2.5 rounded-xl font-semibold transition disabled:opacity-50"
                >
                  {savingBusiness ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  Save Profile
                </button>
              </div>
            </form>
          </div>

          {/* Account Security Section */}
          <div className="bg-white border border-[#dce5df] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#047857] flex items-center justify-center">
                <Lock size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#161b19]">Account Security</h2>
                <p className="text-xs text-gray-500">Manage your password and authentication</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-1 text-gray-500">Registered Email</label>
              <div className="text-base font-bold text-[#161b19] bg-gray-50 p-3 rounded-xl border border-gray-200">
                {user?.email || "user@example.com"}
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Change Password (Placeholder)</h3>
              
              <div>
                <label className="block text-sm font-semibold mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl py-2.5 px-4 outline-none focus:border-[#047857] transition"
                  placeholder="••••••••"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl py-2.5 px-4 outline-none focus:border-[#047857] transition"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl py-2.5 px-4 outline-none focus:border-[#047857] transition"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="flex items-center gap-2 bg-[#047857] hover:bg-[#056b4f] text-white px-6 py-2.5 rounded-xl font-semibold transition disabled:opacity-50"
                >
                  {savingPassword ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  Update Password
                </button>
              </div>
            </form>
          </div>

          {/* Preferences Section */}
          <div className="bg-white border border-[#dce5df] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#047857] flex items-center justify-center">
                <Sliders size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#161b19]">Preferences</h2>
                <p className="text-xs text-gray-500">System currency, timezone, and notifications</p>
              </div>
            </div>

            <form onSubmit={handleSavePreferences} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Currency</label>
                  <select
                    value={preferences.currency}
                    onChange={(e) => setPreferences({...preferences, currency: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl py-2.5 px-4 outline-none focus:border-[#047857] transition bg-white"
                  >
                    <option value="IDR">IDR (Indonesian Rupiah)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Timezone</label>
                  <select
                    value={preferences.timezone}
                    onChange={(e) => setPreferences({...preferences, timezone: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl py-2.5 px-4 outline-none focus:border-[#047857] transition bg-white"
                  >
                    <option value="Asia/Jakarta">WIB - Western Indonesia Time (Asia/Jakarta)</option>
                    <option value="Asia/Makassar">WITA - Central Indonesia Time</option>
                    <option value="Asia/Jayapura">WIT - Eastern Indonesia Time</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <h4 className="text-sm font-bold text-[#161b19]">Email Notifications</h4>
                  <p className="text-xs text-gray-500">Receive summary and alerts about business performance</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.notifications}
                    onChange={(e) => setPreferences({...preferences, notifications: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#047857]"></div>
                </label>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-[#047857] hover:bg-[#056b4f] text-white px-6 py-2.5 rounded-xl font-semibold transition"
                >
                  <Save size={18} />
                  Save Preferences
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default Settings;
