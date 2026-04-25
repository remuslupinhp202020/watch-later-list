document.addEventListener('DOMContentLoaded', () => {
    // --- PASTE YOUR PUBLISHED GOOGLE SHEET CSV URL HERE ---
    const googleSheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQZy6HsBu6eHeXTXzap2TeAlozXV5R3TM-Jo4Qbg1_YuBlISqVWR6IOB0WyF7zkyJU9Szx7hjXTDsry/pub?output=csv';
    // ----------------------------------------------------

    const linksGrid = document.getElementById('links-grid');
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const platformFilter = document.getElementById('platform-filter');

    let allLinksData = [];

    // Robust CSV Parser that handles commas inside quotes
    function parseCSV(text) {
        const lines = text.trim().split('\n');
        const result = [];
        
        for (let i = 1; i < lines.length; i++) {
            const obj = {};
            // regex to split by comma except inside double quotes
            const currentline = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

            if (currentline.length < 6) continue;

            // Mapping based on: Timestamp, Name, Link, Category, Genre, Platform
            obj.name = currentline[1]?.replace(/^"|"$/g, '').trim() || '';
            obj.link = currentline[2]?.replace(/^"|"$/g, '').trim() || '';
            obj.category = currentline[3]?.replace(/^"|"$/g, '').trim() || '';
            obj.genre = currentline[4]?.replace(/^"|"$/g, '').trim() || '';
            obj.platform = currentline[5]?.replace(/^"|"$/g, '').trim() || '';
            
            if (obj.name && obj.link) {
                result.push(obj);
            }
        }
        return result;
    }

    // Helper to extract embed URLs for common video platforms
    function getEmbedURL(url) {
        if (!url) return null;
        
        // YouTube
        const ytMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

        // Vimeo
        const vimeoMatch = url.match(/(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/);
        if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

        return null;
    }

    // Helper to get platform-specific branding
    function getPlatformBranding(url, platformName) {
        const p = platformName.toLowerCase();
        const u = url.toLowerCase();
        
        if (p.includes('netflix') || u.includes('netflix')) return { color: '#e50914', icon: 'N', name: 'Netflix' };
        if (p.includes('instagram') || u.includes('instagram')) return { color: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', icon: '📸', name: 'Instagram' };
        if (p.includes('amazon') || p.includes('prime') || u.includes('primevideo')) return { color: '#00a8e1', icon: 'P', name: 'Prime Video' };
        if (p.includes('hotstar') || u.includes('hotstar')) return { color: '#001524', icon: 'H', name: 'Hotstar' };
        if (p.includes('youtube') || u.includes('youtube') || u.includes('youtu.be')) return { color: '#ff0000', icon: 'Y', name: 'YouTube' };
        
        return { color: '#334155', icon: '🔗', name: platformName || 'Link' };
    }

    // Render the grid of cards
    function renderGrid(data) {
        linksGrid.innerHTML = '';
        
        if (data.length === 0) {
            linksGrid.innerHTML = '<div class="no-results">No items found matching your criteria.</div>';
            return;
        }

        data.forEach(item => {
            const card = document.createElement('div');
            card.className = 'link-card';
            
            const embedURL = getEmbedURL(item.link);
            const branding = getPlatformBranding(item.link, item.platform);
            
            let mediaHTML = '';
            if (embedURL) {
                mediaHTML = `<div class="media-container"><iframe src="${embedURL}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
            } else {
                mediaHTML = `
                    <div class="media-container link-preview" style="background: ${branding.color}">
                        <div class="link-brand">${branding.icon}</div>
                        <div class="platform-label">${branding.name}</div>
                        <a href="${item.link}" target="_blank" class="preview-btn">Open on ${branding.name}</a>
                    </div>`;
            }

            card.innerHTML = `
                ${mediaHTML}
                <div class="card-content">
                    <div class="card-tags">
                        <span class="tag category">${item.category}</span>
                        <span class="tag platform">${item.platform}</span>
                    </div>
                    <h3 class="card-title">${item.name}</h3>
                    <p class="card-genre">${item.genre}</p>
                    <div class="card-footer">
                        <a href="${item.link}" target="_blank" class="visit-link">
                            Visit Source
                            <svg viewBox="0 0 24 24" width="16" height="16"><path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z" fill="currentColor"/></svg>
                        </a>
                    </div>
                </div>
            `;
            linksGrid.appendChild(card);
        });
    }

    // Populate filter dropdowns dynamically from data
    function populateFilters(data) {
        const categories = [...new Set(data.map(item => item.category).filter(Boolean))].sort();
        const platforms = [...new Set(data.map(item => item.platform).filter(Boolean))].sort();

        categories.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat;
            categoryFilter.appendChild(opt);
        });

        platforms.forEach(plat => {
            const opt = document.createElement('option');
            opt.value = plat;
            opt.textContent = plat;
            platformFilter.appendChild(opt);
        });
    }

    // Filter logic
    function filterData() {
        const searchTerm = searchInput.value.toLowerCase();
        const catValue = categoryFilter.value;
        const platValue = platformFilter.value;

        const filtered = allLinksData.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm) || 
                                 item.category.toLowerCase().includes(searchTerm) || 
                                 item.platform.toLowerCase().includes(searchTerm) ||
                                 item.genre.toLowerCase().includes(searchTerm);
            const matchesCat = catValue === 'all' || item.category === catValue;
            const matchesPlat = platValue === 'all' || item.platform === platValue;

            return matchesSearch && matchesCat && matchesPlat;
        });

        renderGrid(filtered);
    }

    // Sample data for preview when fetch fails (e.g., local file access)
    const sampleData = [
        { name: "Bulla at Biella Jazz Club | Rabbi Shergill", link: "https://www.youtube.com/watch?v=z5X6fczz54Q", category: "Music 🎵", genre: "Sufi 👳", platform: "YouTube" },
        { name: "Sisters Season 2", link: "https://www.youtube.com/watch?v=Pls0Uw_omDk", category: "TV Show 📺", genre: "Comedy 😁", platform: "YouTube" },
        { name: "I Left The U.S. For India...", link: "https://www.youtube.com/watch?v=3enHvs7VaN8", category: "Vlog 🙋‍♂️", genre: "Business 💰", platform: "YouTube" },
        { name: "Chipotle Cheese Spread", link: "https://youtube.com/shorts/6xBEbs83QQg", category: "Recipe 🍕", genre: "Food 🍔", platform: "YouTube" }
    ];

    // Initial load
    function loadLinksFromSheet() {
        fetch(googleSheetURL)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.text();
            })
            .then(csvText => {
                allLinksData = parseCSV(csvText);
                populateFilters(allLinksData);
                renderGrid(allLinksData);
            })
            .catch(error => {
                console.warn("Fetch failed, loading sample data for preview:", error);
                allLinksData = sampleData;
                populateFilters(allLinksData);
                renderGrid(allLinksData);
                
                // Add a small notice about why sample data is showing
                const notice = document.createElement('div');
                notice.style.cssText = 'grid-column: 1/-1; text-align: center; padding: 10px; background: rgba(255,165,0,0.1); color: #fbbf24; border-radius: 8px; margin-bottom: 20px; font-size: 0.9rem; border: 1px solid rgba(255,165,0,0.2);';
                notice.innerHTML = '⚠️ <b>Preview Mode:</b> Loading from local disk prevents fetching live data. Deploy to Netlify or use a local server to see your live Google Sheet.';
                linksGrid.prepend(notice);
            });
    }

    // Event Listeners
    searchInput.addEventListener('input', filterData);
    categoryFilter.addEventListener('change', filterData);
    platformFilter.addEventListener('change', filterData);

    loadLinksFromSheet();
});
