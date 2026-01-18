import { supabase } from "../lib/supabase";
import { TrialMockExam, TrialLearningProgress } from "../types/trial";

export const trialApi = {
  // --- Practice Exams (TrialMockExam) ---

  async getPracticeExams(moduleId: string) {
    const { data, error } = await supabase
      .from("trial_mock_exams")
      .select("*")
      .eq("module_id", moduleId)
      .order("sequence_order", { ascending: true });

    if (error) throw error;
    return data as TrialMockExam[];
  },

  async updatePracticeExam(id: string, updates: Partial<TrialMockExam>) {
    const { data, error } = await supabase
      .from("trial_mock_exams")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as TrialMockExam;
  },

  async createPracticeExam(
    exam: Omit<TrialMockExam, "id" | "created_at" | "updated_at">,
  ) {
    const { data, error } = await supabase
      .from("trial_mock_exams")
      .insert(exam)
      .select()
      .single();

    if (error) throw error;
    return data as TrialMockExam;
  },

  // --- Learning Progress ---

  async getLearningProgress(userId: string) {
    const { data, error } = await supabase
      .from("trial_learning_progress")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;
    return data as TrialLearningProgress[];
  },

  // Note: Standard CRUD for other trial entities would go here
};
