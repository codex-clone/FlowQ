# Language Test Web Application - MVP Guide

## 1. MVP Requirements & Features

### Core Features (Must-Have)
- **Language Selection**: German and English (expandable later)
- **Test Type Selection**: Reading, Writing, and Speaking for each language
- **No Authentication**: Anonymous user access
- **AI-Powered Test Generation**: Dynamic content creation based on language and test type
- **Basic Evaluation**: AI-driven scoring and feedback
- **Simple UI**: Clean, intuitive interface for test taking

### User Flow
1. User lands on homepage
2. Selects language (German/English)
3. Selects test type (Reading/Writing/Speaking)
4. Takes the test
5. Receives immediate feedback and score
6. Can retake or try different test

## 2. Technical Architecture

### Frontend Stack
- **Framework**: React.js (recommended) or Vue.js
- **Styling**: Tailwind CSS or Bootstrap
- **Audio Recording**: Web Audio API for speaking tests
- **State Management**: React Context API or Vuex

### Backend Stack
- **Language**: Node.js with Express.js or Python with FastAPI
- **Database**: SQLite (local file-based)
- **AI Integration**: OpenAI API or similar
- **File Storage**: Local filesystem for audio files

### Infrastructure
- **Deployment**: Docker containers
- **Web Server**: Nginx (optional for production)
- **Environment**: Development setup with hot reload

## 3. Database Design (SQLite)

```sql
-- Users table (anonymous users)
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Languages table
CREATE TABLE languages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Test types table
CREATE TABLE test_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- Test sessions table
CREATE TABLE test_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    language_id INTEGER,
    test_type_id INTEGER,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    score DECIMAL(5,2),
    status TEXT DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (language_id) REFERENCES languages(id),
    FOREIGN KEY (test_type_id) REFERENCES test_types(id)
);

-- Test questions table
CREATE TABLE test_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL,
    difficulty_level INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES test_sessions(id)
);

-- User responses table
CREATE TABLE user_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER,
    response_text TEXT,
    audio_file_path TEXT,
    score DECIMAL(5,2),
    feedback TEXT,
    response_time INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES test_questions(id)
);

-- AI evaluation results table
CREATE TABLE ai_evaluations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    response_id INTEGER,
    evaluation_metrics TEXT,
    confidence_score DECIMAL(5,2),
    evaluation_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (response_id) REFERENCES user_responses(id)
);
```

## 4. AI Integration Strategy

### AI Providers & APIs
1. **OpenAI API** (Recommended):
   - GPT-4 for content generation and evaluation
   - Whisper for speech-to-text (speaking tests)
   - TTS API for text-to-speech (reading prompts)

2. **Alternative Options**:
   - Google Cloud AI (Speech-to-Text, Natural Language)
   - AWS Transcribe and Comprehend
   - Microsoft Azure Cognitive Services

### AI Use Cases by Test Type

#### Reading Tests
- **Content Generation**: AI generates reading passages and comprehension questions
- **Evaluation**: AI evaluates multiple-choice and open-ended responses
- **Difficulty Adaptation**: Adjust complexity based on user performance

#### Writing Tests
- **Prompt Generation**: AI creates writing prompts based on topics and difficulty
- **Evaluation**: AI assesses grammar, vocabulary, coherence, and content relevance
- **Feedback**: Provides specific suggestions for improvement

#### Speaking Tests
- **Audio Processing**: Convert speech to text using Whisper
- **Evaluation**: Assess pronunciation, fluency, grammar, and vocabulary
- **Scoring**: Provide detailed feedback on speaking skills

## 5. API Design

### Core Endpoints

#### Authentication & Session Management
```http
POST /api/sessions
```
Response:
```json
{ "session_id": "uuid", "user_id": 123 }
```

```http
GET /api/sessions/:sessionId
```

#### Test Management
```http
POST /api/tests
```
Body:
```json
{ "language": "de", "test_type": "speaking" }
```
Response:
```json
{ "test_id": 456, "questions": [] }
```

```http
POST /api/tests/:testId/responses
```
Body:
```json
{ "question_id": 789, "response": "text or audio_file_path" }
```

```http
POST /api/tests/:testId/complete
```
Response:
```json
{ "score": 85.5, "feedback": "..." }
```

#### AI Integration Endpoints
```http
POST /api/ai/generate-content
```
Body:
```json
{ "language": "en", "test_type": "reading", "difficulty": 2 }
```
Response:
```json
{ "questions": [] }
```

```http
POST /api/ai/evaluate
```
Body:
```json
{ "question_id": 789, "response": "user response", "type": "text|audio" }
```
Response:
```json
{ "score": 8.5, "feedback": "...", "metrics": {} }
```

## 6. Implementation Roadmap

### Phase 1: Core Infrastructure (Week 1-2)
- [ ] Set up development environment
- [ ] Create SQLite database schema
- [ ] Implement basic backend API structure
- [ ] Set up OpenAI API integration
- [ ] Create basic frontend routing

### Phase 2: Reading Tests (Week 3-4)
- [ ] Implement reading test generation
- [ ] Create reading test UI components
- [ ] Implement response evaluation
- [ ] Add basic scoring and feedback

### Phase 3: Writing Tests (Week 5-6)
- [ ] Implement writing prompt generation
- [ ] Create writing test interface
- [ ] Add text evaluation capabilities
- [ ] Implement detailed feedback system

### Phase 4: Speaking Tests (Week 7-8)
- [ ] Implement audio recording functionality
- [ ] Integrate speech-to-text (Whisper)
- [ ] Create speaking test interface
- [ ] Add pronunciation and fluency evaluation

### Phase 5: Polish & Testing (Week 9-10)
- [ ] UI/UX improvements
- [ ] Performance optimization
- [ ] Error handling and edge cases
- [ ] User testing and feedback collection

## 7. Required Tools & Providers

### Development Tools
- **Code Editor**: VS Code
- **Version Control**: Git
- **Database Management**: DB Browser for SQLite
- **API Testing**: Postman or Insomnia
- **Containerization**: Docker

### External APIs & Services
- **OpenAI API**: For AI content generation and evaluation
  - Estimated cost: $0.002-0.03 per 1K tokens depending on model
  - Required: API key from OpenAI platform

### Dependencies (Package.json example)
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "sqlite3": "^5.1.6",
    "openai": "^4.0.0",
    "multer": "^1.4.5",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3"
  },
  "devDependencies": {
    "nodemon": "^2.0.22",
    "jest": "^29.5.0",
    "supertest": "^6.3.3"
  }
}
```

## 8. Cost Estimates

### Development Costs
- **Development Time**: 10 weeks (1 developer)
- **Hosting**: $5-20/month (basic VPS)
- **API Costs**: $50-200/month (depending on usage)

### OpenAI API Usage Estimates
- **Content Generation**: ~1,000 tokens per test
- **Evaluation**: ~500 tokens per response
- **Estimated Monthly Cost**: $100-500 for 1,000 tests/month

## 9. Security Considerations
- **API Key Management**: Store OpenAI API keys in environment variables
- **Data Privacy**: Anonymous user data, no PII collection
- **File Upload Security**: Validate audio file types and sizes
- **Rate Limiting**: Implement API rate limiting to prevent abuse

## 10. Scalability & Future Enhancements

### Post-MVP Features
- User authentication and profiles
- Progress tracking and history
- Multi-language support expansion
- Advanced AI evaluation models
- Mobile app development
- Real-time multiplayer testing

### Performance Optimizations
- Database indexing for faster queries
- Caching frequently used test content
- Async processing for AI evaluations
- CDN for static assets

