import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaBook,
  FaFileUpload,
  FaFolderOpen,
} from "react-icons/fa";
import { authService } from "../services/authService";

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
      accent: "bg-teal-50 text-[#5bb5a1]",
    },
    {
      icon: FaFolderOpen,
      title: "Manage Uploaded Resources",
      description: "View your uploads and update or delete them when needed.",
      path: "/expert/resource-library",
      accent: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f9f5e7]">
      <div className="gradient-teal py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">
              <Link
                to="/expert/dashboard"
                className="hover:text-gray-800 transition-colors flex items-center gap-1.5"
              >
                <FaArrowLeft size={12} /> Dashboard
              </Link>
              <span>/</span>
              <span>Resource Management</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FaBook className="text-[#5bb5a1]" /> Resource Management
            </h1>
            <p className="text-gray-600">
              Choose what you want to do next. Each action opens its own page.
            </p>
          </div>
          <Link
            to="/expert/dashboard"
            className="px-4 py-2 bg-white text-gray-700 rounded-lg flex items-center space-x-2 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all font-medium text-sm"
          >
            <FaArrowLeft />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {resourceCards.map((card) => {
            const Icon = card.icon;

            return (
              <Link key={card.title} to={card.path}>
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all h-full">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${card.accent}`}
                  >
                    <Icon size={22} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    {card.title}
                  </h2>
                  <p className="text-sm text-gray-600">{card.description}</p>
                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#5bb5a1]">
                    Open page <FaArrowLeft className="rotate-180" size={12} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ExpertUploadResourcesPage;
