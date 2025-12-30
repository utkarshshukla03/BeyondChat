import axios from 'axios';
import googleSearch from './googleSearch.js';
import scraper from './scraper.js';
import llmService from './llmService.js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

/**
 * Content Enhancement Engine - Main Orchestrator
 * Coordinates the entire enhancement workflow
 */
export class EnhancementEngine {
  constructor() {
    this.backendApiBase = process.env.BACKEND_API_BASE_URL || 'http://localhost:8000/api';
    this.apiClient = axios.create({
      baseURL: this.backendApiBase,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    this.batchSize = parseInt(process.env.BATCH_SIZE || '1');
    this.delayBetweenRequests = parseInt(process.env.DELAY_BETWEEN_REQUESTS || '2000');
  }

  /**
   * Main enhancement workflow
   */
  async enhanceArticles() {
    try {
      console.log('\n🚀 Starting Content Enhancement Engine\n');
      console.log('📋 Configuration:');
      console.log(`   - LLM Provider: ${process.env.LLM_PROVIDER || 'openai'}`);
      console.log(`   - Backend API: ${this.backendApiBase}`);
      console.log(`   - Batch Size: ${this.batchSize}`);
      console.log(`   - Delay: ${this.delayBetweenRequests}ms\n`);

      // Step 1: Fetch original articles from Backend API
      console.log('📥 Fetching original articles from Backend API...');
      const articles = await this.fetchOriginalArticles();
      
      if (articles.length === 0) {
        console.log('⚠️  No original articles found. Please run the scraper first.');
        return;
      }

      console.log(`✅ Found ${articles.length} original articles\n`);

      // Step 2-5: Process each article
      for (let i = 0; i < articles.length; i++) {
        await this.processArticle(articles[i], i + 1, articles.length);
        
        // Add delay between requests
        if (i < articles.length - 1) {
          await this.delay(this.delayBetweenRequests);
        }
      }

      console.log('\n✅ Content enhancement completed!\n');
    } catch (error) {
      console.error('\n❌ Fatal error in enhancement engine:', error.message);
      process.exit(1);
    }
  }

  /**
   * Fetch original articles from Laravel API
   */
  async fetchOriginalArticles(page = 1) {
    try {
      const response = await this.apiClient.get('/articles', {
        params: {
          type: 'original',
          limit: 50,
          page: page
        }
      });

      console.log(`📊 API Response:`, JSON.stringify(response.data, null, 2).substring(0, 200));

      // Handle both response formats
      const articles = response.data.data || response.data || [];
      console.log(`✅ Retrieved ${articles.length} articles from API`);
      return articles;
    } catch (error) {
      console.error('❌ Error fetching articles from API:', error.message);
      if (error.response?.data) {
        console.error('   Response:', error.response.data);
      }
      return [];
    }
  }

  /**
   * Process single article through enhancement workflow
   */
  async processArticle(article, index, total) {
    try {
      console.log(`\n${'='.repeat(70)}`);
      console.log(`[${index}/${total}] Processing: "${article.title}"`);
      console.log(`${'='.repeat(70)}`);

      // Step 2: Search for reference articles
      const references = await googleSearch.searchRelatedArticles(article.title, 2);
      
      if (references.length === 0) {
        console.log('⚠️  No reference articles found');
        return;
      }

      // Step 3: Scrape reference articles
      const referenceContent = [];
      for (const ref of references) {
        const content = await scraper.scrapeArticle(ref.url);
        if (content) {
          referenceContent.push({
            ...ref,
            ...content
          });
        }
      }

      if (referenceContent.length === 0) {
        console.log('⚠️  No reference articles available, but continuing with enhancement...');
        // Continue even without references - will use mock content
      } else {
        console.log(`✅ Scraped ${referenceContent.length} reference articles`);
      }

      // Step 4: Enhance content using LLM (always try even with limited references)
      let enhancedContent = await llmService.enhanceArticle(
        article,
        referenceContent.length > 0 ? referenceContent : this.getMockReferences()
      );

      // Add references section
      enhancedContent = llmService.formatFinalContent(enhancedContent, references.length > 0 ? references : [{ title: 'Mock Reference', url: '#' }]);

      // Step 5: Publish enhanced article via Laravel API
      await this.publishEnhancedArticle(article, enhancedContent, references);

    } catch (error) {
      console.error(`❌ Error processing article: ${error.message}`);
    }
  }

  /**
   * Publish enhanced article via Backend API
   */
  async publishEnhancedArticle(originalArticle, enhancedContent, references) {
    try {
      console.log('\n📤 Publishing enhanced article...');

      // Generate unique URL for enhanced article
      const enhancedUrl = (originalArticle.url || originalArticle.original_url || '') + 
        '?version=enhanced&ts=' + Date.now();

      const payload = {
        url: enhancedUrl,
        title: `${originalArticle.title} (Enhanced)`,
        author: originalArticle.author || 'BeyondChat Enhancement Engine',
        content: enhancedContent,
        excerpt: enhancedContent.substring(0, 200),
        type: 'enhanced',
        relatedArticleId: originalArticle.id,
        publishedDate: new Date().toISOString()
      };

      console.log('📋 Creating enhanced version for:', originalArticle.title);

      const response = await this.apiClient.post('/articles', payload);

      if (response.data.success && response.data.data) {
        console.log('✅ Enhanced article published successfully');
        console.log(`   ID: ${response.data.data.id}`);
      } else {
        console.log('⚠️  Unexpected response:', JSON.stringify(response.data).substring(0, 200));
      }
    } catch (error) {
      if (error.response?.data?.error?.includes('UNIQUE constraint')) {
        console.log('ℹ️  Enhanced article already exists - skipping');
      } else {
        console.error('❌ Error publishing article:', error.message);
        if (error.response?.data) {
          console.error('   Backend response:', error.response.data);
        }
      }
    }
  }

  /**
   * Delay utility
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate mock references for testing
   */
  getMockReferences() {
    return [
      {
        title: 'Reference Article',
        headings: ['Introduction', 'Main Points', 'Analysis'],
        paragraphs: ['This is a mock reference article used for testing.'],
        content: 'Mock reference content for enhancement testing.'
      }
    ];
  }
}

/**
 * Main execution
 */
async function main() {
  const engine = new EnhancementEngine();
  
  console.log('\n🚀 Content Enhancement Engine Started\n');
  
  // Run enhancement once, then poll every 30 seconds
  let cycle = 0;
  while (true) {
    try {
      cycle++;
      console.log(`\n📍 Cycle ${cycle} - ${new Date().toLocaleTimeString()}`);
      await engine.enhanceArticles();
      console.log('\n⏳ Waiting 30 seconds before next cycle...\n');
      await new Promise(resolve => setTimeout(resolve, 30000));
    } catch (error) {
      console.error('❌ Error in enhancement cycle:', error.message);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

// Run if this is the main module
if (process.argv[1].includes('index.js')) {
  main().catch(console.error);
}

export default EnhancementEngine;

