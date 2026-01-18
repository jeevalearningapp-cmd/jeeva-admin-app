import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Tooltip,
  Button,
} from "@mui/material";
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  VisibilityOutlined,
  AddOutlined,
} from "@mui/icons-material";
import { supabase } from "@/lib/supabase";

interface PracticeQuestion {
  id: string;
  category: string;
  subdivision: string;
  question_text: string;
  question_type: "multiple_choice" | "true_false";
  difficulty: "easy" | "medium" | "hard";
  points: number;
  explanation?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PracticeQuestionListProps {
  category: string;
  subdivision: string;
  onEdit: (question: PracticeQuestion) => void;
  onDelete: (questionId: string) => void;
  onCreate: () => void;
  refreshTrigger?: number;
}

export const PracticeQuestionList: React.FC<PracticeQuestionListProps> = ({
  category,
  subdivision,
  onEdit,
  onDelete,
  onCreate,
  refreshTrigger,
}) => {
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<
    PracticeQuestion[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (category && subdivision) {
      fetchQuestions();
    }
  }, [category, subdivision, refreshTrigger]);

  useEffect(() => {
    applyFilters();
  }, [questions, searchQuery, difficultyFilter, statusFilter]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("practice_questions")
        .select("*")
        .eq("category", category)
        .eq("subdivision", subdivision)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setQuestions(data || []);
    } catch (err) {
      console.error("Error fetching practice questions:", err);
      setError("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...questions];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (q) =>
          q.question_text.toLowerCase().includes(query) ||
          (q.explanation && q.explanation.toLowerCase().includes(query)),
      );
    }

    // Difficulty filter
    if (difficultyFilter !== "all") {
      filtered = filtered.filter((q) => q.difficulty === difficultyFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      filtered = filtered.filter((q) => q.is_active === isActive);
    }

    setFilteredQuestions(filtered);
    setPage(0); // Reset to first page when filters change
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "success";
      case "medium":
        return "warning";
      case "hard":
        return "error";
      default:
        return "default";
    }
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const paginatedQuestions = filteredQuestions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header with Create Button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h6">Questions for {subdivision}</Typography>
        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          onClick={onCreate}
        >
          Create Question
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{ flexGrow: 1, minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              label="Difficulty"
            >
              <MenuItem value="all">All Difficulties</MenuItem>
              <MenuItem value="easy">Easy</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="hard">Hard</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box
          sx={{
            mt: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Showing {filteredQuestions.length} of {questions.length} questions
          </Typography>
        </Box>
      </Paper>

      {/* Questions Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Question</TableCell>
              <TableCell align="center">Type</TableCell>
              <TableCell align="center">Difficulty</TableCell>
              <TableCell align="center">Points</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedQuestions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No questions found. Create your first question to get
                    started.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedQuestions.map((question) => (
                <TableRow key={question.id} hover>
                  <TableCell>
                    <Tooltip title={question.question_text}>
                      <Typography variant="body2">
                        {truncateText(question.question_text)}
                      </Typography>
                    </Tooltip>
                    {question.image_url && (
                      <Chip
                        label="Has Image"
                        size="small"
                        sx={{ mt: 0.5 }}
                        icon={<VisibilityOutlined />}
                      />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={
                        question.question_type === "multiple_choice"
                          ? "MCQ"
                          : "T/F"
                      }
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={question.difficulty}
                      size="small"
                      color={getDifficultyColor(question.difficulty)}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">{question.points}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={question.is_active ? "Active" : "Inactive"}
                      size="small"
                      color={question.is_active ? "success" : "default"}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => onEdit(question)}
                        color="primary"
                      >
                        <EditOutlined />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => onDelete(question.id)}
                        color="error"
                      >
                        <DeleteOutlined />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredQuestions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
};
