import { createTheme, PaletteMode } from '@mui/material/styles';

export const getTheme = (mode: PaletteMode) => createTheme({
  palette: {
    mode,
    primary: { 
      main: '#007aff',
      light: '#3395ff',
      dark: '#0051d5',
    },
    secondary: { 
      main: '#181C32',
      light: '#2C3142',
      dark: '#0F1119',
    },
    background: mode === 'light' 
      ? { 
          default: '#F5F5F5', 
          paper: '#FFFFFF' 
        }
      : {
          default: '#0F1119',
          paper: '#181C32',
        },
    success: { 
      main: '#4CAF50' 
    },
    error: { 
      main: '#D32F2F' 
    },
    warning: { 
      main: '#F9A825' 
    },
    info: { 
      main: '#0288D1' 
    },
    divider: mode === 'light' ? '#C1C7D0' : '#2C3142',
    text: mode === 'light'
      ? {
          primary: '#181C32',
          secondary: '#545454',
          disabled: '#C1C7D0'
        }
      : {
          primary: '#FFFFFF',
          secondary: '#B0B0B0',
          disabled: '#545454'
        }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontSize: '2rem',
      fontWeight: 700
    },
    body1: {
      fontSize: '1rem'
    },
    button: {
      fontWeight: 700,
      letterSpacing: 0.5,
      textTransform: 'none'
    }
  },
  shape: { 
    borderRadius: 8 
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: mode === 'light' 
            ? '0px 2px 4px rgba(0, 0, 0, 0.05)'
            : '0px 2px 4px rgba(0, 0, 0, 0.3)',
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          }
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: mode === 'light' ? '1px solid #C1C7D0' : '1px solid #2C3142',
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: mode === 'light' 
            ? '0px 1px 3px rgba(0, 0, 0, 0.08)'
            : '0px 1px 3px rgba(0, 0, 0, 0.4)',
        }
      }
    }
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

export default getTheme('light');
