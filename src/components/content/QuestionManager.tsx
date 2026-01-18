import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  FormControlLabel,
  Switch,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
} from "@mui/material";
import {
  EditOutlined,
  DeleteOutlined,
  AddOutlined,
  CloseOutlined,
} from "@mui/icons-material";
import {
  Question,
  CreateQuestionInput,
  QuestionOption,
  ModuleType,
  ExamPart,
} from "@/types/content";
import {
  useQuestionsByFilters,
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
} from "@/hooks/useQuestions";

interface QuestionManagerProps {
  moduleType: ModuleType;
  category?: string;
  subdivision?: string;
  examPart?: ExamPart;
  onQuestionAdded?: () => void;
}

export const QuestionManager: React.FC<QuestionManagerProps> = ({
  moduleType,
  category,
  subdivision,
  examPart,
  onQuestionAdded,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateQuestionInput>({
    questionText: "",
    questionType: "multiple_choice",
    difficulty: "medium",
    points: 1,
    explanation: "",
    imageUrl: "",
    isActive: true,
    moduleType,
    category,
    subdivision,
    examPart,
    options: [],
  });
  const [optionText, setOptionText] = useState("");

  const { data: questions = [], isLoading } = useQuestionsByFilters({
    moduleType,
    category,
    subdivision,
    examPart,
  });
  const createMutation = useCreateQuestion();
  const updateMutation = useUpdateQuestion();
  const deleteMutation = useDeleteQuestion();

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      moduleType,
      category,
      subdivision,
      examPart,
    }));
  }, [moduleType, category, subdivision, examPart]);

  const handleOpenDialog = (question?: Question) => {
    if (question) {
      setEditingQuestion(question);
      setFormData({
        questionText: question.questionText,
        questionType: question.questionType,
        difficulty: question.difficulty,
        points: question.points,
        explanation: question.explanation,
        imageUrl: question.imageUrl,
        isActive: question.isActive,
        moduleType: question.moduleType,
        category: question.category,
        subdivision: question.subdivision,
        examPart: question.examPart,
        options:
          question.options?.map((opt, idx) => ({
            optionText: opt.optionText,
            isCorrect: opt.isCorrect,
            displayOrder: idx,
          })) || [],
      });
    } else {
      setEditingQuestion(null);
      setFormData({
        questionText: "",
        questionType: "multiple_choice",
        difficulty: "medium",
        points: 1,
        explanation: "",
        imageUrl: "",
        isActive: true,
        moduleType,
        category,
        subdivision,
        examPart,
        options: [],
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingQuestion(null);
    setOptionText("");
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

  const handleToggleCorrect = (index: number) => {
    const updatedOptions =
      formData.options?.map((opt, i) => ({
        ...opt,
        isCorrect: i === index,
      })) || [];
    setFormData({ ...formData, options: updatedOptions });
  };

  const handleSubmit = async () => {
    if (editingQuestion) {
      await updateMutation.mutateAsync({
        id: editingQuestion.id,
        input: formData,
      });
    } else {
      await createMutation.mutateAsync(formData);
    }
    handleCloseDialog();
    onQuestionAdded?.();
  };

  const handleDeleteClick = (questionId: string) => {
    setQuestionToDelete(questionId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (questionToDelete) {
      await deleteMutation.mutateAsync(questionToDelete);
      setDeleteConfirmOpen(false);
      setQuestionToDelete(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "success";
      case "medium":
        return "warning";
      case "hard":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">Questions</Typography>
        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          onClick={() => handleOpenDialog()}
        >
          Add Question
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      ) : questions.length === 0 ? (
        <Alert severity="info">
          No questions found for this{" "}
          {moduleType === "practice"
            ? "subdivision"
            : moduleType === "learning"
              ? "topic"
              : "exam part"}
          .
          <br />
          Click "Add Question" to create your first question or use bulk upload
          to add multiple questions at once.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Question</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Difficulty</TableCell>
                <TableCell>Points</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {questions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell sx={{ maxWidth: 400 }}>
                    {question.questionText.length > 100
                      ? `${question.questionText.substring(0, 100)}...`
                      : question.questionText}
                  </TableCell>
                  <TableCell>
                    <Chip label={question.questionType} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={question.difficulty}
                      size="small"
                      color={getDifficultyColor(question.difficulty)}
                    />
                  </TableCell>
                  <TableCell>{question.points}</TableCell>
                  <TableCell>
                    <Chip
                      label={question.isActive ? "Active" : "Inactive"}
                      size="small"
                      color={question.isActive ? "success" : "default"}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(question)}
                    >
                      <EditOutlined />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteClick(question.id)}
                    >
                      <DeleteOutlined />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Question Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingQuestion ? "Edit Question" : "Add New Question"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            {/* Question Text */}
            <TextField
              label="Question Text"
              multiline
              rows={3}
              value={formData.questionText}
              onChange={(e) =>
                setFormData({ ...formData, questionText: e.target.value })
              }
              fullWidth
              required
            />

            {/* Question Type, Difficulty, Points */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Question Type</InputLabel>
                <Select
                  value={formData.questionType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      questionType: e.target.value as any,
                    })
                  }
                  label="Question Type"
                >
                  <MenuItem value="multiple_choice">Multiple Choice</MenuItem>
                  <MenuItem value="true_false">True/False</MenuItem>
                  <MenuItem value="short_answer">Short Answer</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ flex: 1 }}>
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

              <TextField
                label="Points"
                type="number"
                value={formData.points}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    points: parseInt(e.target.value) || 1,
                  })
                }
                sx={{ width: 100 }}
              />
            </Box>

            {/* Options for Multiple Choice */}
            {formData.questionType === "multiple_choice" && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Answer Options
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  <TextField
                    placeholder="Enter option text..."
                    value={optionText}
                    onChange={(e) => setOptionText(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddOption()}
                    fullWidth
                    size="small"
                  />
                  <Button
                    onClick={handleAddOption}
                    variant="outlined"
                    size="small"
                  >
                    Add
                  </Button>
                </Box>

                {formData.options && formData.options.length > 0 ? (
                  <List dense>
                    {formData.options.map((option, index) => (
                      <ListItem
                        key={index}
                        sx={{
                          bgcolor: option.isCorrect
                            ? "success.light"
                            : "background.paper",
                          mb: 1,
                          borderRadius: 1,
                        }}
                      >
                        <ListItemText
                          primary={option.optionText}
                          secondary={option.isCorrect ? "Correct Answer" : null}
                        />
                        <ListItemSecondaryAction>
                          <Button
                            size="small"
                            onClick={() => handleToggleCorrect(index)}
                            color={option.isCorrect ? "success" : "inherit"}
                          >
                            {option.isCorrect ? "Correct" : "Mark Correct"}
                          </Button>
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveOption(index)}
                          >
                            <CloseOutlined />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Alert severity="warning">
                    Add at least one option and mark the correct answer
                  </Alert>
                )}
              </Box>
            )}

            {/* Explanation */}
            <TextField
              label="Explanation (Optional)"
              multiline
              rows={2}
              value={formData.explanation}
              onChange={(e) =>
                setFormData({ ...formData, explanation: e.target.value })
              }
              fullWidth
              helperText="Explain why the correct answer is right"
            />

            {/* Image URL */}
            <TextField
              label="Image URL (Optional)"
              value={formData.imageUrl}
              onChange={(e) =>
                setFormData({ ...formData, imageUrl: e.target.value })
              }
              fullWidth
              helperText="URL to an image related to this question"
            />

            {/* Active Status */}
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                />
              }
              label="Active (visible to students)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              !formData.questionText ||
              (formData.questionType === "multiple_choice" &&
                (!formData.options || formData.options.length === 0))
            }
          >
            {editingQuestion ? "Update" : "Create"} Question
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this question? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
