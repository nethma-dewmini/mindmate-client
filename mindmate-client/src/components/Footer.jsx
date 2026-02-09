import { Link } from "react-router-dom";
import {
  FaBrain,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa";

const Footer = () => {
  const footerLinks = {
    Product: [
      { name: "Features", path: "/features" },
      { name: "Pricing", path: "/pricing" },
      { name: "FAQ", path: "/faq" },
    ],
    Company: [
      { name: "About Us", path: "/about" },
      { name: "Contact", path: "/contact" },
      { name: "Careers", path: "/careers" },
    ],
    Resources: [
      { name: "Blog", path: "/blog" },
      { name: "Support", path: "/support" },
      { name: "Privacy", path: "/privacy" },
    ],
    Legal: [
      { name: "Terms of Service", path: "/terms" },
      { name: "Privacy Policy", path: "/privacy" },
      { name: "Cookie Policy", path: "/cookies" },
    ],
  };

  const socialLinks = [
    { icon: FaFacebook, path: "#" },
    { icon: FaTwitter, path: "#" },
    { icon: FaInstagram, path: "#" },
    { icon: FaLinkedin, path: "#" },
  ];

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <FaBrain className="text-white text-xl" />
              </div>
              <span className="text-xl font-bold">MindMate</span>
            </Link>
            <p className="text-slate-400 text-sm mb-4">
              Your AI-powered mental wellness companion for a healthier mind.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.path}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
                {category}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-slate-400 hover:text-white text-sm transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} MindMate. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link
              to="/privacy"
              className="text-slate-400 hover:text-white text-sm"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="text-slate-400 hover:text-white text-sm"
            >
              Terms
            </Link>
            <Link
              to="/cookies"
              className="text-slate-400 hover:text-white text-sm"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
