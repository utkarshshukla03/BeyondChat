import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { articleService } from '../services/api';

/**
 * ArticleDetail Page
 */
export function ArticleDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await articleService.getArticleById(id);
        setArticle(response.data);
      } catch (err) {
        setError(err.message || 'Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loader">Loading article...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-message">❌ {error}</div>
        <Link to="/" className="btn btn-primary">Back to Articles</Link>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="page-container">
        <div className="error-message">Article not found</div>
        <Link to="/" className="btn btn-primary">Back to Articles</Link>
      </div>
    );
  }

  return (
    <div className="article-detail-page">
      <Link to="/" className="btn btn-secondary mb-4">← Back to Articles</Link>

      <article className="article-content">
        <header className="article-header">
          <h1>{article.title}</h1>
          
          <div className="article-meta">
            {article.author && <span className="meta">By {article.author}</span>}
            {article.published_date && (
              <span className="meta">Published {new Date(article.published_date).toLocaleDateString()}</span>
            )}
            <span className={`badge badge-${article.type}`}>
              {article.type === 'enhanced' ? '✨ Enhanced' : '📄 Original'}
            </span>
          </div>

          {article.original_url && (
            <div className="article-source">
              <a href={article.original_url} target="_blank" rel="noopener noreferrer" className="source-link">
                🔗 View Original Source
              </a>
            </div>
          )}
        </header>

        <div className="article-body">
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>

        {/* Show original article link for enhanced articles */}
        {article.type === 'enhanced' && article.original_article && (
          <div className="related-article">
            <h3>📄 Based on Original Article</h3>
            <Link to={`/articles/${article.original_article.id}`} className="related-link">
              {article.original_article.title}
            </Link>
          </div>
        )}

        {/* Show enhanced versions for original articles */}
        {article.type === 'original' && article.enhanced_versions && article.enhanced_versions.length > 0 && (
          <div className="enhanced-versions">
            <h3>✨ Enhanced Versions</h3>
            <ul className="versions-list">
              {article.enhanced_versions.map((enhanced) => (
                <li key={enhanced.id}>
                  <Link to={`/articles/${enhanced.id}`}>
                    {enhanced.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </article>
    </div>
  );
}

export default ArticleDetail;
