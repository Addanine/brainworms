// src/App.jsx
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import IndexPage from './pages/IndexPage';
import CategoryPage from './pages/CategoryPage';
import TermPage from './pages/TermPage';
import GalleryPage from './pages/GalleryPage';
import DataGraphPage from './pages/DataGraphPage';
import BrainwormsTracker from './pages/BrainwormsTracker';
import { LightboxProvider } from './contexts/LightboxContext';
import Lightbox from './components/Lightbox';

function App() {
  return (
    <LightboxProvider>
      <HashRouter>
        <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<IndexPage />} />
          <Route path="category/:categorySlug" element={<CategoryPage />} />
          <Route path="category/:categorySlug/term/:termSlug" element={<TermPage />} />
          <Route path="term/:termSlug" element={<TermPage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="graph" element={<DataGraphPage />} />
          <Route path="tracker" element={<BrainwormsTracker />} />
          {/* A catch-all route for 404s, styled to look like a post. */}
          <Route path="*" element={
            <div className="postContainer replyContainer">
                <div className="post reply">Page Not Found</div>
            </div>
          } />
        </Route>
      </Routes>
      <Lightbox />
    </HashRouter>
    </LightboxProvider>
  );
}

export default App;