import express, { Request, Response } from 'express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

/**
 * GET /api/topics/:topicId/validation-status
 * Check if topic is ready for activation
 */
router.get('/topics/:topicId/validation-status', async (req: Request, res: Response) => {
  try {
    const { topicId } = req.params;

    // Check if topic exists
    const { data: topic, error: topicError } = await supabase
      .from('topics')
      .select('id, title')
      .eq('id', topicId)
      .single();

    if (topicError || !topic) {
      res.status(404).json({
        success: false,
        error: 'Topic not found',
      });
      return;
    }

    const validationErrors: string[] = [];
    const validationWarnings: string[] = [];

    // 1. Check Core Notes exist and are not empty
    const { data: coreNotes, error: coreNotesError } = await supabase
      .from('topic_core_notes')
      .select('content, is_active')
      .eq('topic_id', topicId)
      .single();

    if (coreNotesError || !coreNotes) {
      validationErrors.push('Core Notes do not exist');
    } else if (!coreNotes.content || coreNotes.content.trim() === '') {
      validationErrors.push('Core Notes content is empty');
    } else if (!coreNotes.is_active) {
      validationWarnings.push('Core Notes exist but are not marked as active');
    }

    // 2. Check exactly 5 Flash Content screens exist
    const { data: flashContent, error: flashError } = await supabase
      .from('topic_flash_content')
      .select('screen_number, title, content, is_active')
      .eq('topic_id', topicId)
      .order('screen_number', { ascending: true });

    if (flashError) {
      validationErrors.push('Error fetching Flash Content');
    } else if (!flashContent || flashContent.length !== 5) {
      validationErrors.push(`Exactly 5 Flash Content screens required (currently: ${flashContent?.length || 0})`);
    } else {
      // Check each screen has content
      const emptyScreens = flashContent.filter(screen => !screen.content || screen.content.trim() === '');
      if (emptyScreens.length > 0) {
        validationErrors.push(`Flash Content screens ${emptyScreens.map(s => s.screen_number).join(', ')} have empty content`);
      }

      // Check if all screens are active
      const inactiveScreens = flashContent.filter(screen => !screen.is_active);
      if (inactiveScreens.length > 0) {
        validationWarnings.push(`Flash Content screens ${inactiveScreens.map(s => s.screen_number).join(', ')} are not marked as active`);
      }
    }

    // 3. Check all subtopics
    const { data: subtopics, error: subtopicsError } = await supabase
      .from('subtopics')
      .select('id, title')
      .eq('topic_id', topicId);

    if (subtopicsError) {
      validationErrors.push('Error fetching subtopics');
    } else if (!subtopics || subtopics.length === 0) {
      validationErrors.push('At least one subtopic is required');
    } else {
      // Check each subtopic
      for (const subtopic of subtopics) {
        // Check mandatory video lesson
        const { data: lessons, error: lessonsError } = await supabase
          .from('lessons')
          .select('id, is_mandatory, content_type')
          .eq('subtopic_id', subtopic.id)
          .eq('is_mandatory', true);

        if (lessonsError) {
          validationErrors.push(`Error fetching lessons for subtopic "${subtopic.title}"`);
        } else if (!lessons || lessons.length === 0) {
          validationErrors.push(`Subtopic "${subtopic.title}" has no mandatory video lesson`);
        }

        // Check MCQs (5-10 required)
        const { count: mcqCount, error: mcqError } = await supabase
          .from('learning_questions')
          .select('*', { count: 'exact', head: true })
          .eq('subtopic_id', subtopic.id)
          .eq('is_active', true);

        if (mcqError) {
          validationErrors.push(`Error fetching MCQs for subtopic "${subtopic.title}"`);
        } else if (!mcqCount || mcqCount < 5) {
          validationErrors.push(`Subtopic "${subtopic.title}" has insufficient MCQs (${mcqCount || 0}/5 minimum)`);
        } else if (mcqCount > 10) {
          validationWarnings.push(`Subtopic "${subtopic.title}" has more than 10 MCQs (${mcqCount}/10 maximum)`);
        }

        // Check all MCQs are mapped to video lessons
        const { data: unmappedMCQs, error: unmappedError } = await supabase
          .from('learning_questions')
          .select('id')
          .eq('subtopic_id', subtopic.id)
          .is('video_lesson_id', null);

        if (unmappedError) {
          validationErrors.push(`Error checking MCQ mappings for subtopic "${subtopic.title}"`);
        } else if (unmappedMCQs && unmappedMCQs.length > 0) {
          validationErrors.push(`Subtopic "${subtopic.title}" has ${unmappedMCQs.length} MCQs not mapped to video lessons`);
        }
      }
    }

    // Determine overall status
    const isValid = validationErrors.length === 0;
    const status = isValid ? (validationWarnings.length > 0 ? 'valid_with_warnings' : 'valid') : 'invalid';

    res.json({
      success: true,
      data: {
        topicId,
        topicTitle: topic.title,
        status,
        isValid,
        errors: validationErrors,
        warnings: validationWarnings,
        summary: {
          coreNotesValid: !validationErrors.some(e => e.includes('Core Notes')),
          flashContentValid: !validationErrors.some(e => e.includes('Flash Content')),
          subtopicsValid: !validationErrors.some(e => e.includes('Subtopic') || e.includes('subtopic')),
        },
      },
    });
  } catch (error) {
    console.error('Error in GET /topics/:topicId/validation-status:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to validate topic',
    });
  }
});

