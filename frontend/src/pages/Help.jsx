import { useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Package, 
  Receipt, 
  Wallet, 
  FileText, 
  Mail, 
  Phone, 
  MapPin, 
  Info 
} from "lucide-react";

function Help() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "How do I reset my password?",
      answer: "You can update your password from the Settings page under Account Security. If you are locked out, use the 'Forgot Password' link on the login page."
    },
    {
      question: "Can I manage multiple products and stock levels?",
      answer: "Yes! Navigate to the Products page where you can add new items, update prices, and monitor stock availability in real-time."
    },
    {
      question: "How are financial reports calculated?",
      answer: "Reports automatically aggregate your recorded sales transactions and subtract business operational expenses to calculate your net profit and cash flow."
    },
    {
      question: "Is my business data secure?",
      answer: "All data is securely stored in Supabase with enterprise-grade encryption and isolated per user business account (Row Level Security)."
    }
  ];

  const quickGuides = [
    {
      icon: Package,
      title: "How to add products",
      description: "Go to Products > Click '+ Add Product' > Fill in product name, category, price, and initial stock > Save."
    },
    {
      icon: Receipt,
      title: "How to create transactions",
      description: "Go to Transactions > Click '+ Add Transaction' > Select product from inventory > Enter quantity and choose payment method > Submit."
    },
    {
      icon: Wallet,
      title: "How to manage expenses",
      description: "Go to Expenses > Click '+ Add Expense' > Select category, enter amount, description, and payment method > Save."
    },
    {
      icon: FileText,
      title: "How to view reports",
      description: "Go to Reports or Dashboard to monitor your real-time balance, total revenue, expenses breakdown, and business performance."
    }
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#161b19]">Help & Support</h1>
        <p className="text-gray-500 mt-1">Guides, FAQs, and support channels to help you grow your business</p>
      </div>

      <div className="space-y-8">
        {/* Quick Guides Section */}
        <div className="bg-white border border-[#dce5df] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#047857] flex items-center justify-center">
              <HelpCircle size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#161b19]">Quick User Guide</h2>
              <p className="text-xs text-gray-500">Step-by-step instructions for core features</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {quickGuides.map((guide, idx) => {
              const Icon = guide.icon;
              return (
                <div key={idx} className="border border-gray-200 rounded-2xl p-5 hover:border-[#047857] transition bg-[#f5f7f6]/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[#047857] text-white flex items-center justify-center">
                      <Icon size={16} />
                    </div>
                    <h3 className="font-bold text-sm text-[#161b19]">{guide.title}</h3>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{guide.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ Accordion Section */}
        <div className="bg-white border border-[#dce5df] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#047857] flex items-center justify-center">
              <Info size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#161b19]">Frequently Asked Questions</h2>
              <p className="text-xs text-gray-500">Find answers to common questions about Finova</p>
            </div>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden transition">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex justify-between items-center p-4 text-left font-semibold text-sm text-[#161b19] hover:bg-gray-50 transition"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? <ChevronUp size={18} className="text-[#047857]" /> : <ChevronDown size={18} className="text-gray-400" />}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-gray-600 leading-relaxed bg-gray-50/50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Support Contact & About Finova Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Support Contact */}
          <div className="bg-white border border-[#dce5df] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#161b19] mb-1">Support Contact</h3>
              <p className="text-xs text-gray-500 mb-6">Need further assistance? Reach out to our team.</p>

              <div className="space-y-4 text-sm text-gray-600">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#047857] flex items-center justify-center shrink-0">
                    <Mail size={16} />
                  </div>
                  <span className="font-medium">support@finova-umkm.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#047857] flex items-center justify-center shrink-0">
                    <Phone size={16} />
                  </div>
                  <span className="font-medium">+62 812-3456-7890</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#047857] flex items-center justify-center shrink-0">
                    <MapPin size={16} />
                  </div>
                  <span className="font-medium">Jakarta, Indonesia</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <a
                href="mailto:support@finova-umkm.com"
                className="w-full block text-center bg-[#047857] hover:bg-[#056b4f] text-white py-2.5 rounded-xl text-sm font-semibold transition"
              >
                Contact Support
              </a>
            </div>
          </div>

          {/* About Finova */}
          <div className="bg-white border border-[#dce5df] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#047857] text-white flex items-center justify-center font-bold text-xl">
                  F
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#047857]">Finova UMKM Finance</h3>
                  <p className="text-xs text-gray-400">Version 1.0.0-beta</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed mb-6">
                Finova is a smart, user-friendly financial management and business suite designed specifically for UMKM in Indonesia. Track revenue, monitor inventory, record expenses, and gain intelligent insights to scale your business.
              </p>
            </div>

            <div className="border-t border-gray-100 pt-4 text-xs text-gray-400 text-center">
              © 2026 Finova UMKM Finance. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Help;
