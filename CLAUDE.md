# CLAUDE.md - AI Assistant Guide for Prog Bellecour APC

## Project Overview

**Project Name**: Outil de Programmation (Programming Tool)
**Version**: V8.36 (UI Finalisée)
**Type**: Progressive Web App (PWA)
**Language**: French (UI and content)
**Primary Purpose**: A project management and planning tool for managing building/construction program elements (rooms, spaces, functions) with visual analytics and relational mapping.

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **No Framework**: Pure JavaScript - no React, Vue, or Angular
- **External Libraries**:
  - `jsPDF` (v2.5.1) - PDF export functionality
  - `jsPDF-autotable` (v3.5.29) - Table generation in PDFs
  - `vis-network` - Graph/network visualization
  - Google Fonts (Inter) - Typography
- **Storage**: LocalStorage for data persistence
- **PWA Features**: Service Worker for offline functionality
- **Build System**: None - runs directly in browser

## File Structure

```
/
├── index.html           # Main application file (single-page app)
├── manifest.json        # PWA manifest configuration
├── service-worker.js    # Service worker for offline caching
├── icon-192.png        # PWA icon (192x192)
├── icon-512.png        # PWA icon (512x512)
└── icon.png            # Base icon image
```

### Key Files Explained

#### `index.html` (2547 lines)
- **Everything-in-one file**: Contains HTML structure, CSS styles, and JavaScript logic
- **Design System**: Custom CSS variables for theming (dark/light modes)
- **Application Logic**: Complete JavaScript application in `<script>` tag
- **No external JS files**: All code is inline for simplicity

#### `service-worker.js` (51 lines)
- **Cache Management**: Manages offline resource caching
- **Version Control**: Cache name includes version (prog-tool-v8.36)
- **Network Strategy**: Cache-first strategy for offline support

#### `manifest.json`
- **PWA Configuration**: Defines app name, icons, theme colors
- **Standalone Mode**: Runs as standalone app when installed

## Application Architecture

### State Management

The application uses a centralized state object (`App.state`) with the following structure:

```javascript
App.state = {
  data: [],              // Main data array (items/locations)
  links: [],             // Graph connections between items
  positions: {},         // Node positions in graph view
  title: "PROJET",       // Project title (editable)
  filters: {             // Active filter state
    search: "",
    programme: [],
    niveau: [],
    fonction: []
  },
  sort: {               // Table sorting state
    col: "programme",
    asc: true
  },
  locked: false,        // Lock state prevents editing
  history: [],          // Undo history (max 20 items)
  savedViews: [],       // Saved filter configurations
  types: {...},         // Configurable types/categories
  currentView: 'list',  // Active view: 'list', 'actions', or 'graph'
  selectedIds: new Set(), // Batch selection
  openDropdown: null,   // Currently open dropdown
  saveTimeout: null     // Debounced save timeout
}
```

### Module Organization

The `App` object is organized into modules:

```javascript
App = {
  state: {},           // Application state
  init: fn,            // Initialization
  graph: {},           // Graph visualization module
  methods: {},         // Core business logic
  helpers: {},         // Utility functions
  render: {},          // UI rendering functions
  ui: {},              // UI interaction helpers
  events: {}           // Event binding
}
```

## Data Model

### Main Data Item Structure

Each item in `App.state.data` has this structure:

```javascript
{
  id: Number,           // Unique timestamp-based ID
  programme: String,    // Program category (e.g., "BUREAUX", "LOGEMENTS")
  niveau: String,       // Level/floor (e.g., "RDC", "R+1", "S-1")
  fonction: String,     // Function (e.g., "Circulation", "Travail")
  local: String,        // Room/space name
  surfUnite: Number,    // Surface area per unit (m²)
  nombre: Number,       // Quantity/count
  isExt: Boolean,       // Is exterior space
  sueInt: Number,       // Internal surface (calculated)
  sueExt: Number,       // External surface (calculated)
  statut: String,       // Status (e.g., "VALIDÉ", "À CONFIRMER")
  priorite: String,     // Priority level
  remarque: String      // Notes/comments
}
```

### Graph Links Structure

```javascript
{
  id: String,          // Unique link ID
  from: String,        // Source item ID
  to: String           // Target item ID
}
```

### Type Configuration

The `App.state.types` object contains configurable categories:

```javascript
types: {
  programmes: [{ id, nom, bg, txt }],   // Program types
  niveaux: [{ id, nom, bg, txt }],      // Level types
  fonctions: [{ id, nom, bg, txt }],    // Function types
  statuts: [{ id, nom, bg, txt }],      // Status types
  priorites: [{ id, nom, bg, txt }]     // Priority types
}
```

