export interface TrialMockExam {
  id: string;
  module_id: string;
  title: string;
  description?: string;
  category: "numeracy" | "clinical";
  sequence_order: number;
  question_count: number;
  time_limit_minutes: number;
  passing_score: number;
  question_ids: string[];
  allow_mark_for_review: boolean;
  allow_answer_changes: boolean;
  show_question_navigator: boolean;
  auto_submit_at_time_limit: boolean;
  show_results_immediately: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface TrialLearningProgress {
  id: string;
  user_id: string;
  topic_id: string;
  subtopic_id?: string;
  lesson_id: string;
  is_started: boolean;
  is_completed: boolean;
  is_unlocked: boolean;
  assessment_score?: number;
  assessment_percentage?: number;
  assessment_passed?: boolean;
  assessment_attempts: number;
  content_viewed?: Record<string, boolean>;
  estimated_time_spent_minutes?: number;
  started_at?: string;
  completed_at?: string;
  last_accessed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TrialAttemptRecord {
  id: string;
  user_id: string;
  module_id: string;
  content_type: "practice" | "learning" | "mock_exam";
  section_type?: string;
  total_questions?: number;
  correct_answers?: number;
  score?: number;
  percentage_score?: number;
  started_at: string;
  completed_at?: string;
  duration_seconds?: number;
  is_passed?: boolean;
  status: "in_progress" | "completed" | "abandoned";
  answers_data?: any;
  question_details?: any;
  device_type?: string;
  ip_address?: string;
  created_at: string;
  updated_at: string;
}

export interface TrialExamAttempt {
  id: string;
  user_id: string;
  exam_id: string;
  total_questions: number;
  correct_answers?: number;
  incorrect_answers?: number;
  score?: number;
  percentage_score?: number;
  is_passed?: boolean;
  user_answers?: any;
  marked_for_review?: any;
  started_at: string;
  completed_at: string;
  duration_seconds?: number;
  topic_scores?: any;
  status: string;
  device_type?: string;
  ip_address?: string;
  created_at: string;
  updated_at: string;
}
