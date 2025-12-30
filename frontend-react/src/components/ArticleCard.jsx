import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

/**
 * ArticleCard Component
 * Displays article summary in a card layout
 */
export function ArticleCard({ article }) {
  const isEnhanced = article.type === 'enhanced';
  
  return (
    <div className="article-card">
      <div className="card-header">
        <h3 className="card-title">
          <Link to={`/articles/${article.id}`}>
            {article.title}
          </Link>
        </h3>
        <span className={`badge badge-${isEnhanced ? 'enhanced' : 'original'}`}>
          {isEnhanced ? '✨ Enhanced' : '📄 Original'}
        </span>
      </div>

      <div className="card-meta">
        {article.author && (
          <span className="meta-item">👤 {article.author}</span>
        )}
        {article.published_date && (
          <span className="meta-item">
            📅 {formatDistanceToNow(new Date(article.published_date), { addSuffix: true })}
          </span>
        )}
      </div>

      {isEnhanced && article.original_article_id && (
        <div className="card-relation">
          <span className="relation-label">Enhanced from:</span>
          <Link to={`/articles/${article.original_article_id}`} className="relation-link">
            Original Article
          </Link>
        </div>
      )}

      <div className="card-footer">
        <Link to={`/articles/${article.id}`} className="btn btn-primary">
          Read More
        </Link>
      </div>
    </div>
  );
}

export default ArticleCard;
