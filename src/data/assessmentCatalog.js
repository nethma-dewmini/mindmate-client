const ASSESSMENT_STORAGE_KEY = "mindmate_assessment_catalog";

const DEFAULT_ASSESSMENT_CATALOG = [
  {
    id: "stress",
    title: "Stress Level Assessment",
    description:
      "Evaluate your current stress load, common triggers, and how much it is affecting your routine.",
    icon: "😰",
    duration: 6,
    status: "active",
    audience: "Students",
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
    title: "Anxiety Screening",
    description:
      "Check for recurring worry, nervousness, and body symptoms linked with anxiety.",
    icon: "😟",
    duration: 7,
    status: "active",
    audience: "Students",
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
    title: "Depression Screening (PHQ-9 style)",
    description:
      "Review mood, interest, motivation, and energy patterns associated with low mood.",
    icon: "😔",
    duration: 8,
    status: "active",
    audience: "Students",
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
    title: "Sleep Quality Assessment",
    description:
      "Measure sleep duration, sleep quality, and how refreshed you feel during the day.",
    icon: "😴",
    duration: 5,
    status: "draft",
    audience: "Students",
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

function cloneAssessment(assessment) {
  return {
    ...assessment,
    questions: (assessment.questions || []).map((question) => ({
      ...question,
      options: [...(question.options || [])],
    })),
  };
}

function getDefaultAssessmentCatalog() {
  return DEFAULT_ASSESSMENT_CATALOG.map(cloneAssessment);
}

function normalizeQuestion(question) {
  return {
    prompt: String(question?.prompt || "").trim(),
    options: Array.isArray(question?.options)
      ? question.options.map((option) => String(option).trim()).filter(Boolean)
      : [],
  };
}

function normalizeAssessment(assessment, index = 0) {
  const id = String(assessment?.id || `assessment-${index + 1}`).trim();

  return {
    id,
    title: String(assessment?.title || "Untitled assessment").trim(),
    description: String(assessment?.description || "").trim(),
    icon: String(assessment?.icon || "🧠").trim() || "🧠",
    duration: Number(assessment?.duration) || 5,
    status: ["active", "draft", "archived"].includes(assessment?.status)
      ? assessment.status
      : "draft",
    audience: String(assessment?.audience || "Students").trim() || "Students",
    questions: Array.isArray(assessment?.questions)
      ? assessment.questions
          .map(normalizeQuestion)
          .filter((question) => question.prompt)
      : [],
  };
}

export function loadAssessmentCatalog() {
  if (typeof window === "undefined") {
    return getDefaultAssessmentCatalog();
  }

  try {
    const rawCatalog = window.localStorage.getItem(ASSESSMENT_STORAGE_KEY);
    if (!rawCatalog) {
      return getDefaultAssessmentCatalog();
    }

    const parsed = JSON.parse(rawCatalog);
    if (!Array.isArray(parsed)) {
      return getDefaultAssessmentCatalog();
    }

    const normalized = parsed
      .map(normalizeAssessment)
      .filter((assessment) => assessment.id);
    return normalized.length > 0 ? normalized : getDefaultAssessmentCatalog();
  } catch {
    return getDefaultAssessmentCatalog();
  }
}

export function saveAssessmentCatalog(catalog) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify(catalog));
}

export function resetAssessmentCatalog() {
  const catalog = getDefaultAssessmentCatalog();
  saveAssessmentCatalog(catalog);
  return catalog;
}

export function getAssessmentById(catalog, assessmentId) {
  return catalog.find((assessment) => assessment.id === assessmentId) || null;
}

export function createAssessmentDraft() {
  const timestamp = Date.now();

  return {
    id: `assessment-${timestamp}`,
    title: "New Assessment",
    description: "Describe what this assessment helps the student understand.",
    icon: "🧠",
    duration: 5,
    status: "draft",
    audience: "Students",
    questions: [
      {
        prompt: "What would you like this assessment to measure?",
        options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
      },
    ],
  };
}

export function updateAssessmentInCatalog(catalog, updatedAssessment) {
  const normalized = normalizeAssessment(updatedAssessment);

  return catalog.some((assessment) => assessment.id === normalized.id)
    ? catalog.map((assessment) =>
        assessment.id === normalized.id ? normalized : assessment,
      )
    : [normalized, ...catalog];
}

export function removeAssessmentFromCatalog(catalog, assessmentId) {
  return catalog.filter((assessment) => assessment.id !== assessmentId);
}

export function calculateAssessmentResult(assessment, answers) {
  const questions = assessment?.questions || [];
  const maxScore = questions.length * 4;

  const score = questions.reduce((total, _question, index) => {
    const selected = answers[index];
    return total + (Number.isFinite(selected) ? selected : 0);
  }, 0);

  const percentage = maxScore > 0 ? score / maxScore : 0;

  let severity = "Low";
  let recommendation =
    "Your responses suggest that things are relatively manageable right now. Keep using your current coping strategies and check in regularly.";

  if (percentage > 0.25 && percentage <= 0.55) {
    severity = "Moderate";
    recommendation =
      "Some areas are showing strain. Consider using campus support, guided coping tools, or a follow-up conversation with a professional.";
  } else if (percentage > 0.55 && percentage <= 0.75) {
    severity = "High";
    recommendation =
      "Your answers suggest a significant level of distress. Reaching out to a counsellor or mental health professional would be a good next step.";
  } else if (percentage > 0.75) {
    severity = "Very High";
    recommendation =
      "Your responses indicate strong distress. Please seek support from a trusted person, counsellor, or emergency mental health service as soon as possible.";
  }

  return {
    score,
    maxScore,
    percentage,
    severity,
    recommendation,
  };
}

export { ASSESSMENT_STORAGE_KEY, DEFAULT_ASSESSMENT_CATALOG };
