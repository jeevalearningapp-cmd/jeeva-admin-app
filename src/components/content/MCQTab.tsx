import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  AddOutlined,
  EditOutlined,
  DeleteOutlined,
  QuizOutlined,
  CheckCircleOutlined,
  ErrorOutlined,
} from "@mui/icons-material";
import { Subtopic } from "@/api/subtopics";
import {
  learningQuestionsAPI,
  LearningQuestion,
} from "@/api/learningQuestions";
import { useSnackbar } from "notistack";

interface MCQTabProps {
  subtopic: Subtopic;
  onAddQuestion: () => void;
  onEditQuestion: (question: LearningQuestion) => void;
}

export const MCQTab: React.FC<MCQTabProps> = ({
  subtopic,
  onAddQuestion,
  onEditQuestion,
}) => {
  const [questions, setQuestions] = useState<LearningQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    loadQuestions();
  }, [subtopic.id]);

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await learningQuestionsAPI.getByVideoLessonId(subtopic.id);
      setQuestions(data);
    } catch (err: any) {
      setError(err.message || "Failed to load questions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (question: LearningQuestion) => {
    if (window.confirm(`Are you sure you want to delete this question?`)) {
      try {
        await learningQuestionsAPI.delete(question.id);
        enqueueSnackbar("Question deleted successfully", {
          variant: "success",
        });
        loadQuestions();
      } catch (err: any) {
        enqueueSnackbar(err.message || "Failed to delete question", {
          variant: "error",
        });
      }
    }
  };

  const getValidationStatus = () => {
    const count = questions.length;
    if (count < 5) {
      return {
        isValid: false,
        message: `Need ${5 - count} more question(s) (minimum 5 required)`,
        color: "error" as const,
      };
    } else if (count > 10) {
      return {
        isValid: false,
        message: `Remove ${count - 10} question(s) (maximum 10 allowed)`,
        color: "error" as const,
      };
    } else {
      return {
        isValid: true,
        message: `Valid (${count} questions)`,
        color: "success" as const,
      };
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const validation = getValidationStatus();

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
          <Typography variant="h6" gutterBottom>
            Video-Mapped MCQs
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add 5-10 multiple choice questions mapped to this video lesson
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          onClick={onAddQuestion}
          disabled={questions.length >= 10}
          sx={{ borderRadius: "12px" }}
        >
          Add Question
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Validation Status */}
      <Alert
        severity={validation.isValid ? "success" : "warning"}
        icon={validation.isValid ? <CheckCircleOutlined /> : <ErrorOutlined />}
        sx={{ mb: 3 }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2">{validation.message}</Typography>
          <Chip
            label={`${questions.length} / 5-10`}
            size="small"
            color={validation.color}
          />
        </Box>
      </Alert>

      {/* Questions List */}
      <Paper
        sx={{
          bgcolor: "background.paper",
          border: "1px solid #E5E7EB",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        {questions.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <QuizOutlined
              sx={{ fontSize: 48, color: "action.disabled", mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary" gutterBottom>
              No questions yet. Click "Add Question" to create one.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              You need to add 5-10 questions for this subtopic
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {questions.map((question, index) => {
              const correctOption = question.options?.find(
                (opt) => opt.isCorrect,
              );

              return (
                <ListItem
                  key={question.id}
                  sx={{
                    borderBottom: "1px solid #E5E7EB",
                    "&:last-child": {
                      borderBottom: "none",
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Chip
                          label={`Q${index + 1}`}
                          size="small"
                          color="primary"
                        />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {question.questionText.substring(0, 80)}
                          {question.questionText.length > 80 ? "..." : ""}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box
                        sx={{
                          mt: 1,
                          display: "flex",
                          gap: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        <Chip
                          label={question.difficulty}
                          size="small"
                          color={
                            question.difficulty === "easy"
                              ? "success"
                              : question.difficulty === "medium"
                                ? "warning"
                                : "error"
                          }
                          variant="outlined"
                        />
                        <Chip
                          label={`${question.options?.length || 0} options`}
                          size="small"
                          variant="outlined"
                        />
                        {correctOption && (
                          <Chip
                            label={`✓ ${correctOption.optionText.substring(0, 30)}...`}
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        )}
                        {!question.isActive && (
                          <Chip label="Inactive" size="small" color="default" />
                        )}
                      </Box>
                    }
                  />

                  <ListItemSecondaryAction>
                    <IconButton
                      size="small"
                      onClick={() => onEditQuestion(question)}
                      sx={{ mr: 1 }}
                    >
                      <EditOutlined fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(question)}
                      color="error"
                    >
                      <DeleteOutlined fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
        )}
      </Paper>

      {/* Info Box */}
      <Paper
        sx={{
          p: 2,
          mt: 3,
          bgcolor: "info.lighter",
          border: "1px solid",
          borderColor: "info.light",
        }}
      >
        <Typography variant="body2" color="info.dark">
          <strong>Note:</strong> All questions are automatically mapped to this
          video lesson. Students must watch the video before taking the
          assessment. A passing score of 80% is required to unlock the next
          subtopic.
        </Typography>
      </Paper>
    </Box>
  );
};