## Key Features & Components

### 1. **Three View Modes**
- **List View** (`list`): Complete table with all items
- **Actions View** (`actions`): Filtered view showing items requiring action (non-validated status)
- **Graph View** (`graph`): Visual network diagram showing relationships between items

### 2. **Filtering System**
- Search by location name
- Multi-select filters for: Programme, Niveau, Fonction
- Saved views for quick filter presets
- Reset filters functionality

### 3. **Data Management**
- Add/Edit/Delete items via modal form
- Batch operations (edit multiple items at once)
- Import/Export JSON
- Export to CSV and PDF
- Undo functionality (20-step history)

### 4. **Graph Visualization**
- Interactive network diagram using vis-network
- Three coloring modes: by Programme, Niveau, or Fonction
- Link mode: Create connections between items
- Physics simulation toggle (freeze/unfreeze layout)
- Double-click items to edit
- Delete connections
- Persistent node positions

### 5. **Lock Mechanism**
- Lock button (🔓/🔒) prevents accidental edits
- Disables all editing functions when locked
- Useful for presentation or review mode

### 6. **Theming**
- Dark mode (default)
- Light mode toggle
- CSS custom properties for easy theming
- Persistent theme preference in localStorage

### 7. **Statistics Dashboard**
- Total internal surface area
- Total external surface area
- Donut charts for distribution by Programme and Niveau
- Real-time calculation based on filtered data

## LocalStorage Keys

The application uses these localStorage keys:

- `v7-data`: Main data array
- `v7-title`: Project title
- `v7-types`: Custom type configurations
- `v7-graph-links`: Graph connections
- `v7-graph-positions`: Node positions in graph
- `v7-locked`: Lock state
- `v7-theme`: Theme preference ('light' or 'dark')
- `v7-views`: Saved filter views

## Development Workflow

### Making Changes

1. **Read the entire `index.html` file first** - Everything is in one file
2. **Understand the state** - Most bugs relate to state management
3. **Check localStorage** - Data persists between sessions
4. **Test in browser** - No build step required
5. **Clear cache** - Service worker may cache old versions

### Common Development Tasks

#### Adding a New Field to Items

1. Update the data model in modal form (around line 306-326)
2. Add form field in `App.ui.openModalItem` (line 643-686)
3. Update `App.methods.saveForm()` to capture the field (line 537-549)
4. Add column to table in `App.render.content()` if needed (line 617-637)
5. Update CSV/PDF export if field should be included (line 553-554)

#### Adding a New Type Category

1. Add to `CONFIG.types` object (line 363-371)
2. Add dropdown/selector in filters UI
3. Update `App.render.modalSelects()` (line 573)
4. Add to settings modal for management

#### Modifying the Graph Visualization

Graph logic is in `App.graph` module (line 406-492):
- `start()`: Initializes vis-network
- `draw()`: Renders nodes and edges
- `updateColors()`: Changes color scheme
- `toggleLinkMode()`: Enables/disables link creation mode

#### Changing Styling

All styles are in the `<style>` tag (line 16-198):
- CSS custom properties in `:root` (line 18-34)
- Design system is well-organized with clear sections
- Light mode overrides in `:root.light` (line 27-34)

### Testing Checklist

When making changes, test:
- [ ] Add/Edit/Delete items
- [ ] Filtering (search, dropdowns, chips)
- [ ] All three views (list, actions, graph)
- [ ] Lock/unlock functionality
- [ ] Import/Export
- [ ] Batch operations
- [ ] Undo
- [ ] Theme switching
- [ ] Graph interactions (link mode, physics, zoom)
- [ ] Service worker doesn't cache old version
- [ ] Mobile responsiveness

## Code Conventions

### Naming Conventions

- **Element IDs**: Use descriptive kebab-case (e.g., `btn-save-json`, `modal-item`)
- **CSS Classes**: Use kebab-case (e.g., `batch-bar`, `graph-toolbar`)
- **JavaScript**: Use camelCase for variables and functions
- **Constants**: UPPER_CASE (e.g., `APP_VERSION`, `CACHE_NAME`)

### Function Organization

- **Pure functions in `App.helpers`**: For utilities and calculations
- **Side effects in `App.methods`**: For state changes
- **Rendering in `App.render`**: For DOM updates
- **Event handlers in `App.events`**: For binding events

### State Updates Pattern

