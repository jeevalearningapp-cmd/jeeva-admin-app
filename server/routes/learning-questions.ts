import express, { Request, Response } from "express";
import { supabase } from "../lib/supabase.js";

const router = express.Router();

/**
 * GET /api/learning/questions?topicId=X&subtopicId=Y&videoLessonId=Z
 * Get learning questions filtered by topic, subtopic, and video lesson
 */
router.get("/questions", async (req: Request, res: Response) => {
  try {
    const { topicId, subtopicId, videoLessonId, isActive } = req.query;

    let query = supabase
      .from("learning_questions")
      .select(
        `
        *,
        options:learning_question_options(*)
      `,
      )
      .order("created_at", { ascending: false });

    if (topicId) {
      query = query.eq("topic_id", topicId);
    }

    if (subtopicId) {
      query = query.eq("subtopic_id", subtopicId);
    }

    if (videoLessonId) {
      query = query.eq("video_lesson_id", videoLessonId);
    }

    if (isActive !== undefined) {
      query = query.eq("is_active", isActive === "true");
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching learning questions:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
      return;
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error in GET /questions:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch learning questions",
    });
  }
});

/**
 * POST /api/learning/questions (admin only)
 * Create a new learning question
 */
router.post("/questions", async (req: Request, res: Response) => {
  try {
    const {
      topicId,
      subtopicId,
      videoLessonId,
      questionText,
      questionType,
      difficulty,
      points,
      explanation,
      imageUrl,
      isActive,
      options,
    } = req.body;

    // Validate required fields
    if (
      !topicId ||
      !subtopicId ||
      !videoLessonId ||
      !questionText ||
      !questionType ||
      !difficulty
    ) {
      res.status(400).json({
        success: false,
        error:
          "Missing required fields: topicId, subtopicId, videoLessonId, questionText, questionType, difficulty",
      });
      return;
    }

    // Validate options
    if (!options || !Array.isArray(options) || options.length === 0) {
      res.status(400).json({
        success: false,
        error: "At least one option is required",
      });
      return;
    }

    // Validate at least one correct answer
    const hasCorrectAnswer = options.some((opt: any) => opt.isCorrect === true);
    if (!hasCorrectAnswer) {
      res.status(400).json({
        success: false,
        error: "At least one correct answer is required",
      });
      return;
    }

    // Insert question
    const { data: question, error: questionError } = await supabase
      .from("learning_questions")
      .insert({
        topic_id: topicId,
        subtopic_id: subtopicId,
        video_lesson_id: videoLessonId,
        question_text: questionText,
        question_type: questionType,
        difficulty,
        points: points || 1,
        explanation,
        image_url: imageUrl,
        is_active: isActive !== undefined ? isActive : true,
      })
      .select()
      .single();

    if (questionError) {
      console.error("Error creating learning question:", questionError);
      res.status(500).json({
        success: false,
        error: questionError.message,
      });
      return;
    }

    // Insert options
    const optionsToInsert = options.map((opt: any, index: number) => ({
      question_id: question.id,
      option_text: opt.optionText,
      is_correct: opt.isCorrect || false,
      display_order: opt.displayOrder !== undefined ? opt.displayOrder : index,
    }));

    const { data: insertedOptions, error: optionsError } = await supabase
      .from("learning_question_options")
      .insert(optionsToInsert)
      .select();

    if (optionsError) {
      // Rollback: delete the question
      await supabase.from("learning_questions").delete().eq("id", question.id);
      console.error("Error creating learning question options:", optionsError);
      res.status(500).json({
        success: false,
        error: optionsError.message,
      });
      return;
    }

    res.status(201).json({
      success: true,
      data: {
        ...question,
        options: insertedOptions,
      },
    });
  } catch (error) {
    console.error("Error in POST /questions:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create learning question",
    });
  }
});

/**
 * PUT /api/learning/questions/:id (admin only)
 * Update an existing learning question
 */
