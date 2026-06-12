import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { FaBars, FaTimes, FaUser, FaSignOutAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import mindmateLogo from "../assets/mindmate_logo.png";

const Navbar = ({ isAuthenticated = false, user = null, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const publicLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const authLinks = [
    // Removed individual app links — replaced by a single admin access button when appropriate
  ];

  // Show public links only on the homepage; otherwise use auth links when logged in
  const links =
    location.pathname === "/" ? publicLinks : isAuthenticated ? authLinks : [];
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.img
              whileHover={{ rotate: 10, scale: 1.1 }}
              src={mindmateLogo}
              alt="MindMate"
              className="w-10 h-10 rounded-xl"
            />
            <span className="text-xl font-bold text-slate-800">MindMate</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="relative font-medium text-slate-600 hover:text-[#2c6e5f] transition-colors group py-2"
              >
                {link.name}
                {/* Active/Hover underline effect */}
                <motion.span
                  className={`absolute bottom-0 left-0 h-0.5 bg-[#2c6e5f] transition-all duration-300 ${
                    isActive(link.path) ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-slate-600 cursor-pointer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-slate-200 overflow-hidden"
            >
              <div className="flex flex-col space-y-3 py-4">
                {links.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`font-medium py-2 px-4 rounded-lg transition-colors ${
                      isActive(link.path)
                        ? "text-[#2c6e5f] bg-[#2c6e5f]/10"
                        : "text-slate-600 hover:text-[#2c6e5f] hover:bg-slate-50"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
