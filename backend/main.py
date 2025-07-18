import os
import json
import csv
import pandas as pd
import numpy as np
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import psycopg2
from psycopg2.extras import RealDictCursor
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Smart Course Recommender API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database configuration
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:password@localhost:5432/course_recommender')

# Request/Response models
class RecommendationRequest(BaseModel):
    user_id: str
    preferences: Dict[str, Any]

class CourseResponse(BaseModel):
    id: str
    title: str
    description: str
    platform: str
    duration: str
    skill_level: str
    type: str
    category: str
    url: str

class RecommendationResponse(BaseModel):
    course: CourseResponse
    score: float

class RecommendationsResponse(BaseModel):
    recommendations: List[RecommendationResponse]
    total_count: int

# Database connection
def get_db_connection():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        return None

# Load courses from CSV file
def load_courses() -> pd.DataFrame:
    try:
        # Try to load from database first
        conn = get_db_connection()
        if conn:
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            cursor.execute("SELECT * FROM courses")
            courses = cursor.fetchall()
            cursor.close()
            conn.close()
            
            if courses:
                df = pd.DataFrame(courses)
                logger.info(f"Loaded {len(df)} courses from database")
                return df
        
        # Fallback to CSV file
        csv_path = os.path.join(os.path.dirname(__file__), 'data', 'courses.csv')
        df = pd.read_csv(csv_path)
        df['id'] = df['id'].astype(str)  # Ensure ID is string
        logger.info(f"Loaded {len(df)} courses from database")
        return df
    except Exception as e:
        logger.error(f"Error loading courses: {e}")
        # Create a minimal dataset as fallback
        fallback_data = {
            'id': ['1', '2', '3'],
            'title': ['Python Basics', 'Web Development', 'Data Science'],
            'description': ['Learn Python programming', 'Build web applications', 'Analyze data'],
            'platform': ['Coursera', 'Udemy', 'edX'],
            'duration': ['4 weeks', '8 weeks', '6 weeks'],
            'skill_level': ['Beginner', 'Intermediate', 'Advanced'],
            'type': ['Free', 'Paid', 'Free'],
            'category': ['AI', 'Web Dev', 'Data Science'],
            'url': ['https://example.com/1', 'https://example.com/2', 'https://example.com/3']
        }
        return pd.DataFrame(fallback_data)

# Initialize TF-IDF vectorizer and course data
courses_df = None
tfidf_vectorizer = None
tfidf_matrix = None

def initialize_ml_model():
    global courses_df, tfidf_vectorizer, tfidf_matrix
    
    try:
        courses_df = load_courses()
        
        # Create TF-IDF vectorizer
        tfidf_vectorizer = TfidfVectorizer(
            max_features=5000,
            stop_words='english',
            ngram_range=(1, 2)
        )
        
        # Fit vectorizer on course descriptions
        tfidf_matrix = tfidf_vectorizer.fit_transform(courses_df['description'])
        
        logger.info("ML model initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing ML model: {e}")
        # Don't raise, allow the app to start with minimal functionality

# Initialize ML model on startup
@app.on_event("startup")
async def startup_event():
    initialize_ml_model()

def filter_courses_by_preferences(df: pd.DataFrame, preferences: Dict[str, Any]) -> pd.DataFrame:
    """Filter courses based on user preferences"""
    filtered_df = df.copy()
    
    # Filter by category
    if preferences.get('category'):
        filtered_df = filtered_df[filtered_df['category'] == preferences['category']]
    
    # Filter by skill level
    if preferences.get('skill_level'):
        filtered_df = filtered_df[filtered_df['skill_level'] == preferences['skill_level']]
    
    # Filter by course type
    if preferences.get('course_type') and preferences['course_type'] != 'Both':
        filtered_df = filtered_df[filtered_df['type'] == preferences['course_type']]
    
    # Filter by time availability (basic mapping)
    if preferences.get('time_availability'):
        if preferences['time_availability'] == 'Short Term':
            # Filter for courses with shorter durations
            duration_keywords = ['2 weeks', '3 weeks', '4 weeks', '5 weeks', '6 weeks']
            filtered_df = filtered_df[filtered_df['duration'].str.contains('|'.join(duration_keywords), case=False, na=False)]
        elif preferences['time_availability'] == 'Long Term':
            # Filter for courses with longer durations
            duration_keywords = ['8 weeks', '10 weeks', '12 weeks', '14 weeks', '16 weeks', '20 weeks']
            filtered_df = filtered_df[filtered_df['duration'].str.contains('|'.join(duration_keywords), case=False, na=False)]
    
    return filtered_df

