import { ThemeProvider, CssBaseline } from '@mui/material'
import { Box, Typography, Button, CircularProgress } from '@mui/material'
import theme from './theme'
import { AuthProvider, useAuth } from './context'
import { LoginForm } from './components/auth/LoginForm'

function AppContent() {
  const { user, adminUser, loading, logout } = useAuth()

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default'
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (!user || !adminUser) {
    return <LoginForm />
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 3
      }}
    >
      <Typography variant="h1" color="primary" gutterBottom>
        Jeeva Admin Portal
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Welcome, {adminUser.email}!
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Role: <strong>{adminUser.role}</strong>
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Button 
          variant="contained" 
          color="primary"
          onClick={logout}
        >
          Logout
        </Button>
      </Box>
    </Box>
  )
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
