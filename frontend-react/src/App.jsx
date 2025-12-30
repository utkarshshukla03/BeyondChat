import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ArticlesList from './pages/ArticlesList';
import ArticleDetail from './pages/ArticleDetail';
import './styles/main.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="navbar-container">
            <a href="/" className="navbar-brand">
              🚀 BeyondChat Articles
            </a>
            <div className="navbar-links">
              <a href="/" className="nav-link">Home</a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="nav-link">
                GitHub
              </a>
            </div>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<ArticlesList />} />
            <Route path="/articles/:id" element={<ArticleDetail />} />
          </Routes>
        </main>

        <footer className="footer">
          <div className="footer-content">
            <p>&copy; 2024 BeyondChat Article Management System</p>
            <p>Created with React, Laravel & Node.js</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
