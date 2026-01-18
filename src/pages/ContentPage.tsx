import React from "react";
import { Box, Typography, Card, CardActionArea } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  ViewModuleOutlined,
  TopicOutlined,
  MenuBookOutlined,
  QuizOutlined,
  StyleOutlined,
} from "@mui/icons-material";

export const ContentPage: React.FC = () => {
  const navigate = useNavigate();

  const contentTypes = [
    {
      title: "Modules",
      description: "Manage course modules and learning paths",
      icon: <ViewModuleOutlined sx={{ fontSize: 48 }} />,
      path: "/content/modules",
      color: "#007aff",
    },
    {
      title: "Topics",
      description: "Organize content into topics within modules",
      icon: <TopicOutlined sx={{ fontSize: 48 }} />,
      path: "/content/topics",
      color: "#34C759",
    },
    {
      title: "Lessons",
      description: "Create and manage lesson content",
      icon: <MenuBookOutlined sx={{ fontSize: 48 }} />,
      path: "/content/lessons",
      color: "#5AC8FA",
    },
    {
      title: "Questions",
      description: "Build question banks for assessments",
      icon: <QuizOutlined sx={{ fontSize: 48 }} />,
      path: "/content/questions",
      color: "#FF9500",
    },
    {
      title: "Flashcards",
      description: "Design flashcards for active learning",
      icon: <StyleOutlined sx={{ fontSize: 48 }} />,
      path: "/content/flashcards",
      color: "#AF52DE",
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Content Management
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Manage all learning content across the platform
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
          gap: 3,
        }}
      >
        {contentTypes.map((type) => (
          <Card
            key={type.title}
            sx={{ bgcolor: "background.paper", height: "100%" }}
          >
            <CardActionArea
              onClick={() => navigate(type.path)}
              sx={{
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: `${type.color}15`,
                  color: type.color,
                  mb: 2,
                }}
              >
                {type.icon}
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {type.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {type.description}
              </Typography>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Box>
  );
};
