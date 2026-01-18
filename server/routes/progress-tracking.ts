import express, { Request, Response } from "express";
import { supabase } from "../lib/supabase.js";

const router = express.Router();

/**
 * GET /api/users/:userId/topic-progress
 * Get all topic progress for a user
 */
router.get("/:userId/topic-progress", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from("topic_progress")
      .select(
        `
        *,
        topic:topics(id, title, description)
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching topic progress:", error);
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
    console.error("Error in GET /:userId/topic-progress:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch topic progress",
    });
  }
});

/**
 * GET /api/users/:userId/subtopic-progress?topicId=X
 * Get subtopic progress for a user, optionally filtered by topic
 */
router.get(
  "/:userId/subtopic-progress",
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { topicId } = req.query;

      let query = supabase
        .from("subtopic_progress")
        .select(
          `
        *,
        topic:topics(id, title),
        subtopic:subtopics(id, title, description)
      `,
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (topicId) {
        query = query.eq("topic_id", topicId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching subtopic progress:", error);
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
      console.error("Error in GET /:userId/subtopic-progress:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch subtopic progress",
      });
    }
  },
);

/**
 * POST /api/users/:userId/subtopic-progress
 * Update subtopic progress after MCQ completion
 */
router.post(
  "/:userId/subtopic-progress",
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { topicId, subtopicId, status, score, timeSpentSeconds } = req.body;

      // Validate required fields
      if (!topicId || !subtopicId || !status) {
        res.status(400).json({
          success: false,
          error: "Missing required fields: topicId, subtopicId, status",
        });
        return;
      }

      // Check if progress record exists
      const { data: existing } = await supabase
        .from("subtopic_progress")
        .select("*")
        .eq("user_id", userId)
        .eq("subtopic_id", subtopicId)
        .single();

      if (existing) {
        // Update existing progress
        const updateData: any = {
          status,
          updated_at: new Date().toISOString(),
        };

        if (score !== undefined) {
          updateData.score = score;
          // Update best score if current score is higher
          if (!existing.best_score || score > existing.best_score) {
            updateData.best_score = score;
          }
        }

        if (timeSpentSeconds !== undefined) {
          updateData.time_spent_seconds =
            (existing.time_spent_seconds || 0) + timeSpentSeconds;
        }

        updateData.attempts = (existing.attempts || 0) + 1;

        if (status === "completed") {
          updateData.completed_at = new Date().toISOString();
        }

        const { data, error } = await supabase
          .from("subtopic_progress")
          .update(updateData)
          .eq("user_id", userId)
          .eq("subtopic_id", subtopicId)
          .select()
          .single();

        if (error) {
          console.error("Error updating subtopic progress:", error);
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
      } else {
        // Create new progress record
        const { data, error } = await supabase
          .from("subtopic_progress")
          .insert({
            user_id: userId,
            topic_id: topicId,
            subtopic_id: subtopicId,
            status,
            score: score || null,
            best_score: score || null,
            attempts: 1,
            time_spent_seconds: timeSpentSeconds || 0,
            completed_at:
              status === "completed" ? new Date().toISOString() : null,
          })
          .select()
          .single();

        if (error) {
          console.error("Error creating subtopic progress:", error);
          res.status(500).json({
            success: false,
            error: error.message,
          });
          return;
        }

        res.status(201).json({
          success: true,
          data,
        });
      }
    } catch (error) {
      console.error("Error in POST /:userId/subtopic-progress:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update subtopic progress",
      });
    }
  },
);

/**
 * GET /api/users/:userId/topics/:topicId/progress
 * Calculate overall topic progress for a user
 */
router.get(
  "/:userId/topics/:topicId/progress",
  async (req: Request, res: Response) => {
    try {
      const { userId, topicId } = req.params;

      // Get topic progress
      const { data: topicProgress } = await supabase
        .from("topic_progress")
        .select("*")
        .eq("user_id", userId)
        .eq("topic_id", topicId)
        .single();

      // Get all subtopics for this topic
      const { data: subtopics, error: subtopicsError } = await supabase
        .from("subtopics")
        .select("id")
        .eq("topic_id", topicId);

      if (subtopicsError) {
        console.error("Error fetching subtopics:", subtopicsError);
        res.status(500).json({
          success: false,
          error: subtopicsError.message,
        });
        return;
      }

      // Get subtopic progress
      const { data: subtopicProgress, error: progressError } = await supabase
        .from("subtopic_progress")
        .select("*")
        .eq("user_id", userId)
        .eq("topic_id", topicId);

      if (progressError) {
        console.error("Error fetching subtopic progress:", progressError);
        res.status(500).json({
          success: false,
          error: progressError.message,
        });
        return;
      }

      // Calculate progress percentage
      const totalSubtopics = subtopics?.length || 0;
      const completedSubtopics =
        subtopicProgress?.filter((p) => p.status === "completed").length || 0;
      const coreNotesCompleted = topicProgress?.core_notes_completed || false;
      const flashContentCompleted =
        topicProgress?.flash_content_completed || false;

      // Progress calculation:
      // - Core Notes: 20%
      // - Flash Content: 20%
      // - Subtopics: 60% (divided equally among subtopics)
      let progressPercentage = 0;
      if (coreNotesCompleted) progressPercentage += 20;
      if (flashContentCompleted) progressPercentage += 20;
      if (totalSubtopics > 0) {
        progressPercentage += (completedSubtopics / totalSubtopics) * 60;
      }

      progressPercentage = Math.round(progressPercentage);

      // Update or create topic progress
      if (topicProgress) {
        const { data, error } = await supabase
          .from("topic_progress")
          .update({
            progress_percentage: progressPercentage,
            completed_at:
              progressPercentage === 100 ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .eq("topic_id", topicId)
          .select()
          .single();

        if (error) {
          console.error("Error updating topic progress:", error);
          res.status(500).json({
            success: false,
            error: error.message,
          });
          return;
        }

        res.json({
          success: true,
          data: {
            ...data,
            totalSubtopics,
            completedSubtopics,
          },
        });
      } else {
        const { data, error } = await supabase
          .from("topic_progress")
          .insert({
            user_id: userId,
            topic_id: topicId,
            core_notes_completed: false,
            flash_content_completed: false,
            progress_percentage: progressPercentage,
            completed_at:
              progressPercentage === 100 ? new Date().toISOString() : null,
          })
          .select()
          .single();

        if (error) {
          console.error("Error creating topic progress:", error);
          res.status(500).json({
            success: false,
            error: error.message,
          });
          return;
        }

        res.status(201).json({
          success: true,
          data: {
            ...data,
            totalSubtopics,
            completedSubtopics,
          },
        });
      }
    } catch (error) {
      console.error("Error in GET /:userId/topics/:topicId/progress:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to calculate topic progress",
      });
    }
  },
);

export default router;
