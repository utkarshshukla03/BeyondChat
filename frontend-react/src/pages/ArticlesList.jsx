import React, { useState, useEffect } from 'react';
import ArticleCard from '../components/ArticleCard';
import Pagination from '../components/Pagination';
import { articleService } from '../services/api';

/**
 * Articles List Page
 */
export function ArticlesList() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScraping, setIsScraping] = useState(false);

  const fetchArticles = async (page = 1, type = null) => {
    try {
      setLoading(true);
      setError(null);
      const response = await articleService.getArticles(type, page, 15);
      setArticles(response.data);
      setPagination(response.pagination);
      setCurrentPage(page);
    } catch (err) {
      setError(err.message || 'Failed to load articles');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await articleService.searchArticles(searchQuery, selectedType);
      setArticles(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleScrape = async () => {
    if (!window.confirm('Scrape latest articles from BeyondChats? This may take a few minutes.')) {
      return;
    }

    try {
      setIsScraping(true);
      setError(null);
      const response = await articleService.scrapeArticles();
      
      if (response.success) {
        alert(`✅ Scraping started!\nCheck the backend terminal for progress.`);
        // Fetch updated articles after a delay to allow scraping to complete
        setTimeout(() => fetchArticles(1, selectedType), 5000);
      }
    } catch (err) {
      setError(err.message || 'Scraping failed');
    } finally {
      setIsScraping(false);
    }
  };

  const handleTypeFilter = (type) => {
    setSelectedType(type);
    setCurrentPage(1);
    setSearchQuery('');
  };

  const handlePageChange = (page) => {
    fetchArticles(page, selectedType);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    fetchArticles(1, selectedType);
  };

  useEffect(() => {
    fetchArticles(1, selectedType);
  }, [selectedType]);

  return (
    <div className="articles-list-page">
      {/* Header */}
      <header className="page-header">
        <h1>📚 Article Management System</h1>
        <p>Explore original and enhanced articles from BeyondChats</p>
      </header>

      {/* Controls */}
      <div className="controls-section">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn btn-primary">🔍 Search</button>
          {searchQuery && (
            <button 
              type="button" 
              onClick={handleClearSearch}
              className="btn btn-secondary"
            >
              Clear
            </button>
          )}
        </form>

        {/* Filter Buttons */}
        <div className="filter-buttons">
          <button
            onClick={() => handleTypeFilter(null)}
            className={`btn ${selectedType === null ? 'btn-primary' : 'btn-secondary'}`}
          >
            📄 All Articles
          </button>
          <button
            onClick={() => handleTypeFilter('original')}
            className={`btn ${selectedType === 'original' ? 'btn-primary' : 'btn-secondary'}`}
          >
            📄 Original
          </button>
          <button
            onClick={() => handleTypeFilter('enhanced')}
            className={`btn ${selectedType === 'enhanced' ? 'btn-primary' : 'btn-secondary'}`}
          >
            ✨ Enhanced
          </button>
        </div>

        {/* Scrape Button */}
        <button 
          onClick={handleScrape}
          disabled={isScraping}
          className="btn btn-action"
        >
          {isScraping ? '⏳ Scraping...' : '🔄 Scrape Articles'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loader">Loading articles...</div>
      )}

      {/* Articles Grid */}
      {!loading && articles.length > 0 && (
        <>
          <div className="articles-grid">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
            <Pagination
              currentPage={pagination.current_page}
              lastPage={pagination.last_page}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && articles.length === 0 && (
        <div className="empty-state">
          <p>No articles found. Try adjusting your filters or scraping new content.</p>
          <button onClick={handleScrape} className="btn btn-primary">
            🔄 Start Scraping
          </button>
        </div>
      )}
    </div>
  );
}

export default ArticlesList;
