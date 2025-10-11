import { useEffect } from 'react'
import { Box, Fade } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import logoHeader from '@/assets/logo-header.png'

export const SplashScreen: React.FC = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login')
    }, 2500)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Fade in={true} timeout={800}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            animation: 'popOut 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            '@keyframes popOut': {
              '0%': {
                transform: 'scale(0.3)',
                opacity: 0,
              },
              '50%': {
                transform: 'scale(1.1)',
              },
              '100%': {
                transform: 'scale(1)',
                opacity: 1,
              },
            },
          }}
        >
          <Box
            component="img"
            src={logoHeader}
            alt="Jeeva Logo"
            sx={{
              width: 120,
              height: 120,
            }}
          />
        </Box>
      </Fade>
    </Box>
  )
}
