import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { 
      main: '#1976D2' 
    },
    secondary: { 
      main: '#181C32' 
    },
    background: { 
      default: '#F5F5F5', 
      paper: '#FFFFFF' 
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
    divider: '#C1C7D0',
    text: {
      primary: '#181C32',
      secondary: '#545454',
      disabled: '#C1C7D0'
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
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
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
    }
  }
});

export default theme;
