import { useState } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function TextAnalyzer({ onAnalysisComplete }) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!text.trim()) {
      setError('Please enter some text to analyze')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await axios.post(`${API_URL}/analyze`, {
        text: text
      })

      // Format response to match batch format
      onAnalysisComplete({
        summary: {
          total: 1,
          positive: response.data.sentiment === 'positive' ? 1 : 0,
          negative: response.data.sentiment === 'negative' ? 1 : 0,
          neutral: response.data.sentiment === 'neutral' ? 1 : 0
        },
        results: [response.data]
      })

      setText('')
    } catch (err) {
      setError('Failed to analyze text. Make sure the backend is running.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="analyzer-card">
      <h3>📝 Text Analysis</h3>
      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to analyze sentiment... 
          
Example: 'This product is amazing!' or 'I'm disappointed with the service.'"
          rows="5"
          disabled={loading}
        />
        
        {error && <div className="error-message">{error}</div>}
        
        <button type="submit" disabled={loading || !text.trim()}>
          {loading ? 'Analyzing...' : 'Analyze Sentiment'}
        </button>
      </form>
    </div>
  )
}

export default TextAnalyzer