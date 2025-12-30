# 🚀 BeyondChat Article Management System

**A production-ready, three-phase full-stack application** for scraping, enhancing, and managing articles with modern web technologies.

---

## 📋 Project Overview

BeyondChat is a comprehensive article management system that demonstrates modern full-stack development practices:

1. **Phase 1: Node.js Backend** - Scrapes articles from BeyondChats blogs, stores them in SQLite database, and provides RESTful APIs
2. **Phase 2: Node.js Enhancement Engine** - Fetches original articles, searches for reference content, and uses AI/LLM to enhance article quality
3. **Phase 3: React Frontend** - Beautiful, responsive UI to browse original and enhanced articles

The system automates content discovery, quality enhancement, and management—all while maintaining strict originality standards.

---

## 🛠️ Tech Stack

### Backend (Phase 1)
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: SQLite3
- **HTTP Client**: Axios
- **Scraping**: Cheerio
- **API Style**: RESTful JSON

### Enhancement Engine (Phase 2)
- **Runtime**: Node.js 18+
- **Search API**: Google Custom Search / SerpAPI (with mock fallback)
- **LLM Integration**: OpenAI, Google Gemini, Ollama, or Mock
- **Web Scraping**: Cheerio
- **HTTP Client**: Axios

### Frontend (Phase 3)
- **Framework**: React 18
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **Styling**: Modern CSS with Responsive Design
- **UI Components**: Custom components with professional styling

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     BeyondChat System                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              FRONTEND (React - Port 3000)               │   │
│  │  ┌─────────────┬─────────────┬──────────────────────┐  │   │
│  │  │  Articles   │   Detail    │    Search & Filter   │  │   │
│  │  │    List     │    Page     │                      │  │   │
│  │  └─────────────┴─────────────┴──────────────────────┘  │   │
│  └──────────────────┬───────────────────────────────────────┘   │
│                     │ Axios HTTP Calls                           │
│  ┌──────────────────▼───────────────────────────────────────┐   │
│  │        BACKEND API (Node.js Express - Port 8000)         │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │ GET /api/articles         - List all articles     │ │   │
│  │  │ GET /api/articles/:id     - Get single article   │ │   │
│  │  │ POST /api/articles        - Create article       │ │   │
│  │  │ PUT /api/articles/:id     - Update article       │ │   │
│  │  │ DELETE /api/articles/:id  - Delete article       │ │   │
│  │  │ POST /api/articles/scrape - Trigger scraping     │ │   │
│  │  │ GET /api/articles/search  - Search articles      │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │           Database (SQLite)                        │ │   │
│  │  │  ┌──────────────────────────────────────────────┐ │ │   │
│  │  │  │ articles table                               │ │ │   │
│  │  │  │ - id, title, author, published_date          │ │ │   │
│  │  │  │ - url (unique), content, excerpt             │ │ │   │
│  │  │  │ - type (original/enhanced)                   │ │ │   │
│  │  │  │ - related_article_id (foreign key)           │ │ │   │
│  │  │  │ - timestamps, image_url                      │ │ │   │
│  │  │  └──────────────────────────────────────────────┘ │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  └──────────────────┬───────────────────────────────────────┘   │
│                     │                                             │
│                     │ REST API Calls                              │
│  ┌──────────────────▼───────────────────────────────────────┐   │
│  │    ENHANCEMENT ENGINE (Node.js - Standalone)            │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │ 1. Fetch original articles from backend API       │ │   │
│  │  │ 2. Search Google for related articles             │ │   │
│  │  │ 3. Scrape reference article content               │ │   │
│  │  │ 4. Call LLM (Gemini/OpenAI/Ollama) to enhance    │ │   │
│  │  │ 5. Post enhanced article back to backend API      │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │ External Services (Optional)                       │ │   │
│  │  │ ├─ Google Search API (find references)            │ │   │
│  │  │ ├─ Google Gemini API (free LLM enhancement)       │ │   │
│  │  │ ├─ OpenAI API (GPT-3.5/4 for enhancement)         │ │   │
│  │  │ ├─ Ollama (local LLM models)                      │ │   │
│  │  │ └─ BeyondChats blog website (scrape source)       │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA FLOW OVERVIEW                        │
└─────────────────────────────────────────────────────────────┘

PHASE 1: SCRAPING & STORAGE
────────────────────────────
  BeyondChats Website
         ↓
   [Scraper Service]
    (Last page only)
         ↓
  [Find 5 oldest articles]
         ↓
 [Store in SQLite Database]
         ↓
  Articles Table
  (type = 'original')


