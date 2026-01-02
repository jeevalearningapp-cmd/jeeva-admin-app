import express, { Request, Response } from 'express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

/**
 * GET /api/topics/:topicId/core-notes
 * Get core notes for a specific topic
 */
router.get('/:topicId/core-notes', async (req: Request, res: Response) => {
  try {
    const { topicId } = req.params;

    const { data, error } = await supabase
      .from('topic_core_notes')
      .select('*')
      .eq('topic_id', topicId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        res.status(404).json({
          success: false,
          error: 'Core notes not found for this topic',
        });
        return;
      }
      console.error('Error fetching topic core notes:', error);
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
    console.error('Error in GET /:topicId/core-notes:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch topic core notes',
    });
  }
});

/**
 * POST /api/topics/:topicId/core-notes (admin only)
 * Create core notes for a topic
 */
router.post('/:topicId/core-notes', async (req: Request, res: Response) => {
  try {
    const { topicId } = req.params;
    const { content, sections, isActive } = req.body;

    // Validate required fields
    if (!content) {
      res.status(400).json({
        success: false,
        error: 'Content is required',
      });
      return;
    }

    // Check if topic exists
    const { data: topic, error: topicError } = await supabase
      .from('topics')
      .select('id')
      .eq('id', topicId)
      .single();

    if (topicError || !topic) {
      res.status(404).json({
        success: false,
        error: 'Topic not found',
      });
      return;
    }

    // Check if core notes already exist for this topic
    const { data: existing } = await supabase
      .from('topic_core_notes')
      .select('id')
      .eq('topic_id', topicId)
      .single();

    if (existing) {
      res.status(409).json({
        success: false,
        error: 'Core notes already exist for this topic. Use PUT to update.',
      });
      return;
    }

    // Insert core notes
    const { data, error } = await supabase
      .from('topic_core_notes')
      .insert({
        topic_id: topicId,
        content,
        sections: sections || null,
        is_active: isActive !== undefined ? isActive : true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating topic core notes:', error);
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
  } catch (error) {
    console.error('Error in POST /:topicId/core-notes:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create topic core notes',
    });
  }
});

/**
 * PUT /api/topics/:topicId/core-notes (admin only)
 * Update core notes for a topic
 */
router.put('/:topicId/core-notes', async (req: Request, res: Response) => {
  try {
    const { topicId } = req.params;
    const { content, sections, isActive } = req.body;

    // Check if core notes exist
    const { data: existing, error: fetchError } = await supabase
      .from('topic_core_notes')
      .select('id')
      .eq('topic_id', topicId)
      .single();

    if (fetchError || !existing) {
      res.status(404).json({
        success: false,
        error: 'Core notes not found for this topic',
      });
      return;
    }

    // Update core notes
    const updateData: any = {};
    if (content !== undefined) updateData.content = content;
    if (sections !== undefined) updateData.sections = sections;
    if (isActive !== undefined) updateData.is_active = isActive;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('topic_core_notes')
      .update(updateData)
      .eq('topic_id', topicId)
      .select()
      .single();

    if (error) {
      console.error('Error updating topic core notes:', error);
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
    console.error('Error in PUT /:topicId/core-notes:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update topic core notes',
    });
  }
});

export default router;
