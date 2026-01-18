import React, { useState } from "react";
import { Box, Typography, Paper, Tabs, Tab, Chip } from "@mui/material";
import { MockQuestionManager, MockCSVBulkUpload } from "@/components/content";

type ExamPart = "part_a" | "part_b";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

export const MockExamManagement: React.FC = () => {
  const [selectedExamPart, setSelectedExamPart] = useState<ExamPart>("part_a");
  const [tabValue, setTabValue] = useState(0);

  return (
    <Box>
      {/* Exam Part Selector */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Select Exam Part
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Choose which part of the mock exam to manage
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Chip
            label="Part A: Numeracy (15 questions, 30 min)"
            onClick={() => setSelectedExamPart("part_a")}
            color={selectedExamPart === "part_a" ? "primary" : "default"}
            sx={{ px: 2, py: 3 }}
          />
          <Chip
            label="Part B: Clinical (120 questions, 150 min)"
            onClick={() => setSelectedExamPart("part_b")}
            color={selectedExamPart === "part_b" ? "primary" : "default"}
            sx={{ px: 2, py: 3 }}
          />
        </Box>
      </Paper>

      {/* Content Tabs */}
      <Paper sx={{ p: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
        >
          <Tab label="Questions" />
          <Tab label="Bulk Upload" />
        </Tabs>

        {/* Questions Tab */}
        <TabPanel value={tabValue} index={0}>
          <MockQuestionManager examPart={selectedExamPart} />
        </TabPanel>

        {/* Bulk Upload Tab */}
        <TabPanel value={tabValue} index={1}>
          <MockCSVBulkUpload examPart={selectedExamPart} />
        </TabPanel>
      </Paper>
    </Box>
  );
};
