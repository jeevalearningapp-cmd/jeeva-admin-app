import { supabase } from "@/lib/supabase";

export interface PracticeQuestionOption {
  id: string;
  questionId: string;
  optionText: string;
  isCorrect: boolean;
  displayOrder: number;
}

export interface PracticeQuestion {
  id: string;
  category: string;
  subdivision: string;
  questionText: string;
  questionType: "multiple_choice" | "true_false";
  difficulty: "easy" | "medium" | "hard";
  points: number;
  explanation?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  options?: PracticeQuestionOption[];
}

export interface CreatePracticeQuestionInput {
  category: string;
  subdivision: string;
  questionText: string;
  questionType: "multiple_choice" | "true_false";
  difficulty: "easy" | "medium" | "hard";
  points?: number;
  explanation?: string;
  imageUrl?: string;
  isActive?: boolean;
  options: {
    optionText: string;
    isCorrect: boolean;
    displayOrder: number;
  }[];
}

export interface UpdatePracticeQuestionInput {
  category?: string;
  subdivision?: string;
  questionText?: string;
  questionType?: "multiple_choice" | "true_false";
  difficulty?: "easy" | "medium" | "hard";
  points?: number;
  explanation?: string;
  imageUrl?: string;
  isActive?: boolean;
}

const mapToQuestion = (data: any): PracticeQuestion => ({
  id: data.id,
  category: data.category,
  subdivision: data.subdivision,
  questionText: data.question_text,
  questionType: data.question_type,
  difficulty: data.difficulty,
  points: data.points,
  explanation: data.explanation,
  imageUrl: data.image_url,
  isActive: data.is_active,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
});

const mapToOption = (data: any): PracticeQuestionOption => ({
  id: data.id,
  questionId: data.question_id,
  optionText: data.option_text,
  isCorrect: data.is_correct,
  displayOrder: data.display_order,
});

export const practiceQuestionsAPI = {
  async getByFilter(
    category: string,
    subdivision: string,
  ): Promise<PracticeQuestion[]> {
    const { data, error } = await supabase
      .from("practice_questions")
      .select("*, practice_question_options(*)")
      .eq("category", category)
      .eq("subdivision", subdivision)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map((q) => ({
      ...mapToQuestion(q),
      options: (q.practice_question_options || [])
        .sort((a: any, b: any) => a.display_order - b.display_order)
        .map(mapToOption),
    }));
  },

  async getById(id: string): Promise<PracticeQuestion> {
    const { data, error } = await supabase
      .from("practice_questions")
      .select("*, practice_question_options(*)")
      .eq("id", id)
      .single();

    if (error) throw error;
    return {
      ...mapToQuestion(data),
      options: (data.practice_question_options || [])
        .sort((a: any, b: any) => a.display_order - b.display_order)
        .map(mapToOption),
    };
  },

  async create(input: CreatePracticeQuestionInput): Promise<PracticeQuestion> {
    // Create question
    const { data: questionData, error: questionError } = await supabase
      .from("practice_questions")
      .insert([
        {
          category: input.category,
          subdivision: input.subdivision,
          question_text: input.questionText,
          question_type: input.questionType,
          difficulty: input.difficulty,
          points: input.points ?? 1,
          explanation: input.explanation,
          image_url: input.imageUrl,
          is_active: input.isActive ?? true,
        },
      ])
      .select()
      .single();

    if (questionError) throw questionError;

    // Create options
    if (input.options && input.options.length > 0) {
      const optionsToInsert = input.options.map((opt) => ({
        question_id: questionData.id,
        option_text: opt.optionText,
        is_correct: opt.isCorrect,
        display_order: opt.displayOrder,
      }));

      const { error: optionsError } = await supabase
        .from("practice_question_options")
        .insert(optionsToInsert);

      if (optionsError) throw optionsError;
    }

    return practiceQuestionsAPI.getById(questionData.id);
  },

  async update(
    id: string,
    input: UpdatePracticeQuestionInput,
  ): Promise<PracticeQuestion> {
    const updateData: any = {};
    if (input.category !== undefined) updateData.category = input.category;
    if (input.subdivision !== undefined)
      updateData.subdivision = input.subdivision;
    if (input.questionText !== undefined)
      updateData.question_text = input.questionText;
    if (input.questionType !== undefined)
      updateData.question_type = input.questionType;
    if (input.difficulty !== undefined)
      updateData.difficulty = input.difficulty;
    if (input.points !== undefined) updateData.points = input.points;
    if (input.explanation !== undefined)
      updateData.explanation = input.explanation;
    if (input.imageUrl !== undefined) updateData.image_url = input.imageUrl;
    if (input.isActive !== undefined) updateData.is_active = input.isActive;

    const { error } = await supabase
      .from("practice_questions")
      .update(updateData)
      .eq("id", id);

    if (error) throw error;
    return practiceQuestionsAPI.getById(id);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("practice_questions")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async updateOptions(
    questionId: string,
    options: { optionText: string; isCorrect: boolean; displayOrder: number }[],
  ): Promise<void> {
    // Delete existing options
    await supabase
      .from("practice_question_options")
      .delete()
      .eq("question_id", questionId);

    // Insert new options
    if (options.length > 0) {
      const optionsToInsert = options.map((opt) => ({
        question_id: questionId,
        option_text: opt.optionText,
        is_correct: opt.isCorrect,
        display_order: opt.displayOrder,
      }));

      const { error } = await supabase
        .from("practice_question_options")
        .insert(optionsToInsert);

      if (error) throw error;
    }
  },

  async uploadImage(file: File): Promise<string> {
    const fileName = `practice/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("question-images")
      .upload(fileName, file);

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from("question-images")
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  },

  async bulkCreate(
    inputs: CreatePracticeQuestionInput[],
  ): Promise<PracticeQuestion[]> {
    const createdQuestions: PracticeQuestion[] = [];

    for (const input of inputs) {
      try {
        const question = await practiceQuestionsAPI.create(input);
        createdQuestions.push(question);
      } catch (error) {
        console.error("Failed to create question:", input, error);
      }
    }

    return createdQuestions;
  },
};
