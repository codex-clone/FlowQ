# Language Test Web Application

A fully responsive web application for practicing German and English language skills. Learners can take reading, writing, and speaking tests with AI-powered content and evaluation using their own OpenAI API keys. No authentication is required; anonymous sessions keep the experience lightweight and private.

## Features

- 🎯 **Anonymous sessions** – no sign-up required; each user receives a unique session automatically.
- 🌍 **Dual language support** – practice German (`de`) and English (`en`).
- 📝 **Three test modes** – reading comprehension, writing prompts, and speaking exercises with audio recording.
- 🤖 **Bring-your-own OpenAI key** – users supply personal API keys which are stored per-session and never shipped with the repo.
- 📊 **Detailed reporting** – AI-generated scores and feedback per question with aggregate results.
- 📱 **Responsive design** – Tailwind CSS ensures the UI adapts to mobile, tablet, and desktop screens.
- 🔔 **Toast notifications** – real-time success and error feedback across the app.
- 🎙️ **Web Audio API** – record, preview, and resubmit audio for speaking assessments.

## Project Structure

```
.
├── backend/
│   ├── package.json
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── database.ts
│   │   └── server.ts
│   ├── tsconfig.json
│   └── .env.example
├── frontend/
│   ├── package.json
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── tsconfig.json
│   └── .env.example
└── README.md
```


## Prerequisites

- Node.js 18+
- npm or pnpm
- An OpenAI API key with access to GPT-4 and Whisper endpoints

## Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/language-test-app.git
   cd language-test-app
   ```

2. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   cd ..
   ```

3. **Install frontend dependencies**

   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Configure environment variables**

   ```bash
   # backend env
   cd backend
   cp .env.example .env
   cd ..

   # frontend env
   cd frontend
   cp .env.example .env
   cd ..
   ```

5. **Run the development servers**

   ```bash
   # Terminal 1 - backend
   cd backend
   npm run dev

   # Terminal 2 - frontend
   cd frontend
   npm run dev
   ```

6. **Open the app**

   Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Workflow

1. The app automatically creates an anonymous session on first visit.
2. Navigate to **API Key Setup** to store your OpenAI key (only retained in your session).
3. Choose a language and test type on the home page and start the test.
4. Complete each question – reading and writing use text inputs, speaking uses the microphone.
5. Submit the test to receive AI-generated scores and feedback.
6. Retake the same test or switch languages/skills at any time.

## Backend Overview

- **Express + TypeScript** – REST API with structured controllers and services.
- **SQLite** – automatically provisioned with the full schema defined in `src/database.ts`.
- **OpenAI integration** – GPT-4.1 mini is used for generation and evaluation, Whisper for audio transcription.
- **Multer** – handles audio file uploads stored in the `/uploads` directory.
- **Centralized error handling** – consistent HTTP responses with contextual logging.

### Key API Endpoints

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `POST` | `/api/sessions` | Create an anonymous session. |
| `GET` | `/api/sessions/:sessionId` | Fetch session metadata. |
| `POST` | `/api/api-keys` | Store a user-provided API key. |
| `GET` | `/api/api-keys/:sessionId` | List stored API keys for a session. |
| `DELETE` | `/api/api-keys/:keyId` | Remove an API key. |
| `POST` | `/api/tests` | Start a new test run. |
| `POST` | `/api/tests/:testId/responses` | Submit an answer or audio recording. |
| `POST` | `/api/tests/:testId/complete` | Finalise the test and compute results. |
| `POST` | `/api/ai/generate-content` | Generate new test content via OpenAI. |
| `POST` | `/api/ai/evaluate` | Evaluate a specific response via OpenAI. |

## Frontend Overview

- **React + TypeScript + Vite** – fast DX with typed components.
- **React Context** – session, API key, UI state, and test management.
- **React Hook Form** – accessible validation for all forms.
- **Tailwind CSS** – responsive, mobile-first layouts.
- **React Toastify** – standardized success/error notifications.
- **Web Audio API** – record and replay microphone input for speaking prompts.

### Core UI Components

- `Header` & `Footer` – consistent layout and responsive navigation.
- `APIKeyInput` – masked input with validation, testing, and save actions.
- `ReadingTest`, `WritingTest`, `SpeakingTest` – specialized UIs per skill.
- `ProgressBar`, `Modal`, `Button` – reusable building blocks.
- `ErrorBoundary` – graceful fallback UI for uncaught exceptions.

## Database Schema

All tables are created automatically on server start:

- `users`, `languages`, `test_types`, `test_sessions`
- `test_questions`, `user_responses`, `ai_evaluations`, `user_api_keys`

Foreign keys ensure referential integrity, and default seed data enables German and English tests out of the box.

## Security & Privacy

- API keys are scoped to a session and never stored in the repository.
- Keys are persisted in SQLite for the duration of the session and removed on request.
- Client-side session IDs are stored in local storage for seamless returns.
- Audio uploads are validated for MIME type and size before being accepted.

## Testing & Quality

- TypeScript across both frontend and backend for compile-time safety.
- Centralized logging and error middleware on the backend.
- Context-driven separation of concerns on the frontend for maintainability.

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/amazing-feature`.
3. Commit changes with descriptive messages.
4. Push the branch and open a Pull Request.

## License

This project is released under the MIT License. See the LICENSE file for details.

## Support

Encountered an issue? Please open a GitHub issue with details and reproduction steps.
