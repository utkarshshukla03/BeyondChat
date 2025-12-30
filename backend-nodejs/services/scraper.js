import axios from 'axios';
import * as cheerio from 'cheerio';
import { runQuery, getQuery, allQuery } from '../db/database.js';

const BEYONDCHAT_BLOGS_URL = process.env.BEYONDCHAT_BLOGS_URL || 'https://beyondchats.com/blogs/';

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      console.log(`  Attempt ${i + 1} failed, retrying...`);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

async function findLastPageNumber() {
  console.log('🔍 Finding last page of blogs...');
  const html = await fetchWithRetry(BEYONDCHAT_BLOGS_URL);
  const $ = cheerio.load(html);

  let lastPage = 1;
  const pagination = $('a[aria-label*="page"]');
  
  if (pagination.length > 0) {
    pagination.each((i, el) => {
      const pageNum = parseInt($(el).text());
      if (!isNaN(pageNum)) {
        lastPage = Math.max(lastPage, pageNum);
      }
    });
  }

  console.log(`✓ Found last page: ${lastPage}`);
  return lastPage;
}

async function scrapeArticlesFromPage(pageUrl) {
  console.log(`📄 Scraping ${pageUrl}...`);
  const html = await fetchWithRetry(pageUrl);
  const $ = cheerio.load(html);

  const articles = [];
  
  $('article, .blog-post, .post-item, [data-testid*="blog"], a[href*="/blogs/"]').each((i, el) => {
    try {
      const $article = $(el);
      const titleEl = $article.find('h1, h2, h3, .title, .post-title').first();
      const title = titleEl.text().trim();
      
      if (!title) return;

      const linkEl = $article.find('a[href*="/blogs/"]').first() || $article.closest('a');
      const url = linkEl.attr('href');
      
      if (!url || !url.includes('/blogs/')) return;

      const fullUrl = url.startsWith('http') ? url : `https://beyondchats.com${url}`;
      
      const excerpt = $article.find('p, .excerpt, .summary').first().text().trim().substring(0, 200);
      const imageUrl = $article.find('img').first().attr('src') || '';

      articles.push({
        url: fullUrl,
        title,
        excerpt,
        imageUrl: imageUrl.startsWith('http') ? imageUrl : `https://beyondchats.com${imageUrl}`
      });
    } catch (e) {
      // Skip articles with parsing errors
    }
  });

  return articles;
}

async function getFullArticleContent(url) {
  try {
    const html = await fetchWithRetry(url);
    const $ = cheerio.load(html);

    // Remove script and style elements
    $('script, style, nav, footer').remove();

    // Extract title - try multiple selectors
    let title = '';
    const titleSelectors = [
      'h1',
      '[property="og:title"]',
      '.page-title',
      '.post-title',
      '.article-title',
      'head > title',
      '.entry-title'
    ];
    
    for (const selector of titleSelectors) {
      const el = $(selector).first();
      if (el.length > 0) {
        title = el.text().trim();
        if (title) break;
      }
    }

    // Fallback: extract from URL or use generic title
    if (!title || title.length < 3) {
      const urlParts = url.split('/').filter(p => p);
      title = urlParts[urlParts.length - 1]?.replace(/-/g, ' ') || 'Article';
    }

    const author = $('[rel="author"], .author, .by, .author-name, [itemprop="author"]').first().text().trim();
    const publishedDate = $('[property="article:published_time"], time, [itemprop="datePublished"]').first().attr('datetime') || $('[property="article:published_time"], time').first().text() || '';
    
    // Get main content
    let content = '';
    const contentSelectors = [
      'article',
      '.post-content',
      '.article-content',
      '.entry-content',
      'main',
      '[role="main"]',
      '.content',
      '.blog-content'
    ];
    
    for (const selector of contentSelectors) {
      const el = $(selector).first();
      if (el.length > 0) {
        content = el.html();
        break;
      }
    }

    if (!content) {
      content = $('body').html();
    }

    // Clean up content
    content = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    content = content.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

    return {
      title: title || 'Article',
      author,
      publishedDate,
      content
    };
  } catch (error) {
    console.error(`❌ Error fetching full content from ${url}:`, error.message);
    return {
      title: 'Article',
      author: '',
      publishedDate: '',
      content: ''
    };
  }
}

