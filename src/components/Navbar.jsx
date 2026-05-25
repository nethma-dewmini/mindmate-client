import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { FaBars, FaTimes, FaUser, FaSignOutAlt } from "react-icons/fa";
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
            <img
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
                className={`font-medium transition-colors ${
                  isActive(link.path)
                    ? "text-indigo-600"
                    : "text-slate-600 hover:text-indigo-600"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {user?.role === "admin" && (
                  <Link
                    to="/admin"
                    className="px-3 py-2 bg-[#5bb5a1] text-white rounded-lg font-medium hover:bg-[#4a9d8b] transition-colors"
                  >
                    Admin
                  </Link>
                )}
              </div>
            ) : (
              <div>
                <Link
                  to="/admin"
                  className="px-3 py-2 bg-[#5bb5a1] text-white rounded-lg font-medium hover:bg-[#4a9d8b] transition-colors"
                >
                  Admin
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-slate-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200">
            <div className="flex flex-col space-y-3">
              {links.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`font-medium py-2 ${
                    isActive(link.path)
                      ? "text-indigo-600"
                      : "text-slate-600 hover:text-indigo-600"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              {!isAuthenticated && (
                <div className="flex flex-col space-y-2 pt-4 border-t border-slate-200">
                  <Link
                    to="/admin"
                    className="text-center py-2.5 text-indigo-600 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Admin
                  </Link>
                </div>
              )}
              {isAuthenticated && (
                <div className="flex flex-col space-y-2 pt-4 border-t border-slate-200">
                  {user?.role === "admin" && (
                    <Link
                      to="/admin"
                      className="text-slate-600 hover:text-indigo-600 font-medium py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
