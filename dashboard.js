document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.prof-actions .contact').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.prof-card');
      const name = card.querySelector('.prof-body strong').innerText;
      alert(`Compose message to ${name} (demo)`);
    });
  });

  const OPENALEX_SEARCH_URL = 'https://api.openalex.org/works';
  const OPENALEX_API_KEY = 'vM2YhO48RAxHeUxTw3AJru';
  const DEBOUNCE_DELAY = 400;
  let debounceTimer = null;
  let activeFetchController = null;
  const savedPapers = new Map();

  const escapeHtml = (value = '') => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  const renderEmptyState = (message = 'No results found.') => {
    const resultsContainer = document.querySelector('.search_results');
    if (!resultsContainer) return;
    resultsContainer.innerHTML = `<p class="muted">${message}</p>`;
  };

  const updateSavedPapersList = () => {
    const list = document.querySelector('.saved-papers-list');
    const statNumber = document.querySelector('.stat .stat-number');
    if (!list) return;

    if (savedPapers.size === 0) {
      list.innerHTML = '<p class="muted">No papers saved yet.</p>';
    } else {
      const entries = Array.from(savedPapers.values()).slice(0, 5);
      list.innerHTML = entries.map((paper) => `
        <div class="saved-paper-item">
          <span>${escapeHtml(paper.title)}</span>
          <a href="${paper.url}" target="_blank" rel="noopener noreferrer">Open</a>
        </div>
      `).join('');
    }

    if (savedPapers.size === 0) {
      statNumber.innerHTML = String(0);
    }
    else {
      statNumber.innerHTML = String(savedPapers.size);
    }
    
  };

  const savePaper = (paper) => {
    const key = paper.id || paper.url || paper.title;
    if (!savedPapers.has(key)) {
      savedPapers.set(key, paper);
      updateSavedPapersList();
    }
  };

   const unsavePaper = (paper) => {
    const key = paper.id || paper.url || paper.title;
    if (savedPapers.has(key)) {
      savedPapers.delete(key);
      updateSavedPapersList();
    }
  };

  const renderResults = (items) => {
    const resultsContainer = document.querySelector('.search_results');
    if (!resultsContainer) return;

    if (!items || items.length === 0) {
      renderEmptyState();
      return;
    }

    resultsContainer.innerHTML = items.map((item) => {
      const title = item.display_name || 'Untitled paper';
      const authors = item.authorships
        ?.slice(0, 3)
        .map((entry) => entry.author?.display_name)
        .filter(Boolean)
        .join(', ') || 'Unknown author';
      const year = item.publication_year || 'N/A';
      const venue = item.primary_location?.source?.display_name || item.host_venue?.display_name || 'Unknown venue';
      const type = item.type_display || item.type || 'work';
      const url = item.primary_location?.landing_page_url || item.ids?.openalex || item.id || '#';
      const paperId = item.id || url;

      return `
        <div class="result-item" data-result-title="${escapeHtml(title)}" data-paper-id="${escapeHtml(paperId)}">
          <div class="result-topline">
            <span class="result-type">${escapeHtml(type)}</span>
            <span class="result-year">${escapeHtml(year)}</span>
          </div>
          <div class="result-title">${escapeHtml(title)}</div>
          <div class="result-meta">${escapeHtml(authors)}</div>
          <div class="result-venue">${escapeHtml(venue)}</div>
          <div class="result-actions">
            <a class="result-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">Open</a>
            <button class="result-save" type="button" data-paper-id="${escapeHtml(paperId)}" data-paper-title="${escapeHtml(title)}" data-paper-url="${escapeHtml(url)}">Save</button>
          </div>
        </div>
      `;
    }).join('');

    resultsContainer.querySelectorAll('.result-item').forEach((card) => {
      card.addEventListener('click', (event) => {
        if (event.target.closest('a, button')) return;
        const searchInput = document.getElementById('searchy');
        if (searchInput) {
          searchInput.value = card.dataset.resultTitle || '';
        }
      });
    });

    resultsContainer.querySelectorAll('.result-save').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        const paper = {
          id: button.dataset.paperId,
          title: button.dataset.paperTitle,
          url: button.dataset.paperUrl
        };
         if (paper) {
          savePaper(paper);
          button.textContent = 'Saved';
          button.disabled = true;
        };
        
      });
    });
  };

  let currentPage = 1;
  const fetchOpenAlexResults = async (query) => {
    const resultsContainer = document.querySelector('.search_results');
    if (!resultsContainer) return;
    const page = currentPage;

    if (activeFetchController) {
      activeFetchController.abort();
    }

    activeFetchController = new AbortController();

    resultsContainer.innerHTML = `
      <div class="search-loading">
        <span class="loading-spinner"></span>
        <span>Searching OpenAlex...</span>
      </div>
    `;

    try {
      const url = new URL(OPENALEX_SEARCH_URL);
      url.searchParams.set('search', query);
      url.searchParams.set('per-page', '5');
      url.searchParams.set('page', String(page));
      url.searchParams.set('api_key', OPENALEX_API_KEY);
      url.searchParams.set('mailto', 'jerespacetime@gmail.com');

      const response = await fetch(url.toString(), { signal: activeFetchController.signal });
      if (!response.ok) {
        throw new Error(`OpenAlex request failed with status ${response.status}`);
      }

      const data = await response.json();
      renderResults(data.results || []);
    } catch (error) {
      if (error.name === 'AbortError') return;
      renderEmptyState('Unable to load results right now.');
    }
    currentPage = page;
  };

  const newSearch = document.querySelector('.search-btn');
  if (newSearch) newSearch.addEventListener('click', () => {
    const overlay = document.querySelector('.search_overlay');
    if (!overlay) return;

    overlay.classList.add('active');
    const searchInput = document.getElementById('searchy');
    if (searchInput) {
      searchInput.focus();
    }

    const closeOverlay = (event) => {
      if (event.target === overlay) {
        overlay.classList.remove('active');
        overlay.removeEventListener('click', closeOverlay);
      }
    };

    overlay.addEventListener('click', closeOverlay);
  });

  const searchInput = document.getElementById('searchy');
  if (searchInput) {
    searchInput.addEventListener('input', (event) => {
      const query = event.target.value.trim();

      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      if (!query) {
        renderEmptyState();
        if (activeFetchController) {
          activeFetchController.abort();
        }
        return;
      }

      debounceTimer = setTimeout(() => {
        fetchOpenAlexResults(query);
      }, DEBOUNCE_DELAY);
    });
  }
});
