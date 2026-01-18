import { useState } from "react";
import { Box, TextField, Button, Typography, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context";
import logoLogin from "@/assets/logo-login.png";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        maxWidth: 440,
        width: "100%",
        mx: "auto",
        mt: { xs: 4, sm: 8 },
        p: { xs: 3, sm: 4 },
        bgcolor: "background.paper",
        borderRadius: 3,
        boxShadow: (mode) =>
          mode.palette.mode === "light"
            ? "0 4px 20px rgba(0, 0, 0, 0.08)"
            : "0 4px 20px rgba(0, 0, 0, 0.3)",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
        <Box
          component="img"
          src={logoLogin}
          alt="Jeeva Logo"
          sx={{
            width: 210,
            height: 210,
            objectFit: "contain",
          }}
        />
      </Box>

      <Typography
        variant="h4"
        component="h1"
        align="center"
        sx={{
          mb: 4,
          fontWeight: 600,
          fontSize: { xs: "1.75rem", sm: "2rem" },
        }}
      >
        Admin Login
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        fullWidth
        autoComplete="email"
        sx={{ mb: 2.5 }}
      />

      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        fullWidth
        autoComplete="current-password"
        sx={{ mb: 3 }}
      />

      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={loading}
        fullWidth
        size="large"
        sx={{
          py: 1.5,
          fontSize: "1rem",
          fontWeight: 600,
          mb: 2,
        }}
      >
        {loading ? "Signing in..." : "Sign In"}
      </Button>
    </Box>
  );
};
