import { useState } from 'react'
import axios from 'axios'

const API_URL = 'http://localhost:8000'

function CSVUploader({ onAnalysisComplete }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    
    if (selectedFile && !selectedFile.name.endsWith('.csv')) {
      setError('Please upload a CSV file')
      setFile(null)
      return
    }
    
    setFile(selectedFile)
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!file) {
      setError('Please select a file')
      return
    }

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axios.post(`${API_URL}/analyze-batch`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      onAnalysisComplete(response.data)
      setFile(null)
      e.target.reset()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze CSV. Make sure it has a "text" column.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="analyzer-card">
      <h3>📤 CSV Upload</h3>
      <p className="hint">Upload a CSV file with a "text" column</p>
      
      <form onSubmit={handleSubmit}>
        <div className="file-input-wrapper">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={loading}
            id="csv-file"
          />
          <label htmlFor="csv-file" className="file-label">
            {file ? file.name : 'Choose CSV file...'}
          </label>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <button type="submit" disabled={loading || !file}>
          {loading ? 'Processing...' : 'Upload & Analyze'}
        </button>
      </form>

      <div className="download-sample">
        <a href="/sample_feedback.csv" download>
          📥 Download sample CSV
        </a>
      </div>
    </div>
  )
}

export default CSVUploader