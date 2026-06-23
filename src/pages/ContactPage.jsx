import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaEnvelope, FaClock, FaShieldAlt, FaPaperPlane } from "react-icons/fa";
import mindmateLogo from "../assets/mindmate_logo.png";
import { authService } from "../services/authService";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

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
    <div className="min-h-screen bg-[#f9f5e7] flex flex-col pt-16 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" style={{ animationDuration: "8s" }} />
      <div className="absolute bottom-1/3 right-10 w-80 h-80 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" style={{ animationDuration: "12s" }} />

      <div className="max-w-6xl w-full mx-auto px-6 py-12 flex-grow relative z-10">
        {/* Title Banner */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-extrabold text-[#1b4d42] tracking-tight"
          >
            Contact Support & Admin
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-4 text-[#2c6e5f]/85 max-w-2xl mx-auto text-sm md:text-base leading-relaxed font-medium"
          >
            We are here to listen, support, and assist you. Reach out to our system administrator for technical help, account assistance, or platform inquiries.
          </motion.p>
        </div>

        {/* Core Columns */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-12 gap-8"
        >
          {/* Support Form */}
          <motion.div 
            variants={cardVariants}
            className="md:col-span-7 glass-card bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-150 hover-glow-teal transition-all duration-300"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2.5">
              <span>✉️</span> Send a Message
            </h2>
            
            <AnimatePresence mode="wait">
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-4 p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs font-semibold"
                >
                  {successMessage}
                </motion.div>
              )}
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-4 p-3.5 rounded-2xl bg-rose-50 text-rose-800 border border-rose-100 text-xs font-semibold"
                >
                  {errorMessage}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50/80 border border-gray-200 focus:border-[#2c6e5f] focus:ring-4 focus:ring-[#2c6e5f]/10 focus:outline-none rounded-xl transition-all duration-300 text-xs font-medium text-gray-700 placeholder-gray-400 focus:scale-[1.005]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50/80 border border-gray-200 focus:border-[#2c6e5f] focus:ring-4 focus:ring-[#2c6e5f]/10 focus:outline-none rounded-xl transition-all duration-300 text-xs font-medium text-gray-700 placeholder-gray-400 focus:scale-[1.005]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="What is this regarding?"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50/80 border border-gray-200 focus:border-[#2c6e5f] focus:ring-4 focus:ring-[#2c6e5f]/10 focus:outline-none rounded-xl transition-all duration-300 text-xs font-medium text-gray-700 placeholder-gray-400 focus:scale-[1.005]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Message
                </label>
                <textarea
                  required
                  rows="4"
                  placeholder="Type your message here..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50/80 border border-gray-200 focus:border-[#2c6e5f] focus:ring-4 focus:ring-[#2c6e5f]/10 focus:outline-none rounded-xl transition-all duration-300 text-xs font-medium text-gray-700 placeholder-gray-400 focus:scale-[1.005] resize-none leading-relaxed"
                />
              </div>

              <motion.button
                type="submit"
                disabled={submitted}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                className="w-full py-3.5 bg-[#2c6e5f] hover:bg-[#1b4d42] text-white font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-75 text-xs uppercase tracking-wider"
              >
                <FaPaperPlane size={11} />
                <span>{submitted ? "Sending..." : "Submit Inquiry"}</span>
              </motion.button>
            </form>
          </motion.div>

          {/* Contact Details Card */}
          <motion.div 
            variants={cardVariants}
            className="md:col-span-5 flex flex-col gap-6"
          >
            <div className="glass-card bg-white rounded-3xl p-6 border border-gray-150 shadow-sm hover-glow-indigo transition-all duration-300">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2c6e5f] bg-[#2c6e5f]/10 px-3 py-1 rounded-full">
                Primary Contact
              </span>
              
              <h2 className="text-lg font-bold text-gray-800 mt-4 mb-2">Administrator Support</h2>
              <p className="text-gray-500 text-xs leading-relaxed mb-6 font-semibold">
                For administrative matters, expert requests, and policy concerns, contact our designated site admin directly.
              </p>

              <div className="space-y-4">
                <motion.div 
                  whileHover={{ x: 4 }}
                  className="flex items-start gap-3 group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#2c6e5f]/10 text-[#2c6e5f] flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                    <FaEnvelope size={14} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none">Support Email</h4>
                    <a
                      href="mailto:nethmadewmini24@gmail.com"
                      className="text-xs font-bold text-[#2c6e5f] hover:underline break-all mt-1.5 inline-block"
                    >
                      nethmadewmini24@gmail.com
                    </a>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ x: 4 }}
                  className="flex items-start gap-3 group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                    <FaShieldAlt size={14} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none">Role</h4>
                    <p className="text-xs font-bold text-gray-700 mt-1.5">Platform Administrator</p>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ x: 4 }}
                  className="flex items-start gap-3 group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                    <FaClock size={14} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none">Response Hours</h4>
                    <p className="text-xs font-bold text-gray-700 mt-1.5">Mon - Fri: 9am - 5pm</p>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Crisis Alert Banner */}
            <motion.div 
              variants={cardVariants}
              whileHover={{ scale: 1.01 }}
              className="bg-rose-50/60 border border-rose-200/50 rounded-3xl p-6 shadow-sm hover:border-rose-300/60 transition-all duration-300 hover-glow-rose"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-100 px-3 py-1 rounded-full">
                Emergency Alert
              </span>
              <h3 className="text-sm font-bold text-rose-800 mt-4 mb-1">Need Immediate Help?</h3>
              <p className="text-xs text-rose-700 leading-relaxed font-semibold">
                If you are in immediate danger or facing a mental health emergency, please contact local emergency medical services or a crisis helpline. Support emails are not monitored 24/7 for crisis situations.
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
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
