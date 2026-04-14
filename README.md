# ResumeForge

ResumeForge is an AI-assisted resume tailoring app that helps you build one structured master profile and generate job-specific, ATS-friendly LaTeX resumes from it.

Instead of sending your entire profile to the model every time, ResumeForge uses a token-efficient flow:

- Your static profile data is stored in MongoDB
- Only lightweight, job-relevant profile context is sent to the AI
- The AI returns structured JSON with a tailored summary, selected projects, certifications, and curated skills
- The backend merges that output into a reusable LaTeX resume template

The result is a fast workflow for creating targeted `.tex` resumes you can paste into Overleaf or compile with your preferred LaTeX toolchain.

## Features

- AI-powered resume tailoring from a pasted job description
- Support for multiple knowledge profiles such as Full Stack, Data Science, AI/ML, Backend, and more
- Structured profile builder for personal info, education, experience, projects, skills, and certifications
- Resume history with saved job descriptions, AI selections, LaTeX output, and profile snapshots
- One-click copy or download of generated `.tex` files
- Ability to restore older profile snapshots from resume history
- Dual AI provider support:
  - `ollama` for local models
  - `gemini` for Google Gemini API
- Dockerized production setup with Node + MongoDB

## Tech Stack

- Frontend: React, React Router, Axios, CSS
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- AI Providers: Ollama or Google Gemini
- Output Format: LaTeX
- Containerization: Docker, Docker Compose

## How It Works

1. Fill in your master profile on the Profile page.
2. Paste a job description into the Builder page.
3. The backend sends a lightweight subset of your data to the AI provider.
4. The AI returns structured JSON with:
   - `professional_summary`
   - curated `skills`
   - `selected_projects`
   - `selected_certifications`
5. The backend combines that JSON with your stored profile to generate a full LaTeX resume.
6. The generated resume is saved to history for reuse and comparison.

## Product Flow

### Home

The landing page introduces the app, explains the workflow, and links users to the Profile and Builder pages.

### Profile

The Profile page lets users manage:

- Personal information
- Knowledge profiles
- Education
- Experience
- Projects
- Skills
- Certifications
- Resume history

This data is stored as a single user document in MongoDB.

### Builder

The Builder page accepts a job description and:

- validates it
- calls the resume generation API
- displays AI insights
- shows the generated LaTeX output
- supports copying or downloading the `.tex` file

### History

Every generated resume stores:

- the original job description
- the AI-selected JSON
- the final LaTeX
- a snapshot of the profile used at generation time

Only the latest 20 generated resumes are retained.

## Architecture

### Frontend

The React app contains three main routes:

- `/`
- `/profile`
- `/builder`

The frontend uses Axios to call the backend API through `REACT_APP_API_URL` or same-origin `/api`.

### Backend

The Express server:

- connects to MongoDB
- exposes profile and resume generation endpoints
- selects an AI provider based on environment variables
- generates LaTeX from structured AI output
- serves the React production build in Docker/production mode

### Data Model

The main `User` document stores:

- `personalInfo`
- `profiles`
- `education`
- `experience`
- `projects`
- `skills`
- `certifications`
- `generatedResumes`
- `isSeeded`

## Project Structure

```text
ResumeForge/
├── client/                  # React frontend
│   └── src/
│       ├── components/
│       ├── pages/
│       └── services/
├── server/                  # Express backend
│   ├── config/
│   ├── models/
│   ├── routes/
│   └── services/
├── Dockerfile
├── docker-compose.yml
├── package.json
└── .env
```

## Environment Variables

Create a `.env` file in the project root.

```env
MONGO_URI=mongodb://localhost:27017/resume-builder
PORT=5000

AI_PROVIDER=ollama

OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma3:12b

GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL=gemini-2.5-flash
```

### Variable Reference

| Variable | Required | Description |
| --- | --- | --- |
| `MONGO_URI` | Yes | MongoDB connection string |
| `PORT` | No | Backend port, defaults to `5000` |
| `AI_PROVIDER` | Yes | `ollama` or `gemini` |
| `OLLAMA_BASE_URL` | Required for Ollama | Base URL for local Ollama server |
| `OLLAMA_MODEL` | Required for Ollama | Ollama model name |
| `GEMINI_API_KEY` | Required for Gemini | Google Gemini API key |
| `GEMINI_MODEL` | No | Gemini model name |
| `REACT_APP_API_URL` | No | Frontend API base URL, defaults to `/api` |
| `DOCKER_OLLAMA_BASE_URL` | No | Docker-only Ollama URL override, defaults to `http://host.docker.internal:11434` |

