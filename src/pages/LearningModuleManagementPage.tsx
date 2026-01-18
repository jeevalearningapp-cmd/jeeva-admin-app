import React, { useState } from "react";
import { Box, Tabs, Tab, Paper } from "@mui/material";
import { Topic } from "@/types/content";
import { Subtopic } from "@/api/subtopics";
import { LearningQuestion } from "@/api/learningQuestions";
import { LearningModuleTopicList } from "@/components/content/LearningModuleTopicList";
import { TopicFormModal } from "@/components/content/TopicFormModal";
import { CoreNotesEditor } from "@/components/content/CoreNotesEditor";
import { FlashContentEditor } from "@/components/content/FlashContentEditor";
import { SubtopicList } from "@/components/content/SubtopicList";
import { VideoLessonTab } from "@/components/content/VideoLessonTab";
import { LessonTextTab } from "@/components/content/LessonTextTab";
import { PodcastTab } from "@/components/content/PodcastTab";
import { MCQTab } from "@/components/content/MCQTab";
import { VideoMappedMCQForm } from "@/components/content/VideoMappedMCQForm";
import { ContentValidation } from "@/components/content/ContentValidation";

type ViewMode = "list" | "topic-detail" | "subtopic-detail";
type TopicTab = "core-notes" | "flash-content" | "subtopics" | "validation";
type SubtopicTab = "video" | "reading" | "podcast" | "mcqs";

export const LearningModuleManagementPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<Subtopic | null>(
    null,
  );
  const [topicTab, setTopicTab] = useState<TopicTab>("core-notes");
  const [subtopicTab, setSubtopicTab] = useState<SubtopicTab>("video");
  const [topicFormOpen, setTopicFormOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [mcqFormOpen, setMcqFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] =
    useState<LearningQuestion | null>(null);

  const handleAddTopic = () => {
    setEditingTopic(null);
    setTopicFormOpen(true);
  };

  const handleEditTopic = (topic: Topic) => {
    setEditingTopic(topic);
    setTopicFormOpen(true);
  };

  const handleViewTopicDetail = (topic: Topic) => {
    setSelectedTopic(topic);
    setViewMode("topic-detail");
    setTopicTab("core-notes");
  };

  const handleEditSubtopic = (subtopic: Subtopic) => {
    setSelectedSubtopic(subtopic);
    setViewMode("subtopic-detail");
    setSubtopicTab("video");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedTopic(null);
    setSelectedSubtopic(null);
  };

  const handleBackToTopic = () => {
    setViewMode("topic-detail");
    setSelectedSubtopic(null);
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setMcqFormOpen(true);
  };

  const handleEditQuestion = (question: LearningQuestion) => {
    setEditingQuestion(question);
    setMcqFormOpen(true);
  };

  const handleSubtopicUpdate = () => {
    // Refresh subtopic data
    if (selectedSubtopic) {
      // Trigger re-render
      setSelectedSubtopic({ ...selectedSubtopic });
    }
  };

  return (
    <Box sx={{ py: 4 }}>
      {/* List View */}
      {viewMode === "list" && (
        <LearningModuleTopicList
          onAddTopic={handleAddTopic}
          onEditTopic={handleEditTopic}
          onSelectTopic={handleViewTopicDetail}
        />
      )}

      {/* Topic Detail View */}
      {viewMode === "topic-detail" && selectedTopic && (
        <Box>
          {/* Back Button */}
          <Box sx={{ mb: 3 }}>
            <button
              onClick={handleBackToList}
              style={{
                background: "none",
                border: "none",
                color: "#1976d2",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              ← Back to Topics
            </button>
          </Box>

          {/* Topic Tabs */}
          <Paper
            sx={{ mb: 3, border: "1px solid #E5E7EB", borderRadius: "16px" }}
          >
            <Tabs
              value={topicTab}
              onChange={(_, newValue) => setTopicTab(newValue)}
              variant="fullWidth"
            >
              <Tab label="Core Notes" value="core-notes" />
              <Tab label="Flash Content" value="flash-content" />
              <Tab label="Subtopics" value="subtopics" />
              <Tab label="Validation" value="validation" />
            </Tabs>
          </Paper>

          {/* Tab Content */}
          {topicTab === "core-notes" && (
            <CoreNotesEditor topicId={selectedTopic.id} />
          )}
          {topicTab === "flash-content" && (
            <FlashContentEditor topicId={selectedTopic.id} />
          )}
          {topicTab === "subtopics" && (
            <SubtopicList
              topicId={selectedTopic.id}
              onEditSubtopic={handleEditSubtopic}
            />
          )}
          {topicTab === "validation" && (
            <ContentValidation topic={selectedTopic} />
          )}
        </Box>
      )}

      {/* Subtopic Detail View */}
      {viewMode === "subtopic-detail" && selectedSubtopic && (
        <Box>
          {/* Back Button */}
          <Box sx={{ mb: 3 }}>
            <button
              onClick={handleBackToTopic}
              style={{
                background: "none",
                border: "none",
                color: "#1976d2",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              ← Back to Topic
            </button>
          </Box>

          {/* Subtopic Tabs */}
          <Paper
            sx={{ mb: 3, border: "1px solid #E5E7EB", borderRadius: "16px" }}
          >
            <Tabs
              value={subtopicTab}
              onChange={(_, newValue) => setSubtopicTab(newValue)}
              variant="fullWidth"
            >
              <Tab label="Video Lesson" value="video" />
              <Tab label="Readable Content" value="reading" />
              <Tab label="Podcast" value="podcast" />
              <Tab label="MCQs" value="mcqs" />
            </Tabs>
          </Paper>

          {/* Tab Content */}
          {subtopicTab === "video" && (
            <VideoLessonTab
              subtopic={selectedSubtopic}
              onUpdate={handleSubtopicUpdate}
            />
          )}
          {subtopicTab === "reading" && (
            <LessonTextTab
              subtopic={selectedSubtopic}
              onUpdate={handleSubtopicUpdate}
            />
          )}
          {subtopicTab === "podcast" && (
            <PodcastTab
              subtopic={selectedSubtopic}
              onUpdate={handleSubtopicUpdate}
            />
          )}
          {subtopicTab === "mcqs" && (
            <MCQTab
              subtopic={selectedSubtopic}
              onAddQuestion={handleAddQuestion}
              onEditQuestion={handleEditQuestion}
            />
          )}
        </Box>
      )}

      {/* Topic Form Modal */}
      <TopicFormModal
        open={topicFormOpen}
        onClose={() => setTopicFormOpen(false)}
        editingTopic={editingTopic}
      />

      {/* MCQ Form Modal */}
      {selectedSubtopic && (
        <VideoMappedMCQForm
          open={mcqFormOpen}
          onClose={() => setMcqFormOpen(false)}
          subtopic={selectedSubtopic}
          editingQuestion={editingQuestion}
          onSuccess={() => {
            // Refresh MCQ list
            setMcqFormOpen(false);
          }}
        />
      )}
    </Box>
  );
};

export default LearningModuleManagementPage;
