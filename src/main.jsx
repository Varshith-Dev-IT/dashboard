import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { LanguageProvider } from './contexts/LanguageContext'
import App from './App'
import './index.css'

// Handle GitHub Pages redirect from 404.html
// This code restores the original URL from sessionStorage
(function() {
  var redirectInfo = sessionStorage.getItem('ghp_redirect');
  if (redirectInfo) {
    try {
      var info = JSON.parse(redirectInfo);
      sessionStorage.removeItem('ghp_redirect');
      var newPath = info.path || '';
      var newSearch = info.search ? '?' + info.search : '';
      var newHash = info.hash || '';
      var fullPath = (newPath ? '/' + newPath : '') + newSearch + newHash;
      if (fullPath && fullPath !== location.pathname + location.search + location.hash) {
        history.replaceState(null, null, fullPath);
      }
    } catch (e) {
      console.error('Error parsing redirect info:', e);
    }
  }
})();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
)
