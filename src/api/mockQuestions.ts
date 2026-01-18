import { supabase } from "@/lib/supabase";

export interface MockQuestionOption {
  id: string;
  questionId: string;
  optionText: string;
  isCorrect: boolean;
  displayOrder: number;
}

export interface MockQuestion {
  id: string;
  examPart: "part_a" | "part_b";
  questionText: string;
  questionType: "multiple_choice" | "true_false" | "short_answer";
  difficulty: "easy" | "medium" | "hard";
  points: number;
  explanation?: string;
  imageUrl?: string;
  isActive: boolean;
  isTrialContent?: boolean;
  trialOrder?: number;
  acceptableRange?: number;
  unit?: string;
  createdAt: string;
  updatedAt: string;
  options?: MockQuestionOption[];
}

export interface CreateMockQuestionInput {
  examPart: "part_a" | "part_b";
  questionText: string;
  questionType: "multiple_choice" | "true_false" | "short_answer";
  difficulty: "easy" | "medium" | "hard";
  points?: number;
  explanation?: string;
  imageUrl?: string;
  isActive?: boolean;
  isTrialContent?: boolean;
  trialOrder?: number;
  acceptableRange?: number;
  unit?: string;
  options: {
    optionText: string;
    isCorrect: boolean;
    displayOrder: number;
  }[];
}

export interface UpdateMockQuestionInput {
  examPart?: "part_a" | "part_b";
  questionText?: string;
  questionType?: "multiple_choice" | "true_false" | "short_answer";
  difficulty?: "easy" | "medium" | "hard";
  points?: number;
  explanation?: string;
  imageUrl?: string;
  isActive?: boolean;
  isTrialContent?: boolean;
  trialOrder?: number;
  acceptableRange?: number;
  unit?: string;
}

const mapToQuestion = (data: any): MockQuestion => ({
  id: data.id,
  examPart: data.exam_part,
  questionText: data.question_text,
  questionType: data.question_type,
  difficulty: data.difficulty,
  points: data.points,
  explanation: data.explanation,
  imageUrl: data.image_url,
  isActive: data.is_active,
  isTrialContent: data.is_trial_content,
  trialOrder: data.trial_order,
  acceptableRange: data.acceptable_range,
  unit: data.unit,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
});

const mapToOption = (data: any): MockQuestionOption => ({
  id: data.id,
  questionId: data.question_id,
  optionText: data.option_text,
  isCorrect: data.is_correct,
  displayOrder: data.display_order,
});

export const mockQuestionsAPI = {
  async getByPart(examPart: "part_a" | "part_b"): Promise<MockQuestion[]> {
    const { data, error } = await supabase
      .from("mock_exam_questions")
      .select("*, mock_exam_question_options(*)")
      .eq("exam_part", examPart)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map((q) => ({
      ...mapToQuestion(q),
      options: (q.mock_exam_question_options || [])
        .sort((a: any, b: any) => a.display_order - b.display_order)
        .map(mapToOption),
    }));
  },

  async getTrialQuestions(): Promise<MockQuestion[]> {
    const { data, error } = await supabase
      .from("mock_exam_questions")
      .select("*, mock_exam_question_options(*)")
      .eq("is_trial_content", true)
      .order("trial_order", { ascending: true });

    if (error) throw error;
    return (data || []).map((q) => ({
      ...mapToQuestion(q),
      options: (q.mock_exam_question_options || [])
        .sort((a: any, b: any) => a.display_order - b.display_order)
        .map(mapToOption),
    }));
  },

  async getById(id: string): Promise<MockQuestion> {
    const { data, error } = await supabase
      .from("mock_exam_questions")
      .select("*, mock_exam_question_options(*)")
      .eq("id", id)
      .single();

    if (error) throw error;
    return {
      ...mapToQuestion(data),
      options: (data.mock_exam_question_options || [])
        .sort((a: any, b: any) => a.display_order - b.display_order)
        .map(mapToOption),
    };
  },

  async create(input: CreateMockQuestionInput): Promise<MockQuestion> {
    // Create question
    const { data: questionData, error: questionError } = await supabase
      .from("mock_exam_questions")
      .insert([
        {
          exam_part: input.examPart,
          question_text: input.questionText,
          question_type: input.questionType,
          difficulty: input.difficulty,
          points: input.points ?? 1,
          explanation: input.explanation,
          image_url: input.imageUrl,
          is_active: input.isActive ?? true,
          is_trial_content: input.isTrialContent ?? false,
          trial_order: input.trialOrder,
          acceptable_range: input.acceptableRange,
          unit: input.unit,
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
        .from("mock_exam_question_options")
        .insert(optionsToInsert);

      if (optionsError) throw optionsError;
    }

    return mockQuestionsAPI.getById(questionData.id);
  },

  async update(
    id: string,
    input: UpdateMockQuestionInput,
  ): Promise<MockQuestion> {
    const updateData: any = {};
    if (input.examPart !== undefined) updateData.exam_part = input.examPart;
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
    if (input.isTrialContent !== undefined)
      updateData.is_trial_content = input.isTrialContent;
    if (input.trialOrder !== undefined)
      updateData.trial_order = input.trialOrder;
    if (input.acceptableRange !== undefined)
      updateData.acceptable_range = input.acceptableRange;
    if (input.unit !== undefined) updateData.unit = input.unit;

    const { error } = await supabase
      .from("mock_exam_questions")
      .update(updateData)
      .eq("id", id);

    if (error) throw error;
    return mockQuestionsAPI.getById(id);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("mock_exam_questions")
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
      .from("mock_exam_question_options")
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
        .from("mock_exam_question_options")
        .insert(optionsToInsert);

      if (error) throw error;
    }
  },

  async uploadImage(file: File): Promise<string> {
    const fileName = `mock_exam/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("question-images")
      .upload(fileName, file);

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from("question-images")
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  },

  async bulkCreate(inputs: CreateMockQuestionInput[]): Promise<MockQuestion[]> {
    const createdQuestions: MockQuestion[] = [];

    for (const input of inputs) {
      try {
        const question = await mockQuestionsAPI.create(input);
        createdQuestions.push(question);
      } catch (error) {
        console.error("Failed to create question:", input, error);
      }
    }

    return createdQuestions;
  },
};
