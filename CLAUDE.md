# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based glossary website that presents transgender-related terminology from 4chan communities. The project is styled to look like an authentic 4chan thread and includes:

- A React application (Vite + React 19.1.0) located in `brainworms-react/`
- 4chan-authentic theming using layered CSS files
- Interactive features (image lightbox, banner rotation, term auto-linking)
- Static data served from local JSON files (no backend required)
- HashRouter for client-side routing (enables `/#/path` URLs)

## Development Commands

Navigate to `brainworms-react/` directory first, then:

```bash
npm run dev      # Start Vite dev server (http://localhost:5173)
npm run build    # Build for production (outputs to dist/)
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

**Production viewing**: After `npm run build`, open `dist/index.html` with VS Code Live Server.

## Architecture

### Routing Structure (HashRouter)
- `/` - Home page with all categories
- `/category/:categorySlug` - Category term listing
- `/category/:categorySlug/term/:termSlug` - Term detail from category
- `/term/:termSlug` - Direct term access
- `/gallery` - Image gallery grid
- `/graph` - Data visualization

### Key Components & Services

**Core Data Management**:
- `src/services/glossaryService.js` - Central data service that:
  - Maps category IDs to JSON files via `categoryMap` object
  - Implements in-memory caching to prevent re-fetching
  - Handles term slug generation and variation matching
  - Provides unified data access for all components

**Component Architecture**:
- `src/App.jsx` - Root component with HashRouter and route definitions
- `src/components/Layout.jsx` - Main layout wrapper with header, banner rotation
- `src/components/AutoLinkText.jsx` - Automatically links term references in text
- `src/contexts/LightboxContext.jsx` - Global state for image lightbox functionality
- `src/hooks/useGlossaryData.js` - React hook for async data loading with states

### Data Flow
1. JSON files loaded from `public/jsons/` on first access
2. Cached in-memory by glossaryService
3. Components use `useGlossaryData()` hook
4. AutoLinkText component creates term cross-references

## CSS Architecture (Critical!)

### CSS Loading Order & Specificity
1. **index.html head** (base 4chan styles):
   - `unified.css` - Minified 4chan base theme
   - `fourchanx.css` - 4chan enhancements
   - `custom.css` - Project overrides
   - `fixes.css` - Empty legacy file

2. **React imports**:
   - `src/styles/fixes.css` - React-specific fixes (1542 lines)
   - `src/styles/graph.css` - Graph page styles

### CSS Conflict Resolution
- **351 !important declarations** across all files due to specificity wars
- Key selectors: `.post`, `.postMessage`, `.file`, `#dynamicContent`
- Add new styles to `src/styles/fixes.css` with specific selectors
- Test at 480px mobile breakpoint and desktop

### Z-index Hierarchy
- Lightbox: 10000-10001
- Tooltips: 1000
- Header: 999
- Menus: 100

## Development Guidelines

### Before Making Changes
1. Check existing CSS: `grep -r "selector" public/Brainworms*/`
2. Use `glossaryService` for data access (already handles caching)
3. Follow existing component patterns (see TermCard for reference)

### File/Image Paths
- Term images: `public/Brainworms Glossary_files/images/`
- Category icons: `public/Brainworms Glossary_files/svg-icons/`
- Banners: `public/Brainworms Glossary_files/banners/`
- Data: `public/jsons/`

### Testing Checklist
- Mobile view (480px breakpoint)
- Lightbox z-index stacking
- Banner rotation on click
- Term auto-linking in descriptions
- Both Chrome and Firefox