PHASE 2: ENHANCEMENT
────────────────────
  Articles Database
  (Original Articles)
         ↓
 [Fetch via Node.js API]
         ↓
 [For each article]
   ├─ Google Search
   │    (Find 2 references)
   ├─ Scrape References
   │    (Get content)
   ├─ LLM Enhancement
   │    (Rewrite & improve)
   ├─ Add References Section
   │    (Cite sources)
   └─ POST enhanced article
         ↓
  Articles Table
  (type = 'enhanced')


PHASE 3: PRESENTATION
─────────────────────
  Articles Database
  ├─ Original Articles
  └─ Enhanced Articles
         ↓
  Node.js Express API
  (GET /api/articles)
         ↓
  React Frontend
  ├─ List View
  │   (All articles with filters)
  ├─ Detail View
  │   (Full content + references)
  └─ Search
      (Query articles)
         ↓
  Browser (User Interface)
```

---

## 🚀 Quick Start Guide

### Prerequisites

Ensure you have installed:
- **Node.js 18+** with npm
- **Git**

### 1️⃣ Phase 1: Setup Node.js Backend

```bash
# Navigate to backend
cd backend-nodejs

# Copy environment file
cp .env.example .env

# Install dependencies
npm install

# Start Express server
npm start

# API runs on http://localhost:8000
# Database (SQLite) auto-creates as articles.db
```

### 2️⃣ Phase 2: Setup Enhancement Engine

```bash
# Navigate to enhancer
cd content-enhancer

# Copy environment file
cp .env.example .env

# Update .env with API keys (optional - will use mock data)
# API_BASE_URL=http://localhost:8000/api
# LLM_PROVIDER=gemini (or: openai, ollama, mock)
# GEMINI_API_KEY=AIza...
# OPENAI_API_KEY=sk-...

# Install dependencies
npm install

# Run enhancement engine
npm start
```

### 3️⃣ Phase 3: Setup React Frontend

```bash
# Navigate to frontend
cd frontend-react

# Copy environment file
cp .env.example .env

# Update .env if needed
# VITE_API_BASE_URL=http://localhost:8000/api

# Install dependencies
npm install

# Start development server
npm run dev

# Frontend runs on http://localhost:3000
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:8000/api
```

### Endpoints

#### 📄 Get All Articles
```
GET /articles
Parameters:
  - type: 'original' | 'enhanced' (optional)
  - page: number (default: 1)
  - per_page: number (default: 15)

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Article Title",
      "author": "Author Name",
      "published_date": "2024-01-01 10:00:00",
      "original_url": "https://example.com/article",
      "content": "Article HTML content...",
      "type": "original",
      "original_article_id": null,
      "created_at": "2024-01-02 10:00:00",
      "updated_at": "2024-01-02 10:00:00"
    }
  ],
  "pagination": {
    "total": 50,
    "per_page": 15,
    "current_page": 1,
    "last_page": 4
  }
}
```

#### 📖 Get Single Article
```
GET /articles/{id}

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Article Title",
    ...
    "enhanced_versions": [...]  // if original
    "original_article": {...}   // if enhanced
  }
}
```

#### ✏️ Create Article
```
POST /articles
Content-Type: application/json

Body:
{
  "title": "New Article",
  "author": "Author Name",
  "published_date": "2024-01-01 10:00:00",
  "original_url": "https://example.com/article",
  "content": "<p>Article content...</p>",
  "type": "original",
  "original_article_id": null
}

Response: {
  "success": true,
  "message": "Article created successfully",
  "data": { ... }
}
```

#### 🔄 Update Article
```
PUT /articles/{id}
Content-Type: application/json

Body: { /* partial update fields */ }
Response: { ... }
```

#### 🗑️ Delete Article
```
DELETE /articles/{id}

Response:
{
  "success": true,
  "message": "Article deleted successfully"
}
```

#### 🔍 Search Articles
```
GET /articles/search
Parameters:
  - q: search query (required)
  - type: 'original' | 'enhanced' (optional)

Response: { ... }
```

#### 🕷️ Trigger Scraping
```
POST /articles/scrape