router.put("/questions/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      topicId,
      subtopicId,
      videoLessonId,
      questionText,
      questionType,
      difficulty,
      points,
      explanation,
      imageUrl,
      isActive,
      options,
    } = req.body;

    // Check if question exists
    const { data: existingQuestion, error: fetchError } = await supabase
      .from("learning_questions")
      .select("id")
      .eq("id", id)
      .single();

    if (fetchError || !existingQuestion) {
      res.status(404).json({
        success: false,
        error: "Question not found",
      });
      return;
    }

    // Update question
    const updateData: any = {};
    if (topicId !== undefined) updateData.topic_id = topicId;
    if (subtopicId !== undefined) updateData.subtopic_id = subtopicId;
    if (videoLessonId !== undefined) updateData.video_lesson_id = videoLessonId;
    if (questionText !== undefined) updateData.question_text = questionText;
    if (questionType !== undefined) updateData.question_type = questionType;
    if (difficulty !== undefined) updateData.difficulty = difficulty;
    if (points !== undefined) updateData.points = points;
    if (explanation !== undefined) updateData.explanation = explanation;
    if (imageUrl !== undefined) updateData.image_url = imageUrl;
    if (isActive !== undefined) updateData.is_active = isActive;
    updateData.updated_at = new Date().toISOString();

    const { data: updatedQuestion, error: updateError } = await supabase
      .from("learning_questions")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating learning question:", updateError);
      res.status(500).json({
        success: false,
        error: updateError.message,
      });
      return;
    }

    // Update options if provided
    if (options && Array.isArray(options)) {
      // Validate at least one correct answer
      const hasCorrectAnswer = options.some(
        (opt: any) => opt.isCorrect === true,
      );
      if (!hasCorrectAnswer) {
        res.status(400).json({
          success: false,
          error: "At least one correct answer is required",
        });
        return;
      }

      // Delete existing options
      await supabase
        .from("learning_question_options")
        .delete()
        .eq("question_id", id);

      // Insert new options
      const optionsToInsert = options.map((opt: any, index: number) => ({
        question_id: id,
        option_text: opt.optionText,
        is_correct: opt.isCorrect || false,
        display_order:
          opt.displayOrder !== undefined ? opt.displayOrder : index,
      }));

      const { data: insertedOptions, error: optionsError } = await supabase
        .from("learning_question_options")
        .insert(optionsToInsert)
        .select();

      if (optionsError) {
        console.error(
          "Error updating learning question options:",
          optionsError,
        );
        res.status(500).json({
          success: false,
          error: optionsError.message,
        });
        return;
      }

      res.json({
        success: true,
        data: {
          ...updatedQuestion,
          options: insertedOptions,
        },
      });
    } else {
      // Fetch existing options
      const { data: existingOptions } = await supabase
        .from("learning_question_options")
        .select("*")
        .eq("question_id", id);

      res.json({
        success: true,
        data: {
          ...updatedQuestion,
          options: existingOptions || [],
        },
      });
    }
  } catch (error) {
    console.error("Error in PUT /questions/:id:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update learning question",
    });
  }
});

/**
 * DELETE /api/learning/questions/:id (admin only)
 * Delete a learning question
 */
router.delete("/questions/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if question exists
    const { data: existingQuestion, error: fetchError } = await supabase
      .from("learning_questions")
      .select("id")
      .eq("id", id)
      .single();

    if (fetchError || !existingQuestion) {
      res.status(404).json({
        success: false,
        error: "Question not found",
      });
      return;
    }

    // Delete question (options will be cascade deleted)
    const { error: deleteError } = await supabase
      .from("learning_questions")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting learning question:", deleteError);
      res.status(500).json({
        success: false,
        error: deleteError.message,
      });
      return;
    }

    res.json({
      success: true,
      message: "Learning question deleted successfully",
    });
  } catch (error) {
    console.error("Error in DELETE /questions/:id:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete learning question",
    });
  }
});

export default router;
