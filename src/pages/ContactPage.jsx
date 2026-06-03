import { useState } from "react";
import { Link } from "react-router-dom";
import { FaEnvelope, FaClock, FaShieldAlt, FaPaperPlane } from "react-icons/fa";
import mindmateLogo from "../assets/mindmate_logo.png";
import { authService } from "../services/authService";

const ContactPage = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    setSubmitted(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await authService.submitContactMessage(form);
      setSuccessMessage("Thank you! Your message has been sent to our administrator.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setErrorMessage(err.message || "Failed to submit message. Please try again.");
    } finally {
      setSubmitted(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f5e7] flex flex-col pt-16">
      <div className="max-w-4xl w-full mx-auto px-6 py-12 flex-grow">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-[#2c6e5f] hover:text-[#1b4d42] font-semibold transition-colors"
          >
            <span className="mr-1.5">←</span> Back to Home
          </Link>
        </div>

        {/* Title Banner */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight">
            Contact Support & Admin
          </h1>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto text-sm leading-relaxed">
            We are here to listen, support, and assist you. Reach out to our system administrator for technical help, account assistance, or platform inquiries.
          </p>
        </div>

        {/* Core Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Support Form */}
          <div className="md:col-span-7 bg-white rounded-3xl p-8 border border-gray-100 shadow-soft">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2.5">
              <span>✉️</span> Send a Message
            </h2>
            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100 text-sm animate-in fade-in">
                {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-100 text-sm animate-in fade-in">
                {errorMessage}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2c6e5f]/20 focus:border-[#2c6e5f] transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2c6e5f]/20 focus:border-[#2c6e5f] transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="What is this regarding?"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2c6e5f]/20 focus:border-[#2c6e5f] transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Message
                </label>
                <textarea
                  required
                  rows="4"
                  placeholder="Type your message here..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2c6e5f]/20 focus:border-[#2c6e5f] transition-all text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitted}
                className="w-full py-3.5 bg-[#2c6e5f] hover:bg-[#1b4d42] text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-75"
              >
                <FaPaperPlane size={14} />
                <span>{submitted ? "Sending..." : "Submit Inquiry"}</span>
              </button>
            </form>
          </div>

          {/* Contact Details Card */}
          <div className="md:col-span-5 flex flex-col gap-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-soft">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2c6e5f] bg-[#2c6e5f]/10 px-3 py-1 rounded-full">
                Primary Contact
              </span>
              
              <h2 className="text-lg font-bold text-gray-800 mt-4 mb-2">Administrator Support</h2>
              <p className="text-gray-500 text-xs leading-relaxed mb-6">
                For administrative matters, expert requests, and policy concerns, contact our designated site admin directly.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#2c6e5f]/10 text-[#2c6e5f] flex items-center justify-center shrink-0">
                    <FaEnvelope size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Support Email</h4>
                    <a
                      href="mailto:nethmadewmini24@gmail.com"
                      className="text-sm font-bold text-[#2c6e5f] hover:underline break-all"
                    >
                      nethmadewmini24@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#2c6e5f]/10 text-[#2c6e5f] flex items-center justify-center shrink-0">
                    <FaShieldAlt size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</h4>
                    <p className="text-sm font-bold text-gray-700">Platform Administrator</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#2c6e5f]/10 text-[#2c6e5f] flex items-center justify-center shrink-0">
                    <FaClock size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Response Hours</h4>
                    <p className="text-sm font-bold text-gray-700">Mon - Fri: 9am - 5pm</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Crisis Alert Banner */}
            <div className="bg-rose-50/60 border border-rose-200/50 rounded-3xl p-6 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-100 px-3 py-1 rounded-full">
                Emergency Alert
              </span>
              <h3 className="text-sm font-bold text-rose-800 mt-4 mb-1">Need Immediate Help?</h3>
              <p className="text-xs text-rose-700 leading-relaxed">
                If you are in immediate danger or facing a mental health emergency, please contact local emergency medical services or a crisis helpline. Support emails are not monitored 24/7 for crisis situations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-50 border-t border-gray-100 w-full mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <img src={mindmateLogo} alt="MindMate" className="w-6 h-6" />
            <span className="font-semibold text-gray-800">MindMate</span>
          </div>
          <p className="text-sm text-gray-500">
            © 2025 MindMate. A safe space for mental wellness.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ContactPage;
