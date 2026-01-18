import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Checkbox,
  FormControlLabel,
  Alert,
  CircularProgress,
  Paper,
  Divider,
} from "@mui/material";
import {
  AddOutlined,
  DeleteOutlined,
  ImageOutlined,
  CloseOutlined,
} from "@mui/icons-material";
import { supabase } from "@/lib/supabase";

interface QuestionOption {
  id?: string;
  option_text: string;
  is_correct: boolean;
  display_order: number;
}

interface PracticeQuestion {
  id?: string;
  category: string;
  subdivision: string;
  question_text: string;
  question_type: "multiple_choice" | "true_false";
  difficulty: "easy" | "medium" | "hard";
  points: number;
  explanation?: string;
  image_url?: string;
  is_active: boolean;
}

interface PracticeQuestionFormProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  category: string;
  subdivision: string;
  question?: PracticeQuestion & { options?: QuestionOption[] };
}

export const PracticeQuestionForm: React.FC<PracticeQuestionFormProps> = ({
  open,
  onClose,
  onSave,
  category,
  subdivision,
  question,
}) => {
  const [formData, setFormData] = useState<PracticeQuestion>({
    category,
    subdivision,
    question_text: "",
    question_type: "multiple_choice",
    difficulty: "medium",
    points: 1,
    explanation: "",
    image_url: "",
    is_active: true,
  });

  const [options, setOptions] = useState<QuestionOption[]>([
    { option_text: "", is_correct: false, display_order: 0 },
    { option_text: "", is_correct: false, display_order: 1 },
    { option_text: "", is_correct: false, display_order: 2 },
    { option_text: "", is_correct: false, display_order: 3 },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (question) {
      setFormData({
        id: question.id,
        category: question.category,
        subdivision: question.subdivision,
        question_text: question.question_text,
        question_type: question.question_type,
        difficulty: question.difficulty,
        points: question.points,
        explanation: question.explanation || "",
        image_url: question.image_url || "",
        is_active: question.is_active,
      });

      if (question.options && question.options.length > 0) {
        setOptions(question.options);
      }
    } else {
      // Reset form for new question
      setFormData({
        category,
        subdivision,
        question_text: "",
        question_type: "multiple_choice",
        difficulty: "medium",
        points: 1,
        explanation: "",
        image_url: "",
        is_active: true,
      });
      setOptions([
        { option_text: "", is_correct: false, display_order: 0 },
        { option_text: "", is_correct: false, display_order: 1 },
        { option_text: "", is_correct: false, display_order: 2 },
        { option_text: "", is_correct: false, display_order: 3 },
      ]);
    }
    setError(null);
  }, [question, category, subdivision, open]);

  const handleInputChange = (field: keyof PracticeQuestion, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (
    index: number,
    field: keyof QuestionOption,
    value: any,
  ) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const handleCorrectAnswerChange = (index: number) => {
    const newOptions = options.map((opt, i) => ({
      ...opt,
      is_correct: i === index,
    }));
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([
      ...options,
      { option_text: "", is_correct: false, display_order: options.length },
    ]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) {
      setError("At least 2 options are required");
      return;
    }
    const newOptions = options.filter((_, i) => i !== index);
    // Reorder display_order
    newOptions.forEach((opt, i) => {
      opt.display_order = i;
    });
    setOptions(newOptions);
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setError(null);

      const fileName = `${Date.now()}-${file.name}`;
      const { data, error: uploadError } = await supabase.storage
        .from("question-images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("question-images")
        .getPublicUrl(fileName);

      setFormData((prev) => ({ ...prev, image_url: urlData.publicUrl }));
      setImageFile(file);
    } catch (err) {
      console.error("Error uploading image:", err);
      setError("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.question_text.trim()) {
      setError("Question text is required");
      return false;
    }

    if (formData.question_type === "multiple_choice") {
      // Check if all options have text
      const emptyOptions = options.filter((opt) => !opt.option_text.trim());
      if (emptyOptions.length > 0) {
        setError("All options must have text");
        return false;
      }

      // Check if at least one correct answer
      const correctAnswers = options.filter((opt) => opt.is_correct);
      if (correctAnswers.length === 0) {
        setError("At least one correct answer is required");
        return false;
      }

      // Check for duplicate options
      const optionTexts = options.map((opt) =>
        opt.option_text.trim().toLowerCase(),
      );
      const uniqueTexts = new Set(optionTexts);
      if (optionTexts.length !== uniqueTexts.size) {
        setError("Options must be unique");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);

      if (question?.id) {
        // Update existing question
        const { error: updateError } = await supabase
          .from("practice_questions")
          .update({
            question_text: formData.question_text,
            question_type: formData.question_type,
            difficulty: formData.difficulty,
            points: formData.points,
            explanation: formData.explanation,
            image_url: formData.image_url,
            is_active: formData.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq("id", question.id);

        if (updateError) throw updateError;

        // Delete old options
        await supabase
          .from("practice_question_options")
          .delete()
          .eq("question_id", question.id);

        // Insert new options
        if (formData.question_type === "multiple_choice") {
          const { error: optionsError } = await supabase
            .from("practice_question_options")
            .insert(
              options.map((opt) => ({
                question_id: question.id,
                option_text: opt.option_text,
                is_correct: opt.is_correct,
                display_order: opt.display_order,
              })),
            );

          if (optionsError) throw optionsError;
        }
      } else {
        // Create new question
        const { data: newQuestion, error: createError } = await supabase
          .from("practice_questions")
          .insert({
            category: formData.category,
            subdivision: formData.subdivision,
            question_text: formData.question_text,
            question_type: formData.question_type,
            difficulty: formData.difficulty,
            points: formData.points,
            explanation: formData.explanation,
            image_url: formData.image_url,
            is_active: formData.is_active,
          })
          .select()
          .single();

        if (createError) throw createError;

        // Insert options
        if (formData.question_type === "multiple_choice") {
          const { error: optionsError } = await supabase
            .from("practice_question_options")
            .insert(
              options.map((opt) => ({
                question_id: newQuestion.id,
                option_text: opt.option_text,
                is_correct: opt.is_correct,
                display_order: opt.display_order,
              })),
            );

          if (optionsError) throw optionsError;
        }
      }

      onSave();
      onClose();
    } catch (err) {
      console.error("Error saving question:", err);
      setError("Failed to save question");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">
            {question ? "Edit Question" : "Create New Question"}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseOutlined />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Question Text */}
          <TextField
            label="Question Text"
            multiline
            rows={3}
            value={formData.question_text}
            onChange={(e) => handleInputChange("question_text", e.target.value)}
            required
            fullWidth
          />

          {/* Question Type, Difficulty, Points */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Question Type</InputLabel>
              <Select
                value={formData.question_type}
                onChange={(e) =>
                  handleInputChange("question_type", e.target.value)
                }
                label="Question Type"
              >
                <MenuItem value="multiple_choice">Multiple Choice</MenuItem>
                <MenuItem value="true_false">True/False</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={formData.difficulty}
                onChange={(e) =>
                  handleInputChange("difficulty", e.target.value)
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
                handleInputChange("points", parseInt(e.target.value))
              }
              inputProps={{ min: 1 }}
              sx={{ width: 120 }}
            />
          </Box>

          {/* Explanation */}
          <TextField
            label="Explanation (Optional)"
            multiline
            rows={2}
            value={formData.explanation}
            onChange={(e) => handleInputChange("explanation", e.target.value)}
            fullWidth
          />

          {/* Image Upload */}
          <Box>
            <Button
              variant="outlined"
              component="label"
              startIcon={
                uploadingImage ? (
                  <CircularProgress size={20} />
                ) : (
                  <ImageOutlined />
                )
              }
              disabled={uploadingImage}
            >
              {formData.image_url ? "Change Image" : "Upload Image"}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageUpload}
              />
            </Button>
            {formData.image_url && (
              <Box sx={{ mt: 1 }}>
                <img
                  src={formData.image_url}
                  alt="Question"
                  style={{
                    maxWidth: "200px",
                    maxHeight: "200px",
                    borderRadius: "4px",
                  }}
                />
              </Box>
            )}
          </Box>

          {/* Options Editor (for multiple choice) */}
          {formData.question_type === "multiple_choice" && (
            <Paper sx={{ p: 2, bgcolor: "background.default" }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="subtitle1" fontWeight={600}>
                  Answer Options
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddOutlined />}
                  onClick={addOption}
                >
                  Add Option
                </Button>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {options.map((option, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    gap: 1,
                    mb: 2,
                    alignItems: "flex-start",
                  }}
                >
                  <TextField
                    label={`Option ${index + 1}`}
                    value={option.option_text}
                    onChange={(e) =>
                      handleOptionChange(index, "option_text", e.target.value)
                    }
                    fullWidth
                    size="small"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={option.is_correct}
                        onChange={() => handleCorrectAnswerChange(index)}
                        color="success"
                      />
                    }
                    label="Correct"
                    sx={{ minWidth: 100 }}
                  />
                  {options.length > 2 && (
                    <IconButton
                      size="small"
                      onClick={() => removeOption(index)}
                      color="error"
                    >
                      <DeleteOutlined />
                    </IconButton>
                  )}
                </Box>
              ))}

              <Alert severity="info" sx={{ mt: 2 }}>
                Select one option as the correct answer. At least 2 options are
                required.
              </Alert>
            </Paper>
          )}

          {/* Active Status */}
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.is_active}
                onChange={(e) =>
                  handleInputChange("is_active", e.target.checked)
                }
              />
            }
            label="Active (visible to students)"
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? "Saving..." : question ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