export async function scrapeAndStoreBeyondChatArticles() {
  try {
    console.log('\n📚 Starting BeyondChat blog scrape...\n');

    const lastPage = await findLastPageNumber();
    const lastPageUrl = BEYONDCHAT_BLOGS_URL + (lastPage > 1 ? `?page=${lastPage}` : '');

    const articles = await scrapeArticlesFromPage(lastPageUrl);
    console.log(`\n✓ Found ${articles.length} articles on last page`);

    // Sort by URL (oldest first) and take first 5
    articles.sort((a, b) => a.url.localeCompare(b.url));
    const selectedArticles = articles.slice(0, 5);

    console.log(`\n📥 Storing ${selectedArticles.length} articles in database...\n`);

    for (const article of selectedArticles) {
      try {
        // Check if article already exists
        const existing = await getQuery('SELECT id FROM articles WHERE url = ?', [article.url]);
        if (existing) {
          console.log(`⊘ Skipping (already exists): ${article.title}`);
          continue;
        }

        // Get full content
        console.log(`↓ Fetching full content: ${article.title}`);
        const fullContent = await getFullArticleContent(article.url);

        // Store in database
        await runQuery(
          `INSERT INTO articles (url, title, author, content, excerpt, image_url, type, published_date)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            article.url,
            fullContent.title,
            fullContent.author,
            fullContent.content,
            article.excerpt,
            article.imageUrl,
            'original',
            fullContent.publishedDate
          ]
        );

        console.log(`✓ Stored: ${fullContent.title}`);
      } catch (error) {
        console.error(`✗ Error storing article: ${error.message}`);
      }
    }

    console.log('\n✓ Scrape completed!\n');
  } catch (error) {
    console.error('Fatal scraping error:', error.message);
    throw error;
  }
}

export async function getArticleById(id) {
  return getQuery('SELECT * FROM articles WHERE id = ?', [id]);
}

export async function getAllArticles(type = null, limit = 10, offset = 0) {
  let sql = 'SELECT * FROM articles WHERE type = ? ORDER BY created_at DESC LIMIT ? OFFSET ?';
  let params = [type || 'original', limit, offset];

  if (!type) {
    sql = 'SELECT * FROM articles ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params = [limit, offset];
  }

  return allQuery(sql, params);
}

export async function getTotalArticleCount(type = null) {
  let sql = 'SELECT COUNT(*) as count FROM articles';
  if (type) {
    sql += ` WHERE type = '${type}'`;
  }
  
  const result = await getQuery(sql);
  return result?.count || 0;
}

export async function createArticle(data) {
  const result = await runQuery(
    `INSERT INTO articles (url, title, author, content, excerpt, image_url, type, related_article_id, published_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.url,
      data.title,
      data.author || '',
      data.content || '',
      data.excerpt || '',
      data.imageUrl || '',
      data.type || 'original',
      data.relatedArticleId || null,
      data.publishedDate || new Date().toISOString()
    ]
  );
  return result.lastID;
}

export async function updateArticle(id, data) {
  const updates = [];
  const params = [];

  if (data.title !== undefined) {
    updates.push('title = ?');
    params.push(data.title);
  }
  if (data.content !== undefined) {
    updates.push('content = ?');
    params.push(data.content);
  }
  if (data.author !== undefined) {
    updates.push('author = ?');
    params.push(data.author);
  }
  if (data.excerpt !== undefined) {
    updates.push('excerpt = ?');
    params.push(data.excerpt);
  }
  if (data.relatedArticleId !== undefined) {
    updates.push('related_article_id = ?');
    params.push(data.relatedArticleId);
  }

  if (updates.length === 0) return false;

  updates.push('updated_at = CURRENT_TIMESTAMP');
  params.push(id);

  const sql = `UPDATE articles SET ${updates.join(', ')} WHERE id = ?`;
  const result = await runQuery(sql, params);
  return result.changes > 0;
}

export async function deleteArticle(id) {
  const result = await runQuery('DELETE FROM articles WHERE id = ?', [id]);
  return result.changes > 0;
}

export async function searchArticles(query, limit = 10) {
  return allQuery(
    `SELECT * FROM articles 
     WHERE title LIKE ? OR content LIKE ? OR excerpt LIKE ?
     ORDER BY created_at DESC
     LIMIT ?`,
    [`%${query}%`, `%${query}%`, `%${query}%`, limit]
  );
}
