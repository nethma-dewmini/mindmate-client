import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const assessments = [
  {
    id: "stress",
    title: "Stress Level Assessment",
    description: "Evaluate your current stress levels and identify triggers",
    questions: 10,
    duration: 5,
    icon: "😰",
  },
  {
    id: "anxiety",
    title: "Anxiety Screening",
    description:
      "Check for symptoms of anxiety and get personalized recommendations",
    questions: 12,
    duration: 7,
    icon: "😟",
  },
  {
    id: "depression",
    title: "Depression Screening (PHQ-9)",
    description: "Assess depression symptoms using the PHQ-9 questionnaire",
    questions: 9,
    duration: 5,
    icon: "😔",
  },
  {
    id: "sleep",
    title: "Sleep Quality Assessment",
    description:
      "Evaluate your sleep patterns and their impact on mental health",
    questions: 8,
    duration: 4,
    icon: "😴",
  },
];

const sampleQuestions = [
  {
    question: "How often have you felt nervous or stressed in the past week?",
    options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
  },
  {
    question: "How would you rate your overall sleep quality?",
    options: ["Excellent", "Good", "Fair", "Poor", "Very Poor"],
  },
  {
    question: "How often do you feel overwhelmed by your responsibilities?",
    options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
  },
  {
    question: "How well are you able to concentrate on tasks?",
    options: ["Very well", "Well", "Moderately", "Poorly", "Very poorly"],
  },
  {
    question: "How often do you feel fatigued or low on energy?",
    options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
  },
];

const AssessmentPage = () => {
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
          {assessments.map((assessment) => (
            <Link key={assessment.id} to={`/assessment/${assessment.id}`}>
              <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 text-center">
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl flex items-center justify-center">
                  <span className="text-4xl">{assessment.icon}</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  {assessment.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {assessment.description}
                </p>
                <div className="flex justify-center space-x-4 text-xs text-gray-400 mb-4">
                  <span>📝 {assessment.questions} questions</span>
                  <span>⏱ {assessment.duration} minutes</span>
                </div>
                <button className="w-full py-2 bg-[#e74c3c] text-white rounded-lg font-medium hover:bg-[#c0392b]">
                  Start Assessment
                </button>
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
  const navigate = useNavigate();
  const { id } = useParams();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});

  const assessment = assessments.find((a) => a.id === id) || assessments[0];
  const questions = sampleQuestions;
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (answerIndex) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion]: answerIndex }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      navigate("/assessment");
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
          <h2 className="text-xl font-semibold text-gray-800 text-center mb-8">
            {questions[currentQuestion].question}
          </h2>

          <div className="space-y-3 max-w-md mx-auto">
            {questions[currentQuestion].options.map((option, index) => (
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
      </div>
    </div>
  );
};

export default AssessmentPage;
