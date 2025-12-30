import { scrapeAndStoreBeyondChatArticles } from '../services/scraper.js';

// Run scraper
scrapeAndStoreBeyondChatArticles()
  .then(() => {
    console.log('\nScraping completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Scraping failed:', error);
    process.exit(1);
  });