Response:
{
  "success": true,
  "message": "Scraping completed: X created, Y skipped",
  "data": {
    "created": 3,
    "skipped": 2,
    "articles": [...]
  }
}
```

---

## 🔄 Enhancement Workflow

### Step-by-step Process

1. **Fetch Original Articles**
   - Call: `GET /api/articles?type=original`
   - Gets all unenhanced articles from database

2. **Google Search**
   - Search for related articles using article title
   - Filters out BeyondChats domain
   - Selects top 2 relevant results

3. **Scrape Reference Articles**
   - Fetches content from reference URLs
   - Extracts headings, paragraphs, lists
   - Cleans up unwanted elements (scripts, ads)

4. **LLM Enhancement**
   - Sends original + reference content to LLM
   - Requests rewrite with improved structure
   - Ensures originality (no plagiarism)
   - Returns HTML-formatted enhanced content

5. **Add References**
   - Appends "References" section
   - Lists all source articles with URLs
   - Maintains citation standards

6. **Publish Enhanced Article**
   - `POST /api/articles` with enhanced content
   - Sets `type: 'enhanced'`
   - Links to original via `original_article_id`

---

## 🗄️ Database Schema

### Articles Table (SQLite)

```sql
CREATE TABLE articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  author TEXT,
  published_date TEXT,
  content TEXT NOT NULL,
  excerpt TEXT,
  image_url TEXT,
  type TEXT DEFAULT 'original' CHECK(type IN ('original', 'enhanced')),
  related_article_id INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (related_article_id) REFERENCES articles(id) ON DELETE CASCADE,
  INDEX idx_type (type),
  INDEX idx_published_date (published_date),
  INDEX idx_created_at (created_at)
);
```

### Key Features
- ✅ **Unique URL constraint** - No duplicate scraping
- ✅ **Self-referencing foreign key** - Link enhanced → original
- ✅ **Type constraint** - Enforce original/enhanced values
- ✅ **Timestamps** - Track creation and updates
- ✅ **SQLite database** - Zero setup, file-based storage

---

## 🎯 Key Features

### Phase 1: Backend
- ✅ Scrapes BeyondChats blogs (last page, 5 oldest articles)
- ✅ Prevents duplicate articles (unique URL constraint)
- ✅ RESTful CRUD APIs with validation
- ✅ Pagination support (15 per page default)
- ✅ Search functionality
- ✅ Soft deletes for data safety
- ✅ CORS enabled for frontend

### Phase 2: Enhancement Engine
- ✅ Google Search integration (or mock for testing)
- ✅ Content scraping from reference articles
- ✅ LLM integration (OpenAI, Gemini, Claude)
- ✅ Batch processing with configurable delays
- ✅ Automatic reference section generation
- ✅ Comprehensive logging
- ✅ Error handling and retries

### Phase 3: Frontend
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Article listing with filters
- ✅ Full-text search
- ✅ Article detail page with formatting
- ✅ Original ↔ Enhanced article linking
- ✅ Scrape trigger button
- ✅ Professional UI with modern styling
- ✅ Pagination controls

---

## 🔐 Environment Variables

### Backend (.env)
```
PORT=8000
NODE_ENV=development
DATABASE_PATH=./articles.db
API_BASE_URL=http://localhost:8000/api
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Enhancement Engine (.env)
```
API_BASE_URL=http://localhost:8000/api
LLM_PROVIDER=gemini
GEMINI_API_KEY=AIza...
OPENAI_API_KEY=sk-...
GOOGLE_SEARCH_API_KEY=...
GOOGLE_SEARCH_ENGINE_ID=...
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## 📁 Project Structure

```
BeyondChat/
│
├── backend-nodejs/
│   ├── server.js                     # Express app entry point
│   ├── db/
│   │   └── database.js               # SQLite connection & helpers
│   ├── services/
│   │   └── scraper.js                # Web scraping logic
│   ├── routes/
│   │   └── articles.js               # API endpoints (CRUD + search)
│   ├── scripts/
│   │   └── scraper.js                # Standalone scraper script
│   ├── package.json
│   └── .env.example
│
├── content-enhancer/
│   ├── index.js                      # Main orchestrator with loop
│   ├── googleSearch.js               # Google Search integration
│   ├── scraper.js                    # Web scraper for references
│   ├── llmService.js                 # LLM service (Gemini/OpenAI/Ollama)
│   ├── package.json
│   └── .env.example
│
├── frontend-react/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ArticleCard.jsx       # Article card component
│   │   │   └── Pagination.jsx        # Pagination component
│   │   ├── pages/
│   │   │   ├── ArticlesList.jsx      # List page
│   │   │   └── ArticleDetail.jsx     # Detail page
│   │   ├── services/
│   │   │   └── api.js                # Axios API client
│   │   ├── styles/
│   │   │   └── main.css              # Global styles
│   │   ├── App.jsx                   # Main app component
│   │   └── main.jsx                  # Entry point
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env.example
│
└── README.md                         # This file
```

---

## 🧪 Testing & Development

### Testing the Scraper
```bash
cd backend-nodejs

# Start the backend server
npm start

# In another terminal, test scraping endpoint
curl -X POST http://localhost:8000/api/articles/scrape

# List all articles
curl http://localhost:8000/api/articles

# Search articles
curl "http://localhost:8000/api/articles/search?q=nodejs"
```

### Testing the Enhancement Engine
```bash
cd content-enhancer

# Start the enhancement engine (runs continuously)
npm start

# Watch logs for processing progress
# Engine fetches, searches, scrapes, and enhances every 30 seconds
```

### Testing the Frontend
```bash
cd frontend-react

