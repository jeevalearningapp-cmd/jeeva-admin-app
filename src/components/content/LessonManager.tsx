import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import {
  AddOutlined,
  EditOutlined,
  DeleteOutlined,
  VideoLibraryOutlined,
  AudioFileOutlined,
  TextFieldsOutlined,
  QuizOutlined,
} from "@mui/icons-material";
import {
  useLessonsByTopic,
  useCreateLesson,
  useUpdateLesson,
  useDeleteLesson,
} from "@/hooks/useLessons";
import { useTopics } from "@/hooks/useTopics";
import { PageLoader } from "@/components/common";
import { Lesson, CreateLessonInput, FIXED_MODULE_IDS } from "@/types/content";
import {
  getAllSubtopics,
  LEARNING_TOPICS,
} from "@/constants/learningStructure";
import { RichTextEditor } from "@/components/common/RichTextEditor";
import { subtopicsAPI, Subtopic } from "@/api/subtopics";

interface LessonManagerProps {
  topicTitle: string;
  subtopicId?: string;
}

export const LessonManager: React.FC<LessonManagerProps> = ({
  topicTitle,
  subtopicId,
}) => {
  // Find the topic ID from the title
  const selectedTopic = LEARNING_TOPICS.find((t) => t.title === topicTitle);
  const topicId = selectedTopic?.id || "";
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  // Fix: formData typing to use new fields
  const [formData, setFormData] = useState<CreateLessonInput>({
    topicId: "",
    title: "",
    content: "",
    videoUrl: "",
    audioUrl: "",
    podcastUrl: "",
    lessonType: "text",
    contentType: "text",
    passingScorePercentage: 80,
    category: "",
    subtopicId: "",
    duration: 0,
    isActive: true,
    displayOrder: 0,
    isMandatory: true,
  });
  const [touched, setTouched] = useState({ title: false, content: false });
  const [submitError, setSubmitError] = useState<string>("");

  const { data: allLessons, isLoading } = useLessonsByTopic(topicId);
  const { data: topics } = useTopics();
  const createMutation = useCreateLesson();
  const updateMutation = useUpdateLesson();
  const deleteMutation = useDeleteLesson();

  // New: Fetch subtopics dynamically
  const [availableSubtopics, setAvailableSubtopics] = useState<Subtopic[]>([]);

  React.useEffect(() => {
    const fetchSubtopics = async () => {
      if (topicId) {
        try {
          const data = await subtopicsAPI.getByTopicId(topicId);
          setAvailableSubtopics(data);
        } catch (error) {
          console.error("Failed to fetch subtopics", error);
        }
      }
    };
    fetchSubtopics();
  }, [topicId]);

  const currentTopic = topics?.find((t) => t.id === topicId);
  const isLearningModule = currentTopic?.moduleId === FIXED_MODULE_IDS.LEARNING;

  // Filter lessons by subtopic if provided
  const lessons = subtopicId
    ? allLessons?.filter(
        (lesson) =>
          lesson.category === subtopicId || lesson.subtopicId === subtopicId,
      )
    : allLessons;

  if (isLoading) {
    return <PageLoader />;
  }

  const handleOpenDialog = (lesson?: Lesson) => {
    if (lesson) {
      setEditingLesson(lesson);
      setFormData({
        topicId: lesson.topicId,
        title: lesson.title,
        content: lesson.content,
        videoUrl: lesson.videoUrl || "",
        audioUrl: lesson.audioUrl || "",
        podcastUrl: lesson.podcastUrl || lesson.audioUrl || "", // Fallback for transition
        lessonType: lesson.contentType || lesson.lessonType || "text",
        contentType: lesson.contentType || lesson.lessonType || "text",
        passingScorePercentage: lesson.passingScorePercentage || 80,
        category: lesson.subtopicId || lesson.category || "",
        subtopicId: lesson.subtopicId || lesson.category || "", // Fallback
        duration: lesson.duration || 0,
        isActive: lesson.isActive,
        displayOrder: lesson.displayOrder,
        isMandatory: lesson.isMandatory ?? true,
      });
    } else {
      setEditingLesson(null);
      setFormData({
        topicId,
        title: "",
        content: "",
        videoUrl: "",
        audioUrl: "",
        podcastUrl: "",
        lessonType: "text",
        contentType: "text",
        passingScorePercentage: 80,
        category: subtopicId || "",
        subtopicId: subtopicId || "",
        duration: 0,
        isActive: true,
        displayOrder: 0,
        isMandatory: true,
      });
    }
    setTouched({ title: false, content: false });
    setSubmitError("");
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingLesson(null);
  };

  const getFieldError = (field: string) => {
    if (!touched[field as keyof typeof touched]) return "";
    if (field === "title" && !formData.title.trim()) return "Title is required";
    if (field === "content" && !formData.content.trim())
      return "Content is required";
    return "";
  };

  const validate = () => {
    return formData.title.trim() && formData.content.trim();
  };

  const handleSubmit = async () => {
    setTouched({ title: true, content: true });
    if (!validate()) {
      setSubmitError("Please fill in all required fields");
      return;
    }

    try {
      // Ensure sync between legacy and new fields
      const payload = {
        ...formData,
        lessonType: formData.contentType, // Legacy support
        category: formData.subtopicId, // Legacy support
        audioUrl: formData.podcastUrl, // Legacy/Frontend mapping
      };

      if (editingLesson) {
        await updateMutation.mutateAsync({
          id: editingLesson.id,
          input: payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }
      handleCloseDialog();
    } catch (error: any) {
      setSubmitError(error.message || "An error occurred");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this lesson?")) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  const getLessonTypeIcon = (type?: string) => {
    switch (type) {
      case "video":
        return <VideoLibraryOutlined fontSize="small" />;
      case "audio":
        return <AudioFileOutlined fontSize="small" />;
      case "quiz":
        return <QuizOutlined fontSize="small" />;
      default:
        return <TextFieldsOutlined fontSize="small" />;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h6">
            Lessons for {currentTopic?.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {lessons?.length || 0} lesson(s)
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: "12px" }}
        >
          Add Lesson
        </Button>
      </Box>

      {/* Lessons Table */}
      {lessons && lessons.length > 0 ? (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Type</TableCell>
                {isLearningModule && <TableCell>Subtopic</TableCell>}
                <TableCell>Duration</TableCell>
                <TableCell>Media</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lessons.map((lesson) => (
                <TableRow key={lesson.id}>
                  <TableCell>{lesson.title}</TableCell>
                  <TableCell>
                    <Chip
                      icon={getLessonTypeIcon(
                        lesson.contentType || lesson.lessonType,
                      )}
                      label={lesson.contentType || lesson.lessonType || "text"}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  {isLearningModule && (
                    <TableCell>
                      {lesson.subtopicId || lesson.category ? (
                        <Chip
                          label={
                            availableSubtopics.find(
                              (s) =>
                                s.id === (lesson.subtopicId || lesson.category),
                            )?.title ||
                            lesson.subtopicId ||
                            lesson.category
                          }
                          size="small"
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                  )}
                  <TableCell>{lesson.duration} min</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      {lesson.videoUrl && (
                        <Chip
                          icon={<VideoLibraryOutlined fontSize="small" />}
                          label="Video"
                          size="small"
                        />
                      )}
                      {(lesson.podcastUrl || lesson.audioUrl) && (
                        <Chip
                          icon={<AudioFileOutlined fontSize="small" />}
                          label="Audio"
                          size="small"
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={lesson.isActive ? "Active" : "Inactive"}
                      color={lesson.isActive ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleOpenDialog(lesson)}
                      size="small"
                    >
                      <EditOutlined fontSize="small" />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(lesson.id)}
                      size="small"
                      color="error"
                    >
                      <DeleteOutlined fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Alert severity="info">
          No lessons found for this topic. Click "Add Lesson" to create one.
        </Alert>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingLesson ? "Edit Lesson" : "Add Lesson"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            {submitError && (
              <Alert severity="error" onClose={() => setSubmitError("")}>
                {submitError}
              </Alert>
            )}

            {isLearningModule && (
              <FormControl fullWidth>
                <InputLabel>Subtopic</InputLabel>
                <Select
                  value={formData.subtopicId || formData.category || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      subtopicId: e.target.value,
                      category: e.target.value, // Legacy sync
                    })
                  }
                  label="Subtopic"
                >
                  <MenuItem value="">
                    <em>None (Direct lesson)</em>
                  </MenuItem>
                  {availableSubtopics.map((subtopic) => (
                    <MenuItem key={subtopic.id} value={subtopic.id}>
                      {subtopic.title}
                    </MenuItem>
                  ))}
                </Select>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 0.5, ml: 2 }}
                >
                  Select which subtopic this lesson belongs to (e.g., "1.1
                  Prioritise People")
                </Typography>
              </FormControl>
            )}

            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              onBlur={() => setTouched({ ...touched, title: true })}
              fullWidth
              required
              error={!!getFieldError("title")}
              helperText={getFieldError("title")}
            />

            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Lesson Content *
              </Typography>
              <RichTextEditor
                content={formData.content}
                onChange={(content) => {
                  setFormData({ ...formData, content });
                  setTouched({ ...touched, content: true });
                }}
                placeholder="Write your lesson content here... Use the toolbar for formatting."
              />
              {getFieldError("content") && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ mt: 0.5, ml: 2 }}
                >
                  {getFieldError("content")}
                </Typography>
              )}
            </Box>

            <TextField
              label="Video URL"
              value={formData.videoUrl}
              onChange={(e) =>
                setFormData({ ...formData, videoUrl: e.target.value })
              }
              fullWidth
              placeholder="https://www.youtube.com/watch?v=..."
            />

            <TextField
              label="Podcast / Audio URL"
              value={formData.podcastUrl || formData.audioUrl}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  podcastUrl: e.target.value,
                  audioUrl: e.target.value, // Legacy sync
                })
              }
              fullWidth
              placeholder="https://example.com/audio.mp3"
              helperText="Optional: Add audio/podcast content for this lesson"
            />

            <FormControl fullWidth>
              <InputLabel>Content Type</InputLabel>
              <Select
                value={formData.contentType || formData.lessonType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contentType: e.target.value as any,
                    lessonType: e.target.value as any, // Sync
                  })
                }
                label="Content Type"
              >
                <MenuItem value="text">Text</MenuItem>
                <MenuItem value="video">Video</MenuItem>
                <MenuItem value="audio">Audio</MenuItem>
                <MenuItem value="quiz">Quiz</MenuItem>
              </Select>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, ml: 2 }}
              >
                Select the primary format of this lesson
              </Typography>
            </FormControl>

            {(formData.contentType === "quiz" ||
              formData.lessonType === "quiz") && (
              <TextField
                label="Passing Score (%)"
                type="number"
                value={formData.passingScorePercentage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    passingScorePercentage: parseInt(e.target.value) || 80,
                  })
                }
                fullWidth
                inputProps={{ min: 0, max: 100 }}
                helperText="Minimum score required to pass this quiz (0-100%)"
              />
            )}

            <TextField
              label="Duration (minutes)"
              type="number"
              value={formData.duration}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  duration: parseInt(e.target.value) || 0,
                })
              }
              fullWidth
            />

            <TextField
              label="Display Order"
              type="number"
              value={formData.displayOrder}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  displayOrder: parseInt(e.target.value) || 0,
                })
              }
              fullWidth
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                  />
                }
                label="Active"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isMandatory}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isMandatory: e.target.checked,
                      })
                    }
                  />
                }
                label="Mandatory"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} sx={{ borderRadius: "12px" }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              !validate() ||
              createMutation.isPending ||
              updateMutation.isPending
            }
            sx={{ borderRadius: "12px" }}
          >
            {createMutation.isPending || updateMutation.isPending
              ? "Saving..."
              : editingLesson
                ? "Update"
                : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