## Running Locally

### Prerequisites

- Node.js
- npm
- MongoDB running locally or remotely
- Either:
  - Ollama running locally with a pulled model
  - or a valid Gemini API key

### Install Dependencies

```bash
npm install
cd client && npm install
```

### Start the App

From the project root:

```bash
npm run dev
```

This starts:

- backend on `http://localhost:5000`
- frontend on `http://localhost:3000`

### Seed Sample Data

If you want starter data in MongoDB:

```bash
npm run seed
```

## Running with Docker

The Docker setup runs:

- `app` on port `5000`
- `mongo` on port `27017`

Start everything with:

```bash
docker compose up --build
```

Then open:

```text
http://localhost:5000
```

### Docker Notes

- In production/Docker, Express serves the built React app.
- The compose setup overrides `MONGO_URI` to use the internal Mongo service.
- If you use Ollama on your host machine, Docker defaults to:

```text
http://host.docker.internal:11434
```

- To override that for Docker, set:

```env
DOCKER_OLLAMA_BASE_URL=http://your-ollama-host:11434
```

## API Endpoints

### `GET /api/user`

Returns the latest user document.

Behavior:

- returns real saved user data if available
- returns a dummy in-memory template if the database is empty

### `POST /api/user`

Creates or updates the current user profile.

Request body includes:

- `personalInfo`
- `profiles`
- `education`
- `experience`
- `projects`
- `skills`
- `certifications`

### `PATCH /api/user`

Partially updates the current user.

### `POST /api/generate`

Generates a tailored resume from a job description.

Request:

```json
{
  "jd": "Full job description text here"
}
```

Response:

```json
{
  "latex": "full latex string",
  "aiJson": {
    "professional_summary": "Tailored summary",
    "skills": {},
    "selected_projects": [],
    "selected_certifications": []
  }
}
```

Rules:

- `jd` must be at least 20 characters
- the user must save a profile before generating a resume

### `DELETE /api/resume/:resumeId`

Deletes one generated resume from history.

## AI Provider Behavior

ResumeForge supports two provider modes.

### Ollama

Use this for local inference.

```env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma3:12b
```

### Gemini

Use this for Google-hosted inference.

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL=gemini-2.5-flash
```

## Output

The app currently generates LaTeX, not PDFs directly.

After generation you can:

- copy the LaTeX into Overleaf
- download the `.tex` file
- compile it using your own LaTeX workflow

## Important Behavior and Notes

- The backend is designed to be token-efficient by sending lightweight user context to the AI instead of the full profile.
- Generated resumes are stored with their original job descriptions and snapshots of the source profile.
- The frontend uses same-origin `/api` by default, which works cleanly in Docker and production.
- The app assumes a single active user document rather than a full multi-user authentication system.

## Known Limitations

- No authentication or user accounts yet
- No direct PDF compilation inside the app yet
- Only one active user profile document is managed at a time
- Resume output quality depends on the AI provider and the quality of your profile data
- On Windows, Create React App / Webpack may fail if the project path contains `!` characters, such as `!! COMPLETED !!`

## Future Improvements

- Add authentication and multi-user support
- Add PDF compilation and download inside the app
- Add multiple LaTeX templates
- Add resume scoring or keyword coverage analysis
- Add export/import for profile data
- Add tests for API routes and core resume generation logic

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Run backend and frontend together |
| `npm run server` | Run backend with nodemon |
| `npm run client` | Run frontend |
| `npm run build` | Build the React frontend |
| `npm start` | Start the production Node server |
| `npm run seed` | Seed sample profile data |

## Key Files

- [server/server.js](./server/server.js) - Express entry point and production static serving
- [server/routes/api.js](./server/routes/api.js) - Profile and resume generation endpoints
- [server/services/gemini.js](./server/services/gemini.js) - AI provider selection and prompt pipeline
- [server/services/latexBuilder.js](./server/services/latexBuilder.js) - LaTeX document generation
- [server/models/User.js](./server/models/User.js) - MongoDB schema
- [server/seed.js](./server/seed.js) - Sample data seeding
- [client/src/pages/Profile.jsx](./client/src/pages/Profile.jsx) - Profile builder UI
- [client/src/pages/Builder.jsx](./client/src/pages/Builder.jsx) - Resume generation UI
- [client/src/components/PreviousResumes.jsx](./client/src/components/PreviousResumes.jsx) - Resume history UI
- [Dockerfile](./Dockerfile) - Production image build
- [docker-compose.yml](./docker-compose.yml) - App + Mongo orchestration

## License

This project currently uses the `ISC` license in package metadata.
