import { Box, CircularProgress } from "@mui/material";

export const PageLoader = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <CircularProgress size={50} thickness={4} />
    </Box>
  );
};
