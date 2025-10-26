import { useState } from 'react'
import './App.css'
import TextAnalyzer from './components/TextAnalyzer'
import CSVUploader from './components/CSVUploader'
import SentimentChart from './components/SentimentChart'

function App() {
  const [analysisResults, setAnalysisResults] = useState(null)
  const [filter, setFilter] = useState('all')

  const handleAnalysisComplete = (results) => {
    setAnalysisResults(results)
  }

  const getFilteredResults = () => {
    if (!analysisResults || !analysisResults.results) return []
    
    if (filter === 'all') return analysisResults.results
    
    return analysisResults.results.filter(
      result => result.sentiment === filter
    )
  }

  const filteredResults = getFilteredResults()

  return (
    <div className="app">
      <header className="header">
        <h1>🎯 AI Sentiment Analytics Tool</h1>
        <p>Analyze customer feedback with AI-powered sentiment analysis</p>
      </header>

      <div className="container">
        <div className="input-section">
          <TextAnalyzer onAnalysisComplete={handleAnalysisComplete} />
          <CSVUploader onAnalysisComplete={handleAnalysisComplete} />
        </div>

        {analysisResults && (
          <div className="results-section">
            <h2>📊 Analysis Results</h2>
            
            {/* Summary Statistics */}
            {analysisResults.summary && (
              <div className="summary">
                <div className="stat-card">
                  <span className="stat-label">Total</span>
                  <span className="stat-value">{analysisResults.summary.total}</span>
                </div>
                <div className="stat-card positive">
                  <span className="stat-label">Positive</span>
                  <span className="stat-value">{analysisResults.summary.positive}</span>
                </div>
                <div className="stat-card negative">
                  <span className="stat-label">Negative</span>
                  <span className="stat-value">{analysisResults.summary.negative}</span>
                </div>
                <div className="stat-card neutral">
                  <span className="stat-label">Neutral</span>
                  <span className="stat-value">{analysisResults.summary.neutral}</span>
                </div>
              </div>
            )}

            {/* Chart Visualization */}
            {analysisResults.summary && (
              <SentimentChart data={analysisResults.summary} />
            )}

            {/* Filter Buttons */}
            <div className="filters">
              <button 
                className={filter === 'all' ? 'active' : ''} 
                onClick={() => setFilter('all')}
              >
                All ({analysisResults.results?.length || 0})
              </button>
              <button 
                className={filter === 'positive' ? 'active' : ''} 
                onClick={() => setFilter('positive')}
              >
                Positive ({analysisResults.summary?.positive || 0})
              </button>
              <button 
                className={filter === 'negative' ? 'active' : ''} 
                onClick={() => setFilter('negative')}
              >
                Negative ({analysisResults.summary?.negative || 0})
              </button>
              <button 
                className={filter === 'neutral' ? 'active' : ''} 
                onClick={() => setFilter('neutral')}
              >
                Neutral ({analysisResults.summary?.neutral || 0})
              </button>
            </div>

            {/* Results List */}
            <div className="results-list">
              {filteredResults.map((result, index) => (
                <div key={index} className={`result-item ${result.sentiment}`}>
                  <div className="result-header">
                    <span className={`badge ${result.sentiment}`}>
                      {result.sentiment}
                    </span>
                    <span className="polarity">
                      Polarity: {result.polarity}
                    </span>
                  </div>
                  <p className="result-text">{result.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="footer">
        <p>Built with React + FastAPI | Powered by TextBlob</p>
      </footer>
    </div>
  )
}

export default App