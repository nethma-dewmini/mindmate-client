import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { authService } from "../services/authService";
import {
  DEFAULT_ASSESSMENTS,
  buildAssessmentResult,
  normalizeAssessment,
  normalizeAssessmentList,
} from "../data/assessmentCatalog";

const AssessmentPage = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadAssessments = async () => {
      try {
        const data = await authService.getPublicAssessments();
        if (!isMounted) {
          return;
        }

        const nextAssessments = normalizeAssessmentList(data.assessments);

        setAssessments(nextAssessments);
        if (nextAssessments.length === 0) {
          setError("No public assessments are available yet.");
        }
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setAssessments(DEFAULT_ASSESSMENTS);
        setError(loadError.message || "Failed to load assessments.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAssessments();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f9f5e7] py-8 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-sm text-[#5bb5a1] hover:text-[#4a9d8b] font-medium transition-colors"
          >
            <span className="mr-1.5">←</span> Back to Dashboard
          </Link>
        </div>

        <div className="flex justify-between items-start mb-8 gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Mental Health Assessments
            </h1>
            <p className="mt-2 text-gray-500 max-w-2xl">
              Take evidence-based assessments to understand your mental well-being
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8 border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-2">
            Confidential & Anonymous
          </h2>
          <p className="text-gray-500">
            Your responses are private and are only used to show you the
            selected assessment result.
          </p>
          {error ? (
            <p className="mt-3 text-sm text-amber-700 bg-amber-50 rounded-xl px-4 py-3">
              {error}
            </p>
          ) : null}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse"
              >
                <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-gray-100" />
                <div className="h-5 bg-gray-100 rounded mb-3" />
                <div className="h-4 bg-gray-100 rounded mb-2" />
                <div className="h-4 bg-gray-100 rounded w-4/5 mx-auto mb-6" />
                <div className="h-10 bg-gray-100 rounded-lg" />
              </div>
            ))}
          </div>
        ) : assessments.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No assessments published yet
            </h3>
            <p className="text-gray-500">
              Check back later when an expert publishes a public assessment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assessments.map((assessment) => (
              <Link key={assessment.id} to={`/assessment/${assessment.id}`}>
                <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 text-center h-full">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl flex items-center justify-center">
                    <span className="text-4xl">{assessment.icon}</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    {assessment.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 min-h-12">
                    {assessment.description}
                  </p>
                  <div className="flex justify-center space-x-4 text-xs text-gray-400 mb-2">
                    <span>📝 {assessment.questions.length} questions</span>
                    <span>⏱ {assessment.duration} minutes</span>
                  </div>
                  <div className="text-[11px] text-gray-400 mb-4 flex flex-col items-center gap-0.5">
                    <span>Published by: {assessment.authorName || "MindMate Team"}</span>
                    {assessment.updatedAt && assessment.createdAt && Math.abs(new Date(assessment.updatedAt) - new Date(assessment.createdAt)) > 5000 ? (
                      <span>
                        Modified at: {new Date(assessment.updatedAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    ) : assessment.createdAt ? (
                      <span>
                        Created at: {new Date(assessment.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    ) : null}
                  </div>
                  <span className="inline-flex w-full justify-center py-2 bg-[#2c6e5f] text-white rounded-lg font-medium hover:bg-[#1b4d42]">
                    Start Assessment
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const scoreLabels = {
  Low: "Low",
  Moderate: "Moderate",
  High: "High",
};

export const AssessmentTaking = () => {
  const { id } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadAssessment = async () => {
      try {
        const data = await authService.getAssessmentById(id);
        if (!isMounted) {
          return;
        }

        setAssessment(normalizeAssessment(data.assessment));
        setFetchError("");
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        if (loadError.status === 404) {
          setAssessment(null);
          setFetchError("Assessment not found.");
        } else {
          const fallback = DEFAULT_ASSESSMENTS.find((item) => item.id === id);
          setAssessment(fallback ? normalizeAssessment(fallback) : null);
          setFetchError(loadError.message || "Failed to load assessment.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      loadAssessment();
    } else {
      setLoading(false);
      setAssessment(null);
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    setCurrentQuestion(0);
    setAnswers({});
    setResult(null);
  }, [assessment?.id]);

  const questions = assessment?.questions || [];
  const progress =
    questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  const handleAnswer = (answerIndex) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion]: answerIndex }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      return;
    }

    setResult(buildAssessmentResult(assessment, answers));
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f5e7] py-8 px-6">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 shadow-sm text-center border border-gray-100">
          <h1 className="text-2xl font-semibold text-gray-800 mb-3">
            Loading assessment
          </h1>
          <p className="text-gray-500">Preparing your assessment.</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-[#f9f5e7] py-8 px-6">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 shadow-sm text-center border border-gray-100">
          <h1 className="text-2xl font-semibold text-gray-800 mb-3">
            Assessment not found
          </h1>
          <p className="text-gray-500 mb-6">
            {fetchError || "No assessment template is available for this link."}
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
        <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 shadow-sm text-center border border-gray-100">
          <h1 className="text-2xl font-semibold text-gray-800 mb-3">
            This assessment is empty
          </h1>
          <p className="text-gray-500 mb-6">
            The selected assessment does not have any questions yet.
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

  return (
    <div className="min-h-screen bg-[#f9f5e7] py-8 px-6">
      <div className="max-w-3xl mx-auto">
        {result ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
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
                    {scoreLabels[result.severity] || result.severity}
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
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-gray-100">
              <Link
                to="/assessment"
                className="text-[#5bb5a1] text-sm flex items-center mb-4 hover:underline"
              >
                <FaArrowLeft className="mr-2" /> Back to Assessments
              </Link>
              <h1 className="text-xl font-semibold text-[#5bb5a1] mb-1">
                {assessment.title}
              </h1>
              <div className="flex justify-between items-center text-xs text-gray-400 mb-3">
                <span>By: {assessment.authorName || "MindMate Team"}</span>
                {assessment.updatedAt && assessment.createdAt && Math.abs(new Date(assessment.updatedAt) - new Date(assessment.createdAt)) > 5000 ? (
                  <span>
                    Modified at: {new Date(assessment.updatedAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                ) : assessment.createdAt ? (
                  <span>
                    Published: {new Date(assessment.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                ) : null}
              </div>
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

            <div className="bg-white rounded-2xl p-8 shadow-sm mb-6 border border-gray-100">
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
