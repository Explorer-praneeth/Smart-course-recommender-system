import os
import json
import pandas as pd
import numpy as np
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Smart Course Recommender API", version="1.0.0")

# Add CORS middleware - CRITICAL for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Request model
class RecommendationRequest(BaseModel):
    interest: str
    skill: str
    duration: str
    course_type: str

# Global variables for ML model
courses_df = None
tfidf_vectorizer = None
tfidf_matrix = None

def load_courses() -> pd.DataFrame:
    """Load courses from CSV file"""
    try:
        csv_path = os.path.join(os.path.dirname(__file__), 'data', 'courses.csv')
        if not os.path.exists(csv_path):
            # Create data directory if it doesn't exist
            os.makedirs(os.path.dirname(csv_path), exist_ok=True)
            # Create sample data if CSV doesn't exist
            create_sample_dataset(csv_path)
        
        df = pd.read_csv(csv_path)
        logger.info(f"Loaded {len(df)} courses from CSV")
        return df
    except Exception as e:
        logger.error(f"Error loading courses: {e}")
        return create_fallback_dataset()

def create_sample_dataset(csv_path: str):
    """Create a sample dataset if CSV doesn't exist"""
    sample_data = {
        'title': [
            'Machine Learning Fundamentals',
            'Web Development with React',
            'Python for Data Science',
            'Advanced JavaScript',
            'Database Design',
            'Mobile App Development',
            'Cloud Computing Basics',
            'Cybersecurity Essentials',
            'UI/UX Design',
            'DevOps Fundamentals'
        ],
        'description': [
            'Learn machine learning algorithms and applications',
            'Build modern web applications with React framework',
            'Master Python for data analysis and visualization',
            'Advanced JavaScript concepts and ES6 features',
            'Design efficient databases and write complex queries',
            'Create mobile apps for iOS and Android platforms',
            'Introduction to cloud services and deployment',
            'Essential cybersecurity principles and practices',
            'User interface and user experience design principles',
            'DevOps practices and continuous integration'
        ],
        'platform': [
            'Coursera', 'Udemy', 'edX', 'Pluralsight', 'Khan Academy',
            'Udacity', 'AWS Training', 'Cybrary', 'Figma Academy', 'Docker'
        ],
        'duration': [
            '8 weeks', '6 weeks', '10 weeks', '4 weeks', '5 weeks',
            '12 weeks', '3 weeks', '7 weeks', '4 weeks', '6 weeks'
        ],
        'level': [
            'Beginner', 'Intermediate', 'Beginner', 'Advanced', 'Intermediate',
            'Intermediate', 'Beginner', 'Advanced', 'Beginner', 'Intermediate'
        ],
        'type': [
            'Free', 'Paid', 'Free', 'Paid', 'Free',
            'Paid', 'Free', 'Paid', 'Free', 'Free'
        ],
        'link': [
            'https://coursera.org/learn/machine-learning',
            'https://udemy.com/course/react-complete-guide',
            'https://edx.org/course/python-data-science',
            'https://pluralsight.com/courses/advanced-javascript',
            'https://khanacademy.org/computing/sql',
            'https://udacity.com/course/mobile-development',
            'https://aws.amazon.com/training/cloud-basics',
            'https://cybrary.it/course/cybersecurity-essentials',
            'https://figma.com/academy/ui-design',
            'https://docker.com/get-started'
        ]
    }
    
    df = pd.DataFrame(sample_data)
    df.to_csv(csv_path, index=False)
    logger.info(f"Created sample dataset with {len(df)} courses")

def create_fallback_dataset() -> pd.DataFrame:
    """Create fallback dataset if CSV loading fails"""
    fallback_data = {
        'title': ['Python Basics', 'Web Development', 'Data Science'],
        'description': ['Learn Python programming', 'Build web applications', 'Analyze data'],
        'platform': ['Coursera', 'Udemy', 'edX'],
        'duration': ['4 weeks', '8 weeks', '6 weeks'],
        'level': ['Beginner', 'Intermediate', 'Advanced'],
        'type': ['Free', 'Paid', 'Free'],
        'link': ['https://example.com/1', 'https://example.com/2', 'https://example.com/3']
    }
    return pd.DataFrame(fallback_data)

