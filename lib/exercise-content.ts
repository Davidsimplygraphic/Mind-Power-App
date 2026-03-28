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
    title: "Week 1 Exercises",
    sections: [
      {
        id: "w1-exercises",
        type: "checklist",
        title: "Exercises for Week 1",
        items: [
          {
            id: "w1-ex-1",
            label:
              "Write down the six laws on a piece of paper. Spend 5 minutes contemplating these six laws every day.",
          },
          {
            id: "w1-ex-2",
            label:
              "Take one law each day. Start with the first law on the first day, second law on the next day, and so forth. Contemplate that one law for 5 minutes.",
          },
          {
            id: "w1-ex-3",
            label:
              "Contemplate the following statement for 5 minutes each day: \u2018I am in possession of an amazing instrument of power that is transforming my life, now that I\u2019m learning to use it.\u2019",
          },
          {
            id: "w1-ex-4",
            label:
              "Contemplate the following statement for 5 minutes each day: \u2018My personal vibration determines the circumstances and situations that happen to me. My thoughts and my beliefs create my personal vibration.\u2019",
          },
          {
            id: "w1-ex-5",
            label:
              "Self-observation: Several times every day, right in the midst of doing something, stop and catch yourself thinking. Observe your mind in action.",
          },
          {
            id: "w1-ex-6",
            label:
              "Weeding of negatives: Begin to weed out negatives by experimenting with the 4 techniques. (There is no time limit with this exercise.)",
          },
          {
            id: "w1-ex-7",
            label: "Go over your notes for 5 to 10 minutes every day.",
          },
        ],
      },
      {
        id: "w1-timer",
        type: "timer",
        title: "Contemplation Timer",
        label: "Set a focused contemplation period — 5 minutes is the recommended starting point.",
        suggestedMinutes: 5,
      },
      {
        id: "w1-reflection",
        type: "prompt",
        title: "Daily Reflection",
        prompt: "What did you notice in today\u2019s practice? Capture any thoughts, insights, or observations.",
        placeholder: "Write freely \u2014 this is for your benefit only.",
        multiline: true,
      },
    ],
  },
  2: {
    weekNumber: 2,
    title: "Week 2 Exercises",
    sections: [
      {
        id: "w2-exercises",
        type: "checklist",
        title: "Exercises for Week 2",
        items: [
          {
            id: "w2-ex-1",
            label:
              "Pick a quality or characteristic that you wish to possess. Spend 5 minutes every day visualising yourself possessing that quality.",
          },
          {
            id: "w2-ex-2",
            label:
              "For 5 minutes every day, seed what it would feel like to have that quality (as in exercise 1).",
          },
          {
            id: "w2-ex-3",
            label:
              "Visualise yourself doing your Mind Power exercises and being proficient at them, for 5 minutes every day.",
          },
          {
            id: "w2-ex-4",
            label:
              "Contemplation exercise: rewrite the six laws into the personal. For example: \u2018thoughts are real forces\u2019 becomes \u2018my thoughts are real forces\u2019. Spend 5 minutes every day contemplating the six laws.",
          },
          {
            id: "w2-ex-5",
            label:
              "Contemplate the following statements for several minutes every day: \u2022 My power to think thoughts is my power to create in my life. \u2022 I have the power to think whatever thoughts I choose.",
          },
          {
            id: "w2-ex-6",
            label:
              "Self-observation exercise: Ask yourself several times during the course of the day: \u2022 How am I feeling? \u2022 What am I thinking?",
          },
          {
            id: "w2-ex-7",
            label: "Weed out negatives by using the techniques from Lecture 1.",
          },
          {
            id: "w2-ex-8",
            label: "Go over your notes for 5 minutes every day.",
          },
        ],
      },
      {
        id: "w2-timer",
        type: "timer",
        title: "Visualisation / Seeding Timer",
        label: "Set a focused practice period \u2014 5 minutes is the recommended starting point.",
        suggestedMinutes: 5,
      },
      {
        id: "w2-reflection",
        type: "prompt",
        title: "Daily Reflection",
        prompt: "What quality are you cultivating this week, and what did you notice in today\u2019s practice?",
        placeholder: "Write freely \u2014 this is for your benefit only.",
        multiline: true,
      },
    ],
  },
  3: {
    weekNumber: 3,
    title: "Week 3 Exercises",
    sections: [
      {
        id: "w3-exercises",
        type: "checklist",
        title: "Exercises for Week 3",
        items: [
          {
            id: "w3-ex-1",
            label:
              "Pick a quality that you wish you had. For 5 minutes every day, seed and visualise that you have that quality, that you are that person. Combine seeding and visualisation as one technique.",
          },
          {
            id: "w3-ex-2",
            label:
              "Spend 5 minutes each day affirming to yourself that you are that person.",
          },
          {
            id: "w3-ex-3",
            label:
              "Project of your choice: pick something that you want to see happen to you this week. Spend 10 minutes every day using visualisation, seeding and affirmations to create it.",
          },
          {
            id: "w3-ex-4",
            label:
              "Acknowledging exercise: make an acknowledging list of at least 15 or 20 things that presently make you feel good about yourself and that make you feel you are a success. Spend 5 minutes contemplating this list.",
          },
          {
            id: "w3-ex-5",
            label:
              "For 5 minutes every day, visualise that your life is going well and is working in every aspect.",
          },
          {
            id: "w3-ex-6",
            label:
              "For 5 minutes every day, go over your notes, starting from the beginning of this course.",
          },
          {
            id: "w3-ex-7",
            label: "Drink 2 to 3 litres of water every day.",
          },
        ],
      },
      {
        id: "w3-timer",
        type: "timer",
        title: "Project Practice Timer",
        label: "Set a focused creation period \u2014 10 minutes is recommended for the project exercise.",
        suggestedMinutes: 10,
      },
      {
        id: "w3-reflection",
        type: "prompt",
        title: "Daily Reflection",
        prompt: "What are you creating this week? Note what came up in today\u2019s practice.",
        placeholder: "Write freely \u2014 this is for your benefit only.",
        multiline: true,
      },
    ],
  },
  4: {
    weekNumber: 4,
    title: "Week 4 Exercises",
    sections: [
      {
        id: "w4-exercises",
        type: "checklist",
        title: "Exercises for Week 4",
        items: [
          {
            id: "w4-ex-1",
            label:
              "For 5 minutes every day repeat the following affirmation: \u201cI always remember my dreams.\u201d Write your dreams down in a special Dream Journal.",
          },
          {
            id: "w4-ex-2",
            label:
              "Each day, for 10 minutes, use the three steps to reach the subconscious.",
          },
          {
            id: "w4-ex-3",
            label:
              "Contemplation: choose a phrase or law to contemplate for 5 minutes each day.",
          },
          {
            id: "w4-ex-4",
            label:
              "Self-image: For 5 minutes each day, re-create an aspect of your self-image using seeding, visualisation and affirmation.",
          },
          {
            id: "w4-ex-5",
            label:
              "Project of the week: spend 10 minutes every day visualising and seeding whatever goal you wish.",
          },
        ],
      },
      {
        id: "w4-timer",
        type: "timer",
        title: "Subconscious / Project Timer",
        label: "Set a focused practice period \u2014 10 minutes is recommended.",
        suggestedMinutes: 10,
      },
      {
        id: "w4-dream-journal",
        type: "prompt",
        title: "Dream Journal",
        prompt: "Record any dreams you remember from last night.",
        placeholder: "Write what you remember, even if it is brief or fragmented.",
        multiline: true,
      },
      {
        id: "w4-reflection",
        type: "prompt",
        title: "Daily Reflection",
        prompt: "What came up in today\u2019s subconscious or self-image practice?",
        placeholder: "Write freely \u2014 this is for your benefit only.",
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
