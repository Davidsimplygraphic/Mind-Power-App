export type ExerciseContent = {
  weekNumber: 1 | 2 | 3 | 4;
  title: string;
  intro?: string;
  sections: ExerciseSection[];
};

export type ExerciseSection =
  | TextSection
  | PromptSection
  | ChecklistSection
  | TimerSection;

export type TextSection = {
  id: string;
  type: "text";
  title?: string;
  content: string;
};

export type PromptSection = {
  id: string;
  type: "prompt";
  title?: string;
  prompt: string;
  placeholder?: string;
  multiline?: boolean;
};

export type ChecklistSection = {
  id: string;
  type: "checklist";
  title?: string;
  items: {
    id: string;
    label: string;
  }[];
};

export type TimerSection = {
  id: string;
  type: "timer";
  title?: string;
  label: string;
  suggestedMinutes?: number;
};

const weekExerciseContent: Record<1 | 2 | 3 | 4, ExerciseContent> = {
  1: {
    weekNumber: 1,
    title: "Week 1: Foundations and Mental Discipline",
    intro:
      "Week 1 introduces the six laws of thought, self-observation, and disciplined contemplation. The PDF frames this as a turning point: create with intention instead of reacting to circumstances.",
    sections: [
      {
        id: "w1-summary",
        type: "text",
        title: "Summary of Concepts",
        content:
          "Key themes from the Week 1 notes: all is law and cause-and-effect, thoughts are real forces, and the inner and outer worlds are connected. The notes also emphasize concentration, contemplation, and weeding out negative thought patterns.",
      },
      {
        id: "w1-six-laws",
        type: "checklist",
        title: "Six Laws of the Mind (Daily Review)",
        items: [
          { id: "law-1", label: "Thoughts are real forces." },
          {
            id: "law-2",
            label: "The mind is a sending and receiving station of thought.",
          },
          {
            id: "law-3",
            label:
              "Law of Attraction: emotionalized thoughts become magnetized and attract like thoughts.",
          },
          {
            id: "law-4",
            label:
              "Law of Control: entertain or dismiss thoughts consciously.",
          },
          {
            id: "law-5",
            label: "Law of Insertion: choose and insert deliberate thoughts.",
          },
          {
            id: "law-6",
            label: "Law of Connection: inner and outer worlds are connected.",
          },
        ],
      },
      {
        id: "w1-law-of-day",
        type: "prompt",
        title: "Law of the Day",
        prompt:
          "Which law are you contemplating today, and what did you notice in practice?",
        placeholder: "Write one practical insight from today.",
        multiline: true,
      },
      {
        id: "w1-contemplation-timer",
        type: "timer",
        title: "Contemplation Block",
        label: "Use a focused contemplation period for 5 minutes.",
        suggestedMinutes: 5,
      },
      {
        id: "w1-self-observation",
        type: "prompt",
        title: "Self-Observation Notes",
        prompt:
          "When you stopped to observe your thinking today, what thoughts were recurring?",
        placeholder: "Capture recurring thoughts without judgement.",
        multiline: true,
      },
      {
        id: "w1-negatives",
        type: "prompt",
        title: "Weeding Out Negatives",
        prompt:
          "Which negative thought did you catch, and which replacement technique did you use?",
        placeholder: "Cut off, observe, exaggerate, or counteract with the opposite.",
        multiline: true,
      },
      {
        id: "w1-weekly-checklist",
        type: "checklist",
        title: "Week 1 Practice Checklist",
        items: [
          {
            id: "exercise-1",
            label:
              "Write down the six laws and contemplate them for 5 minutes daily.",
          },
          {
            id: "exercise-2",
            label:
              "Take one law per day and contemplate it for 5 minutes.",
          },
          {
            id: "exercise-3",
            label:
              "Contemplate: I am in possession of an amazing instrument of power.",
          },
          {
            id: "exercise-4",
            label:
              "Contemplate: my personal vibration determines circumstances and situations.",
          },
          {
            id: "exercise-5",
            label:
              "Several times daily, stop and catch yourself thinking.",
          },
          {
            id: "exercise-6",
            label:
              "Practice weeding out negatives using the four techniques.",
          },
          {
            id: "exercise-7",
            label: "Review your notes for 5 to 10 minutes daily.",
          },
        ],
      },
      {
        id: "w1-notes-reflection",
        type: "prompt",
        title: "Notes Reflection",
        prompt:
          "What one idea from the Week 1 notes is starting to change how you think?",
        placeholder: "Short reflection for future review.",
        multiline: true,
      },
    ],
  },
  2: {
    weekNumber: 2,
    title: "Week 2: Cultivating the Inner Garden",
    intro:
      "Week 2 focuses on conscious cultivation: what you consistently plant in the mind becomes your lived harvest. The notes emphasize seeding, visualization, self-observation, and daily deliberate thought.",
    sections: [
      {
        id: "w2-summary",
        type: "text",
        title: "Summary of Concepts",
        content:
          "The Week 2 PDF compares the mind to a fertile garden: if you do not consciously feed it, it feeds itself. The practical focus is to create causes in the inner world that produce the outer conditions you want.",
      },
      {
        id: "w2-quality",
        type: "prompt",
        title: "Chosen Quality",
        prompt:
          "What quality or characteristic are you cultivating this week?",
        placeholder: "Example: calm confidence, consistency, courage.",
      },
      {
        id: "w2-seeding-feeling",
        type: "prompt",
        title: "Seeding Practice",
        prompt:
          "Describe what it feels like to already possess that quality.",
        placeholder: "Write in present tense.",
        multiline: true,
      },
      {
        id: "w2-seeding-timer",
        type: "timer",
        title: "Seeding / Visualization Block",
        label: "Set a focused practice period for 5 minutes.",
        suggestedMinutes: 5,
      },
      {
        id: "w2-laws-personal",
        type: "prompt",
        title: "Rewrite the Laws into the Personal",
        prompt:
          "Rewrite one of the six laws in first person and note how it lands differently.",
        placeholder: "Example: my thoughts are real forces.",
        multiline: true,
      },
      {
        id: "w2-weekly-checklist",
        type: "checklist",
        title: "Week 2 Practice Checklist",
        items: [
          {
            id: "exercise-1",
            label:
              "Visualize yourself possessing your chosen quality for 5 minutes daily.",
          },
          {
            id: "exercise-2",
            label:
              "Seed what it feels like to have that quality for 5 minutes daily.",
          },
          {
            id: "exercise-3",
            label:
              "Visualize yourself doing the Mind Power exercises proficiently.",
          },
          {
            id: "exercise-4",
            label:
              "Rewrite the six laws into the personal and contemplate daily.",
          },
          {
            id: "exercise-5",
            label:
              "Contemplate: my power to think is my power to create; I choose my thoughts.",
          },
          {
            id: "exercise-6",
            label:
              "Ask yourself during the day: how am I feeling and what am I thinking?",
          },
          {
            id: "exercise-7",
            label: "Use the Lecture 1 negative-thought techniques.",
          },
          {
            id: "exercise-8",
            label: "Review notes for 5 minutes daily.",
          },
        ],
      },
      {
        id: "w2-self-observation",
        type: "prompt",
        title: "Daily Check-In",
        prompt:
          "When you asked ‘How am I feeling?’ and ‘What am I thinking?’, what pattern appeared?",
        placeholder: "Capture one pattern you want to shift.",
        multiline: true,
      },
    ],
  },
  3: {
    weekNumber: 3,
    title: "Week 3: Creating Period and Identity Shift",
    intro:
      "Week 3 deepens deliberate creation: consciously insert thoughts, combine techniques, and run a daily creating period. The notes stress choosing creation over reaction.",
    sections: [
      {
        id: "w3-summary",
        type: "text",
        title: "Summary of Concepts",
        content:
          "The Week 3 notes center on training the mind to create deliberately. They highlight affirmation, visualization, seeding, acknowledging progress, and a daily creating period (5 to 15 minutes).",
      },
      {
        id: "w3-identity-quality",
        type: "prompt",
        title: "Identity Quality",
        prompt:
          "Which quality are you practicing as already true about you this week?",
        placeholder: "Name the quality and describe it in first person.",
        multiline: true,
      },
      {
        id: "w3-affirmation",
        type: "prompt",
        title: "Affirmation Line",
        prompt:
          "Write the affirmation you are repeating daily for this quality.",
        placeholder: "I am ...",
      },
      {
        id: "w3-project",
        type: "prompt",
        title: "Project of the Week",
        prompt:
          "What specific outcome are you creating this week?",
        placeholder: "Keep it concrete and observable.",
        multiline: true,
      },
      {
        id: "w3-project-timer",
        type: "timer",
        title: "Project Practice Block",
        label: "Use a focused creation period for 10 minutes.",
        suggestedMinutes: 10,
      },
      {
        id: "w3-acknowledging-list",
        type: "prompt",
        title: "Acknowledging List",
        prompt:
          "List things that make you feel good about yourself and where you are already succeeding.",
        placeholder: "Aim for at least 15 entries over the week.",
        multiline: true,
      },
      {
        id: "w3-weekly-checklist",
        type: "checklist",
        title: "Week 3 Practice Checklist",
        items: [
          {
            id: "exercise-1",
            label:
              "Seed and visualize yourself as the person with your chosen quality.",
          },
          {
            id: "exercise-2",
            label: "Affirm daily that you are that person.",
          },
          {
            id: "exercise-3",
            label:
              "Run a 10-minute daily project practice using visualization, seeding, and affirmations.",
          },
          {
            id: "exercise-4",
            label:
              "Build and contemplate an acknowledging list (15-20 items).",
          },
          {
            id: "exercise-5",
            label:
              "Visualize your life working well in every aspect for 5 minutes daily.",
          },
          {
            id: "exercise-6",
            label: "Review notes daily from the beginning of the course.",
          },
          {
            id: "exercise-7",
            label: "Drink 2 to 3 litres of water daily.",
          },
        ],
      },
      {
        id: "w3-daily-reflection",
        type: "prompt",
        title: "Creation vs Reaction",
        prompt:
          "Where today did you consciously create instead of react?",
        placeholder: "Capture one concrete moment.",
        multiline: true,
      },
    ],
  },
  4: {
    weekNumber: 4,
    title: "Week 4: Habit, Intuition, and Self-Image",
    intro:
      "Week 4 emphasizes consistency: thought power as a daily habit, connecting with intuition, and reshaping self-image. The notes frame this as disciplined participation in change.",
    sections: [
      {
        id: "w4-summary",
        type: "text",
        title: "Summary of Concepts",
        content:
          "The Week 4 notes focus on making thought power automatic: daily affirming, seeding, visualizing, and weeding negatives. They also include the three-step subconscious process and expanded work on self-image.",
      },
      {
        id: "w4-dream-journal",
        type: "prompt",
        title: "Dream Journal",
        prompt:
          "Record any dreams you remember after repeating the Week 4 dream affirmation.",
        placeholder: "Write what you remember, even if it is brief.",
        multiline: true,
      },
      {
        id: "w4-subconscious-request",
        type: "prompt",
        title: "Subconscious Request",
        prompt:
          "What question or answer are you clearly asking your subconscious mind for?",
        placeholder: "State it clearly and specifically.",
        multiline: true,
      },
      {
        id: "w4-subconscious-timer",
        type: "timer",
        title: "Subconscious Practice Block",
        label: "Use the three-step subconscious process for 10 minutes.",
        suggestedMinutes: 10,
      },
      {
        id: "w4-self-image",
        type: "prompt",
        title: "Self-Image Re-Creation",
        prompt:
          "Which aspect of your self-image are you deliberately re-creating this week?",
        placeholder: "Describe the old pattern and the new pattern.",
        multiline: true,
      },
      {
        id: "w4-weekly-checklist",
        type: "checklist",
        title: "Week 4 Practice Checklist",
        items: [
          {
            id: "exercise-1",
            label:
              "Repeat daily: I always remember my dreams, and keep a dream journal.",
          },
          {
            id: "exercise-2",
            label:
              "Use the three-step subconscious process for 10 minutes daily.",
          },
          {
            id: "exercise-3",
            label: "Contemplate one phrase or law for 5 minutes daily.",
          },
          {
            id: "exercise-4",
            label:
              "Re-create one self-image aspect using seeding, visualization, and affirmation.",
          },
          {
            id: "exercise-5",
            label:
              "Spend 10 minutes daily visualizing and seeding your project goal.",
          },
        ],
      },
      {
        id: "w4-pattern-note",
        type: "prompt",
        title: "Pattern Note",
        prompt:
          "What repeating thought or behavior pattern are you noticing this week?",
        placeholder: "This supports future reflection summaries.",
        multiline: true,
      },
    ],
  },
};

export function getExerciseContentForWeek(weekNumber: number) {
  if (weekNumber === 1 || weekNumber === 2 || weekNumber === 3 || weekNumber === 4) {
    return weekExerciseContent[weekNumber];
  }

  return null;
}
