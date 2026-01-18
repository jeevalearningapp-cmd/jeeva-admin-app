import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
  CircularProgress,
  Button,
  Collapse,
} from "@mui/material";
import {
  CheckCircleOutlined,
  ErrorOutlined,
  ExpandMoreOutlined,
  ExpandLessOutlined,
} from "@mui/icons-material";
import { Topic } from "@/types/content";
import { coreNotesAPI } from "@/api/coreNotes";
import { flashContentAPI } from "@/api/flashContent";
import { subtopicsAPI, Subtopic } from "@/api/subtopics";

interface ContentValidationProps {
  topic: Topic;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface TopicValidation {
  coreNotes: ValidationResult;
  flashContent: ValidationResult;
  subtopics: ValidationResult;
  overall: ValidationResult;
}

export const ContentValidation: React.FC<ContentValidationProps> = ({
  topic,
}) => {
  const [validation, setValidation] = useState<TopicValidation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);

  useEffect(() => {
    validateTopic();
  }, [topic.id]);

  const validateTopic = async () => {
    try {
      setIsLoading(true);

      // Validate Core Notes
      const coreNotesValidation = await validateCoreNotes();

      // Validate Flash Content
      const flashContentValidation = await validateFlashContent();

      // Validate Subtopics
      const subtopicsValidation = await validateSubtopics();

      // Overall validation
      const overallErrors = [
        ...coreNotesValidation.errors,
        ...flashContentValidation.errors,
        ...subtopicsValidation.errors,
      ];
      const overallWarnings = [
        ...coreNotesValidation.warnings,
        ...flashContentValidation.warnings,
        ...subtopicsValidation.warnings,
      ];

      setValidation({
        coreNotes: coreNotesValidation,
        flashContent: flashContentValidation,
        subtopics: subtopicsValidation,
        overall: {
          isValid: overallErrors.length === 0,
          errors: overallErrors,
          warnings: overallWarnings,
        },
      });
    } catch (err) {
      console.error("Validation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const validateCoreNotes = async (): Promise<ValidationResult> => {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const coreNotes = await coreNotesAPI.getByTopicId(topic.id);
      if (!coreNotes) {
        errors.push("Core Notes do not exist");
      } else {
        if (
          !coreNotes.content &&
          (!coreNotes.sections || coreNotes.sections.length === 0)
        ) {
          errors.push("Core Notes are empty");
        }
        if (coreNotes.sections && coreNotes.sections.length === 0) {
          warnings.push("Core Notes have no sections");
        }
      }
    } catch (err) {
      errors.push("Failed to load Core Notes");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  };

  const validateFlashContent = async (): Promise<ValidationResult> => {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const flashScreens = await flashContentAPI.getByTopicId(topic.id);
      if (flashScreens.length !== 5) {
        errors.push(
          `Flash Content must have exactly 5 screens (currently: ${flashScreens.length})`,
        );
      } else {
        // Check if all screens have content
        const emptyScreens = flashScreens.filter(
          (screen) => !screen.title.trim() || !screen.content.trim(),
        );
        if (emptyScreens.length > 0) {
          warnings.push(
            `${emptyScreens.length} flash screen(s) are empty: ${emptyScreens
              .map((s) => `Screen ${s.screenNumber}`)
              .join(", ")}`,
          );
        }
      }
    } catch (err) {
      errors.push("Failed to load Flash Content");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  };

  const validateSubtopics = async (): Promise<ValidationResult> => {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const subtopicsData = await subtopicsAPI.getByTopicId(topic.id);
      setSubtopics(subtopicsData);

      if (subtopicsData.length === 0) {
        errors.push("No subtopics found");
      } else {
        for (const subtopic of subtopicsData) {
          const validation = await subtopicsAPI.getValidationStatus(
            subtopic.id,
          );

          if (!validation.isValid) {
            errors.push(
              `Subtopic "${subtopic.title}": ${validation.errors.join(", ")}`,
            );
          }

          if (!validation.hasVideo) {
            errors.push(
              `Subtopic "${subtopic.title}": Missing mandatory video lesson`,
            );
          }

          if (validation.mcqCount < 5) {
            errors.push(
              `Subtopic "${subtopic.title}": Insufficient MCQs (${validation.mcqCount}/5 minimum)`,
            );
          }

          if (validation.mcqCount > 10) {
            errors.push(
              `Subtopic "${subtopic.title}": Too many MCQs (${validation.mcqCount}/10 maximum)`,
            );
          }

          if (!validation.hasPodcast) {
            warnings.push(
              `Subtopic "${subtopic.title}": No podcast (optional)`,
            );
          }
        }
      }
    } catch (err) {
      errors.push("Failed to load Subtopics");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!validation) {
    return <Alert severity="error">Failed to validate topic content</Alert>;
  }

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
            Content Validation
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Check if topic is ready for activation
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={validateTopic}
          sx={{ borderRadius: "12px" }}
        >
          Re-validate
        </Button>
      </Box>

      {/* Overall Status */}
      <Alert
        severity={validation.overall.isValid ? "success" : "error"}
        icon={
          validation.overall.isValid ? (
            <CheckCircleOutlined />
          ) : (
            <ErrorOutlined />
          )
        }
        sx={{ mb: 3 }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {validation.overall.isValid
              ? "Topic is valid and ready for activation"
              : "Topic has validation errors"}
          </Typography>
          <Chip
            label={
              validation.overall.isValid
                ? "Valid"
                : `${validation.overall.errors.length} error(s)`
            }
            size="small"
            color={validation.overall.isValid ? "success" : "error"}
          />
        </Box>
      </Alert>

      {/* Validation Checklist */}
      <Paper
        sx={{
          border: "1px solid #E5E7EB",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: 2,
            bgcolor: "background.default",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
          }}
          onClick={() => setExpanded(!expanded)}
        >
          <Typography variant="subtitle2">Validation Checklist</Typography>
          {expanded ? <ExpandLessOutlined /> : <ExpandMoreOutlined />}
        </Box>

        <Collapse in={expanded}>
          <List sx={{ p: 0 }}>
            {/* Core Notes */}
            <ListItem sx={{ borderBottom: "1px solid #E5E7EB" }}>
              <ListItemIcon>
                {validation.coreNotes.isValid ? (
                  <CheckCircleOutlined color="success" />
                ) : (
                  <ErrorOutlined color="error" />
                )}
              </ListItemIcon>
              <ListItemText
                primary="Core Notes"
                secondary={
                  <Box>
                    {validation.coreNotes.errors.map((error, i) => (
                      <Typography
                        key={i}
                        variant="caption"
                        color="error"
                        display="block"
                      >
                        • {error}
                      </Typography>
                    ))}
                    {validation.coreNotes.warnings.map((warning, i) => (
                      <Typography
                        key={i}
                        variant="caption"
                        color="warning.main"
                        display="block"
                      >
                        • {warning}
                      </Typography>
                    ))}
                    {validation.coreNotes.isValid && (
                      <Typography variant="caption" color="text.secondary">
                        Core Notes exist and are not empty
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItem>

            {/* Flash Content */}
            <ListItem sx={{ borderBottom: "1px solid #E5E7EB" }}>
              <ListItemIcon>
                {validation.flashContent.isValid ? (
                  <CheckCircleOutlined color="success" />
                ) : (
                  <ErrorOutlined color="error" />
                )}
              </ListItemIcon>
              <ListItemText
                primary="Flash Content"
                secondary={
                  <Box>
                    {validation.flashContent.errors.map((error, i) => (
                      <Typography
                        key={i}
                        variant="caption"
                        color="error"
                        display="block"
                      >
                        • {error}
                      </Typography>
                    ))}
                    {validation.flashContent.warnings.map((warning, i) => (
                      <Typography
                        key={i}
                        variant="caption"
                        color="warning.main"
                        display="block"
                      >
                        • {warning}
                      </Typography>
                    ))}
                    {validation.flashContent.isValid && (
                      <Typography variant="caption" color="text.secondary">
                        Exactly 5 flash screens exist
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItem>

            {/* Subtopics */}
            <ListItem>
              <ListItemIcon>
                {validation.subtopics.isValid ? (
                  <CheckCircleOutlined color="success" />
                ) : (
                  <ErrorOutlined color="error" />
                )}
              </ListItemIcon>
              <ListItemText
                primary={`Subtopics (${subtopics.length})`}
                secondary={
                  <Box>
                    {validation.subtopics.errors.map((error, i) => (
                      <Typography
                        key={i}
                        variant="caption"
                        color="error"
                        display="block"
                      >
                        • {error}
                      </Typography>
                    ))}
                    {validation.subtopics.warnings.map((warning, i) => (
                      <Typography
                        key={i}
                        variant="caption"
                        color="warning.main"
                        display="block"
                      >
                        • {warning}
                      </Typography>
                    ))}
                    {validation.subtopics.isValid && (
                      <Typography variant="caption" color="text.secondary">
                        All subtopics have mandatory videos and 5-10 MCQs
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItem>
          </List>
        </Collapse>
      </Paper>
    </Box>
  );
};
