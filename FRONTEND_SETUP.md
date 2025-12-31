# Frontend React Setup Guide

## Installation Steps

### 1. Install Node.js Dependencies
```bash
cd frontend-react
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` (optional - defaults are provided):
```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=BeyondChat Article Manager
```

### 3. Start Development Server
```bash
npm run dev
```

Frontend runs on: `http://localhost:3000`

## Build for Production
```bash
npm run build
```

Outputs to: `dist/` directory

## Project Structure

### Components
- **ArticleCard.jsx**: Displays article in grid layout
  - Shows title, author, date
  - Displays type badge (original/enhanced)
  - Links to detail page
  
- **Pagination.jsx**: Navigation between pages
  - Previous/Next buttons
  - Jump to specific page
  - Shows current position

### Pages
- **ArticlesList.jsx**: Main listing page
  - Display all articles in grid
  - Search functionality
  - Type filtering (original/enhanced)
  - Pagination
  - Scrape trigger button
  
- **ArticleDetail.jsx**: Full article view
  - Full article content with formatting
  - Author and publication date
  - Link to original source
  - Related articles (originals ↔ enhanced)
  - Back to list button

### Services
- **api.js**: API client using Axios
  - `getArticles()` - Fetch with filters
  - `getArticleById()` - Get single article
  - `createArticle()` - Create new
  - `updateArticle()` - Update existing
  - `deleteArticle()` - Delete article
  - `searchArticles()` - Search by query
  - `scrapeArticles()` - Trigger scraping

## UI Components

### Navigation Bar
- App logo/title
- Links to home and GitHub
- Sticky positioning

### Search & Filters
- Full-text search input
- Article type filter buttons
- All / Original / Enhanced
- Scrape articles button

### Article Grid
- Responsive layout (1-3 columns)
- Article cards with metadata
- Hover effects
- Click to view details

### Article Detail
- Large title
- Metadata (author, date, type)
- Original source link
- Full HTML content
- Related articles section
- References (for enhanced articles)

### Pagination
- Previous/Next buttons
- Current page info
- Jump-to-page input
- Disabled when at limits

## Styling

### Colors
```css
--primary-color: #3b82f6      /* Blue */
--secondary-color: #6b7280    /* Gray */
--success-color: #10b981      /* Green */
--danger-color: #ef4444       /* Red */
--light-bg: #f9fafb           /* Light background */
```

### Responsive Breakpoints
- Desktop: 1200px+
- Tablet: 768px-1199px
- Mobile: <768px

### Typography
- Font: System fonts for performance
- Base size: 16px
- Line height: 1.6

## Features

### Search
```javascript
// Search articles by title or content
await articleService.searchArticles("laravel");

// Filter by type
await articleService.searchArticles("article", "original");
```

### Filtering
```javascript
// Get only enhanced articles
await articleService.getArticles("enhanced", 1, 15);

// Get all articles
await articleService.getArticles(null, 1, 15);
```

### Pagination
```javascript
// Fetch specific page
await articleService.getArticles(type, 2, 15);
```

### Scraping
```javascript
// Trigger scraping from BeyondChats
await articleService.scrapeArticles();
```

## API Integration

All API calls go through `axios` with:
- Base URL: `http://localhost:8000/api`
- Content-Type: `application/json`
- Error handling with try/catch
- User-friendly error messages

### Example API Call
```javascript
// Fetch articles
const response = await articleService.getArticles('original', 1, 15);
console.log(response.data);        // Article array
console.log(response.pagination);  // Page info
```

## State Management

Uses React Hooks:
- `useState()` - Component state
- `useEffect()` - Side effects & API calls
- `useParams()` - Route parameters

## Routing

Using React Router v6:
- `/` - Article listing page
- `/articles/:id` - Article detail page

## Development Tips

### Hot Reload
Any file changes automatically reload in browser.

### Debug API Calls
```javascript
// Open browser console (F12)
// Check Network tab for API requests
// Check Console tab for errors
```

### Test Search
1. Type query in search box
2. Hit Enter or click Search button
3. Results appear below

### Test Filters
1. Click filter buttons (All / Original / Enhanced)
2. Grid updates automatically
3. Click same button again to reset

### Test Pagination
1. Scroll to bottom
2. Click Next/Previous
3. Page updates with new articles

### Test Article Links
1. Click article card
2. Navigate to detail page
3. Click Back button to return

## Troubleshooting

**API connection refused**
```
Error: Cannot GET /api/articles
→ Ensure Laravel server is running on port 8000
→ Check VITE_API_BASE_URL matches Laravel port
```

**Search returns no results**
```
→ Ensure articles exist in database
→ Check search query is valid
→ Try broader search term
```

**Images not loading**
```
→ Check article content has valid image URLs
→ CORS might block cross-origin images
→ Add CORS headers in Laravel
```

**Styling looks broken**
```
→ Clear browser cache: Ctrl+Shift+Delete
→ Rebuild frontend: npm run build
→ Check CSS file is loaded in Network tab
```

**Pagination not working**
```
→ Check pagination data exists
→ Ensure API returns pagination info
→ Check page numbers are valid
```

## Performance Tips

### Image Optimization
- Use lazy loading
- Compress images
- Use modern formats (WebP)

### Bundle Size
- Tree-shake unused code
- Lazy load routes
- Code-split components

### Network
- Cache API responses
- Throttle requests
- Use HTTP/2

## Building for Production

```bash
# Create optimized build
npm run build

# Preview production build
npm run preview

# Deploy dist/ folder to hosting
```

### Deploy Options
- **Vercel** - `vercel deploy`
- **Netlify** - `netlify deploy`
- **GitHub Pages** - Push to gh-pages branch
- **AWS S3 + CloudFront** - Upload to S3
- **Traditional hosting** - FTP to server

## Environment Variables for Deployment

Create `.env.production`:
```
VITE_API_BASE_URL=https://api.beyondchat.com/api
```

Update before building:
```bash
npm run build
```

This will use production API URL in built bundle.
