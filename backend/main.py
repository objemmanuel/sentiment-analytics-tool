from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from textblob import TextBlob
import pandas as pd
import io
from typing import List

app = FastAPI(title="Sentiment Analytics API")

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://sentiment-analytics-tool.vercel.app/", 
        "https://*.vercel.app",  # Allow all Vercel deployments
        "*"  # Remove this in production and specify exact URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TextInput(BaseModel):
    text: str

class SentimentResult(BaseModel):
    text: str
    sentiment: str
    polarity: float
    subjectivity: float

def analyze_sentiment(text: str) -> dict:
    """Analyze sentiment using TextBlob"""
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity
    
    # Classify sentiment
    if polarity > 0.1:
        sentiment = "positive"
    elif polarity < -0.1:
        sentiment = "negative"
    else:
        sentiment = "neutral"
    
    return {
        "text": text,
        "sentiment": sentiment,
        "polarity": round(polarity, 3),
        "subjectivity": round(blob.sentiment.subjectivity, 3)
    }

@app.get("/")
def read_root():
    return {
        "message": "Welcome to Sentiment Analytics API",
        "endpoints": {
            "/analyze": "POST - Analyze single text",
            "/analyze-batch": "POST - Upload CSV file",
            "/health": "GET - Health check"
        }
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/analyze", response_model=SentimentResult)
def analyze_text(input_data: TextInput):
    """Analyze sentiment of a single text"""
    if not input_data.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    result = analyze_sentiment(input_data.text)
    return result

@app.post("/analyze-batch")
async def analyze_csv(file: UploadFile = File(...)):
    """Analyze sentiment from CSV file"""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    
    try:
        # Read CSV file
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        # Check if 'text' column exists
        if 'text' not in df.columns:
            raise HTTPException(
                status_code=400, 
                detail="CSV must have a 'text' column"
            )
        
        # Analyze each row
        results = []
        for idx, row in df.iterrows():
            text = str(row['text'])
            if text.strip():
                analysis = analyze_sentiment(text)
                results.append(analysis)
        
        # Calculate summary statistics
        sentiments = [r['sentiment'] for r in results]
        summary = {
            "total": len(results),
            "positive": sentiments.count("positive"),
            "negative": sentiments.count("negative"),
            "neutral": sentiments.count("neutral")
        }
        
        return {
            "summary": summary,
            "results": results
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)