/**
 * GET /api/subtopics/:subtopicId/validation-status
 * Check if subtopic is ready for activation
 */
router.get('/subtopics/:subtopicId/validation-status', async (req: Request, res: Response) => {
  try {
    const { subtopicId } = req.params;

    // Check if subtopic exists
    const { data: subtopic, error: subtopicError } = await supabase
      .from('subtopics')
      .select('id, title, topic_id')
      .eq('id', subtopicId)
      .single();

    if (subtopicError || !subtopic) {
      res.status(404).json({
        success: false,
        error: 'Subtopic not found',
      });
      return;
    }

    const validationErrors: string[] = [];
    const validationWarnings: string[] = [];

    // 1. Check mandatory video lesson exists
    const { data: mandatoryLessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id, content_type, video_url, is_mandatory')
      .eq('subtopic_id', subtopicId)
      .eq('is_mandatory', true);

    if (lessonsError) {
      validationErrors.push('Error fetching lessons');
    } else if (!mandatoryLessons || mandatoryLessons.length === 0) {
      validationErrors.push('At least one mandatory video lesson is required');
    } else {
      // Check if video URL is provided
      const lessonsWithoutVideo = mandatoryLessons.filter(l => !l.video_url);
      if (lessonsWithoutVideo.length > 0) {
        validationErrors.push(`${lessonsWithoutVideo.length} mandatory lesson(s) missing video URL`);
      }
    }

    // 2. Check MCQs (5-10 required)
    const { data: mcqs, error: mcqError } = await supabase
      .from('learning_questions')
      .select('id, video_lesson_id')
      .eq('subtopic_id', subtopicId)
      .eq('is_active', true);

    if (mcqError) {
      validationErrors.push('Error fetching MCQs');
    } else {
      const mcqCount = mcqs?.length || 0;
      if (mcqCount < 5) {
        validationErrors.push(`Insufficient MCQs (${mcqCount}/5 minimum required)`);
      } else if (mcqCount > 10) {
        validationWarnings.push(`More than 10 MCQs (${mcqCount}/10 maximum recommended)`);
      }

      // Check all MCQs are mapped to video lessons
      const unmappedMCQs = mcqs?.filter(mcq => !mcq.video_lesson_id) || [];
      if (unmappedMCQs.length > 0) {
        validationErrors.push(`${unmappedMCQs.length} MCQ(s) not mapped to video lessons`);
      }
    }

    // 3. Check optional podcast (warning only)
    const { data: podcasts, error: podcastError } = await supabase
      .from('lessons')
      .select('id, content_type, podcast_url')
      .eq('subtopic_id', subtopicId)
      .eq('content_type', 'audio');

    if (!podcastError && (!podcasts || podcasts.length === 0)) {
      validationWarnings.push('No optional podcast provided');
    }

    // Determine overall status
    const isValid = validationErrors.length === 0;
    const status = isValid ? (validationWarnings.length > 0 ? 'valid_with_warnings' : 'valid') : 'invalid';

    res.json({
      success: true,
      data: {
        subtopicId,
        subtopicTitle: subtopic.title,
        topicId: subtopic.topic_id,
        status,
        isValid,
        errors: validationErrors,
        warnings: validationWarnings,
        summary: {
          mandatoryVideoValid: !validationErrors.some(e => e.includes('video') || e.includes('lesson')),
          mcqsValid: !validationErrors.some(e => e.includes('MCQ')),
          hasPodcast: !validationWarnings.some(w => w.includes('podcast')),
        },
      },
    });
  } catch (error) {
    console.error('Error in GET /subtopics/:subtopicId/validation-status:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to validate subtopic',
    });
  }
});

export default router;
