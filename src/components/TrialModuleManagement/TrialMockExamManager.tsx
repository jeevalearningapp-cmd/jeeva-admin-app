import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  TextField,
  FormControlLabel,
  Switch,
  LinearProgress,
  Divider,
  Alert,
} from "@mui/material";
import { InfoOutlined } from "@mui/icons-material";

interface MockExamConfig {
  questionCount: number;
  timeLimitMinutes: number;
  passingScore: number;
  allowMarkForReview: boolean;
  allowAnswerChanges: boolean;
  showQuestionNavigator: boolean;
  autoSubmitAtTimeLimit: boolean;
  showResultsImmediately: boolean;
}

interface MockExamManagerProps {
  onStatusChange: (status: "idle" | "loading" | "success" | "error") => void;
}

export default function TrialMockExamManager({
  onStatusChange,
}: MockExamManagerProps) {
  const [config, setConfig] = useState<MockExamConfig>({
    questionCount: 20,
    timeLimitMinutes: 30,
    passingScore: 50,
    allowMarkForReview: true,
    allowAnswerChanges: true,
    showQuestionNavigator: true,
    autoSubmitAtTimeLimit: true,
    showResultsImmediately: true,
  });

  const [selectedQuestions, setSelectedQuestions] = useState(0);

  const handleSaveConfig = async () => {
    onStatusChange("loading");
    try {
      // Save configuration
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onStatusChange("success");
    } catch (error) {
      onStatusChange("error");
    }
  };

  return (
    <Box>
      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 3 }} icon={<InfoOutlined />}>
        Trial mock exam: 20 questions, 30 minutes, representative sample from
        all topics with detailed results and suggestions.
      </Alert>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Questions
              </Typography>
              <Typography variant="h5">{config.questionCount}</Typography>
              <Typography variant="caption" color="text.secondary">
                Fixed for trial
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Time Limit
              </Typography>
              <Typography variant="h5">
                {config.timeLimitMinutes} min
              </Typography>
              <Typography variant="caption" color="text.secondary">
                30 min for trial
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Passing Score
              </Typography>
              <Typography variant="h5">{config.passingScore}%</Typography>
              <Typography variant="caption" color="text.secondary">
                To pass the exam
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Questions Selected
              </Typography>
              <Typography variant="h5">
                {selectedQuestions}/{config.questionCount}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={(selectedQuestions / config.questionCount) * 100}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Exam Configuration */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Exam Features
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.allowMarkForReview}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        allowMarkForReview: e.target.checked,
                      })
                    }
                  />
                }
                label="Allow Mark for Review"
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ ml: 4, display: "block" }}
              >
                Users can mark questions to review later
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.allowAnswerChanges}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        allowAnswerChanges: e.target.checked,
                      })
                    }
                  />
                }
                label="Allow Answer Changes"
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ ml: 4, display: "block" }}
              >
                Users can change their answers before submit
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.showQuestionNavigator}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        showQuestionNavigator: e.target.checked,
                      })
                    }
                  />
                }
                label="Show Question Navigator"
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ ml: 4, display: "block" }}
              >
                Display all question numbers for easy navigation
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.autoSubmitAtTimeLimit}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        autoSubmitAtTimeLimit: e.target.checked,
                      })
                    }
                  />
                }
                label="Auto-Submit at Time Limit"
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ ml: 4, display: "block" }}
              >
                Automatically submit when time expires
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.showResultsImmediately}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        showResultsImmediately: e.target.checked,
                      })
                    }
                  />
                }
                label="Show Results Immediately"
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ ml: 4, display: "block" }}
              >
                Display detailed results right after exam completion
                (recommended for learning)
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Display */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Results Display
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" gutterBottom>
              Overall Results
            </Typography>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>Pass/Fail status</li>
              <li>Final score (X/20)</li>
              <li>Percentage score</li>
              <li>Time taken</li>
            </ul>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" gutterBottom>
              Topic Breakdown
            </Typography>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>Score per topic</li>
              <li>Weak areas identified</li>
              <li>Comparison to avg user</li>
              <li>Difficulty breakdown</li>
            </ul>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" gutterBottom>
              Detailed Review
            </Typography>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>Each question with answer</li>
              <li>Correct answer highlighted</li>
              <li>Full explanation</li>
              <li>Difficulty level</li>
            </ul>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" gutterBottom>
              Suggestions
            </Typography>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>Weak topic recommendations</li>
              <li>Recommended practice count</li>
              <li>Study suggestions</li>
              <li>Next steps & upgrade CTA</li>
            </ul>
          </Grid>
        </Grid>
      </Paper>

      {/* Save Button */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button variant="contained" onClick={handleSaveConfig}>
          Save Configuration
        </Button>
        <Button variant="outlined">Preview Results Screen</Button>
      </Box>
    </Box>
  );
}