def initialize_ml_model():
    """Initialize the ML model with TF-IDF vectorizer"""
    global courses_df, tfidf_vectorizer, tfidf_matrix
    
    try:
        courses_df = load_courses()
        
        # Create TF-IDF vectorizer
        tfidf_vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 2)
        )
        
        # Fit vectorizer on course descriptions
        tfidf_matrix = tfidf_vectorizer.fit_transform(courses_df['description'])
        
        logger.info("ML model initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing ML model: {e}")

# Initialize ML model on startup
@app.on_event("startup")
async def startup_event():
    initialize_ml_model()

def filter_courses_by_preferences(df: pd.DataFrame, preferences: Dict[str, str]) -> pd.DataFrame:
    """Filter courses based on user preferences"""
    filtered_df = df.copy()
    
    # Filter by skill level
    if preferences.get('skill') and preferences['skill'] != 'Any':
        filtered_df = filtered_df[filtered_df['level'].str.lower() == preferences['skill'].lower()]
    
    # Filter by course type
    if preferences.get('course_type') and preferences['course_type'] != 'Both':
        filtered_df = filtered_df[filtered_df['type'].str.lower() == preferences['course_type'].lower()]
    
    # Filter by duration (basic mapping)
    if preferences.get('duration'):
        if preferences['duration'] == 'Short Term':
            # Filter for courses with shorter durations
            filtered_df = filtered_df[filtered_df['duration'].str.contains('2 weeks|3 weeks|4 weeks|5 weeks', case=False, na=False)]
        elif preferences['duration'] == 'Long Term':
            # Filter for courses with longer durations
            filtered_df = filtered_df[filtered_df['duration'].str.contains('8 weeks|10 weeks|12 weeks|16 weeks', case=False, na=False)]
    
    return filtered_df

@app.post("/recommend")
async def recommend_courses(request: RecommendationRequest):
    """Get course recommendations based on user preferences"""
    try:
        if courses_df is None or tfidf_vectorizer is None:
            raise HTTPException(status_code=500, detail="ML model not initialized")
        
        logger.info(f"Received recommendation request: {request}")
        
        # Create user query from preferences
        user_query = f"{request.interest} {request.skill} course"
        
        # Filter courses based on preferences
        preferences = {
            'skill': request.skill,
            'course_type': request.course_type,
            'duration': request.duration
        }
        
        filtered_df = filter_courses_by_preferences(courses_df, preferences)
        
        if filtered_df.empty:
            # If no courses match filters, use all courses
            filtered_df = courses_df.copy()
            logger.warning("No courses matched filters, using all courses")
        
        # Get indices of filtered courses
        filtered_indices = filtered_df.index.tolist()
        
        # Transform user query
        user_tfidf = tfidf_vectorizer.transform([user_query])
        
        # Calculate similarity with filtered courses
        filtered_tfidf = tfidf_matrix[filtered_indices]
        similarity_scores = cosine_similarity(user_tfidf, filtered_tfidf).flatten()
        
        # Get top 5 recommendations
        top_indices = similarity_scores.argsort()[-5:][::-1]
        
        # Build recommendations
        recommendations = []
        for idx in top_indices:
            course_idx = filtered_indices[idx]
            course = courses_df.iloc[course_idx]
            recommendations.append({
                'title': course['title'],
                'description': course['description'],
                'platform': course['platform'],
                'duration': course['duration'],
                'level': course['level'],
                'type': course['type'],
                'link': course['link'],
                'score': float(similarity_scores[idx])
            })
        
        logger.info(f"Returning {len(recommendations)} recommendations")
        return {"recommendations": recommendations}
        
    except Exception as e:
        logger.error(f"Error in recommend_courses: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "courses_loaded": len(courses_df) if courses_df is not None else 0}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)