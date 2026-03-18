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

export type ConsistencyItem = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ConsistencyLog = {
  id: string;
  user_id: string;
  consistency_item_id: string;
  log_date: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
};

export type ExerciseResponse = {
  id: string;
  user_id: string;
  program_id: string;
  user_program_id: string;
  week_number: number;
  day_number: number;
  section_id: string;
  response_text: string | null;
  response_json: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
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
