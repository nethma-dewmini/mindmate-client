import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { authService } from "../services/authService";
import {
  DEFAULT_ASSESSMENTS,
  buildAssessmentResult,
  normalizeAssessment,
  normalizeAssessmentList,
} from "../data/assessmentCatalog";

// Stagger variants for cards grid
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// Question slide variants
const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: "spring", stiffness: 320, damping: 25 },
      opacity: { duration: 0.2 },
    },
  },
  exit: (direction) => ({
    x: direction < 0 ? 40 : -40,
    opacity: 0,
    transition: {
      x: { type: "spring", stiffness: 320, damping: 25 },
      opacity: { duration: 0.2 },
    },
  }),
};

// Animated statistic counters
const AnimatedCounter = ({ targetValue }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(targetValue, 10);
    if (isNaN(end) || end === 0) {
      setCount(targetValue);
      return;
    }

    const duration = 1000;
    const incrementTime = Math.max(Math.floor(duration / end), 15);

    const timer = setInterval(() => {
      start += 1;
      if (start >= end) {
        clearInterval(timer);
        setCount(targetValue);
      } else {
        const suffix = typeof targetValue === "string" ? targetValue.replace(/^\d+/, "") : "";
        setCount(start + suffix);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [targetValue]);

  return <span>{count}</span>;
};

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
    <div className="min-h-screen bg-[#f9f5e7] py-10 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-4 border-b border-[#2c6e5f]/10">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1b4d42] tracking-tight">
              Mental Health Assessments
            </h1>
            <p className="mt-1 text-[#2c6e5f]/80 font-medium max-w-2xl text-sm md:text-base leading-relaxed">
              Take evidence-based assessments to understand your mental well-being
            </p>
          </div>
        </div>

        {/* Confidentiality Card */}
        <div className="glass-card rounded-3xl p-6 mb-8 border border-gray-100 flex items-start gap-4">
          <span className="text-3xl animate-float shrink-0">🔒</span>
          <div>
            <h2 className="font-extrabold text-gray-800 mb-1.5">Confidential & Anonymous</h2>
            <p className="text-gray-500 text-sm font-semibold leading-relaxed">
              Your responses are private and are only used to show you the selected assessment
              result.
            </p>
            {error && (
              <p className="mt-3 text-xs text-amber-700 bg-amber-50 rounded-xl px-4 py-2 font-bold shadow-inner">
                {error}
              </p>
            )}
          </div>
        </div>

        {/* Assessments Listing */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-pulse"
              >
                <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gray-100" />
                <div className="h-5 bg-gray-100 rounded mb-3" />
                <div className="h-4 bg-gray-100 rounded mb-2" />
                <div className="h-4 bg-gray-100 rounded w-4/5 mx-auto mb-6" />
                <div className="h-10 bg-gray-100 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : assessments.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 text-center">
            <h3 className="text-lg font-bold text-gray-800 mb-2">No assessments published yet</h3>
            <p className="text-gray-500 text-xs">
              Check back later when an expert publishes a public assessment.
            </p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {assessments.map((assessment) => (
              <motion.div key={assessment.id} variants={cardVariants} className="h-full">
                <Link to={`/assessment/${assessment.id}`} className="group block h-full">
                  <div className="glass-card p-6 rounded-3xl text-center h-full flex flex-col justify-between hover-glow-teal border border-gray-100 bg-white">
                    <div>
                      <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                        <span className="text-4xl">{assessment.icon}</span>
                      </div>
                      <h3 className="font-extrabold text-gray-800 mb-2 group-hover:text-[#2c6e5f] transition-colors leading-tight">
                        {assessment.title}
                      </h3>
                      <p className="text-xs text-gray-500 mb-4 min-h-10 leading-relaxed font-semibold">
                        {assessment.description}
                      </p>

                      <div className="flex justify-center space-x-4 text-[10px] text-gray-400 font-bold mb-4">
                        <span className="bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                          📝 {assessment.questions.length} questions
                        </span>
                        <span className="bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                          ⏱ {assessment.duration} mins
                        </span>
                      </div>

                      <div className="text-[9px] text-gray-400 font-bold mb-6 flex flex-col items-center gap-0.5">
                        <span>Published by: {assessment.authorName || "MindMate Team"}</span>
                        {assessment.updatedAt &&
                        assessment.createdAt &&
                        Math.abs(new Date(assessment.updatedAt) - new Date(assessment.createdAt)) >
                          5000 ? (
                          <span>
                            Modified at:{" "}
                            {new Date(assessment.updatedAt).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        ) : assessment.createdAt ? (
                          <span>
                            Created at:{" "}
                            {new Date(assessment.createdAt).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <motion.span
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex w-full justify-center py-2.5 bg-[#2c6e5f] text-white rounded-xl text-xs font-bold hover:bg-[#1b4d42] shadow-sm transition-all active:scale-95"
                    >
                      Start Assessment
                    </motion.span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
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
  const [direction, setDirection] = useState(0); // Animation navigation direction

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
  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  const handleAnswer = (answerIndex) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion]: answerIndex }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setDirection(1);
      // Let direction update finish before moving question index
      setTimeout(() => {
        setCurrentQuestion((prev) => prev + 1);
      }, 50);
      return;
    }

    setResult(buildAssessmentResult(assessment, answers));
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setDirection(-1);
      setTimeout(() => {
        setCurrentQuestion((prev) => prev - 1);
      }, 50);
    }
  };

  const getSeverityBadgeClass = (severity) => {
    const map = {
      Low: "bg-emerald-50 text-emerald-800 border border-emerald-100",
      Moderate: "bg-amber-50 text-amber-800 border border-amber-100",
      High: "bg-rose-50 text-rose-800 border border-rose-100 animate-pulse",
    };
    return map[severity] || "bg-teal-50 text-teal-800 border border-teal-100";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f5e7] py-10 px-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-md text-center border border-gray-100">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2c6e5f] mx-auto mb-4"></div>
          <h1 className="text-xl font-bold text-gray-800 mb-1">Loading Assessment</h1>
          <p className="text-gray-400 text-xs font-semibold">
            Preparing your mental health check-in...
          </p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-[#f9f5e7] py-10 px-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-md text-center border border-gray-100">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Assessment Not Found</h1>
          <p className="text-gray-500 text-xs leading-relaxed font-semibold mb-6">
            {fetchError || "No assessment template is available for this link."}
          </p>
          <Link
            to="/assessment"
            className="inline-flex items-center px-5 py-2.5 bg-[#2c6e5f] hover:bg-[#1b4d42] text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <FaArrowLeft className="mr-2" /> Back to Assessments
          </Link>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#f9f5e7] py-10 px-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-md text-center border border-gray-100">
          <div className="text-4xl mb-4">📝</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">This assessment is empty</h1>
          <p className="text-gray-500 text-xs font-semibold mb-6">
            The selected assessment does not have any questions yet.
          </p>
          <Link
            to="/assessment"
            className="inline-flex items-center px-5 py-2.5 bg-[#2c6e5f] hover:bg-[#1b4d42] text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <FaArrowLeft className="mr-2" /> Back to Assessments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f5e7] py-10 px-6">
      <div className="max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
            >
              <Link
                to="/assessment"
                className="text-[#2c6e5f] text-xs font-bold flex items-center mb-6 hover:underline link-arrow-left"
              >
                <span className="mr-1">←</span> Back to Assessments
              </Link>

              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-emerald-50 rounded-2xl flex items-center justify-center text-4xl animate-float">
                  {assessment.icon}
                </div>
                <h1 className="text-2xl font-extrabold text-gray-800 mb-1">Assessment Complete</h1>
                <p className="text-gray-500 text-sm font-semibold mb-8 max-w-xl mx-auto">
                  {assessment.title}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 hover:shadow-sm transition-all"
                  >
                    <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                      Score
                    </div>
                    <div className="text-2xl font-extrabold text-gray-800 mt-1">
                      <AnimatedCounter targetValue={result.score} />/{result.maxScore}
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -2 }}
                    className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 hover:shadow-sm transition-all"
                  >
                    <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                      Severity
                    </div>
                    <div
                      className={`text-sm font-extrabold px-3 py-1 rounded-full mt-2 inline-block ${getSeverityBadgeClass(result.severity)}`}
                    >
                      {scoreLabels[result.severity] || result.severity}
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -2 }}
                    className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 hover:shadow-sm transition-all"
                  >
                    <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                      Completion
                    </div>
                    <div className="text-2xl font-extrabold text-gray-800 mt-1">100%</div>
                  </motion.div>
                </div>

                <div className="rounded-3xl bg-emerald-50/40 border border-emerald-100/50 p-5 text-left shadow-inner">
                  <h2 className="font-extrabold text-emerald-800 text-sm mb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <span>💡</span> What this means
                  </h2>
                  <p className="text-gray-700 text-sm leading-relaxed font-semibold">
                    {result.recommendation}
                  </p>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setCurrentQuestion(0);
                      setAnswers({});
                      setResult(null);
                    }}
                    className="px-6 py-3 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-xl text-xs font-bold text-gray-600 transition-all cursor-pointer active:scale-95"
                  >
                    Retake Assessment
                  </motion.button>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      to="/assessment"
                      className="px-6 py-3.5 bg-[#2c6e5f] hover:bg-[#1b4d42] text-white rounded-xl text-xs font-bold transition-all shadow-md block"
                    >
                      Back to Assessments
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="quiz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Question Header Status */}
              <div className="bg-white rounded-3xl p-6 shadow-sm mb-6 border border-gray-100">
                <Link
                  to="/assessment"
                  className="text-[#2c6e5f] text-xs font-bold flex items-center mb-4 hover:underline link-arrow-left"
                >
                  <span className="mr-1">←</span> Back to Assessments
                </Link>
                <h1 className="text-xl font-extrabold text-[#1b4d42] mb-3">{assessment.title}</h1>

                <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold mb-3">
                  <span>By: {assessment.authorName || "MindMate Team"}</span>
                  {assessment.updatedAt &&
                  assessment.createdAt &&
                  Math.abs(new Date(assessment.updatedAt) - new Date(assessment.createdAt)) >
                    5000 ? (
                    <span>
                      Modified:{" "}
                      {new Date(assessment.updatedAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  ) : assessment.createdAt ? (
                    <span>
                      Published:{" "}
                      {new Date(assessment.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  ) : null}
                </div>

                {/* Smooth Progress Bar */}
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2 shadow-inner">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#2c6e5f] to-[#5bb5a1]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  />
                </div>
                <p className="text-xs text-gray-500 font-bold text-right mt-1.5">
                  Question {currentQuestion + 1} of {questions.length}
                </p>
              </div>

              {/* Dynamic Question Slider */}
              <div className="overflow-hidden relative rounded-3xl">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentQuestion}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="bg-white rounded-3xl p-8 shadow-sm mb-6 border border-gray-100"
                  >
                    <h2 className="text-xl font-extrabold text-gray-800 text-center mb-2 leading-snug">
                      {questions[currentQuestion]?.prompt}
                    </h2>
                    <p className="text-xs text-gray-400 font-bold text-center mb-8 italic">
                      Choose the option that matches you best.
                    </p>

                    <div className="space-y-3.5 max-w-md mx-auto">
                      {questions[currentQuestion]?.options.map((option, index) => {
                        const isSelected = answers[currentQuestion] === index;
                        return (
                          <motion.button
                            key={index}
                            onClick={() => handleAnswer(index)}
                            whileHover={{ scale: 1.01, x: 2 }}
                            whileTap={{ scale: 0.99 }}
                            className={`w-full py-4 px-6 rounded-2xl border-2 text-center text-sm font-bold transition-all cursor-pointer ${
                              isSelected
                                ? "border-[#2c6e5f] bg-[#2c6e5f]/5 text-[#2c6e5f]"
                                : "border-gray-100 hover:border-gray-200 text-gray-700 bg-gray-50/30"
                            }`}
                          >
                            {option}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between mt-2">
                <motion.button
                  whileHover={currentQuestion > 0 ? { scale: 1.02 } : {}}
                  whileTap={currentQuestion > 0 ? { scale: 0.98 } : {}}
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className="px-8 py-3 border border-gray-200 rounded-2xl font-bold text-xs text-gray-500 hover:bg-white hover:border-gray-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                >
                  Previous
                </motion.button>

                <motion.button
                  whileHover={answers[currentQuestion] !== undefined ? { scale: 1.02 } : {}}
                  whileTap={answers[currentQuestion] !== undefined ? { scale: 0.98 } : {}}
                  onClick={handleNext}
                  disabled={answers[currentQuestion] === undefined}
                  className={`px-8 py-3 rounded-2xl font-bold text-xs transition-all shadow-md active:scale-95 ${
                    answers[currentQuestion] === undefined
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                      : "bg-[#2c6e5f] text-white hover:bg-[#1b4d42]"
                  }`}
                >
                  {currentQuestion === questions.length - 1 ? "Finish" : "Next"}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AssessmentPage;
