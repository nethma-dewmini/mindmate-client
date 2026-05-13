import { Link } from "react-router-dom";
import { FaStar, FaChartBar, FaUser } from "react-icons/fa";

const ExpertsPage = () => {
  const experts = [
    {
      id: 1,
      name: "Dr. Priya Wijesinghe",
      specialization: "Anxiety & Stress Management",
      qualifications: "Ph.D. in Clinical Psychology, University of Colombo",
      rating: 4.9,
      sessions: 520,
      price: "LKR 3500/session",
    },
    {
      id: 2,
      name: "Dr. Kasun Fernando",
      specialization: "Depression & Mood Disorders",
      qualifications: "MBBS, MD (Psychiatry)",
      rating: 4.8,
      sessions: 630,
      price: "LKR 4000/session",
    },
    {
      id: 3,
      name: "Dr. Amaya Perera",
      specialization: "Relationship & Social Issues",
      qualifications: "M.Sc. in Counseling Psychology",
      rating: 4.7,
      sessions: 340,
      price: "LKR 3000/session",
    },
    {
      id: 4,
      name: "Dr. Ranil Silva",
      specialization: "Academic Performance & Motivation",
      qualifications: "Ph.D. in Educational Psychology",
      rating: 4.9,
      sessions: 450,
      price: "LKR 3500/session",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f9f5e7] py-8 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Mental Health Experts
          </h1>
          <p className="text-gray-500 max-w-md text-right">
            Connect with licensed professionals for personalized support
          </p>
        </div>

        {/* Experts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experts.map((expert) => (
            <div
              key={expert.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center"
            >
              {/* Avatar */}
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUser className="text-3xl text-gray-400" />
              </div>

              {/* Info */}
              <h3 className="font-semibold text-[#5bb5a1] mb-1">
                {expert.name}
              </h3>
              <p className="text-sm text-gray-500 mb-1">
                {expert.specialization}
              </p>
              <p className="text-xs text-gray-400 mb-4">
                {expert.qualifications}
              </p>

              {/* Stats */}
              <div className="flex justify-center items-center space-x-4 mb-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <FaStar className="text-yellow-400 mr-1" /> {expert.rating}
                </span>
                <span className="flex items-center">
                  <FaChartBar className="text-gray-400 mr-1" />{" "}
                  {expert.sessions} sessions
                </span>
              </div>

              {/* Price */}
              <p className="text-[#e74c3c] font-semibold mb-4">
                {expert.price}
              </p>

              {/* Button */}
              <Link
                to={`/experts/${expert.id}`}
                className="block w-full py-3 bg-[#f0b429] text-white rounded-lg font-medium hover:bg-[#d9a41f]"
              >
                View Profile
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpertsPage;