```javascript
// 1. Push to history (if undoable)
App.methods.pushHistory();

// 2. Modify state
App.state.data = newData;

// 3. Save to localStorage
App.methods.saveLocal();

// 4. Re-render affected UI
App.render.all();
```

### Modal Pattern

```javascript
// Open modal
App.ui.openModalItem(item); // with item data or null for new

// Close modal
App.ui.closeModal('modal-id');

// Modal must have class "modal-overlay" and toggle "open" class
```

## Important Considerations

### Performance

- **Debounced save**: `App.methods.saveLocal()` is debounced (500ms) to prevent excessive localStorage writes
- **Efficient filtering**: `App.helpers.getFiltered()` is called frequently - keep it fast
- **Graph rendering**: Large datasets (>200 nodes) may slow down the graph view
- **History limit**: Only 20 undo steps to prevent memory issues

### Data Integrity

- **ID uniqueness**: Uses `Date.now()` for IDs - could have collisions if items created in same millisecond
- **Type references**: Items reference types by `nom` (name), not ID - renaming a type won't update existing items
- **Calculated fields**: `sueInt` and `sueExt` are calculated on save, not live

### Security Considerations

- **No authentication**: Application is client-side only
- **No server**: All data is in localStorage (user's browser)
- **XSS prevention**: `App.helpers.safe()` escapes HTML in user input (line 567)
- **Data export**: JSON exports contain all data including types and graph

### Browser Compatibility

- **Modern browsers only**: Uses ES6+, CSS Grid, CSS Custom Properties
- **Service Worker**: Requires HTTPS (or localhost) for PWA features
- **LocalStorage limits**: Usually 5-10MB - large datasets may hit limits

### Localization

- **French only**: All UI text is in French
- **Hard-coded strings**: No i18n system - strings are inline in HTML/JS
- **To translate**: Search and replace text in `index.html`

## Git Workflow

- **Current branch**: `claude/add-claude-documentation-9bSek`
- **Remote**: Uses local proxy at `127.0.0.1:65376`
- **Push format**: Always use `git push -u origin <branch-name>`
- **Branch naming**: Claude branches follow pattern `claude/<description>-<sessionId>`

## Common Pitfalls for AI Assistants

### ❌ Don't Do This

1. **Don't split the file**: The single-file architecture is intentional
2. **Don't add frameworks**: This is a vanilla JS project
3. **Don't add build tools**: No webpack, vite, etc. needed
4. **Don't forget to read first**: Always read the full `index.html` before editing
5. **Don't ignore the lock state**: Many functions check `App.state.locked`
6. **Don't modify without pushHistory**: User expects undo to work
7. **Don't forget saveLocal**: Changes won't persist without it
8. **Don't break the debounce**: `saveLocal()` is debounced for performance

### ✅ Do This

1. **Test the lock state**: Add `if (App.state.locked) return;` to editing functions
2. **Follow the module pattern**: Put functions in appropriate modules
3. **Use existing helpers**: `App.helpers.safe()`, `App.helpers.getFiltered()`, etc.
4. **Maintain CSS variables**: Use existing custom properties for styling
5. **Keep it simple**: Match the existing code style (vanilla JS)
6. **Update all views**: Changes may affect list, actions, and graph views
7. **Test localStorage**: Clear it if making data model changes
8. **Check service worker**: Update cache name in `service-worker.js` if HTML changes

## Quick Reference

### Adding a Toast Notification
```javascript
App.ui.toast("Your message here");
```

### Opening Modal with Item
```javascript
App.ui.openModalItem(item); // or null for new item
```

### Getting Filtered Data
```javascript
const filtered = App.helpers.getFiltered();
```

### Safe HTML Escaping
```javascript
const safe = App.helpers.safe(userInput);
```

### Triggering Re-render
```javascript
App.render.all(); // Re-renders everything
App.render.content(); // Just the table/content area
App.render.charts(); // Just the statistics
```

### Graph Operations
```javascript
App.graph.start(); // Initialize graph
App.graph.draw(); // Redraw graph
App.graph.fit(); // Fit to viewport
```

## Version History Notes

- **V8.36**: "UI Finalisée" - Finalized UI version
- **V7**: LocalStorage key prefix indicates major version
- **Service Worker**: Cache updated per version

## Support & Resources

- **No external documentation**: This file and code comments are primary docs
- **French UI**: Be comfortable with French terms (Local, Programme, Niveau, etc.)
- **Browser DevTools**: Essential for debugging - check Console and Application tabs

---

**Last Updated**: 2025-12-29
**For**: AI Assistants (Claude Code)
**Maintainer**: VinsBarch/prog-bellecour-apc
