import React, { useState, useCallback } from 'react';

/**
 * Pagination Component
 */
export function Pagination({ currentPage, lastPage, onPageChange }) {
  const [inputPage, setInputPage] = useState(currentPage);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < lastPage) {
      onPageChange(currentPage + 1);
    }
  };

  const handleGoToPage = (e) => {
    e.preventDefault();
    const page = parseInt(inputPage);
    if (page > 0 && page <= lastPage) {
      onPageChange(page);
    }
  };

  return (
    <div className="pagination">
      <button 
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="btn btn-secondary"
      >
        ← Previous
      </button>

      <div className="pagination-info">
        <span>Page {currentPage} of {lastPage}</span>
      </div>

      <form onSubmit={handleGoToPage} className="go-to-page">
        <input
          type="number"
          min="1"
          max={lastPage}
          value={inputPage}
          onChange={(e) => setInputPage(e.target.value)}
          className="input-page"
        />
        <button type="submit" className="btn btn-small">Go</button>
      </form>

      <button 
        onClick={handleNext}
        disabled={currentPage === lastPage}
        className="btn btn-secondary"
      >
        Next →
      </button>
    </div>
  );
}

export default Pagination;
