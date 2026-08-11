document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.prof-actions .contact').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.prof-card');
      const name = card.querySelector('.prof-body strong').innerText;
      alert(`Compose message to ${name} (demo)`);
    });
  });

  const newSearch = document.querySelector('.search-btn');
  if (newSearch) newSearch.addEventListener('click', () => {
    const overlay = document.querySelector('.search_overlay');
    if (overlay) overlay.classList.add('active');
    if (overlay.classList.contains('active')) {
      const closeOverlay = (e) => {
        if (e.target === overlay || e.target.classList.contains('close-search')) {
          overlay.classList.remove('active');
          overlay.removeEventListener('click', closeOverlay);
        }
      };
      overlay.addEventListener('click', closeOverlay);
    }
  });

  const searchInput = document.getElementById('searchy');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();
      const resultsContainer = document.querySelector('.search_results');
      if (resultsContainer) {
        if (query.length === 0) {
          resultsContainer.innerHTML = '<p class="muted">No results found.</p>';
          return;
        }
        
        // Simulate search results for demo purposes
        const simulatedResults = [
          { title: 'Paper on AI', type: 'paper' },
          { title: 'Professor John Doe', type: 'professor' },
          { title: 'Topic: Machine Learning', type: 'topic' }
        ].filter(item => item.title.toLowerCase().includes(query));

        if (simulatedResults.length > 0) {
          resultsContainer.innerHTML = simulatedResults.map(item => `<p>${item.title} (${item.type})</p>`).join('');
        } else {
          resultsContainer.innerHTML = '<p class="muted">No results found.</p>';
        }
      }
    });
  }
});
