/**
 * Z.AI Frontend Prototype — app.js
 * Handles: page navigation, search, icon init
 */

// ── Page registry (for search) ──────────────────────────────────────────────
const PAGES = [
  { title: 'Home',                 page: 'home',    icon: 'home'          },
  { title: 'AI Chat',              page: 'chat',    icon: 'message-square'},
  { title: 'Explore Experiments',  page: 'explore', icon: 'compass'       },
  { title: 'Create Experiment',    page: 'create',  icon: 'plus-circle'   },
  { title: 'Learn',                page: 'learn',   icon: 'book-open'     },
];

// ── Navigation ───────────────────────────────────────────────────────────────
function showPage(pageId) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  // De-activate all sidebar items
  document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));

  // Show target page
  const page = document.getElementById('page-' + pageId);
  if (page) {
    page.classList.add('active');
  } else {
    console.warn('[Z.AI] Page not found:', pageId);
    document.getElementById('page-home')?.classList.add('active');
  }

  // Highlight sidebar item
  const sidebarItem = document.querySelector(`.sidebar-item[data-page="${pageId}"]`);
  if (sidebarItem) sidebarItem.classList.add('active');

  // Scroll content back to top
  document.querySelector('.app-content')?.scrollTo(0, 0);

  // Re-render icons (Lucide needs this after DOM changes)
  lucide.createIcons();
}

// ── Search ────────────────────────────────────────────────────────────────────
const searchInput    = document.getElementById('searchInput');
const searchDropdown = document.getElementById('searchDropdown');

function renderSearchResults(query) {
  const q = query.trim().toLowerCase();
  searchDropdown.innerHTML = '';

  if (!q) {
    searchDropdown.classList.remove('visible');
    return;
  }

  const results = PAGES.filter(p => p.title.toLowerCase().includes(q));

  if (!results.length) {
    searchDropdown.classList.remove('visible');
    return;
  }

  results.forEach(r => {
    const item = document.createElement('div');
    item.className = 'search-result';
    item.innerHTML = `<i data-lucide="${r.icon}"></i> ${r.title}`;
    item.addEventListener('click', () => {
      showPage(r.page);
      searchInput.value = '';
      searchDropdown.classList.remove('visible');
    });
    searchDropdown.appendChild(item);
  });

  lucide.createIcons();
  searchDropdown.classList.add('visible');
}

searchInput.addEventListener('input', e => renderSearchResults(e.target.value));

searchInput.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    searchDropdown.classList.remove('visible');
    searchInput.value = '';
    searchInput.blur();
  }
  if (e.key === 'Enter') {
    const first = searchDropdown.querySelector('.search-result');
    if (first) first.click();
  }
  if (e.key === 'ArrowDown') {
    const items = searchDropdown.querySelectorAll('.search-result');
    if (items.length) items[0].focus();
    e.preventDefault();
  }
});

// Close dropdown when clicking outside
document.addEventListener('click', e => {
  if (!e.target.closest('.search-wrap')) {
    searchDropdown.classList.remove('visible');
  }
});

// ── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
});
