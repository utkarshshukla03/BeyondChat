import express from 'express';
import {
  getArticleById,
  getAllArticles,
  getTotalArticleCount,
  createArticle,
  updateArticle,
  deleteArticle,
  searchArticles,
  scrapeAndStoreBeyondChatArticles
} from '../services/scraper.js';

const router = express.Router();

// GET search articles (MUST be before /:id route)
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ success: false, error: 'Search query required' });
    }

    const articles = await searchArticles(query);
    res.json({ success: true, data: articles });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET all articles with pagination
router.get('/', async (req, res) => {
  try {
    const type = req.query.type || null; // 'original', 'enhanced', or null for all
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const articles = await getAllArticles(type, limit, offset);
    const total = await getTotalArticleCount(type);

    res.json({
      success: true,
      data: articles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single article by ID
router.get('/:id', async (req, res) => {
  try {
    const article = await getArticleById(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }
    res.json({ success: true, data: article });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create new article
router.post('/', async (req, res) => {
  try {
    const { url, title, author, content, excerpt, imageUrl, type, relatedArticleId, publishedDate } = req.body;

    if (!url || !title) {
      return res.status(400).json({ success: false, error: 'URL and title are required' });
    }

    const id = await createArticle({
      url,
      title,
      author,
      content,
      excerpt,
      imageUrl,
      type,
      relatedArticleId,
      publishedDate
    });

    const article = await getArticleById(id);
    res.status(201).json({ success: true, data: article });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ success: false, error: 'Article with this URL already exists' });
    } else {
      res.status(500).json({ success: false, error: error.message });
    }
  }
});

// PUT update article
router.put('/:id', async (req, res) => {
  try {
    const updated = await updateArticle(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }

    const article = await getArticleById(req.params.id);
    res.json({ success: true, data: article });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE article
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await deleteArticle(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }
    res.json({ success: true, message: 'Article deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST trigger scraping
router.post('/scrape', async (req, res) => {
  try {
    // Run scrape asynchronously
    scrapeAndStoreBeyondChatArticles().catch(err => {
      console.error('Scrape background error:', err);
    });

    res.json({
      success: true,
      message: 'Scraping started. Check console for progress.'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
