import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  IconButton,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
} from "@mui/material";
import {
  SaveOutlined,
  NavigateBeforeOutlined,
  NavigateNextOutlined,
  ImageOutlined,
} from "@mui/icons-material";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { flashContentAPI, TopicFlashContent } from "@/api/flashContent";
import { useSnackbar } from "notistack";

interface FlashContentEditorProps {
  topicId: string;
}

export const FlashContentEditor: React.FC<FlashContentEditorProps> = ({
  topicId,
}) => {
  const [flashScreens, setFlashScreens] = useState<TopicFlashContent[]>([]);
  const [currentScreen, setCurrentScreen] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const { enqueueSnackbar } = useSnackbar();

  // Load flash content
  useEffect(() => {
    loadFlashContent();
  }, [topicId]);

  const loadFlashContent = async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await flashContentAPI.getByTopicId(topicId);

      // Ensure we have exactly 5 screens
      if (data.length === 0) {
        // Create placeholders if none exist
        const placeholders = await flashContentAPI.createPlaceholders(topicId);
        setFlashScreens(placeholders);
      } else if (data.length < 5) {
        // Create missing screens
        const existingNumbers = data.map((s) => s.screenNumber);
        const missingNumbers = [1, 2, 3, 4, 5].filter(
          (n) => !existingNumbers.includes(n),
        );

        for (const screenNumber of missingNumbers) {
          await flashContentAPI.create({
            topicId,
            screenNumber,
            title: `Screen ${screenNumber}`,
            content: "",
          });
        }

        // Reload
        const reloadedData = await flashContentAPI.getByTopicId(topicId);
        setFlashScreens(reloadedData);
      } else {
        setFlashScreens(data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load flash content");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError("");

      const screen = flashScreens[currentScreen];
      await flashContentAPI.update(topicId, screen.screenNumber, {
        title: screen.title,
        content: screen.content,
        imageUrl: screen.imageUrl,
      });

      enqueueSnackbar("Flash content saved successfully", {
        variant: "success",
      });
    } catch (err: any) {
      setError(err.message || "Failed to save flash content");
      enqueueSnackbar("Failed to save flash content", { variant: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateScreen = (updates: Partial<TopicFlashContent>) => {
    const updatedScreens = [...flashScreens];
    updatedScreens[currentScreen] = {
      ...updatedScreens[currentScreen],
      ...updates,
    };
    setFlashScreens(updatedScreens);
  };

  const handleNavigate = (direction: "prev" | "next") => {
    if (direction === "prev" && currentScreen > 0) {
      setCurrentScreen(currentScreen - 1);
    } else if (direction === "next" && currentScreen < 4) {
      setCurrentScreen(currentScreen + 1);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const screen = flashScreens[currentScreen];

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
          <Typography variant="h5" gutterBottom>
            Flash Content Editor
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create 5 quick revision screens for spaced repetition
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<SaveOutlined />}
          onClick={handleSave}
          disabled={isSaving}
          sx={{ borderRadius: "12px" }}
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Screen Navigation Tabs */}
      <Paper sx={{ mb: 2, border: "1px solid #E5E7EB", borderRadius: "16px" }}>
        <Tabs
          value={currentScreen}
          onChange={(_, newValue) => setCurrentScreen(newValue)}
          variant="fullWidth"
          sx={{ borderBottom: "1px solid #E5E7EB" }}
        >
          {flashScreens.map((screen, index) => (
            <Tab
              key={screen.id}
              label={`Screen ${index + 1}`}
              sx={{ fontWeight: currentScreen === index ? 600 : 400 }}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Screen Editor */}
      {screen && (
        <Paper sx={{ p: 3, border: "1px solid #E5E7EB", borderRadius: "16px" }}>
          {/* Screen Number Indicator */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h6" color="primary">
              Screen {currentScreen + 1} of 5
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton
                onClick={() => handleNavigate("prev")}
                disabled={currentScreen === 0}
                size="small"
              >
                <NavigateBeforeOutlined />
              </IconButton>
              <IconButton
                onClick={() => handleNavigate("next")}
                disabled={currentScreen === 4}
                size="small"
              >
                <NavigateNextOutlined />
              </IconButton>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Title Field */}
          <TextField
            label="Screen Title"
            value={screen.title}
            onChange={(e) => handleUpdateScreen({ title: e.target.value })}
            fullWidth
            required
            sx={{ mb: 3 }}
            placeholder="Enter a catchy title for this screen"
          />

          {/* Content Editor */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Content
            </Typography>
            <FlashContentRichEditor
              content={screen.content}
              onChange={(content) => handleUpdateScreen({ content })}
            />
          </Box>

          {/* Image URL Field */}
          <TextField
            label="Image URL (Optional)"
            value={screen.imageUrl || ""}
            onChange={(e) => handleUpdateScreen({ imageUrl: e.target.value })}
            fullWidth
            placeholder="https://example.com/image.jpg"
            InputProps={{
              startAdornment: (
                <ImageOutlined sx={{ mr: 1, color: "action.active" }} />
              ),
            }}
          />

          {/* Image Preview */}
          {screen.imageUrl && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Image Preview
              </Typography>
              <Box
                component="img"
                src={screen.imageUrl}
                alt="Flash content preview"
                sx={{
                  maxWidth: "100%",
                  maxHeight: 300,
                  borderRadius: "8px",
                  border: "1px solid #E5E7EB",
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </Box>
          )}
        </Paper>
      )}

      {/* Navigation Buttons */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
        <Button
          variant="outlined"
          startIcon={<NavigateBeforeOutlined />}
          onClick={() => handleNavigate("prev")}
          disabled={currentScreen === 0}
          sx={{ borderRadius: "12px" }}
        >
          Previous Screen
        </Button>
        <Button
          variant="outlined"
          endIcon={<NavigateNextOutlined />}
          onClick={() => handleNavigate("next")}
          disabled={currentScreen === 4}
          sx={{ borderRadius: "12px" }}
        >
          Next Screen
        </Button>
      </Box>
    </Box>
  );
};

interface FlashContentRichEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const FlashContentRichEditor: React.FC<FlashContentRichEditorProps> = ({
  content,
  onChange,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: false,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: "Write concise, memorable content for quick revision...",
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <Box
      sx={{
        border: "1px solid #E5E7EB",
        borderRadius: "8px",
        minHeight: 200,
        "& .ProseMirror": {
          padding: 2,
          minHeight: 200,
          outline: "none",
          "& p.is-editor-empty:first-of-type::before": {
            color: "#adb5bd",
            content: "attr(data-placeholder)",
            float: "left",
            height: 0,
            pointerEvents: "none",
          },
        },
      }}
    >
      <EditorContent editor={editor} />
    </Box>
  );
};
