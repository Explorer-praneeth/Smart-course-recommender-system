/*
  # Smart Course Recommender System Database Schema

  1. New Tables
    - `courses`
      - `id` (uuid, primary key)
      - `title` (text, course title)
      - `description` (text, course description)
      - `platform` (text, platform name)
      - `duration` (text, course duration)
      - `skill_level` (text, skill level)
      - `type` (text, free/paid)
      - `category` (text, course category)
      - `url` (text, course URL)
      - `created_at` (timestamp)
    
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, user email)
      - `full_name` (text, user full name)
      - `created_at` (timestamp)
    
    - `recommendations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `course_id` (uuid, references courses)
      - `preferences` (jsonb, user preferences)
      - `score` (decimal, recommendation score)
      - `created_at` (timestamp)
    
    - `feedback`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `course_id` (uuid, references courses)
      - `rating` (integer, 1 for upvote, -1 for downvote)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Public read access for courses table
*/

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  platform text NOT NULL,
  duration text NOT NULL,
  skill_level text NOT NULL,
  type text NOT NULL,
  category text NOT NULL,
  url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  preferences jsonb NOT NULL,
  score decimal NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating IN (-1, 1)),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Courses are viewable by everyone"
  ON courses
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can view own recommendations"
  ON recommendations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recommendations"
  ON recommendations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own feedback"
  ON feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedback"
  ON feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own feedback"
  ON feedback
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Sample courses data
INSERT INTO courses (title, description, platform, duration, skill_level, type, category, url) VALUES
('Introduction to Machine Learning', 'Learn the fundamentals of machine learning including supervised and unsupervised learning algorithms', 'Coursera', '6 weeks', 'Beginner', 'Free', 'AI', 'https://coursera.org/ml-intro'),
('Advanced React Development', 'Master advanced React concepts including hooks, context, and performance optimization', 'Udemy', '8 weeks', 'Advanced', 'Paid', 'Web Dev', 'https://udemy.com/advanced-react'),
('Data Science with Python', 'Complete data science bootcamp covering pandas, numpy, matplotlib, and machine learning', 'edX', '12 weeks', 'Intermediate', 'Paid', 'Data Science', 'https://edx.org/python-data-science'),
('Web Development Fundamentals', 'Learn HTML, CSS, and JavaScript to build modern web applications', 'FreeCodeCamp', '10 weeks', 'Beginner', 'Free', 'Web Dev', 'https://freecodecamp.org/web-fundamentals'),
('Deep Learning Specialization', 'Comprehensive deep learning course covering neural networks, CNNs, and RNNs', 'Coursera', '16 weeks', 'Advanced', 'Paid', 'AI', 'https://coursera.org/deep-learning'),
('Python for Data Analysis', 'Learn Python programming for data analysis and visualization', 'Udacity', '8 weeks', 'Intermediate', 'Paid', 'Data Science', 'https://udacity.com/python-analysis'),
('React Native Mobile Development', 'Build cross-platform mobile apps using React Native framework', 'Pluralsight', '6 weeks', 'Intermediate', 'Paid', 'Mobile Dev', 'https://pluralsight.com/react-native'),
('Artificial Intelligence Basics', 'Introduction to AI concepts, algorithms, and applications', 'Khan Academy', '4 weeks', 'Beginner', 'Free', 'AI', 'https://khanacademy.org/ai-basics'),
('Full Stack JavaScript', 'Complete full-stack development with Node.js, Express, and MongoDB', 'The Odin Project', '20 weeks', 'Advanced', 'Free', 'Web Dev', 'https://theodinproject.com/fullstack-js'),
('Machine Learning with TensorFlow', 'Learn machine learning using TensorFlow and build real-world applications', 'Google AI', '10 weeks', 'Intermediate', 'Free', 'AI', 'https://developers.google.com/machine-learning'),
('CSS Grid and Flexbox', 'Master modern CSS layout techniques for responsive web design', 'CSS-Tricks', '4 weeks', 'Beginner', 'Free', 'Web Dev', 'https://css-tricks.com/css-grid-flexbox'),
('Data Visualization with D3.js', 'Create interactive data visualizations using D3.js library', 'Observable', '6 weeks', 'Advanced', 'Paid', 'Data Science', 'https://observablehq.com/d3-course'),
('iOS Development with Swift', 'Build native iOS applications using Swift programming language', 'Apple Developer', '12 weeks', 'Intermediate', 'Free', 'Mobile Dev', 'https://developer.apple.com/swift'),
('Cloud Computing with AWS', 'Learn Amazon Web Services for cloud infrastructure and deployment', 'AWS Training', '8 weeks', 'Intermediate', 'Paid', 'Cloud', 'https://aws.amazon.com/training'),
('Cybersecurity Fundamentals', 'Introduction to cybersecurity principles and best practices', 'Cybrary', '6 weeks', 'Beginner', 'Free', 'Security', 'https://cybrary.it/cybersecurity-fundamentals'),
('Angular Complete Guide', 'Comprehensive Angular framework course for building single-page applications', 'Udemy', '14 weeks', 'Advanced', 'Paid', 'Web Dev', 'https://udemy.com/angular-complete'),
('Statistics for Data Science', 'Statistical methods and concepts essential for data science', 'MIT OpenCourseWare', '8 weeks', 'Intermediate', 'Free', 'Data Science', 'https://ocw.mit.edu/statistics-data-science'),
('Blockchain Development', 'Learn blockchain technology and smart contract development', 'Ethereum.org', '10 weeks', 'Advanced', 'Free', 'Blockchain', 'https://ethereum.org/developers'),
('UI/UX Design Principles', 'User interface and user experience design fundamentals', 'Google UX Design', '6 weeks', 'Beginner', 'Free', 'Design', 'https://grow.google/ux-design'),
('DevOps Engineering', 'Learn DevOps practices including CI/CD, containerization, and monitoring', 'Linux Academy', '12 weeks', 'Advanced', 'Paid', 'DevOps', 'https://acloud.guru/devops'),
('Database Design and SQL', 'Relational database design and SQL programming', 'SQLBolt', '5 weeks', 'Beginner', 'Free', 'Database', 'https://sqlbolt.com'),
('Computer Vision with OpenCV', 'Image processing and computer vision using OpenCV library', 'OpenCV.org', '8 weeks', 'Intermediate', 'Free', 'AI', 'https://opencv.org/courses'),
('Microservices Architecture', 'Design and implement microservices-based applications', 'Microservices.io', '10 weeks', 'Advanced', 'Paid', 'Architecture', 'https://microservices.io/course'),
('Git and Version Control', 'Master Git version control system for collaborative development', 'Atlassian Git', '3 weeks', 'Beginner', 'Free', 'Tools', 'https://atlassian.com/git'),
('Natural Language Processing', 'Process and analyze text data using NLP techniques', 'NLTK', '12 weeks', 'Advanced', 'Paid', 'AI', 'https://nltk.org/book');