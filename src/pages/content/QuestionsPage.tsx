import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
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
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  AddOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ImageOutlined,
  UploadFileOutlined,
} from "@mui/icons-material";
import { Alert } from "@mui/material";
import {
  useQuestions,
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
  useUploadQuestionImage,
} from "@/hooks/useQuestions";
import { useLessons } from "@/hooks/useLessons";
import { PageLoader } from "@/components/common";
import { Question, CreateQuestionInput, QuestionOption } from "@/types/content";
import { CSVUpload } from "@/components/common/CSVUpload";
import { questionTemplate } from "@/utils/csvTemplates";
import { useBulkUpload } from "@/hooks/useBulkUpload";

export const QuestionsPage: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [csvUploadOpen, setCsvUploadOpen] = useState(false);
  const [bulkLessonId, setBulkLessonId] = useState<string>("");
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [lessonFilter, setLessonFilter] = useState<string>("all");
  const [formData, setFormData] = useState<CreateQuestionInput>({
    lessonId: "",
    questionText: "",
    questionType: "multiple_choice",
    options: [],
    explanation: "",
    imageUrl: "",
    difficulty: "medium",
    isActive: true,
  });
  const [optionText, setOptionText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [touched, setTouched] = useState({
    lessonId: false,
    questionText: false,
  });
  const [submitError, setSubmitError] = useState<string>("");
  const [initialLoad, setInitialLoad] = useState(true);

  const { data: questions, isLoading } = useQuestions();
  const { data: lessons } = useLessons();
  const createMutation = useCreateQuestion();
  const updateMutation = useUpdateQuestion();
  const deleteMutation = useDeleteQuestion();
  const uploadMutation = useUploadQuestionImage();
  const { uploadQuestions } = useBulkUpload();

  React.useEffect(() => {
    if (!isLoading && initialLoad) {
      setInitialLoad(false);
    }
  }, [isLoading, initialLoad]);

  if (isLoading && initialLoad) {
    return <PageLoader />;
  }

  const filteredQuestions = questions?.filter((question: Question) => {
    const matchesSearch = question.questionText
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesLesson =
      lessonFilter === "all" || question.lessonId === lessonFilter;
    return matchesSearch && matchesLesson;
  });

  const handleOpenDialog = (question?: Question) => {
    if (question) {
      setEditingQuestion(question);
      setFormData({
        lessonId: question.lessonId,
        questionText: question.questionText,
        questionType: question.questionType,
        options:
          question.options?.map((opt, idx) => ({
            optionText: opt.optionText,
            isCorrect: opt.isCorrect,
            displayOrder: idx,
          })) || [],
        explanation: question.explanation,
        imageUrl: question.imageUrl,
        difficulty: question.difficulty,
        isActive: question.isActive,
      });
    } else {
      setEditingQuestion(null);
      setFormData({
        lessonId: "",
        questionText: "",
        questionType: "multiple_choice",
        options: [],
        explanation: "",
        imageUrl: "",
        difficulty: "medium",
        isActive: true,
      });
    }
    setTouched({ lessonId: false, questionText: false });
    setSubmitError("");
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingQuestion(null);
    setOptionText("");
    setTouched({ lessonId: false, questionText: false });
    setSubmitError("");
  };

  const validate = () => {
    return (
      formData.lessonId &&
      formData.lessonId.trim() !== "" &&
      formData.questionText.trim() !== ""
    );
  };

  const getFieldError = (field: "lessonId" | "questionText") => {
    if (!touched[field]) return "";
    if (field === "lessonId" && !formData.lessonId) return "Lesson is required";
    if (field === "questionText" && !formData.questionText.trim())
      return "Question text is required";
    return "";
  };

  const handleAddOption = () => {
    if (optionText.trim()) {
      const newOption = {
        optionText: optionText.trim(),
        isCorrect: false,
        displayOrder: formData.options?.length || 0,
      };
      setFormData({
        ...formData,
        options: [...(formData.options || []), newOption],
      });
      setOptionText("");
    }
  };

  const handleRemoveOption = (index: number) => {
    setFormData({
      ...formData,
      options: formData.options?.filter((_, i) => i !== index) || [],
    });
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadMutation.mutateAsync(file);
      setFormData({ ...formData, imageUrl: url });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    setTouched({ lessonId: true, questionText: true });
    if (!validate()) return;

    setSubmitError("");
    try {
      if (editingQuestion) {
        await updateMutation.mutateAsync({
          id: editingQuestion.id,
          input: formData,
        });
      } else {
        await createMutation.mutateAsync(formData);
      }
      handleCloseDialog();
    } catch (error: any) {
      setSubmitError(error.message || "An error occurred. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleToggleActive = async (question: Question) => {
    await updateMutation.mutateAsync({
      id: question.id,
      input: { isActive: !question.isActive },
    });
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
          <Typography variant="h4" gutterBottom>
            Questions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage quiz questions and assessments
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddOutlined />}
            onClick={() => handleOpenDialog()}
            sx={{ borderRadius: "12px" }}
          >
            Add Question
          </Button>
          <Button
            variant="outlined"
            startIcon={<UploadFileOutlined />}
            onClick={() => setCsvUploadOpen(true)}
            sx={{ borderRadius: "12px" }}
          >
            Bulk Upload
          </Button>
        </Box>
      </Box>

      {/* Search and Filter */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          placeholder="Search questions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Lesson</InputLabel>
          <Select
            value={lessonFilter}
            onChange={(e) => setLessonFilter(e.target.value)}
            label="Filter by Lesson"
          >
            <MenuItem value="all">All Lessons</MenuItem>
            {lessons?.map((lesson) => (
              <MenuItem key={lesson.id} value={lesson.id}>
                {lesson.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Questions Table */}
      <TableContainer
        component={Paper}
        sx={{
          bgcolor: "background.paper",
          border: "1px solid #E5E7EB",
          borderRadius: "16px",
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Question</TableCell>
              <TableCell>Lesson</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Difficulty</TableCell>
              <TableCell>Points</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredQuestions?.map((question) => (
              <TableRow key={question.id}>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {question.questionText.substring(0, 60)}...
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={
                      lessons?.find((l) => l.id === question.lessonId)?.title ||
                      "Unknown"
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={question.questionType.replace("_", " ")}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={question.difficulty}
                    size="small"
                    color={
                      question.difficulty === "easy"
                        ? "success"
                        : question.difficulty === "hard"
                          ? "error"
                          : "default"
                    }
                  />
                </TableCell>
                <TableCell>
                  <Chip label={question.points || 1} size="small" />
                </TableCell>
                <TableCell>
                  <Switch
                    checked={question.isActive}
                    onChange={() => handleToggleActive(question)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(question)}
                    sx={{ mr: 1 }}
                  >
                    <EditOutlined fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(question.id)}
                    color="error"
                  >
                    <DeleteOutlined fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {(!filteredQuestions || filteredQuestions.length === 0) && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {searchQuery || lessonFilter !== "all"
                      ? "No questions found matching your filters."
                      : 'No questions yet. Click "Add Question" to create one.'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingQuestion ? "Edit Question" : "Add Question"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            {submitError && (
              <Alert severity="error" onClose={() => setSubmitError("")}>
                {submitError}
              </Alert>
            )}
            <FormControl fullWidth required error={!!getFieldError("lessonId")}>
              <InputLabel>Lesson</InputLabel>
              <Select
                value={formData.lessonId}
                onChange={(e) =>
                  setFormData({ ...formData, lessonId: e.target.value })
                }
                onBlur={() => setTouched({ ...touched, lessonId: true })}
                label="Lesson"
              >
                {lessons
                  ?.filter((l) => l.isActive)
                  .map((lesson) => (
                    <MenuItem key={lesson.id} value={lesson.id}>
                      {lesson.title}
                    </MenuItem>
                  ))}
              </Select>
              {getFieldError("lessonId") && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ mt: 0.5, ml: 2 }}
                >
                  {getFieldError("lessonId")}
                </Typography>
              )}
            </FormControl>
            <TextField
              label="Question Text"
              value={formData.questionText}
              onChange={(e) =>
                setFormData({ ...formData, questionText: e.target.value })
              }
              onBlur={() => setTouched({ ...touched, questionText: true })}
              fullWidth
              multiline
              rows={3}
              required
              error={!!getFieldError("questionText")}
              helperText={getFieldError("questionText")}
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.questionType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      questionType: e.target.value as any,
                    })
                  }
                  label="Type"
                >
                  <MenuItem value="multiple_choice">Multiple Choice</MenuItem>
                  <MenuItem value="true_false">True/False</MenuItem>
                  <MenuItem value="fill_blank">Fill in the Blank</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Difficulty</InputLabel>
                <Select
                  value={formData.difficulty}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      difficulty: e.target.value as any,
                    })
                  }
                  label="Difficulty"
                >
                  <MenuItem value="easy">Easy</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="hard">Hard</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Options */}
            <Box>
              <Typography variant="body2" gutterBottom>
                Answer Options
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                <TextField
                  size="small"
                  value={optionText}
                  onChange={(e) => setOptionText(e.target.value)}
                  placeholder="Add answer option"
                  fullWidth
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddOption();
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddOption}
                  sx={{ borderRadius: "12px" }}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {formData.options?.map((option, index) => (
                  <Chip
                    key={index}
                    label={option.optionText}
                    onDelete={() => handleRemoveOption(index)}
                    size="small"
                  />
                ))}
              </Box>
            </Box>

            <TextField
              label="Points"
              type="number"
              value={formData.points || 1}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  points: parseInt(e.target.value) || 1,
                })
              }
              fullWidth
            />
            <TextField
              label="Explanation"
              value={formData.explanation}
              onChange={(e) =>
                setFormData({ ...formData, explanation: e.target.value })
              }
              fullWidth
              multiline
              rows={2}
            />

            {/* Image Upload */}
            <Box>
              <Button
                variant="outlined"
                component="label"
                startIcon={<ImageOutlined />}
                disabled={uploading}
                sx={{ borderRadius: "12px" }}
              >
                {uploading
                  ? "Uploading..."
                  : formData.imageUrl
                    ? "Change Image"
                    : "Upload Image"}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Button>
              {formData.imageUrl && (
                <TextField
                  label="Or enter image URL"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  fullWidth
                  size="small"
                  sx={{ mt: 1 }}
                />
              )}
            </Box>

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
              : editingQuestion
                ? "Update"
                : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* CSV Bulk Upload - Lesson Selection */}
      <Dialog
        open={csvUploadOpen}
        onClose={() => {
          setCsvUploadOpen(false);
          setBulkLessonId("");
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Select Lesson for Bulk Upload (Optional)</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Choose a lesson to link these questions to (optional):
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Lesson</InputLabel>
              <Select
                value={bulkLessonId}
                onChange={(e) => setBulkLessonId(e.target.value)}
                label="Lesson"
              >
                <MenuItem value="">None (Standalone Questions)</MenuItem>
                {lessons
                  ?.filter((l) => l.isActive)
                  .map((lesson) => (
                    <MenuItem key={lesson.id} value={lesson.id}>
                      {lesson.title}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCsvUploadOpen(false);
              setBulkLessonId("");
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={() => setCsvUploadOpen(false)}>
            Continue to Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* CSV Bulk Upload Component - Shown after lesson selection */}
      {!csvUploadOpen && bulkLessonId !== null && (
        <Box sx={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000 }}>
          <CSVUpload
            template={questionTemplate}
            onUpload={async (data) => {
              const result = await uploadQuestions(
                data,
                bulkLessonId || undefined,
              );
              if (result) {
                setBulkLessonId(null as any); // Reset lesson after successful upload
              }
              return result;
            }}
            contentType="question"
          />
        </Box>
      )}
    </Box>
  );
};
