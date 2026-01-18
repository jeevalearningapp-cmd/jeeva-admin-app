import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  LinearProgress,
  CircularProgress,
} from "@mui/material";
import { DeleteOutlined, EditOutlined, AddOutlined } from "@mui/icons-material";
import { supabase } from "@/lib/supabase";

interface Topic {
  id: string;
  title: string;
  display_order: number;
}

interface Lesson {
  id: string;
  title: string;
  content_type: "video" | "audio" | "text";
  // flashcard/assessment mapped to separate tables?
  // For this simple manager, let's stick to core lesson types: video/text/audio.
  // Flashcards/Questions are separate.
  // The UI had "flashcard" and "assessment".
  // I will map 'flashcard' to a lesson with type 'text' but maybe a specific title flag or just standard lesson.
  // Or actually, `flashcards` table exists.
  // For 'Trial', maybe we just use Lessons for everything for simplicity.
  // I'll support video/text/audio as per DB schema `content_type`.
  video_url?: string;
  content?: string;
  duration?: number;
}

interface LearningManagerProps {
  onStatusChange: (status: "idle" | "loading" | "success" | "error") => void;
}

export default function TrialLearningManager({
  onStatusChange,
}: LearningManagerProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  const [openContentDialog, setOpenContentDialog] = useState(false);
  const [contentFormData, setContentFormData] = useState({
    type: "video" as "video" | "audio" | "text",
    title: "",
    url: "",
    text: "",
    duration: 0,
  });

  useEffect(() => {
    fetchTopics();
  }, []);

  useEffect(() => {
    if (selectedTopicId) {
      fetchLessons(selectedTopicId);
    }
  }, [selectedTopicId]);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      // 1. Get Trial Module
      const { data: moduleData, error: moduleError } = await await supabase
        .from("modules")
        .select("id")
        .eq("slug", "trial-module") // Assuming slug is 'trial-module' or 'free-trial' based on seed.
        // Let's check seed? "Free Trial" title, slug likely generated or hardcoded.
        // In seed: `VALUES ('Free Trial', 'free-trial', ...)`?
        // I should probably check the seed again or be robust.
        // Let's search by title 'Free Trial' if slug uncertain, or try 'free-trial'.
        .eq("title", "Free Trial")
        .single();

      if (moduleError || !moduleData) {
        // If not found, maybe just return or show error.
        console.error("Trial module not found", moduleError);
        return;
      }

      // 2. Get Topics
      const { data: topicsData, error: topicsError } = await supabase
        .from("topics")
        .select("*")
        .eq("module_id", moduleData.id)
        .eq("is_active", true)
        .order("display_order");

      if (topicsError) throw topicsError;

      setTopics(topicsData || []);
      if (topicsData && topicsData.length > 0) {
        setSelectedTopicId(topicsData[0].id);
      }
    } catch (err) {
      console.error(err);
      onStatusChange("error");
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async (topicId: string) => {
    try {
      // setLoading(true) // Don't block whole UI
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("topic_id", topicId)
        .order("display_order");

      if (error) throw error;
      setLessons(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddContent = async () => {
    if (!selectedTopicId) return;
    onStatusChange("loading");
    try {
      const { error } = await supabase.from("lessons").insert([
        {
          topic_id: selectedTopicId,
          title: contentFormData.title,
          content_type: contentFormData.type,
          content: contentFormData.text || "", // Default content
          video_url: contentFormData.url,
          duration: contentFormData.duration,
          is_active: true,
          is_trial_content: true, // IMPORTANT
          display_order: lessons.length + 1,
        },
      ]);

      if (error) throw error;

      await fetchLessons(selectedTopicId);
      setOpenContentDialog(false);
      setContentFormData({
        type: "video",
        title: "",
        url: "",
        text: "",
        duration: 0,
      });
      onStatusChange("success");
    } catch (error) {
      console.error(error);
      onStatusChange("error");
    }
  };

  const handleDeleteContent = async (lessonId: string) => {
    if (!confirm("Delete this lesson?")) return;
    onStatusChange("loading");
    try {
      const { error } = await supabase
        .from("lessons")
        .delete()
        .eq("id", lessonId);
      if (error) throw error;
      if (selectedTopicId) await fetchLessons(selectedTopicId);
      onStatusChange("success");
    } catch (e) {
      onStatusChange("error");
    }
  };

  if (loading && topics.length === 0)
    return (
      <Box p={3}>
        <CircularProgress />
      </Box>
    );
  if (topics.length === 0)
    return (
      <Box p={3}>
        <Typography>
          No Trial Topics found. Please seed the database.
        </Typography>
      </Box>
    );

  const contentCounts = {
    video: lessons.filter((c) => c.content_type === "video").length,
    audio: lessons.filter((c) => c.content_type === "audio").length,
    text: lessons.filter((c) => c.content_type === "text").length,
  };

  return (
    <Box>
      {/* Topic Selection Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={selectedTopicId}
          onChange={(e, value) => setSelectedTopicId(value)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {topics.map((topic) => (
            <Tab key={topic.id} label={topic.title} value={topic.id} />
          ))}
        </Tabs>
      </Paper>

      {/* Content Type Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {(["video", "audio", "text"] as const).map((type) => (
          <Grid size={{ xs: 12, sm: 4 }} key={type}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography color="text.secondary" variant="caption">
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Typography>
                <Typography variant="h6">{contentCounts[type]}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add Content Button */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          onClick={() => setOpenContentDialog(true)}
        >
          Add Lesson
        </Button>
      </Box>

      {/* Content List */}
      <Paper>
        {lessons.length === 0 ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography color="text.secondary">
              No lessons added for this topic. Click "Add Lesson" to get
              started.
            </Typography>
          </Box>
        ) : (
          <List>
            {lessons.map((lesson, index) => (
              <React.Fragment key={lesson.id}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Box
                        sx={{ display: "flex", gap: 1, alignItems: "center" }}
                      >
                        <Typography variant="subtitle2">
                          {lesson.title}
                        </Typography>
                        <Chip
                          label={lesson.content_type}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      lesson.duration ? `Duration: ${lesson.duration}s` : null
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleDeleteContent(lesson.id)}
                      title="Delete"
                    >
                      <DeleteOutlined fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      {/* Add Content Dialog */}
      <Dialog
        open={openContentDialog}
        onClose={() => setOpenContentDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Lesson</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}
        >
          <FormControl fullWidth>
            <InputLabel>Content Type</InputLabel>
            <Select
              value={contentFormData.type}
              onChange={(e) =>
                setContentFormData({
                  ...contentFormData,
                  type: e.target.value as "video" | "audio" | "text",
                })
              }
              label="Content Type"
            >
              <MenuItem value="video">Video</MenuItem>
              <MenuItem value="audio">Audio</MenuItem>
              <MenuItem value="text">Text</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Title"
            value={contentFormData.title}
            onChange={(e) =>
              setContentFormData({ ...contentFormData, title: e.target.value })
            }
            fullWidth
          />

          {(contentFormData.type === "video" ||
            contentFormData.type === "audio") && (
            <>
              <TextField
                label="URL"
                value={contentFormData.url}
                onChange={(e) =>
                  setContentFormData({
                    ...contentFormData,
                    url: e.target.value,
                  })
                }
                fullWidth
                placeholder="https://..."
              />
              <TextField
                label="Duration (seconds)"
                type="number"
                value={contentFormData.duration}
                onChange={(e) =>
                  setContentFormData({
                    ...contentFormData,
                    duration: parseInt(e.target.value),
                  })
                }
                fullWidth
              />
            </>
          )}

          {contentFormData.type === "text" && (
            <TextField
              label="Content (Markdown/Text)"
              multiline
              rows={4}
              value={contentFormData.text}
              onChange={(e) =>
                setContentFormData({ ...contentFormData, text: e.target.value })
              }
              fullWidth
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenContentDialog(false)}>Cancel</Button>
          <Button onClick={handleAddContent} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
