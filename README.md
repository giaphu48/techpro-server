# TechPro Server

Backend server for the TechPro application. Built with Node.js, Express, MongoDB, and ChromaDB for vector storage and AI capabilities.

## Features

- **User Management**: Authentication, registration, and user profiles using JWT.
- **Product Management**: API for handling products.
- **AI Chatbot**: Integrated conversational AI using OpenAI.
- **Vector Search**: Semantic search and synchronization using ChromaDB and OpenAI Embeddings.

## Prerequisites

- Node.js (v18 or higher recommended)
- MongoDB
- Docker (for running ChromaDB)
- OpenAI API Key

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd techpro-server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start ChromaDB (Vector Database):**
   ```bash
   docker-compose up -d
   ```

## Running the Application

- **Development Mode** (with hot-reload using Nodemon):
  ```bash
  npm run dev
  ```

- **Production Mode**:
  ```bash
  npm start
  ```
  
  The server will start on `http://localhost:8080` (or the port specified in `.env`).

## Project Structure

```text
techpro-server/
├── src/
│   ├── configs/      # Database and ChromaDB configurations
│   ├── controllers/  # Request handlers for routes
│   ├── middlewares/  # Express middlewares (e.g., authentication)
│   ├── models/       # Mongoose schemas (User, Product, ChatSession)
│   ├── routes/       # API route definitions
│   ├── utils/        # Utility functions
│   └── server.js     # Entry point of the application
├── docker-compose.yml # ChromaDB service configuration
└── package.json      # Project metadata and dependencies
```

## API Endpoints

- **Users**: `/api/users` - User authentication and management.
- **Products**: `/api/products` - Product operations.
- **Chat**: `/api/chat` - Interact with the AI chatbot.
- **Sync**: `/api/sync` - Sync data with the vector database.
