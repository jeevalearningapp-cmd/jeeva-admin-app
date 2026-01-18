import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Tabs,
  Tab,
  Typography,
  Paper,
  LinearProgress,
  Alert,
} from "@mui/material";
import { AddOutlined } from "@mui/icons-material";
import TrialPracticeManager from "@/components/TrialModuleManagement/TrialPracticeManager";
import TrialLearningManager from "@/components/TrialModuleManagement/TrialLearningManager";
import TrialMockExamManager from "@/components/TrialModuleManagement/TrialMockExamManager";
import TrialAnalyticsDashboard from "@/components/TrialModuleManagement/TrialAnalyticsDashboard";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`trial-tabpanel-${index}`}
      aria-labelledby={`trial-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function TrialModuleManagementPage() {
  const [tabValue, setTabValue] = useState(0);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Trial Module Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage practice questions, learning content, mock exams, and analytics
          for the trial module
        </Typography>
      </Box>

      {/* Status Alert */}
      {status === "success" && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setStatus("idle")}
        >
          Trial content saved successfully!
        </Alert>
      )}
      {status === "error" && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setStatus("idle")}
        >
          Error saving trial content. Please try again.
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ borderRadius: 1 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="Trial module management tabs"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab
            label="Practice Section"
            id="trial-tab-0"
            aria-controls="trial-tabpanel-0"
          />
          <Tab
            label="Learning Section"
            id="trial-tab-1"
            aria-controls="trial-tabpanel-1"
          />
          <Tab
            label="Mock Exam"
            id="trial-tab-2"
            aria-controls="trial-tabpanel-2"
          />
          <Tab
            label="Analytics"
            id="trial-tab-3"
            aria-controls="trial-tabpanel-3"
          />
        </Tabs>

        {/* Tab Panels */}
        <Box sx={{ p: 3 }}>
          <TabPanel value={tabValue} index={0}>
            <TrialPracticeManager onStatusChange={setStatus} />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <TrialLearningManager onStatusChange={setStatus} />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <TrialMockExamManager onStatusChange={setStatus} />
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <TrialAnalyticsDashboard />
          </TabPanel>
        </Box>
      </Paper>
    </Box>
  );
}
