import { useState } from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { Box, Typography, Button } from '@mui/material'
import theme from './theme'

function App() {
  const [count, setCount] = useState(0)

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default'
        }}
      >
        <Typography variant="h1" color="primary" gutterBottom>
          Jeeva Admin Portal
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Welcome to the Jeeva Learning App Admin Portal
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => setCount((count) => count + 1)}
          >
            Count: {count}
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Ready for development - folder structure created!
        </Typography>
      </Box>
    </ThemeProvider>
  )
}

export default App
