# Smart Course Recommender System

A full-stack machine learning-powered course recommendation system built with React, FastAPI, and Supabase.

## Features

- **User Authentication**: Secure registration and login with Supabase
- **Personalized Recommendations**: ML-powered course suggestions using TF-IDF and cosine similarity
- **Interactive Dashboard**: View recommendation history and statistics
- **Feedback System**: Rate courses with upvote/downvote functionality
- **Responsive Design**: Modern UI with Tailwind CSS

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Python, FastAPI, scikit-learn
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **ML**: TF-IDF Vectorization, Cosine Similarity

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- Supabase account

### 1. Clone and Setup Project

```bash
git clone <repository-url>
cd smart-course-recommender
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Install additional packages
npm add @supabase/supabase-js@latest
```

### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### 4. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API to get your keys
3. Run the database migration in the SQL editor
4. Disable email confirmation: Authentication > Settings > Email Auth > Confirm email = OFF

### 5. Environment Variables

Create a `.env` file in the root directory:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Update the `DATABASE_URL` in the backend to point to your Supabase database.

### 6. Run the Application

Terminal 1 (Frontend):
```bash
npm run dev
```

Terminal 2 (Backend):
```bash
cd backend
python main.py
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

## Usage

1. **Register/Login**: Create an account or sign in
2. **Get Recommendations**: Fill out the preference form
3. **View Results**: See your personalized course recommendations
4. **Provide Feedback**: Rate courses with thumbs up/down
5. **Dashboard**: View your recommendation history

## API Endpoints

- `POST /api/recommendations` - Get course recommendations
- `GET /api/health` - Health check
- `GET /api/courses/count` - Get total course count

## Machine Learning Model

The recommendation system uses:
- **TF-IDF Vectorization** on course descriptions
- **Cosine Similarity** to match user preferences
- **Content-based filtering** with preference-based filtering
- **Real-time processing** with caching for performance

## Database Schema

- `courses` - Course information and metadata
- `user_profiles` - User profile data
- `recommendations` - Stored recommendation history
- `feedback` - User feedback and ratings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details.