# BeyondChat Backend (Phase 1)

Node.js Express-based backend that scrapes articles from BeyondChat blogs and provides RESTful CRUD APIs.

## Features

- ✅ Scrapes 5 oldest articles from BeyondChat blogs last page
- ✅ Stores articles in SQLite database
- ✅ RESTful CRUD APIs for article management
- ✅ Search functionality
- ✅ Pagination support
- ✅ Support for original and enhanced articles
- ✅ Links original to enhanced articles

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: SQLite3
- **HTTP Client**: Axios
- **Web Scraping**: Cheerio
- **Environment**: dotenv

## Installation

1. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running

### Start the server:
```bash
npm start
```

The server will run on `http://localhost:8000`

### Start with auto-reload (development):
```bash
npm run dev
```

### Run scraper manually:
```bash
npm run scrape
```

## API Endpoints

### Get All Articles
```
GET /api/articles?page=1&limit=10&type=original
```

Query Parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `type` - Filter by type: `original` or `enhanced` (optional)

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "url": "https://beyondchats.com/blogs/...",
      "title": "Article Title",
      "author": "Author Name",
      "content": "HTML content...",
      "excerpt": "Short excerpt...",
      "image_url": "https://...",
      "type": "original",
      "related_article_id": null,
      "created_at": "2024-01-01T00:00:00.000Z",
      "published_date": "2023-12-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

### Get Single Article
```
GET /api/articles/:id
```

### Create Article
```
POST /api/articles
Content-Type: application/json

{
  "url": "https://example.com/article",
  "title": "Article Title",
  "author": "Author Name",
  "content": "HTML content...",
  "excerpt": "Short excerpt...",
  "imageUrl": "https://...",
  "type": "enhanced",
  "relatedArticleId": 1,
  "publishedDate": "2024-01-01T00:00:00.000Z"
}
```

### Update Article
```
PUT /api/articles/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content...",
  "author": "New Author"
}
```

### Delete Article
```
DELETE /api/articles/:id
```

### Search Articles
```
GET /api/articles/search?q=keyword
```

### Trigger Scraper
```
POST /api/articles/scrape
```

Returns:
```json
{
  "success": true,
  "message": "Scraping started. Check console for progress."
}
```

### Health Check
```
GET /api/health
```

## Database Schema

### articles table
```sql
CREATE TABLE articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  author TEXT,
  content TEXT,
  excerpt TEXT,
  image_url TEXT,
  type TEXT DEFAULT 'original',
  related_article_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  published_date TEXT,
  FOREIGN KEY (related_article_id) REFERENCES articles(id)
)
```

### Fields

- `id` - Unique article identifier
- `url` - Unique article source URL
- `title` - Article title
- `author` - Author name
- `content` - Full HTML content
- `excerpt` - Short excerpt (200 chars)
- `image_url` - Featured image URL
- `type` - `original` or `enhanced`
- `related_article_id` - Links enhanced articles to originals
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp
- `published_date` - Original publication date

## Scraping Logic

The scraper:
1. Finds the last page number of BeyondChat blogs
2. Fetches articles from the last page
3. Sorts by URL (oldest first)
4. Selects 5 oldest articles
5. Fetches full content for each article
6. Stores in database with error handling
7. Automatically retries on network failures (3 attempts with exponential backoff)

## Usage in Phase 2

The Content Enhancer (Phase 2) consumes these APIs:
- Fetches articles: `GET /api/articles?type=original`
- Creates enhanced articles: `POST /api/articles`
- Updates original articles: `PUT /api/articles/:id`

## Error Handling

All endpoints return:
```json
{
  "success": false,
  "error": "Error message"
}
```

Common errors:
- `404` - Article not found
- `400` - Invalid input or duplicate URL
- `500` - Server error

## Environment Variables

```env
PORT=8000                              # Server port
NODE_ENV=development                   # Environment
DATABASE_PATH=./articles.db            # SQLite database path
BEYONDCHAT_BLOGS_URL=https://beyondchats.com/blogs/  # Source URL
```

## Troubleshooting

### npm: command not found
Install Node.js from https://nodejs.org/

### Database locked
Close other database connections or restart the server

### Scraper times out
The scraper retries 3 times automatically. Check internet connection.

### Port already in use
Change PORT in .env or kill the process using port 8000

## Next Steps

Once this backend is running:
1. Run Phase 2 Content Enhancer to enhance articles
2. Run Phase 3 React frontend to display articles
