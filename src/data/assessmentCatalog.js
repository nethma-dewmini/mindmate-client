const DEFAULT_ASSESSMENTS = [
  {
    id: "stress",
    key: "stress",
    title: "Stress Level Assessment",
    description:
      "Evaluate your current stress load, common triggers, and how much it is affecting your routine.",
    icon: "😰",
    duration: 6,
    visibility: "public",
    questions: [
      {
        prompt:
          "How often have deadlines or workload felt overwhelming recently?",
        options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
      },
      {
        prompt:
          "How much tension do you feel in your body during a typical day?",
        options: ["None", "A little", "Moderate", "A lot", "Extreme"],
      },
      {
        prompt:
          "How easy is it for you to switch off from academic or personal worries?",
        options: ["Very easy", "Easy", "Mixed", "Hard", "Very hard"],
      },
      {
        prompt: "How often do you feel your energy is drained by stress?",
        options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
      },
      {
        prompt: "How confident do you feel in managing pressure right now?",
        options: [
          "Very confident",
          "Confident",
          "Somewhat",
          "Not much",
          "Not at all",
        ],
      },
    ],
  },
  {
    id: "anxiety",
    key: "anxiety",
    title: "Anxiety Screening",
    description:
      "Check for recurring worry, nervousness, and body symptoms linked with anxiety.",
    icon: "😟",
    duration: 7,
    visibility: "public",
    questions: [
      {
        prompt:
          "How often have you felt nervous or on edge in the last two weeks?",
        options: [
          "Never",
          "Several days",
          "More than half the days",
          "Nearly every day",
          "Constantly",
        ],
      },
      {
        prompt: "How often do you struggle to stop worrying once it starts?",
        options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
      },
      {
        prompt: "How much has anxiety affected your concentration?",
        options: ["Not at all", "A little", "Moderately", "A lot", "Severely"],
      },
      {
        prompt:
          "How often do you notice physical symptoms like a racing heart or restlessness?",
        options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
      },
      {
        prompt:
          "How much does fear of future events affect your day-to-day mood?",
        options: [
          "Not at all",
          "A little",
          "Somewhat",
          "Quite a bit",
          "Extremely",
        ],
      },
    ],
  },
  {
    id: "depression",
    key: "depression",
    title: "Depression Screening (PHQ-9 style)",
    description:
      "Review mood, interest, motivation, and energy patterns associated with low mood.",
    icon: "😔",
    duration: 8,
    visibility: "public",
    questions: [
      {
        prompt:
          "How often have you had little interest or pleasure in doing things?",
        options: [
          "Not at all",
          "Several days",
          "More than half the days",
          "Nearly every day",
          "Almost always",
        ],
      },
      {
        prompt: "How often have you felt down, depressed, or hopeless?",
        options: [
          "Not at all",
          "Several days",
          "More than half the days",
          "Nearly every day",
          "Almost always",
        ],
      },
      {
        prompt:
          "How often have you felt low energy or struggled to get started?",
        options: [
          "Not at all",
          "Several days",
          "More than half the days",
          "Nearly every day",
          "Almost always",
        ],
      },
      {
        prompt: "How often have you had trouble sleeping or sleeping too much?",
        options: [
          "Not at all",
          "Several days",
          "More than half the days",
          "Nearly every day",
          "Almost always",
        ],
      },
      {
        prompt:
          "How difficult has it been to handle daily tasks because of your mood?",
        options: [
          "Not difficult",
          "A little difficult",
          "Moderately difficult",
          "Very difficult",
          "Extremely difficult",
        ],
      },
    ],
  },
  {
    id: "sleep",
    key: "sleep",
    title: "Sleep Quality Assessment",
    description:
      "Measure sleep duration, sleep quality, and how refreshed you feel during the day.",
    icon: "😴",
    duration: 5,
    visibility: "public",
    questions: [
      {
        prompt: "How would you describe your sleep quality over the last week?",
        options: ["Excellent", "Good", "Fair", "Poor", "Very poor"],
      },
      {
        prompt: "How often do you have trouble falling asleep?",
        options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
      },
      {
        prompt:
          "How often do you wake up during the night and struggle to sleep again?",
        options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
      },
      {
        prompt: "How refreshed do you feel when you wake up?",
        options: [
          "Very refreshed",
          "Refreshed",
          "Neutral",
          "Tired",
          "Exhausted",
        ],
      },
      {
        prompt:
          "How much does poor sleep affect your concentration in the daytime?",
        options: ["Not at all", "A little", "Somewhat", "A lot", "Extremely"],
      },
    ],
  },
];

function cloneQuestion(question) {
  return {
    prompt: String(question?.prompt || "").trim(),
    options: Array.isArray(question?.options)
      ? question.options
          .map((option) => String(option || "").trim())
          .filter(Boolean)
      : [],
  };
}

export function normalizeAssessment(assessment) {
  if (!assessment) {
    return null;
  }

  const questions = Array.isArray(assessment.questions)
    ? assessment.questions
        .map(cloneQuestion)
        .filter((question) => question.prompt)
    : [];

  return {
    id: assessment.id,
    key: assessment.key || assessment.id,
    title: String(assessment.title || "Untitled assessment").trim(),
    description: String(assessment.description || "").trim(),
    icon: String(assessment.icon || "🧠").trim() || "🧠",
    duration: Number(assessment.duration) || 5,
    visibility: assessment.visibility || "private",
    authorId: assessment.authorId || assessment.author_id || null,
    authorName: assessment.authorName || assessment.author_name || null,
    createdAt: assessment.createdAt || assessment.created_at || null,
    updatedAt: assessment.updatedAt || assessment.updated_at || null,
    questions,
  };
}

export function normalizeAssessmentList(assessments) {
  return (Array.isArray(assessments) ? assessments : [])
    .map(normalizeAssessment)
    .filter(Boolean);
}

export function getDefaultAssessmentCatalog() {
  return DEFAULT_ASSESSMENTS.map((assessment) =>
    normalizeAssessment(assessment),
  );
}

export function createAssessmentDraft() {
  return normalizeAssessment({
    id: `draft-${Date.now()}`,
    key: "",
    title: "Untitled assessment",
    description: "",
    icon: "🧠",
    duration: 5,
    visibility: "private",
    questions: [
      {
        prompt: "How often have you felt this way recently?",
        options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
      },
    ],
  });
}

export function buildAssessmentResult(assessment, answers) {
  const questions = assessment?.questions || [];
  const maxScore = questions.length * 4;

  const score = questions.reduce((total, _question, index) => {
    const answer = Number.isFinite(Number(answers[index]))
      ? Number(answers[index])
      : 0;
    return total + answer;
  }, 0);

  const ratio = maxScore > 0 ? score / maxScore : 0;
  let severity = "Low";

  if (ratio >= 0.75) {
    severity = "High";
  } else if (ratio >= 0.45) {
    severity = "Moderate";
  }

  const recommendation =
    severity === "High"
      ? "Your responses suggest a higher level of concern. Consider speaking with a licensed professional or campus support service soon."
      : severity === "Moderate"
        ? "Your responses suggest a moderate level of concern. Keep monitoring your symptoms and consider reaching out for support if they continue."
        : "Your responses suggest a lower level of concern right now. Keep using healthy routines and check in again if anything changes.";

  return {
    score,
    maxScore,
    severity,
    recommendation,
  };
}

export { DEFAULT_ASSESSMENTS };
