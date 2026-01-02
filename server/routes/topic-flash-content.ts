import express, { Request, Response } from 'express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

/**
 * GET /api/topics/:topicId/flash-content
 * Get all flash content screens for a specific topic
 */
router.get('/:topicId/flash-content', async (req: Request, res: Response) => {
  try {
    const { topicId } = req.params;

    const { data, error } = await supabase
      .from('topic_flash_content')
      .select('*')
      .eq('topic_id', topicId)
      .order('screen_number', { ascending: true });

    if (error) {
      console.error('Error fetching topic flash content:', error);
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
    console.error('Error in GET /:topicId/flash-content:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch topic flash content',
    });
  }
});

/**
 * POST /api/topics/:topicId/flash-content (admin only)
 * Create a new flash content screen for a topic
 */
router.post('/:topicId/flash-content', async (req: Request, res: Response) => {
  try {
    const { topicId } = req.params;
    const { screenNumber, title, content, imageUrl, isActive } = req.body;

    // Validate required fields
    if (!screenNumber || !title || !content) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: screenNumber, title, content',
      });
      return;
    }

    // Validate screen number (1-5)
    if (screenNumber < 1 || screenNumber > 5) {
      res.status(400).json({
        success: false,
        error: 'Screen number must be between 1 and 5',
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

    // Check if screen already exists for this topic
    const { data: existing } = await supabase
      .from('topic_flash_content')
      .select('id')
      .eq('topic_id', topicId)
      .eq('screen_number', screenNumber)
      .single();

    if (existing) {
      res.status(409).json({
        success: false,
        error: `Screen ${screenNumber} already exists for this topic. Use PUT to update.`,
      });
      return;
    }

    // Insert flash content
    const { data, error } = await supabase
      .from('topic_flash_content')
      .insert({
        topic_id: topicId,
        screen_number: screenNumber,
        title,
        content,
        image_url: imageUrl,
        is_active: isActive !== undefined ? isActive : true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating topic flash content:', error);
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
    console.error('Error in POST /:topicId/flash-content:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create topic flash content',
    });
  }
});

/**
 * PUT /api/topics/:topicId/flash-content/:screenNumber (admin only)
 * Update a flash content screen for a topic
 */
router.put('/:topicId/flash-content/:screenNumber', async (req: Request, res: Response) => {
  try {
    const { topicId, screenNumber } = req.params;
    const { title, content, imageUrl, isActive } = req.body;

    // Validate screen number
    const screenNum = parseInt(screenNumber, 10);
    if (isNaN(screenNum) || screenNum < 1 || screenNum > 5) {
      res.status(400).json({
        success: false,
        error: 'Screen number must be between 1 and 5',
      });
      return;
    }

    // Check if flash content exists
    const { data: existing, error: fetchError } = await supabase
      .from('topic_flash_content')
      .select('id')
      .eq('topic_id', topicId)
      .eq('screen_number', screenNum)
      .single();

    if (fetchError || !existing) {
      res.status(404).json({
        success: false,
        error: 'Flash content screen not found',
      });
      return;
    }

    // Update flash content
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (imageUrl !== undefined) updateData.image_url = imageUrl;
    if (isActive !== undefined) updateData.is_active = isActive;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('topic_flash_content')
      .update(updateData)
      .eq('topic_id', topicId)
      .eq('screen_number', screenNum)
      .select()
      .single();

    if (error) {
      console.error('Error updating topic flash content:', error);
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
    console.error('Error in PUT /:topicId/flash-content/:screenNumber:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update topic flash content',
    });
  }
});

/**
 * DELETE /api/topics/:topicId/flash-content/:screenNumber (admin only)
 * Delete a flash content screen for a topic
 */
router.delete('/:topicId/flash-content/:screenNumber', async (req: Request, res: Response) => {
  try {
    const { topicId, screenNumber } = req.params;

    // Validate screen number
    const screenNum = parseInt(screenNumber, 10);
    if (isNaN(screenNum) || screenNum < 1 || screenNum > 5) {
      res.status(400).json({
        success: false,
        error: 'Screen number must be between 1 and 5',
      });
      return;
    }

    // Check if flash content exists
    const { data: existing, error: fetchError } = await supabase
      .from('topic_flash_content')
      .select('id')
      .eq('topic_id', topicId)
      .eq('screen_number', screenNum)
      .single();

    if (fetchError || !existing) {
      res.status(404).json({
        success: false,
        error: 'Flash content screen not found',
      });
      return;
    }

    // Delete flash content
    const { error: deleteError } = await supabase
      .from('topic_flash_content')
      .delete()
      .eq('topic_id', topicId)
      .eq('screen_number', screenNum);

    if (deleteError) {
      console.error('Error deleting topic flash content:', deleteError);
      res.status(500).json({
        success: false,
        error: deleteError.message,
      });
      return;
    }

    res.json({
      success: true,
      message: 'Flash content screen deleted successfully',
    });
  } catch (error) {
    console.error('Error in DELETE /:topicId/flash-content/:screenNumber:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete topic flash content',
    });
  }
});

export default router;