# Run development server with hot reload
npm run dev

# Visit http://localhost:3000
# Try filtering by type, searching, and navigating articles
```

---

## 🚨 Troubleshooting

### Backend Issues
```
❌ "CORS error in browser"
→ Check CORS_ALLOWED_ORIGINS in .env matches frontend URL

❌ "Connection refused (API unavailable)"
→ Ensure Node.js backend is running: npm start

❌ "Cannot find module 'sqlite3'"
→ Run npm install in backend-nodejs directory

❌ "Database error: cannot open database file"
→ Check DATABASE_PATH in .env and ensure directory exists

❌ "Unique constraint failed"
→ Article URL already exists; check database or restart with fresh db
```

### Enhancement Engine Issues
```
❌ "API connection failed"
→ Check API_BASE_URL in .env and ensure backend is running

❌ "LLM API error"
→ Verify LLM_PROVIDER and API keys are correct and valid

❌ "No reference articles found"
→ Check GOOGLE_SEARCH_API_KEY or let engine use mock data

❌ "Cannot connect to backend"
→ Check that backend-nodejs is running on port 8000
```

### Frontend Issues
```
❌ "Cannot GET /api/articles"
→ Check VITE_API_BASE_URL points to correct API

❌ "Page shows loading spinner forever"
→ Check browser console for network errors, ensure backend is running

❌ "Styles not loading"
→ Clear browser cache and restart: npm run dev
```

---

## 📈 Future Improvements

- [ ] User authentication & authorization
- [ ] Article versioning system
- [ ] Advanced caching (Redis)
- [ ] Real-time updates (WebSockets)
- [ ] Batch enhancement processing
- [ ] Analytics dashboard
- [ ] Export to PDF/Word
- [ ] Multi-language support
- [ ] Article templates
- [ ] Scheduled scraping (Cron jobs)
- [ ] Enhanced error monitoring
- [ ] Performance metrics
- [ ] Docker containerization
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Kubernetes deployment

---

## 📝 API Examples

### Create an Article via cURL
```bash
curl -X POST http://localhost:8000/api/articles \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My New Article",
    "author": "John Doe",
    "published_date": "2024-01-15 10:30:00",
    "original_url": "https://example.com/article",
    "content": "<p>Article content...</p>",
    "type": "original"
  }'
```

### Search Articles via cURL
```bash
curl "http://localhost:8000/api/articles/search?q=laravel&type=original"
```

### Get Enhanced Articles via JavaScript
```javascript
fetch('http://localhost:8000/api/articles?type=enhanced&page=1')
  .then(res => res.json())
  .then(data => console.log(data.data))
```

---

## 📜 License

MIT License - Feel free to use this project for learning and development.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or issues.

### Development Guidelines
- Follow PSR-12 for PHP code
- Use ES6+ for JavaScript
- Write meaningful commit messages
- Test your changes before submitting
- Update documentation

---

## 👨‍💻 Author

**BeyondChat Development Team**

---

## 📞 Support

For issues, questions, or suggestions:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Review the API documentation
3. Check environment variables
4. Review logs for error messages
5. Open an issue on GitHub

---

## 🎯 Project Checklist

- ✅ Phase 1: Node.js Express Backend with Scraping
  - ✅ Article database model (SQLite)
  - ✅ BeyondChat scraper service
  - ✅ Express REST API routes
  - ✅ CRUD operations (Create, Read, Update, Delete)
  - ✅ Search functionality
  - ✅ Input validation
  - ✅ CORS middleware
  - ✅ Error handling

- ✅ Phase 2: Node.js Enhancement Engine
  - ✅ Google Search integration (with mock fallback)
  - ✅ Web scraper for references
  - ✅ LLM service (Gemini, OpenAI, Ollama, mock)
  - ✅ Enhancement workflow orchestration
  - ✅ Reference generation and citations
  - ✅ Continuous processing loop (30s interval)
  - ✅ Comprehensive logging
  - ✅ Error handling & retries

- ✅ Phase 3: React Frontend
  - ✅ Article listing page with pagination
  - ✅ Article detail page
  - ✅ Search functionality
  - ✅ Type filtering (Original/Enhanced)
  - ✅ Responsive design (mobile/tablet/desktop)
  - ✅ Professional styling and UI
  - ✅ API integration with Axios
  - ✅ React Router navigation

- ✅ Documentation
  - ✅ Complete README with all tech details
  - ✅ Architecture diagram (all 3 phases)
  - ✅ Data flow diagram
  - ✅ API documentation
  - ✅ Troubleshooting guide
  - ✅ Setup guide and quick start
  - ✅ Setup instructions
  - ✅ Troubleshooting guide
  - ✅ .env.example files

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Status**: Production Ready ✅

