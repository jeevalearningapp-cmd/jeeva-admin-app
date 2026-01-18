import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Chip,
  FormControlLabel,
  Switch,
} from "@mui/material";
import {
  SaveOutlined,
  VideoLibraryOutlined,
  CloudUploadOutlined,
} from "@mui/icons-material";
import { Subtopic } from "@/api/subtopics";
import { subtopicsAPI } from "@/api/subtopics";
import { lessonContentAPI } from "@/api/lessonContent";
import { useSnackbar } from "notistack";

interface VideoLessonTabProps {
  subtopic: Subtopic;
  onUpdate: () => void;
}

export const VideoLessonTab: React.FC<VideoLessonTabProps> = ({
  subtopic,
  onUpdate,
}) => {
  const [videoUrl, setVideoUrl] = useState(subtopic.videoUrl || "");
  const [duration, setDuration] = useState(subtopic.duration || 0);
  const [isMandatory, setIsMandatory] = useState(subtopic.isMandatory);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const { enqueueSnackbar } = useSnackbar();

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError("");

      // Update main lesson (subtopic)
      try {
        await subtopicsAPI.update(subtopic.id, {
          isMandatory,
          contentType: "video",
        });
      } catch (e) {
        console.warn(
          "Failed to update parent lesson record, but proceeding with content update",
          e,
        );
      }

      // Update or create video content record
      await lessonContentAPI.upsert(subtopic.id, "video", {
        title: "Video Lesson",
        contentUrl: videoUrl,
        durationSeconds: duration,
        isActive: true,
      });

      enqueueSnackbar("Video lesson saved successfully", {
        variant: "success",
      });
      onUpdate();
    } catch (err: any) {
      setError(err.message || "Failed to save video lesson");
      enqueueSnackbar("Failed to save video lesson", { variant: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const isValidUrl = (url: string) => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
          <Typography variant="h6" gutterBottom>
            Video Lesson (Mandatory)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload or link to a video lesson for this subtopic
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<SaveOutlined />}
          onClick={handleSave}
          disabled={isSaving || !isValidUrl(videoUrl)}
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

      {/* Video URL Field */}
      <Paper
        sx={{ p: 3, mb: 3, border: "1px solid #E5E7EB", borderRadius: "16px" }}
      >
        <Typography variant="subtitle2" gutterBottom>
          Video URL
        </Typography>
        <TextField
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          fullWidth
          placeholder="https://example.com/video.mp4 or YouTube URL"
          helperText="Enter a direct video URL or YouTube/Vimeo link"
          InputProps={{
            startAdornment: (
              <VideoLibraryOutlined sx={{ mr: 1, color: "action.active" }} />
            ),
          }}
          sx={{ mb: 2 }}
        />

        {/* Duration Field */}
        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
          Duration (seconds)
        </Typography>
        <TextField
          type="number"
          value={duration}
          onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
          fullWidth
          placeholder="e.g., 720 for 12 minutes"
          helperText={
            duration > 0
              ? `Duration: ${formatDuration(duration)}`
              : "Enter duration in seconds"
          }
          sx={{ mb: 2 }}
        />

        {/* Mandatory Toggle */}
        <FormControlLabel
          control={
            <Switch
              checked={isMandatory}
              onChange={(e) => setIsMandatory(e.target.checked)}
            />
          }
          label={
            <Box>
              <Typography variant="body2">Mandatory</Typography>
              <Typography variant="caption" color="text.secondary">
                Students must watch this video before taking the assessment
              </Typography>
            </Box>
          }
        />
      </Paper>

      {/* Video Preview */}
      {isValidUrl(videoUrl) && (
        <Paper sx={{ p: 3, border: "1px solid #E5E7EB", borderRadius: "16px" }}>
          <Typography variant="subtitle2" gutterBottom>
            Video Preview
          </Typography>
          <Box
            sx={{
              position: "relative",
              paddingBottom: "56.25%", // 16:9 aspect ratio
              height: 0,
              overflow: "hidden",
              borderRadius: "8px",
              bgcolor: "#000",
            }}
          >
            {videoUrl.includes("youtube.com") ||
            videoUrl.includes("youtu.be") ? (
              <iframe
                src={videoUrl.replace("watch?v=", "embed/")}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={videoUrl}
                controls
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                }}
              >
                Your browser does not support the video tag.
              </video>
            )}
          </Box>
        </Paper>
      )}

      {/* Upload Instructions */}
      {!videoUrl && (
        <Paper
          sx={{
            p: 3,
            border: "1px dashed #E5E7EB",
            borderRadius: "16px",
            textAlign: "center",
          }}
        >
          <CloudUploadOutlined
            sx={{ fontSize: 48, color: "action.disabled", mb: 2 }}
          />
          <Typography variant="body2" color="text.secondary" gutterBottom>
            No video uploaded yet
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Upload your video to a hosting service (YouTube, Vimeo, AWS S3,
            etc.) and paste the URL above
          </Typography>
        </Paper>
      )}

      {/* Status Indicator */}
      <Box sx={{ mt: 3, display: "flex", gap: 1 }}>
        {videoUrl ? (
          <Chip
            icon={<VideoLibraryOutlined />}
            label="Video Added"
            color="success"
            variant="outlined"
          />
        ) : (
          <Chip
            icon={<VideoLibraryOutlined />}
            label="No Video"
            color="default"
            variant="outlined"
          />
        )}
        {isMandatory && <Chip label="Mandatory" color="error" size="small" />}
      </Box>
    </Box>
  );
};
