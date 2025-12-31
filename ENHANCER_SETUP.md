# Enhancement Engine Setup Guide

## Installation Steps

### 1. Install Node.js Dependencies
```bash
cd content-enhancer
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```
# Laravel API Configuration
LARAVEL_API_BASE_URL=http://localhost:8000/api

# LLM Provider Selection
LLM_PROVIDER=openai  # Options: openai, gemini, claude

# API Keys
OPENAI_API_KEY=sk-...
GOOGLE_SEARCH_API_KEY=...
GOOGLE_SEARCH_ENGINE_ID=...

# Processing
BATCH_SIZE=1
DELAY_BETWEEN_REQUESTS=2000
```

### 3. Get API Keys

#### OpenAI API Key
- Visit: https://platform.openai.com/account/api-keys
- Create new API key
- Paste in OPENAI_API_KEY

#### Google Search API
- Visit: https://programmablesearchengine.google.com/
- Create custom search engine
- Get Search Engine ID
- Enable Custom Search API in Google Cloud Console
- Create API key

#### Alternative LLM Providers
- **Gemini**: https://ai.google.dev/
- **Claude**: https://console.anthropic.com/

### 4. Start Enhancement Engine
```bash
npm start
```

The engine will:
1. Fetch original articles from Laravel API
2. Search for references using Google
3. Scrape reference article content
4. Call LLM to enhance content
5. Publish enhanced articles back to API

## How It Works

### Workflow Steps

1. **Fetch Articles**
   ```
   GET /api/articles?type=original
   ```
   Retrieves unenhanced articles from database

2. **Search References**
   ```
   Google Search API
   Query: Article Title
   Results: Top 2 non-BeyondChats articles
   ```

3. **Scrape References**
   ```
   For each reference:
   - Fetch webpage
   - Extract headings, paragraphs, lists
   - Clean HTML
   ```

4. **Enhance with LLM**
   ```
   Input:
   - Original article content
   - Reference articles content
   
   Output:
   - Rewritten article (HTML)
   - Improved structure
   - Better readability
   - Added depth
   - Plagiarism-free
   ```

5. **Add References**
   ```
   Append to enhanced content:
   - Reference titles
   - Reference URLs
   - Proper citation format
   ```

6. **Publish Article**
   ```
   POST /api/articles
   With:
   - type: 'enhanced'
   - original_article_id: <link to original>
   - metadata: { references, timestamp }
   ```

## Configuration Options

### LLM Providers

**OpenAI (Recommended)**
```
LLM_PROVIDER=openai
LLM_MODEL_OPENAI=gpt-4-turbo-preview
```

**Google Gemini**
```
LLM_PROVIDER=gemini
LLM_MODEL_GEMINI=gemini-pro
```

**Anthropic Claude**
```
LLM_PROVIDER=claude
LLM_MODEL_CLAUDE=claude-3-opus-20240229
```

### Processing Settings

```
BATCH_SIZE=1              # Articles per batch
DELAY_BETWEEN_REQUESTS=2000  # Milliseconds between API calls
SCRAPER_TIMEOUT=30000     # Request timeout
SCRAPER_MAX_RETRIES=3     # Retry attempts
EXCLUDE_DOMAINS=beyondchats.com  # Don't scrape these
```

## Key Services

### GoogleSearchService (`googleSearch.js`)
- Searches Google using article title
- Filters out BeyondChats domain
- Returns top 2 relevant articles
- Mock results for testing

### ScraperService (`scraper.js`)
- Fetches webpage content
- Extracts:
  - Headings (h2, h3)
  - Paragraphs
  - Lists (ul, ol)
  - Images
- Retry logic with exponential backoff
- Timeout handling

### LLMService (`llmService.js`)
- Supports multiple LLM providers
- Builds enhancement prompts
- Handles API responses
- Generates references section
- Mock enhancement for testing

### EnhancementEngine (`index.js`)
- Main orchestrator
- Coordinates entire workflow
- Batch processing
- Error handling
- Comprehensive logging

## Logging

Engine logs all activities:
```
🚀 Starting Content Enhancement Engine
📥 Fetching original articles from Laravel API
✅ Found 5 original articles

[1/5] Processing: "Article Title"
════════════════════════════════════════════
🔍 Searching for articles related to: "Article Title"
✅ Found 2 relevant articles
📄 Scraping content from: https://example.com
✅ Scraped article from reference
🤖 Enhancing article: "Article Title"
✅ Content enhanced with OpenAI
📤 Publishing enhanced article...
✅ Enhanced article published successfully
   Article ID: 15
```

## Testing

### Test with Mock Data
The engine has built-in mock data for testing:
- Mock Google search results
- Mock enhanced content
- No actual API calls needed

Set real credentials when ready for production.

### Test Single Article
```bash
# The engine processes all articles by default
# It will log each step
npm start
```

### Check Results
```bash
# View articles in database
curl http://localhost:8000/api/articles

# Filter by type
curl http://localhost:8000/api/articles?type=enhanced
```

## Troubleshooting

**Cannot connect to Laravel API**
- Ensure Laravel server is running: `php artisan serve`
- Check LARAVEL_API_BASE_URL in .env
- Verify database has articles

**Google Search returns no results**
- Check API credentials
- Verify quota limits not exceeded
- Article title might be too specific

**LLM API errors**
- Verify API key is correct
- Check account has credits
- Ensure model name is supported

**Enhancement takes too long**
- Reduce BATCH_SIZE
- Increase DELAY_BETWEEN_REQUESTS
- Check network speed

## Production Deployment

1. **Use real API credentials** (not testing)
2. **Configure error monitoring** (Sentry, DataDog)
3. **Setup logging service** (CloudWatch, ELK)
4. **Use process manager** (PM2, systemd)
5. **Configure rate limiting** to avoid API throttling
6. **Setup backup/recovery** for failed articles
7. **Monitor API quota usage** (Google Search, LLM)
8. **Configure auto-restart** on failures

## Advanced Usage

### Process Only Enhanced-Pending Articles
Modify `index.js` to add filter before processing.

### Custom Enhancement Prompt
Edit `llmService.js` `buildEnhancementPrompt()` method.

### Add New LLM Provider
1. Create new provider method in `llmService.js`
2. Add to provider selection
3. Update .env example

### Custom Reference Selection
Modify `googleSearch.js` filter logic.
