export type Profile = {
  id: string;
  motivation_text: string | null;
  created_at: string;
};

export type Program = {
  id: string;
  title: string;
  duration_days: number;
  created_at: string;
};

export type ProgramWeek = {
  id: string;
  program_id: string;
  week_number: number;
  title: string | null;
  audio_path: string | null;
  exercise_text: string | null;
  created_at: string;
};

export type UserProgram = {
  id: string;
  user_id: string;
  program_id: string;
  started_at: string;
  completed_at: string | null;
  created_at: string;
};

export type DailySession = {
  id: string;
  user_id: string;
  program_id: string;
  day_number: number;
  week_number: number;
  session_date: string;
  exercise_completed: boolean;
  reflection_text: string | null;
  promise_kept: boolean | null;
  created_at: string;
};

export type IntegrityScore = {
  answeredCount: number;
  keptCount: number;
  percentage: number;
};

export type ProgramMetrics = {
  currentDay: number;
  currentDayRaw: number;
  currentWeek: number;
  completedDaysCount: number;
  progressPercentage: number;
  streak: number;
  integrityScore: IntegrityScore;
  isWeekStartDay: boolean;
  isSessionComplete: boolean;
  isProgramFinished: boolean;
};

export type UserProgramSnapshot = {
  profile: Profile | null;
  program: Program | null;
  weeks: ProgramWeek[];
  userProgram: UserProgram | null;
  sessions: DailySession[];
  metrics: ProgramMetrics | null;
  todaySession: DailySession | null;
  todayDate: string;
  currentWeekContent: ProgramWeek | null;
};
