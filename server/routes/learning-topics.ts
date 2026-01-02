import express, { Request, Response } from 'express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

/**
 * GET /api/learning/topics
 * List all learning topics
 */
router.get('/topics', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('topics')
      .select(`
        *,
        subtopics:subtopics(count)
      `)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching learning topics:', error);
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
    console.error('Error in GET /topics:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch learning topics',
    });
  }
});

/**
 * POST /api/learning/topics (admin only)
 * Create a new learning topic
 */
router.post('/topics', async (req: Request, res: Response) => {
  try {
    const { title, description, displayOrder, moduleId } = req.body;

    // Validate required fields
    if (!title) {
      res.status(400).json({
        success: false,
        error: 'Title is required',
      });
      return;
    }

    // If displayOrder not provided, get the max order and add 1
    let order = displayOrder;
    if (order === undefined) {
      const { data: maxOrderTopic } = await supabase
        .from('topics')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1)
        .single();

      order = maxOrderTopic ? maxOrderTopic.display_order + 1 : 1;
    }

    // Insert topic
    const { data: topic, error: topicError } = await supabase
      .from('topics')
      .insert({
        title,
        description,
        display_order: order,
        module_id: moduleId || null,
      })
      .select()
      .single();

    if (topicError) {
      console.error('Error creating learning topic:', topicError);
      res.status(500).json({
        success: false,
        error: topicError.message,
      });
      return;
    }

    // Create placeholder for Core Notes
    await supabase
      .from('topic_core_notes')
      .insert({
        topic_id: topic.id,
        content: '',
        is_active: false,
      });

    // Create placeholders for Flash Content (5 screens)
    const flashContentScreens = [];
    for (let i = 1; i <= 5; i++) {
      flashContentScreens.push({
        topic_id: topic.id,
        screen_number: i,
        title: `Screen ${i}`,
        content: '',
        is_active: false,
      });
    }

    await supabase
      .from('topic_flash_content')
      .insert(flashContentScreens);

    res.status(201).json({
      success: true,
      data: topic,
    });
  } catch (error) {
    console.error('Error in POST /topics:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create learning topic',
    });
  }
});

/**
 * PUT /api/learning/topics/:id (admin only)
 * Edit an existing learning topic
 */
router.put('/topics/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, displayOrder, moduleId } = req.body;

    // Check if topic exists
    const { data: existing, error: fetchError } = await supabase
      .from('topics')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      res.status(404).json({
        success: false,
        error: 'Topic not found',
      });
      return;
    }

    // Update topic
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (displayOrder !== undefined) updateData.display_order = displayOrder;
    if (moduleId !== undefined) updateData.module_id = moduleId;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('topics')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating learning topic:', error);
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
    console.error('Error in PUT /topics/:id:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update learning topic',
    });
  }
});

/**
 * DELETE /api/learning/topics/:id (admin only)
 * Delete a learning topic with cascade warning
 */
router.delete('/topics/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if topic exists
    const { data: existing, error: fetchError } = await supabase
      .from('topics')
      .select('id, title')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      res.status(404).json({
        success: false,
        error: 'Topic not found',
      });
      return;
    }

    // Get counts of related content
    const { count: subtopicsCount } = await supabase
      .from('subtopics')
      .select('*', { count: 'exact', head: true })
      .eq('topic_id', id);

    const { count: coreNotesCount } = await supabase
      .from('topic_core_notes')
      .select('*', { count: 'exact', head: true })
      .eq('topic_id', id);

    const { count: flashContentCount } = await supabase
      .from('topic_flash_content')
      .select('*', { count: 'exact', head: true })
      .eq('topic_id', id);

    const { count: learningQuestionsCount } = await supabase
      .from('learning_questions')
      .select('*', { count: 'exact', head: true })
      .eq('topic_id', id);

    // Check if force delete is requested
    const { force } = req.query;

    if (!force && (subtopicsCount || coreNotesCount || flashContentCount || learningQuestionsCount)) {
      res.status(409).json({
        success: false,
        error: 'Topic has related content',
        warning: {
          message: `Deleting topic "${existing.title}" will also delete:`,
          counts: {
            subtopics: subtopicsCount || 0,
            coreNotes: coreNotesCount || 0,
            flashContent: flashContentCount || 0,
            learningQuestions: learningQuestionsCount || 0,
          },
          hint: 'Add ?force=true to confirm deletion',
        },
      });
      return;
    }

    // Delete topic (cascade will handle related content)
    const { error: deleteError } = await supabase
      .from('topics')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting learning topic:', deleteError);
      res.status(500).json({
        success: false,
        error: deleteError.message,
      });
      return;
    }

    res.json({
      success: true,
      message: 'Topic deleted successfully',
    });
  } catch (error) {
    console.error('Error in DELETE /topics/:id:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete learning topic',
    });
  }
});

/**
 * PUT /api/learning/topics/reorder (admin only)
 * Reorder topics
 */
router.put('/topics/reorder', async (req: Request, res: Response) => {
  try {
    const { topicOrders } = req.body;

    // Validate input
    if (!topicOrders || !Array.isArray(topicOrders)) {
      res.status(400).json({
        success: false,
        error: 'topicOrders array is required',
      });
      return;
    }

    // Update each topic's display order
    const updates = topicOrders.map(async (item: { id: string; displayOrder: number }) => {
      return supabase
        .from('topics')
        .update({
          display_order: item.displayOrder,
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.id);
    });

    await Promise.all(updates);

    // Fetch updated topics
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching reordered topics:', error);
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
    console.error('Error in PUT /topics/reorder:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reorder topics',
    });
  }
});

export default router;
