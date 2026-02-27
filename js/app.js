/**
 * Z.AI Frontend Prototype — app.js
 * Full interactivity: navigation, wizard, chat, explore, avatar dropdown, dark mode
 */

// ── Page registry (search) ───────────────────────────────────────────────────
const PAGES = [
  { title: 'Home',                page: 'home',    icon: 'home'           },
  { title: 'AI Chat',             page: 'chat',    icon: 'message-square' },
  { title: 'Explore Experiments', page: 'explore', icon: 'compass'        },
  { title: 'Create Experiment',   page: 'create',  icon: 'plus-circle'    },
  { title: 'Learn',               page: 'learn',   icon: 'book-open'      },
];

// ── Page Navigation ──────────────────────────────────────────────────────────
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));

  const page = document.getElementById('page-' + pageId);
  if (page) {
    page.classList.add('active');
  } else {
    document.getElementById('page-home')?.classList.add('active');
    pageId = 'home';
  }

  const sidebarItem = document.querySelector(`.sidebar-item[data-page="${pageId}"]`);
  if (sidebarItem) sidebarItem.classList.add('active');

  document.querySelector('.app-content')?.scrollTo(0, 0);
  closeAvatarDropdown();
  lucide.createIcons();
}

// ── Dark Mode ─────────────────────────────────────────────────────────────────
function applyTheme(isDark) {
  const html = document.documentElement;
  const icon = document.getElementById('darkModeIcon');
  if (isDark) {
    html.setAttribute('data-theme', 'dark');
    if (icon) { icon.setAttribute('data-lucide', 'sun'); }
  } else {
    html.removeAttribute('data-theme');
    if (icon) { icon.setAttribute('data-lucide', 'moon'); }
  }
  lucide.createIcons();
}

function toggleDarkMode() {
  const isDark = document.documentElement.hasAttribute('data-theme');
  const newDark = !isDark;
  localStorage.setItem('zebraai-theme', newDark ? 'dark' : 'light');
  applyTheme(newDark);
}

// ── Sidebar Toggle ────────────────────────────────────────────────────────────
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar?.classList.toggle('collapsed');
  lucide.createIcons();
}

// ── Avatar Dropdown ───────────────────────────────────────────────────────────
function closeAvatarDropdown() {
  document.getElementById('avatarDropdown')?.classList.remove('open');
}

document.addEventListener('DOMContentLoaded', () => {
  // ── Restore saved theme ──
  const savedTheme = localStorage.getItem('zebraai-theme');
  // Also check system preference if no saved preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const shouldBeDark = savedTheme ? savedTheme === 'dark' : prefersDark;
  applyTheme(shouldBeDark);

  // ── Avatar dropdown ──
  const avatarWrap = document.getElementById('avatarWrap');
  const avatarDropdown = document.getElementById('avatarDropdown');

  if (avatarWrap) {
    avatarWrap.addEventListener('click', (e) => {
      e.stopPropagation();
      avatarDropdown?.classList.toggle('open');
    });
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#avatarWrap')) {
      closeAvatarDropdown();
    }
  });

  lucide.createIcons();
});

// ── Search ────────────────────────────────────────────────────────────────────
const searchInput    = document.getElementById('searchInput');
const searchDropdown = document.getElementById('searchDropdown');

