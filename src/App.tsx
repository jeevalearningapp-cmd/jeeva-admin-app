import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif'
    }}>
      <h1 style={{ color: '#1976D2' }}>Jeeva Admin Portal</h1>
      <p>Welcome to the Jeeva Learning App Admin Portal</p>
      <div style={{ marginTop: '2rem' }}>
        <button 
          onClick={() => setCount((count) => count + 1)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#1976D2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Count: {count}
        </button>
      </div>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Ready for development - folder structure created!
      </p>
    </div>
  )
}

export default App
