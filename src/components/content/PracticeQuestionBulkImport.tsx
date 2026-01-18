import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  UploadFileOutlined,
  CheckCircleOutlined,
  ErrorOutlined,
  DownloadOutlined,
} from "@mui/icons-material";
import { supabase } from "@/lib/supabase";

interface ParsedQuestion {
  question_text: string;
  question_type: "multiple_choice" | "true_false";
  difficulty: "easy" | "medium" | "hard";
  points: number;
  explanation?: string;
  image_url?: string;
  option_1?: string;
  option_2?: string;
  option_3?: string;
  option_4?: string;
  correct_answer: number;
  is_active: boolean;
  error?: string;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
}

interface PracticeQuestionBulkImportProps {
  category: string;
  subdivision: string;
  onImportComplete: () => void;
}

export const PracticeQuestionBulkImport: React.FC<
  PracticeQuestionBulkImportProps
> = ({ category, subdivision, onImportComplete }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const steps = ["Upload CSV", "Preview", "Import"];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith(".csv")) {
        setError("Please select a CSV file");
        return;
      }
      setFile(selectedFile);
      setError(null);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = async (file: File) => {
    try {
      setError(null);
      const text = await file.text();
      const lines = text.split("\n").filter((line) => line.trim());

      if (lines.length < 2) {
        setError("CSV file is empty or has no data rows");
        return;
      }

      // Parse header
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

      // Validate required columns
      const requiredColumns = [
        "question_text",
        "question_type",
        "difficulty",
        "correct_answer",
      ];

      const missingColumns = requiredColumns.filter(
        (col) => !headers.includes(col),
      );
      if (missingColumns.length > 0) {
        setError(`Missing required columns: ${missingColumns.join(", ")}`);
        return;
      }

      // Parse data rows
      const questions: ParsedQuestion[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length === 0) continue;

        try {
          const question: ParsedQuestion = {
            question_text: getColumnValue(headers, values, "question_text"),
            question_type: getColumnValue(
              headers,
              values,
              "question_type",
            ) as any,
            difficulty: getColumnValue(headers, values, "difficulty") as any,
            points: parseInt(getColumnValue(headers, values, "points") || "1"),
            explanation: getColumnValue(headers, values, "explanation"),
            image_url: getColumnValue(headers, values, "image_url"),
            option_1: getColumnValue(headers, values, "option_1"),
            option_2: getColumnValue(headers, values, "option_2"),
            option_3: getColumnValue(headers, values, "option_3"),
            option_4: getColumnValue(headers, values, "option_4"),
            correct_answer: parseInt(
              getColumnValue(headers, values, "correct_answer"),
            ),
            is_active:
              getColumnValue(headers, values, "is_active")?.toLowerCase() !==
              "false",
          };

          // Validate question
          const validationError = validateQuestion(question);
          if (validationError) {
            question.error = validationError;
          }

          questions.push(question);
        } catch (err) {
          questions.push({
            question_text: `Row ${i + 1}`,
            question_type: "multiple_choice",
            difficulty: "medium",
            points: 1,
            correct_answer: 1,
            is_active: true,
            error: `Failed to parse row: ${err}`,
          });
        }
      }

      setParsedQuestions(questions);
      setActiveStep(1);
    } catch (err) {
      console.error("Error parsing CSV:", err);
      setError("Failed to parse CSV file");
    }
  };

  const parseCSVLine = (line: string): string[] => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    values.push(current.trim());
    return values;
  };

  const getColumnValue = (
    headers: string[],
    values: string[],
    columnName: string,
  ): string => {
    const index = headers.indexOf(columnName);
    return index >= 0 ? values[index] : "";
  };

  const validateQuestion = (question: ParsedQuestion): string | null => {
    if (!question.question_text) {
      return "Question text is required";
    }

    if (!["multiple_choice", "true_false"].includes(question.question_type)) {
      return "Invalid question type (must be multiple_choice or true_false)";
    }

    if (!["easy", "medium", "hard"].includes(question.difficulty)) {
      return "Invalid difficulty (must be easy, medium, or hard)";
    }

    if (question.question_type === "multiple_choice") {
      if (!question.option_1 || !question.option_2) {
        return "At least 2 options required for multiple choice";
      }

      if (question.correct_answer < 1 || question.correct_answer > 4) {
        return "Correct answer must be between 1 and 4";
      }
    }

    return null;
  };

  const handleImport = async () => {
    try {
      setImporting(true);
      setError(null);

      const validQuestions = parsedQuestions.filter((q) => !q.error);
      const result: ImportResult = {
        success: 0,
        failed: 0,
        errors: [],
      };

      for (let i = 0; i < validQuestions.length; i++) {
        const question = validQuestions[i];

        try {
          // Insert question
          const { data: newQuestion, error: questionError } = await supabase
            .from("practice_questions")
            .insert({
              category,
              subdivision,
              question_text: question.question_text,
              question_type: question.question_type,
              difficulty: question.difficulty,
              points: question.points,
              explanation: question.explanation,
              image_url: question.image_url,
              is_active: question.is_active,
            })
            .select()
            .single();

          if (questionError) throw questionError;

          // Insert options for multiple choice
          if (question.question_type === "multiple_choice") {
            const options = [];
            if (question.option_1) {
              options.push({
                question_id: newQuestion.id,
                option_text: question.option_1,
                is_correct: question.correct_answer === 1,
                display_order: 0,
              });
            }
            if (question.option_2) {
              options.push({
                question_id: newQuestion.id,
                option_text: question.option_2,
                is_correct: question.correct_answer === 2,
                display_order: 1,
              });
            }
            if (question.option_3) {
              options.push({
                question_id: newQuestion.id,
                option_text: question.option_3,
                is_correct: question.correct_answer === 3,
                display_order: 2,
              });
            }
            if (question.option_4) {
              options.push({
                question_id: newQuestion.id,
                option_text: question.option_4,
                is_correct: question.correct_answer === 4,
                display_order: 3,
              });
            }

            const { error: optionsError } = await supabase
              .from("practice_question_options")
              .insert(options);

            if (optionsError) throw optionsError;
          }

          result.success++;
        } catch (err) {
          console.error("Error importing question:", err);
          result.failed++;
          result.errors.push({
            row: i + 2, // +2 for header and 0-index
            error: err instanceof Error ? err.message : "Unknown error",
          });
        }
      }

      setImportResult(result);
      setActiveStep(2);

      if (result.success > 0) {
        onImportComplete();
      }
    } catch (err) {
      console.error("Error during import:", err);
      setError("Failed to import questions");
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = `question_text,question_type,difficulty,points,explanation,image_url,option_1,option_2,option_3,option_4,correct_answer,is_active
"What is 2+2?",multiple_choice,easy,1,"Basic addition","",2,4,6,8,2,true
"Is the sky blue?",true_false,easy,1,"Common knowledge","",,,,,1,true`;

    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "practice_questions_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setActiveStep(0);
    setFile(null);
    setParsedQuestions([]);
    setImportResult(null);
    setError(null);
    setShowPreview(false);
  };

  const validQuestions = parsedQuestions.filter((q) => !q.error);
  const invalidQuestions = parsedQuestions.filter((q) => q.error);

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Bulk Import Questions
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Import multiple questions at once using a CSV file
        </Typography>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Step 0: Upload */}
        {activeStep === 0 && (
          <Box>
            <Button
              variant="outlined"
              startIcon={<DownloadOutlined />}
              onClick={downloadTemplate}
              sx={{ mb: 2 }}
            >
              Download CSV Template
            </Button>

            <Box
              sx={{
                border: 2,
                borderStyle: "dashed",
                borderColor: "divider",
                borderRadius: 2,
                p: 4,
                textAlign: "center",
                bgcolor: "background.default",
              }}
            >
              <UploadFileOutlined
                sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="body1" gutterBottom>
                {file ? file.name : "Select a CSV file to upload"}
              </Typography>
              <Button variant="contained" component="label" sx={{ mt: 2 }}>
                Choose File
                <input
                  type="file"
                  hidden
                  accept=".csv"
                  onChange={handleFileSelect}
                />
              </Button>
            </Box>
          </Box>
        )}

        {/* Step 1: Preview */}
        {activeStep === 1 && (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Box>
                <Typography variant="body1" gutterBottom>
                  <strong>{validQuestions.length}</strong> valid questions
                </Typography>
                {invalidQuestions.length > 0 && (
                  <Typography variant="body2" color="error">
                    <strong>{invalidQuestions.length}</strong> questions with
                    errors (will be skipped)
                  </Typography>
                )}
              </Box>
              <Button variant="outlined" onClick={() => setShowPreview(true)}>
                View Details
              </Button>
            </Box>

            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
              <Button onClick={reset}>Cancel</Button>
              <Button
                variant="contained"
                onClick={handleImport}
                disabled={importing || validQuestions.length === 0}
                startIcon={importing && <CircularProgress size={20} />}
              >
                {importing
                  ? "Importing..."
                  : `Import ${validQuestions.length} Questions`}
              </Button>
            </Box>
          </Box>
        )}

        {/* Step 2: Results */}
        {activeStep === 2 && importResult && (
          <Box>
            <Alert
              severity={importResult.failed === 0 ? "success" : "warning"}
              icon={
                importResult.failed === 0 ? (
                  <CheckCircleOutlined />
                ) : (
                  <ErrorOutlined />
                )
              }
              sx={{ mb: 2 }}
            >
              <Typography variant="body1">
                Successfully imported <strong>{importResult.success}</strong>{" "}
                questions
              </Typography>
              {importResult.failed > 0 && (
                <Typography variant="body2">
                  Failed to import <strong>{importResult.failed}</strong>{" "}
                  questions
                </Typography>
              )}
            </Alert>

            {importResult.errors.length > 0 && (
              <Paper sx={{ p: 2, bgcolor: "error.50", mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Errors:
                </Typography>
                {importResult.errors.map((err, index) => (
                  <Typography key={index} variant="body2" color="error">
                    Row {err.row}: {err.error}
                  </Typography>
                ))}
              </Paper>
            )}

            <Button variant="contained" onClick={reset}>
              Import More Questions
            </Button>
          </Box>
        )}
      </Paper>

      {/* Preview Dialog */}
      <Dialog
        open={showPreview}
        onClose={() => setShowPreview(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Preview Questions</DialogTitle>
        <DialogContent dividers>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Question</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Difficulty</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {parsedQuestions.map((q, index) => (
                  <TableRow key={index}>
                    <TableCell>{q.question_text.substring(0, 50)}...</TableCell>
                    <TableCell>{q.question_type}</TableCell>
                    <TableCell>
                      <Chip label={q.difficulty} size="small" />
                    </TableCell>
                    <TableCell>
                      {q.error ? (
                        <Chip label={q.error} size="small" color="error" />
                      ) : (
                        <Chip label="Valid" size="small" color="success" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreview(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
