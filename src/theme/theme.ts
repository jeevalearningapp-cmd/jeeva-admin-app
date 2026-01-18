import { createTheme, PaletteMode } from "@mui/material/styles";

export const getTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: "#007aff",
        light: "#3395ff",
        dark: "#0051d5",
      },
      secondary: {
        main: "#181C32",
        light: "#2C3142",
        dark: "#0F1119",
      },
      background:
        mode === "light"
          ? {
              default: "#F5F5F5",
              paper: "#FFFFFF",
            }
          : {
              default: "#0F1119",
              paper: "#181C32",
            },
      success: {
        main: "#4CAF50",
      },
      error: {
        main: "#D32F2F",
      },
      warning: {
        main: "#F9A825",
      },
      info: {
        main: "#0288D1",
      },
      divider: mode === "light" ? "#C1C7D0" : "#2C3142",
      text:
        mode === "light"
          ? {
              primary: "#181C32",
              secondary: "#545454",
              disabled: "#C1C7D0",
            }
          : {
              primary: "#FFFFFF",
              secondary: "#B0B0B0",
              disabled: "#545454",
            },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
      fontWeightRegular: 400,
      fontWeightMedium: 500,
      fontWeightBold: 700,
      h1: {
        fontSize: "2rem",
        fontWeight: 700,
      },
      h4: {
        fontSize: "1.5rem",
        fontWeight: 700,
        letterSpacing: "-0.02em",
      },
      h5: {
        fontSize: "1.125rem",
        fontWeight: 600,
      },
      h6: {
        fontSize: "1rem",
        fontWeight: 600,
      },
      body1: {
        fontSize: "0.9375rem",
      },
      body2: {
        fontSize: "0.875rem",
      },
      button: {
        fontWeight: 600,
        letterSpacing: 0.3,
        textTransform: "none",
        fontSize: "0.9375rem",
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
          contained: {
            boxShadow: "none",
            "&:hover": {
              boxShadow: "none",
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            border:
              mode === "light" ? "1px solid #E5E7EB" : "1px solid #2C3142",
            backgroundColor: mode === "light" ? "#FFFFFF" : "#181C32",
            boxShadow:
              mode === "light"
                ? "0px 2px 8px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.04)"
                : "0px 2px 8px rgba(0, 0, 0, 0.4), 0px 1px 3px rgba(0, 0, 0, 0.3)",
            transition:
              "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow:
                mode === "light"
                  ? "0px 4px 16px rgba(0, 0, 0, 0.1), 0px 2px 6px rgba(0, 0, 0, 0.06)"
                  : "0px 4px 16px rgba(0, 0, 0, 0.5), 0px 2px 6px rgba(0, 0, 0, 0.4)",
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            border:
              mode === "light" ? "1px solid #E5E7EB" : "1px solid #2C3142",
            backgroundColor: mode === "light" ? "#FFFFFF" : "#181C32",
            boxShadow:
              mode === "light"
                ? "0px 1px 4px rgba(0, 0, 0, 0.05)"
                : "0px 1px 4px rgba(0, 0, 0, 0.3)",
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 8,
            },
            "& .MuiOutlinedInput-input": {
              padding: "10px 14px",
            },
            "& .MuiInputLabel-outlined": {
              transform: "translate(14px, 11px) scale(1)",
              "&.MuiInputLabel-shrink": {
                transform: "translate(14px, -9px) scale(0.75)",
              },
            },
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight:
              mode === "light" ? "1px solid #C1C7D0" : "1px solid #2C3142",
            backgroundImage:
              mode === "light"
                ? "linear-gradient(to right, #FFFFFF, #FAFBFC)"
                : "linear-gradient(to right, #1E2139, #181C32)",
            boxShadow:
              mode === "light"
                ? "4px 0px 16px rgba(0, 0, 0, 0.08)"
                : "4px 0px 16px rgba(0, 0, 0, 0.4)",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow:
              mode === "light"
                ? "0px 1px 3px rgba(0, 0, 0, 0.08)"
                : "0px 1px 3px rgba(0, 0, 0, 0.4)",
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 8,
            boxShadow:
              mode === "light"
                ? "0px 8px 32px rgba(0, 0, 0, 0.12), 0px 2px 8px rgba(0, 0, 0, 0.08)"
                : "0px 8px 32px rgba(0, 0, 0, 0.6), 0px 2px 8px rgba(0, 0, 0, 0.4)",
            backgroundImage:
              mode === "light"
                ? "linear-gradient(to bottom, #FFFFFF, #FAFBFC)"
                : "linear-gradient(to bottom, #1E2139, #181C32)",
          },
        },
      },
      MuiBackdrop: {
        styleOverrides: {
          root: {
            backgroundColor:
              mode === "light" ? "rgba(0, 0, 0, 0.4)" : "rgba(0, 0, 0, 0.7)",
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            fontSize: "1.125rem",
            fontWeight: 600,
            padding: "16px 24px",
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: {
            fontSize: "0.9375rem",
            padding: "20px 24px",
          },
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: {
            padding: "12px 24px",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-notchedOutline": {
              borderRadius: 8,
            },
          },
          select: {
            padding: "10px 14px",
          },
        },
      },
      MuiAutocomplete: {
        styleOverrides: {
          inputRoot: {
            padding: "4px !important",
            "& .MuiOutlinedInput-input": {
              padding: "6px 14px !important",
            },
          },
        },
      },
    },
    transitions: {
      duration: {
        shortest: 150,
        shorter: 200,
        short: 250,
        standard: 300,
        complex: 375,
        enteringScreen: 225,
        leavingScreen: 195,
      },
    },
  });

export default getTheme("light");
