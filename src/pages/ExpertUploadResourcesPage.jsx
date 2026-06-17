import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaBook,
  FaFileUpload,
  FaFolderOpen,
  FaArrowLeft,
} from "react-icons/fa";
import { authService } from "../services/authService";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
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

const ExpertUploadResourcesPage = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser() || {
    name: "Expert",
    role: "expert",
  };

  if (!authService.isAuthenticated() || user.role !== "expert") {
    navigate("/login");
    return null;
  }

  const resourceCards = [
    {
      icon: FaFileUpload,
      title: "Upload Resource",
      description: "Open the form to add a new clinical resource for students.",
      path: "/expert/resource-upload",
      accent: "bg-teal-50 text-[#2c6e5f]",
      glowColor: "teal",
    },
    {
      icon: FaFolderOpen,
      title: "Manage Uploaded Resources",
      description: "View your uploads and update or delete them when needed.",
      path: "/expert/resource-library",
      accent: "bg-amber-50 text-amber-600",
      glowColor: "amber",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f9f5e7] py-10 px-6 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Page Header */}
      <div className="max-w-6xl mx-auto mb-8 pb-4 border-b border-[#2c6e5f]/10">
        <h1 className="text-3xl font-extrabold text-[#1b4d42] tracking-tight flex items-center gap-2">
          <FaBook className="text-[#2c6e5f] shrink-0 animate-float" /> Resource Management
        </h1>
        <p className="text-[#2c6e5f]/80 mt-1 font-medium max-w-2xl leading-relaxed text-sm md:text-base">
          Choose what you want to do next. Each action opens its own page.
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {resourceCards.map((card) => {
            const Icon = card.icon;

            return (
              <motion.div
                key={card.title}
                variants={cardVariants}
                whileHover={{ y: -6 }}
                className="h-full"
              >
                <Link to={card.path} className="block h-full">
                  <div className={`glass-card p-8 h-full flex flex-col justify-between group hover-glow-${card.glowColor}`}>
                    <div>
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 ${card.accent}`}
                      >
                        <Icon size={22} />
                      </div>
                      <h2 className="text-xl font-bold text-gray-800 mb-2">
                        {card.title}
                      </h2>
                      <p className="text-sm text-gray-500 leading-relaxed">{card.description}</p>
                    </div>
                    
                    <div className="mt-6 inline-flex items-center gap-1.5 text-xs font-extrabold text-[#2c6e5f] group-hover:text-[#1b4d42] transition-colors">
                      <span>Open page</span>
                      <FaArrowLeft className="rotate-180 text-[10px] transition-transform duration-200 group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default ExpertUploadResourcesPage;

