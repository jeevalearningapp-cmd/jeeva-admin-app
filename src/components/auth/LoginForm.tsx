import { useState } from 'react'
import { Box, TextField, Button, Typography, Alert } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context'
import logoLogin from '@/assets/logo-login.png'

export const LoginForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        maxWidth: 400,
        mx: 'auto',
        mt: 8,
        p: 3,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Box
          component="img"
          src={logoLogin}
          alt="Jeeva Logo"
          sx={{ 
            width: 210,
            height: 210,
            objectFit: 'contain'
          }}
        />
      </Box>

      <Typography variant="h4" component="h1" align="center" gutterBottom>
        Admin Login
      </Typography>

      {error && (
        <Alert severity="error">{error}</Alert>
      )}

      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        fullWidth
        autoComplete="email"
      />

      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        fullWidth
        autoComplete="current-password"
      />

      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={loading}
        fullWidth
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
    </Box>
  )
}
