import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import {
  calculateAssessmentResult,
  getAssessmentById,
  loadAssessmentCatalog,
} from "../data/assessmentCatalog";

const statusStyles = {
  active: "bg-emerald-100 text-emerald-800",
  draft: "bg-amber-100 text-amber-800",
  archived: "bg-slate-100 text-slate-700",
};

const AssessmentPage = () => {
  const [catalog, setCatalog] = useState(() => loadAssessmentCatalog());

  useEffect(() => {
    setCatalog(loadAssessmentCatalog());
  }, []);

  const activeAssessments = useMemo(
    () => catalog.filter((assessment) => assessment.status !== "archived"),
    [catalog],
  );

  return (
    <div className="min-h-screen bg-[#f9f5e7] py-8 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Mental Health Assessments
            </h1>
          </div>
          <p className="text-gray-500 max-w-md text-right">
            Take evidence-based assessments to understand your mental well-being
          </p>
        </div>

        {/* Confidentiality Notice */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <h2 className="font-semibold text-gray-800 mb-2">
            Confidential & Anonymous
          </h2>
          <p className="text-gray-500">
            Your responses are completely private and will help you understand
            your mental health better
          </p>
        </div>

        {/* Assessment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeAssessments.map((assessment) => (
            <Link key={assessment.id} to={`/assessment/${assessment.id}`}>
              <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 text-center h-full">
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl flex items-center justify-center">
                  <span className="text-4xl">{assessment.icon}</span>
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-800">
                    {assessment.title}
                  </h3>
                  <span
                    className={`text-[10px] px-2 py-1 rounded-full font-medium uppercase tracking-wide ${statusStyles[assessment.status] || "bg-slate-100 text-slate-700"}`}
                  >
                    {assessment.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-4 min-h-12">
                  {assessment.description}
                </p>
                <div className="flex justify-center space-x-4 text-xs text-gray-400 mb-4">
                  <span>📝 {assessment.questions.length} questions</span>
                  <span>⏱ {assessment.duration} minutes</span>
                </div>
                <div className="w-full py-2 bg-[#e74c3c] text-white rounded-lg font-medium hover:bg-[#c0392b]">
                  Start Assessment
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

// Assessment Taking Component
export const AssessmentTaking = () => {
  const { id } = useParams();
  const [catalog, setCatalog] = useState(() => loadAssessmentCatalog());
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  useEffect(() => {
    setCatalog(loadAssessmentCatalog());
  }, [id]);

  const assessment =
    getAssessmentById(catalog, id) ||
    catalog.find((item) => item.status === "active") ||
    catalog[0] ||
    null;
  const questions = assessment?.questions || [];
  const progress =
    questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  useEffect(() => {
    setCurrentQuestion(0);
    setAnswers({});
    setResult(null);
  }, [assessment?.id]);

  if (!assessment) {
    return (
      <div className="min-h-screen bg-[#f9f5e7] py-8 px-6">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 shadow-sm text-center">
          <h1 className="text-2xl font-semibold text-gray-800 mb-3">
            Assessment not found
          </h1>
          <p className="text-gray-500 mb-6">
            No assessment templates are available right now.
          </p>
          <Link
            to="/assessment"
            className="inline-flex items-center px-5 py-3 bg-[#5bb5a1] text-white rounded-xl font-medium hover:bg-[#4a9d8b]"
          >
            <FaArrowLeft className="mr-2" /> Back to Assessments
          </Link>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#f9f5e7] py-8 px-6">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 shadow-sm text-center">
          <h1 className="text-2xl font-semibold text-gray-800 mb-3">
            This assessment is empty
          </h1>
          <p className="text-gray-500 mb-6">
            The selected template does not have any questions yet. Please ask an
            admin to add a question set before taking it.
          </p>
          <Link
            to="/assessment"
            className="inline-flex items-center px-5 py-3 bg-[#5bb5a1] text-white rounded-xl font-medium hover:bg-[#4a9d8b]"
          >
            <FaArrowLeft className="mr-2" /> Back to Assessments
          </Link>
        </div>
      </div>
    );
  }

  const handleAnswer = (answerIndex) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion]: answerIndex }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setResult(calculateAssessmentResult(assessment, answers));
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f5e7] py-8 px-6">
      <div className="max-w-3xl mx-auto">
        {result ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <Link
              to="/assessment"
              className="text-[#5bb5a1] text-sm flex items-center mb-4 hover:underline"
            >
              <FaArrowLeft className="mr-2" /> Back to Assessments
            </Link>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-teal-50 flex items-center justify-center text-4xl">
                {assessment.icon}
              </div>
              <h1 className="text-2xl font-semibold text-gray-800 mb-2">
                Assessment complete
              </h1>
              <p className="text-gray-500 mb-6 max-w-xl mx-auto">
                {assessment.title}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="rounded-2xl border border-gray-200 p-4">
                  <div className="text-xs uppercase tracking-wide text-gray-400">
                    Score
                  </div>
                  <div className="text-2xl font-bold text-gray-800 mt-1">
                    {result.score}/{result.maxScore}
                  </div>
                </div>
                <div className="rounded-2xl border border-gray-200 p-4">
                  <div className="text-xs uppercase tracking-wide text-gray-400">
                    Level
                  </div>
                  <div className="text-2xl font-bold text-[#5bb5a1] mt-1">
                    {result.severity}
                  </div>
                </div>
                <div className="rounded-2xl border border-gray-200 p-4">
                  <div className="text-xs uppercase tracking-wide text-gray-400">
                    Completion
                  </div>
                  <div className="text-2xl font-bold text-gray-800 mt-1">
                    100%
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-[#f0fbf8] p-5 text-left">
                <h2 className="font-semibold text-gray-800 mb-2">
                  What this means
                </h2>
                <p className="text-gray-600 leading-7">
                  {result.recommendation}
                </p>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => {
                    setCurrentQuestion(0);
                    setAnswers({});
                    setResult(null);
                  }}
                  className="px-6 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50"
                >
                  Retake Assessment
                </button>
                <Link
                  to="/assessment"
                  className="px-6 py-3 bg-[#5bb5a1] text-white rounded-xl font-medium hover:bg-[#4a9d8b]"
                >
                  Back to Assessments
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Header Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
              <Link
                to="/assessment"
                className="text-[#5bb5a1] text-sm flex items-center mb-4 hover:underline"
              >
                <FaArrowLeft className="mr-2" /> Back to Assessments
              </Link>
              <h1 className="text-xl font-semibold text-[#5bb5a1] mb-2">
                {assessment.title}
              </h1>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-[#5bb5a1] to-green-400 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 text-right">
                Question {currentQuestion + 1} of {questions.length}
              </p>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-2xl p-8 shadow-sm mb-6">
              <h2 className="text-xl font-semibold text-gray-800 text-center mb-2">
                {questions[currentQuestion]?.prompt}
              </h2>
              <p className="text-sm text-gray-500 text-center mb-8">
                {assessment.description}
              </p>

              <div className="space-y-3 max-w-md mx-auto">
                {questions[currentQuestion]?.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className={`w-full py-4 px-6 rounded-xl border-2 text-center transition-all ${
                      answers[currentQuestion] === index
                        ? "border-[#5bb5a1] bg-teal-50 text-[#5bb5a1]"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="px-8 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={answers[currentQuestion] === undefined}
                className="px-8 py-3 bg-[#5bb5a1] text-white rounded-xl font-medium hover:bg-[#4a9d8b] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentQuestion === questions.length - 1 ? "Finish" : "Next"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AssessmentPage;
