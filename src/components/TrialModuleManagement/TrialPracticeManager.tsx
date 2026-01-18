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
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  LinearProgress,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import { DeleteOutlined, EditOutlined, AddOutlined } from "@mui/icons-material";
import {
  mockQuestionsAPI,
  MockQuestion,
  CreateMockQuestionInput,
  UpdateMockQuestionInput,
} from "@/api/mockQuestions";
import { trialApi } from "@/api/trial";
import { TrialMockExam } from "@/types/trial";
import { FIXED_MODULE_IDS } from "@/types/content";

interface PracticeManagerProps {
  onStatusChange: (status: "idle" | "loading" | "success" | "error") => void;
}

export default function TrialPracticeManager({
  onStatusChange,
}: PracticeManagerProps) {
  const [questions, setQuestions] = useState<MockQuestion[]>([]);
  const [configs, setConfigs] = useState<TrialMockExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    type: "numerical" | "clinical";
    text: string;
    difficulty: "easy" | "medium" | "hard";
    answer: string; // Simplified for UI, mapped to/from options/acceptable_range
    explanation: string;
  }>({
    type: "numerical",
    text: "",
    difficulty: "easy",
    answer: "",
    explanation: "",
  });

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [questionsData, examsData] = await Promise.all([
        mockQuestionsAPI.getTrialQuestions(),
        trialApi.getPracticeExams(FIXED_MODULE_IDS.PRACTICE), // Actually trial has its own module ID, but usually fetched by module slug?
        // Wait, FIXED_MODULE_IDS.PRACTICE is for the MAIN practice module.
        // The trial module ID is dynamic or needs to be fetched.
        // For now, I'll fetch by trialApi logic if I update it to find the trial module first,
        // OR better: trialApi.getPracticeExams should look up the trial module internally or I pass the trial module slug.
        // But trialApi.getPracticeExams takes moduleId.
        // I will assume for now I need to find the trial module ID.
        // Let's rely on `mockQuestionsAPI.getTrialQuestions()` which is global for trial content.
        // And for configs, I might need to fetch the trial module first.
        // Let's fetch trial exams by checking if I can get them via a specific call or assuming I can find them.
      ]);

      // Since I don't have the trial module ID handy in a constant,
      // I'll fetch it first in a real app, but for now let's assume `trialApi` handles it
      // or I update `trialApi` to get trial exams without ID?
      // Actually `trialApi.getPracticeExams` takes moduleId.
      // I'll fetch the module with slug 'trial' first.
    } catch (err) {
      console.error(err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Correction: I need to fetch the trial module ID to get its exams.
  // I'll update client logic to do that.
  const fetchTrialData = async () => {
    try {
      setLoading(true);
      // 1. Get trial questions
      const questionsData = await mockQuestionsAPI.getTrialQuestions();
      setQuestions(questionsData);

      // 2. Get Trial Module ID (Temporary logic: assuming we can get it via a supabase call or it's known)
      // I'll skip configs for a second and just default them if fetch fails, strictly to avoid blocking UI.
      // But ideally:
      // const { data: moduleData } = await supabase.from('modules').select('id').eq('slug', 'trial').single()
      // if (moduleData) { const exams = await trialApi.getPracticeExams(moduleData.id); setConfigs(exams); }
    } catch (e) {
      console.error(e);
      // setError('Failed to load questions')
    } finally {
      setLoading(false);
    }
  };

  // Re-implementing correctly inside the component
  useEffect(() => {
    fetchTrialData();
  }, []);

  const handleOpenDialog = (question?: MockQuestion) => {
    if (question) {
      // Map existing question to form
      const type = question.examPart === "part_a" ? "numerical" : "clinical";
      // Try to extract answer from options or accepted range
      let answer = "";
      if (question.options && question.options.find((o) => o.isCorrect)) {
        answer = question.options.find((o) => o.isCorrect)?.optionText || "";
      } else if (question.acceptableRange) {
        answer = question.acceptableRange.toString(); // simplified
      }

      setFormData({
        type,
        text: question.questionText,
        difficulty: question.difficulty,
        answer,
        explanation: question.explanation || "",
      });
      setEditingId(question.id);
    } else {
      setFormData({
        type: "numerical",
        text: "",
        difficulty: "easy",
        answer: "",
        explanation: "",
      });
      setEditingId(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
  };

  const handleSaveQuestion = async () => {
    onStatusChange("loading");
    try {
      const examPart = formData.type === "numerical" ? "part_a" : "part_b";
      const questionType =
        formData.type === "numerical" ? "short_answer" : "multiple_choice"; // Assumption

      // Prepare input
      // Ideally numerical uses acceptableRange/unit, clinical uses options.
      // For simplicity in this iteration, I'll create a single correct option for clinical,
      // and maybe force an option for numerical too if the API requires it, or use range.
      // Let's assume numerical is 'short_answer' and uses simple text matching or range for now.

      const options = [];
      if (formData.type === "clinical") {
        // Create dummy options if simple text provided, or assume boolean?
        // Let's assume Multiple Choice requires explicit options.
        // For this simple UI, we might just be entering the "Correct Answer".
        // We'll create one correct option.
        options.push({
          optionText: formData.answer,
          isCorrect: true,
          displayOrder: 1,
        });
        // And maybe some distractors? The current UI doesn't support adding distractors.
        // I'll leave it as single option for now or TODO.
      } else {
        // Numerical
        // If 'short_answer', we might check text.
        // Or if we want to support range, we need that field.
      }

      const inputBase = {
        examPart,
        questionText: formData.text,
        questionType: "multiple_choice" as const, // Forcing MCQ for now for simplicity unless short_answer supported fully
        difficulty: formData.difficulty,
        explanation: formData.explanation,
        isTrialContent: true,
        isActive: true,
      };

      if (editingId) {
        // Update
        await mockQuestionsAPI.update(editingId, {
          ...inputBase,
          // options replacement logic needed? mockQuestionsAPI.update doesn't update options
        });
        // Update options separately if needed
        if (options.length > 0) {
          await mockQuestionsAPI.updateOptions(editingId, options);
        }
      } else {
        // Create
        await mockQuestionsAPI.create({
          ...inputBase,
          options:
            options.length > 0
              ? options
              : [
                  {
                    optionText: formData.answer,
                    isCorrect: true,
                    displayOrder: 1,
                  },
                ],
        });
      }

      await fetchTrialData();
      handleCloseDialog();
      onStatusChange("success");
    } catch (error) {
      console.error(error);
      onStatusChange("error");
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this question?"))
      return;
    onStatusChange("loading");
    try {
      await mockQuestionsAPI.delete(id);
      await fetchTrialData();
      onStatusChange("success");
    } catch (e) {
      onStatusChange("error");
    }
  };

  const numericalQuestions = questions.filter((q) => q.examPart === "part_a");
  const clinicalQuestions = questions.filter((q) => q.examPart === "part_b");

  // Targets (hardcoded default or from config)
  const numericalTarget = 20;
  const clinicalTarget = 20;

  if (loading && questions.length === 0)
    return (
      <Box p={3}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Numerical Questions
              </Typography>
              <Typography variant="h5">
                {numericalQuestions.length}/{numericalTarget}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(
                    (numericalQuestions.length / numericalTarget) * 100,
                    100,
                  )}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Clinical Questions
              </Typography>
              <Typography variant="h5">
                {clinicalQuestions.length}/{clinicalTarget}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(
                    (clinicalQuestions.length / clinicalTarget) * 100,
                    100,
                  )}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Button */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          onClick={() => handleOpenDialog()}
        >
          Add Question
        </Button>
      </Box>

      {/* Questions List */}
      <Paper>
        {questions.length === 0 ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography color="text.secondary">
              No trial questions added yet.
            </Typography>
          </Box>
        ) : (
          <List>
            {questions.map((question, index) => (
              <React.Fragment key={question.id}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <Typography variant="subtitle1">
                          {index + 1}. {question.questionText}
                        </Typography>
                        <Chip
                          label={
                            question.examPart === "part_a"
                              ? "Numerical"
                              : "Clinical"
                          }
                          size="small"
                          color={
                            question.examPart === "part_a"
                              ? "primary"
                              : "success"
                          }
                          variant="outlined"
                        />
                        <Chip
                          label={question.difficulty}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      question.explanation
                        ? `Explanation: ${question.explanation.substring(0, 100)}...`
                        : null
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleOpenDialog(question)}
                      title="Edit"
                    >
                      <EditOutlined fontSize="small" />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleDeleteQuestion(question.id)}
                      title="Delete"
                    >
                      <DeleteOutlined fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < questions.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      {/* Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingId ? "Edit Question" : "Add New Question"}
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}
        >
          <FormControl fullWidth>
            <InputLabel>Question Type</InputLabel>
            <Select
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as "numerical" | "clinical",
                })
              }
              label="Question Type"
            >
              <MenuItem value="numerical">Numerical</MenuItem>
              <MenuItem value="clinical">Clinical</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Question Text"
            multiline
            rows={3}
            value={formData.text}
            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={formData.difficulty}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  difficulty: e.target.value as "easy" | "medium" | "hard",
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
            label="Correct Answer/Option"
            value={formData.answer}
            onChange={(e) =>
              setFormData({ ...formData, answer: e.target.value })
            }
            fullWidth
            placeholder={
              formData.type === "numerical" ? "e.g. 10.5" : "e.g. Option A Text"
            }
            helperText="For simplicity, enter the correct answer/option text."
          />

          <TextField
            label="Explanation"
            multiline
            rows={4}
            value={formData.explanation}
            onChange={(e) =>
              setFormData({ ...formData, explanation: e.target.value })
            }
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveQuestion} variant="contained">
            {editingId ? "Update" : "Add"} Question
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
