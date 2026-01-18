import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
} from "@mui/material";
import {
  AddOutlined,
  EditOutlined,
  DeleteOutlined,
  DragIndicatorOutlined,
  CheckCircleOutlined,
  ErrorOutlined,
} from "@mui/icons-material";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Topic } from "@/types/content";
import {
  useTopicsByModule,
  useUpdateTopic,
  useDeleteTopic,
} from "@/hooks/useTopics";
import { FIXED_MODULE_IDS } from "@/types/content";
import { PageLoader } from "@/components/common";

interface LearningModuleTopicListProps {
  onAddTopic: () => void;
  onEditTopic: (topic: Topic) => void;
  onSelectTopic: (topic: Topic) => void;
}

export const LearningModuleTopicList: React.FC<
  LearningModuleTopicListProps
> = ({ onAddTopic, onEditTopic, onSelectTopic }) => {
  const { data: topics, isLoading } = useTopicsByModule(
    FIXED_MODULE_IDS.LEARNING,
  );
  const updateMutation = useUpdateTopic();
  const deleteMutation = useDeleteTopic();
  const [reorderError, setReorderError] = useState<string>("");

  if (isLoading) {
    return <PageLoader />;
  }

  // Sort topics by display order
  const sortedTopics = [...(topics || [])].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || !topics) {
      return;
    }

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) {
      return;
    }

    // Reorder topics array
    const reorderedTopics = Array.from(sortedTopics);
    const [movedTopic] = reorderedTopics.splice(sourceIndex, 1);
    reorderedTopics.splice(destinationIndex, 0, movedTopic);

    // Update display order for all affected topics
    try {
      setReorderError("");
      for (let i = 0; i < reorderedTopics.length; i++) {
        if (reorderedTopics[i].displayOrder !== i) {
          await updateMutation.mutateAsync({
            id: reorderedTopics[i].id,
            input: { displayOrder: i },
          });
        }
      }
    } catch (error: any) {
      setReorderError(error.message || "Failed to reorder topics");
    }
  };

  const handleDelete = async (topic: Topic) => {
    const confirmMessage = `Are you sure you want to delete "${topic.title}"? This will permanently delete:
- Core Notes
- Flash Content (5 screens)
- All Subtopics
- All Video Lessons
- All Podcasts
- All Video-Mapped MCQs

This action cannot be undone.`;

    if (window.confirm(confirmMessage)) {
      try {
        await deleteMutation.mutateAsync(topic.id);
      } catch (error: any) {
        alert(error.message || "Failed to delete topic");
      }
    }
  };

  // Mock validation status - will be implemented in subtask 5.10
  const getValidationStatus = (topic: Topic): "complete" | "incomplete" => {
    // TODO: Implement actual validation logic
    return "incomplete";
  };

  const getProgressPercentage = (topic: Topic): number => {
    // TODO: Implement actual progress calculation
    return 0;
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
            Learning Module Topics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage learning topics with dynamic structure
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          onClick={onAddTopic}
          sx={{ borderRadius: "12px" }}
        >
          Add New Topic
        </Button>
      </Box>

      {reorderError && (
        <Alert
          severity="error"
          onClose={() => setReorderError("")}
          sx={{ mb: 2 }}
        >
          {reorderError}
        </Alert>
      )}

      {/* Topics List with Drag and Drop */}
      <Paper
        sx={{
          bgcolor: "background.paper",
          border: "1px solid #E5E7EB",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        {sortedTopics.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No topics yet. Click "Add New Topic" to create one.
            </Typography>
          </Box>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="topics-list">
              {(provided) => (
                <List
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  sx={{ p: 0 }}
                >
                  {sortedTopics.map((topic, index) => {
                    const validationStatus = getValidationStatus(topic);
                    const progressPercentage = getProgressPercentage(topic);

                    return (
                      <Draggable
                        key={topic.id}
                        draggableId={topic.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <ListItem
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            onClick={() => onSelectTopic(topic)}
                            sx={{
                              borderBottom: "1px solid #E5E7EB",
                              bgcolor: snapshot.isDragging
                                ? "action.hover"
                                : "background.paper",
                              cursor: "pointer",
                              "&:hover": {
                                bgcolor: "action.hover",
                              },
                              "&:last-child": {
                                borderBottom: "none",
                              },
                            }}
                          >
                            {/* Drag Handle */}
                            <Box
                              {...provided.dragHandleProps}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mr: 2,
                                cursor: "grab",
                                "&:active": {
                                  cursor: "grabbing",
                                },
                              }}
                            >
                              <DragIndicatorOutlined color="action" />
                            </Box>

                            {/* Topic Info */}
                            <ListItemText
                              primaryTypographyProps={{ component: "div" }}
                              secondaryTypographyProps={{ component: "div" }}
                              primary={
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <Typography
                                    variant="body1"
                                    component="div"
                                    sx={{ fontWeight: 500 }}
                                  >
                                    {topic.title}
                                  </Typography>
                                  <Chip
                                    label={`Order: ${topic.displayOrder}`}
                                    size="small"
                                    variant="outlined"
                                  />
                                  {!topic.isActive && (
                                    <Chip
                                      label="Inactive"
                                      size="small"
                                      color="default"
                                    />
                                  )}
                                </Box>
                              }
                              secondary={
                                <Box sx={{ mt: 0.5 }}>
                                  <Typography
                                    variant="caption"
                                    component="div"
                                    color="text.secondary"
                                    sx={{ display: "block", mb: 0.5 }}
                                  >
                                    {topic.description}
                                  </Typography>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                  >
                                    {validationStatus === "complete" ? (
                                      <Chip
                                        icon={<CheckCircleOutlined />}
                                        label="Complete"
                                        size="small"
                                        color="success"
                                        variant="outlined"
                                      />
                                    ) : (
                                      <Chip
                                        icon={<ErrorOutlined />}
                                        label="Incomplete"
                                        size="small"
                                        color="warning"
                                        variant="outlined"
                                      />
                                    )}
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      Progress: {progressPercentage}%
                                    </Typography>
                                  </Box>
                                </Box>
                              }
                            />

                            {/* Actions */}
                            <ListItemSecondaryAction>
                              <IconButton
                                size="small"
                                onClick={() => onEditTopic(topic)}
                                sx={{ mr: 1 }}
                              >
                                <EditOutlined fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(topic)}
                                color="error"
                              >
                                <DeleteOutlined fontSize="small" />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </List>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </Paper>
    </Box>
  );
};