function renderSearchResults(query) {
  const q = query.trim().toLowerCase();
  searchDropdown.innerHTML = '';

  if (!q) { searchDropdown.classList.remove('visible'); return; }

  const results = PAGES.filter(p => p.title.toLowerCase().includes(q));
  if (!results.length) { searchDropdown.classList.remove('visible'); return; }

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

searchInput?.addEventListener('input', e => renderSearchResults(e.target.value));
searchInput?.addEventListener('keydown', e => {
  if (e.key === 'Escape') { searchDropdown.classList.remove('visible'); searchInput.value = ''; searchInput.blur(); }
  if (e.key === 'Enter')  { const first = searchDropdown.querySelector('.search-result'); if (first) first.click(); }
  if (e.key === 'ArrowDown') { const items = searchDropdown.querySelectorAll('.search-result'); if (items.length) items[0].focus(); e.preventDefault(); }
});
document.addEventListener('click', e => {
  if (!e.target.closest('.search-wrap')) searchDropdown.classList.remove('visible');
});

// ══════════════════════════════════════════════════════════
// EXPLORE PAGE
// ══════════════════════════════════════════════════════════
function showExploreFilter() {
  document.getElementById('explore-filter-view').style.display = 'block';
  document.getElementById('explore-results-view').style.display = 'none';
  lucide.createIcons();
}

function showExploreResults() {
  document.getElementById('explore-filter-view').style.display = 'none';
  document.getElementById('explore-results-view').style.display = 'block';
  lucide.createIcons();
}

function setExploreView(view) {
  const grid = document.getElementById('explore-grid');
  const list = document.getElementById('explore-list');
  const gridBtn = document.getElementById('gridViewBtn');
  const listBtn = document.getElementById('listViewBtn');

  if (view === 'grid') {
    grid.style.display = 'grid';
    list.style.display = 'none';
    gridBtn?.classList.add('active');
    listBtn?.classList.remove('active');
  } else {
    grid.style.display = 'none';
    list.style.display = 'flex';
    listBtn?.classList.add('active');
    gridBtn?.classList.remove('active');
  }
  lucide.createIcons();
}

// ══════════════════════════════════════════════════════════
// CREATE WIZARD
// ══════════════════════════════════════════════════════════
let currentStep = 1;

function goToStep(step) {
  // Hide current, deactivate
  const currentEl = document.getElementById('wizard-step-' + currentStep);
  if (currentEl) currentEl.classList.remove('active');

  // Mark completed steps
  document.querySelectorAll('.step-item').forEach(item => {
    const s = parseInt(item.dataset.step);
    item.classList.remove('active', 'completed');
    if (s < step) item.classList.add('completed');
    if (s === step) item.classList.add('active');
  });

  // Show new step
  currentStep = step;
  const newEl = document.getElementById('wizard-step-' + step);
  if (newEl) {
    newEl.classList.add('active');
    newEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  lucide.createIcons();
}

function updateEditorModeLabel(checkbox) {
  const label = document.getElementById('editorModeLabel');
  if (label) label.textContent = checkbox.checked ? 'HTML' : 'Text';
}

// ══════════════════════════════════════════════════════════
// AI CHAT PAGE
// ══════════════════════════════════════════════════════════
let chatActive = false;

// Simulated AI responses
const AI_RESPONSES = {
  default: `Great question! You can create an AI experiment in just a few steps. Here's how to get started:

1. **Enter Experiment Details** – Give your experiment a name, choose a share level, and provide a brief description to define its purpose.
2. **Go to the "Create" Page** – Navigate to the Create section in Z.AI to begin setting up your experiment.
3. **Design the User Experience** – Set up how users will interact with your experiment. This includes defining inputs, outputs, and behavior.
4. **Configure the Prompt & Parameters** – Customize how the AI will respond by crafting prompts and fine-tuning parameters.
5. **Review & Share** – Once everything is set, save your experiment and share it with the community or keep it private for testing.`,
  analyze: `Here are the key patterns I found in your experiment logs:

1. **Response latency** averages 1.2s — well within acceptable range.
2. **Token usage** spikes on longer prompts; consider chunking inputs.
3. **Accuracy scores** are highest when temperature is set to 0.4–0.6.
4. **Error rate** is 2.3%, mostly from malformed JSON inputs.

Recommendations: normalize input lengths and add input validation before sending to the model.`,
  optimize: `Here are some optimization strategies for your experiment:

1. **Lower temperature** (0.3–0.5) for more consistent, factual responses.
2. **Add system context** describing the use case to reduce off-topic outputs.
3. **Use few-shot examples** in the prompt to guide the model's format.
4. **Cache frequent queries** to reduce API calls and improve response time.
5. **Monitor token usage** and trim verbose prompts where possible.`
};

function getAIResponse(message) {
  const lower = message.toLowerCase();
  if (lower.includes('analyze') || lower.includes('patterns') || lower.includes('logs')) {
    return AI_RESPONSES.analyze;
  }
  if (lower.includes('optimize') || lower.includes('better results') || lower.includes('debug')) {
    return AI_RESPONSES.optimize;
  }
  return AI_RESPONSES.default;
}

function sendSuggestedMessage(text) {
  // Hide suggestions
  const suggestions = document.getElementById('chatSuggestions');
  if (suggestions) suggestions.style.display = 'none';

  // Show the question bubble
  const introQuestion = document.getElementById('chatIntroQuestion');
  if (introQuestion) {
    introQuestion.textContent = text;
    introQuestion.classList.add('visible');
  }

  chatActive = true;

  // Simulate AI response after a short delay
  setTimeout(() => {
    appendAIMessage(getAIResponse(text));
  }, 800);

  lucide.createIcons();
}

function sendChatMessage() {
  const input = document.getElementById('chatInputField');
  const text = input?.value.trim();
  if (!text) return;

  // Hide suggestions on first message
  if (!chatActive) {
    const suggestions = document.getElementById('chatSuggestions');
    if (suggestions) suggestions.style.display = 'none';
    chatActive = true;
  }

  // Show intro question if first message
  const introQuestion = document.getElementById('chatIntroQuestion');
  if (introQuestion && !introQuestion.classList.contains('visible')) {
    introQuestion.textContent = text;
    introQuestion.classList.add('visible');
  } else {
    // Append user message
    appendUserMessage(text);
  }

  input.value = '';
  input.style.height = 'auto';

  // Simulate AI response
  setTimeout(() => {
    appendAIMessage(getAIResponse(text));
  }, 700);
}

function appendUserMessage(text) {
  const list = document.getElementById('messageList');
  if (!list) return;

  const div = document.createElement('div');
  div.className = 'chat-message chat-message--user';
  div.innerHTML = `
    <div class="chat-message-avatar"><i data-lucide="user"></i></div>
    <div class="chat-message-body">${escapeHtml(text)}</div>
  `;
  list.appendChild(div);
  scrollChatToBottom();
  lucide.createIcons();
}

function appendAIMessage(text) {
  const list = document.getElementById('messageList');
  if (!list) return;

  // Format markdown-style bold and lists
  const formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .split('\n')
    .map((line, i) => {
      if (line.match(/^\d+\./)) return `<li>${line.replace(/^\d+\.\s*/, '')}</li>`;
      return line ? `<p>${line}</p>` : '';
    })
    .join('');

  const hasListItems = text.match(/^\d+\./m);
  const content = hasListItems
    ? `<p>${text.split('\n')[0].replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p><ol>${text.split('\n').filter(l => l.match(/^\d+\./)).map(l => `<li>${l.replace(/^\d+\.\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`).join('')}</ol>`
    : `<p>${text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')}</p>`;

  const div = document.createElement('div');
  div.className = 'chat-message';
  div.innerHTML = `
    <div class="chat-message-avatar" style="background:#fafafa;font-size:16px;">🤖</div>
    <div class="chat-message-body">
      <div class="chat-sender-name"><span>ZebraAI</span></div>
      ${content}
    </div>
  `;
  list.appendChild(div);
  scrollChatToBottom();
  lucide.createIcons();
}

function scrollChatToBottom() {
  const feed = document.getElementById('chatFeed');
  if (feed) feed.scrollTop = feed.scrollHeight;
}

function resetChat() {
  chatActive = false;
  const list = document.getElementById('messageList');
  if (list) list.innerHTML = '';

  const introQuestion = document.getElementById('chatIntroQuestion');
  if (introQuestion) { introQuestion.textContent = ''; introQuestion.classList.remove('visible'); }

  const suggestions = document.getElementById('chatSuggestions');
  if (suggestions) suggestions.style.display = 'grid';

  const input = document.getElementById('chatInputField');
  if (input) { input.value = ''; input.style.height = 'auto'; }

  lucide.createIcons();
}

function toggleChatParams() {
  const panel = document.getElementById('chatParamsPanel');
  panel?.classList.toggle('open');
  lucide.createIcons();
}

function handleChatKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendChatMessage();
  }
}

function autoResizeTextarea(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