def get_content_similarity_scores(user_query: str, filtered_indices: List[int]) -> List[tuple]:
    """Calculate content similarity scores based on user query"""
    try:
        # Transform user query using the same vectorizer
        user_tfidf = tfidf_vectorizer.transform([user_query])
        
        # Calculate cosine similarity with filtered courses
        filtered_tfidf = tfidf_matrix[filtered_indices]
        similarity_scores = cosine_similarity(user_tfidf, filtered_tfidf).flatten()
        
        # Create list of (index, score) pairs
        scored_courses = [(filtered_indices[i], similarity_scores[i]) for i in range(len(filtered_indices))]
        
        # Sort by similarity score (descending)
        scored_courses.sort(key=lambda x: x[1], reverse=True)
        
        return scored_courses
    except Exception as e:
        logger.error(f"Error calculating similarity scores: {e}")
        return []

def save_recommendations_to_db(user_id: str, recommendations: List[RecommendationResponse], preferences: Dict[str, Any]):
    """Save recommendations to database"""
    try:
        conn = get_db_connection()
        if not conn:
            logger.warning("No database connection, skipping save")
            return
            
        cursor = conn.cursor()
        
        # Delete existing recommendations for this user
        cursor.execute("DELETE FROM recommendations WHERE user_id = %s", (user_id,))
        
        # Insert new recommendations
        for rec in recommendations:
            cursor.execute("""
                INSERT INTO recommendations (user_id, course_id, preferences, score)
                VALUES (%s, %s, %s, %s)
            """, (user_id, rec.course.id, json.dumps(preferences), rec.score))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        logger.info(f"Saved {len(recommendations)} recommendations for user {user_id}")
    except Exception as e:
        logger.error(f"Error saving recommendations: {e}")
        # Don't raise exception here as recommendations can still be returned

@app.post("/api/recommendations")
async def get_recommendations(request: RecommendationRequest):
    """Get course recommendations based on user preferences"""
    try:
        if courses_df is None or tfidf_vectorizer is None:
            logger.error("ML model not initialized")
            return {"recommendations": [], "total_count": 0, "error": "ML model not initialized"}
        
        preferences = request.preferences
        
        # Filter courses based on preferences
        filtered_df = filter_courses_by_preferences(courses_df, preferences)
        
        if filtered_df.empty:
            logger.warning("No courses found matching the criteria")
            return {"recommendations": [], "total_count": 0}
        
        # Create user query from preferences
        user_query = f"{preferences.get('category', '')} {preferences.get('description', '')}"
        
        # Get filtered indices
        filtered_indices = filtered_df.index.tolist()
        
        # Calculate similarity scores
        scored_courses = get_content_similarity_scores(user_query, filtered_indices)
        
        if not scored_courses:
            # Fallback: return top courses from filtered set
            scored_courses = [(idx, 0.5) for idx in filtered_indices[:5]]
        
        # Get top 5 recommendations
        top_recommendations = scored_courses[:5]
        
        # Convert to response format
        recommendations = []
        for course_idx, score in top_recommendations:
            course_data = courses_df.iloc[course_idx]
            course = {
                "id": str(course_data['id']),
                "title": course_data['title'],
                "description": course_data['description'],
                "platform": course_data['platform'],
                "duration": course_data['duration'],
                "skill_level": course_data['skill_level'],
                "type": course_data['type'],
                "category": course_data['category'],
                "url": course_data['url']
            }
            recommendations.append({"course": course, "score": float(score)})
        
        # Save recommendations to database
        # save_recommendations_to_db(request.user_id, recommendations, preferences)
        
        return {
            "recommendations": recommendations,
            "total_count": len(recommendations)
        }
    
    except Exception as e:
        logger.error(f"Error getting recommendations: {e}")
        return {"recommendations": [], "total_count": 0, "error": str(e)}

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Smart Course Recommender API is running"}

@app.get("/api/courses/count")
async def get_course_count():
    """Get total number of courses"""
    try:
        if courses_df is not None:
            return {"count": len(courses_df)}
        else:
            return {"count": 0}
    except Exception as e:
        logger.error(f"Error getting course count: {e}")
        return {"count": 0}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)