document.addEventListener('DOMContentLoaded', () => {
    const googleSheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQZy6HsBu6eHeXTXzap2TeAlozXV5R3TM-Jo4Qbg1_YuBlISqVWR6IOB0WyF7zkyJU9Szx7hjXTDsry/pub?output=csv';

    const horizontalGrid = document.getElementById('horizontal-grid');
    const verticalGrid = document.getElementById('vertical-grid');
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const platformFilter = document.getElementById('platform-filter');

    let allLinksData = [];
    let currentPlayingContainer = null;

    function parseCSV(text) {
        try {
            const lines = text.trim().split('\n');
            const result = [];
            for (let i = 1; i < lines.length; i++) {
                const currentline = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
                if (currentline.length < 3) continue;

                const obj = {
                    name: currentline[1]?.replace(/^"|"$/g, '').trim() || 'Untitled',
                    link: currentline[2]?.replace(/^"|"$/g, '').trim() || '',
                    category: currentline[3]?.replace(/^"|"$/g, '').trim() || 'Other',
                    genre: currentline[4]?.replace(/^"|"$/g, '').trim() || '',
                    platform: currentline[5]?.replace(/^"|"$/g, '').trim() || 'Link',
                    thumbnail: (currentline[9] || currentline[8])?.replace(/^"|"$/g, '').trim() || ''
                };
                
                if (obj.link) result.push(obj);
            }
            return result;
        } catch (e) {
            console.error("CSV Parsing Error:", e);
            return [];
        }
    }

    function getYouTubeThumbnail(url) {
        if (!url) return null;
        const ytMatch = url.match(/(?:https?:\/\/)?(?:\w+\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
        return ytMatch ? `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg` : null;
    }

    function getEmbedURL(url) {
        if (!url) return null;
        const ytMatch = url.match(/(?:https?:\/\/)?(?:\w+\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
        if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
        
        const instaMatch = url.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:reel|p)\/([a-zA-Z0-9_-]+)/);
        if (instaMatch) return `https://www.instagram.com/p/${instaMatch[1]}/embed/`;
        
        const vimeoMatch = url.match(/(?:https?:\/\/)?(?:\w+\.)?vimeo\.com\/(\d+)/);
        if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
        
        return null;
    }

    function getPlatformBranding(url, platformName) {
        const p = (platformName || '').toLowerCase();
        const u = (url || '').toLowerCase();
        if (p.includes('netflix') || u.includes('netflix')) return { color: '#e50914', icon: 'N', name: 'Netflix' };
        if (p.includes('instagram') || u.includes('instagram')) return { color: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', icon: '📸', name: 'Instagram' };
        if (p.includes('amazon') || p.includes('prime') || u.includes('primevideo')) return { color: '#00a8e1', icon: 'P', name: 'Prime Video' };
        if (p.includes('hotstar') || u.includes('hotstar')) return { color: '#001524', icon: 'H', name: 'Hotstar' };
        if (p.includes('youtube') || u.includes('youtube') || u.includes('youtu.be')) return { color: '#ff0000', icon: 'Y', name: 'YouTube' };
        return { color: '#334155', icon: '🔗', name: platformName || 'Link' };
    }

    function renderGrid(data) {
        horizontalGrid.innerHTML = '';
        verticalGrid.innerHTML = '';
        let hCount = 0; let vCount = 0;

        data.forEach(item => {
            const isVertical = item.link.includes('shorts') || item.link.includes('reel') || item.link.includes('instagram.com');
            const targetGrid = isVertical ? verticalGrid : horizontalGrid;
            
            const card = document.createElement('div');
            card.className = isVertical ? 'link-card vertical' : 'link-card horizontal';
            
            const embedURL = getEmbedURL(item.link);
            const branding = getPlatformBranding(item.link, item.platform);
            const ytThumb = getYouTubeThumbnail(item.link);
            const customThumb = item.thumbnail && item.thumbnail.startsWith('http') ? item.thumbnail : null;
            const posterImg = customThumb || ytThumb;

            let mediaContentHTML = '';
            if (posterImg) {
                mediaContentHTML = `<div class="poster-image" style="background-image: url('${posterImg}')"></div>`;
            } else {
                mediaContentHTML = `<div class="link-preview" style="background: ${branding.color}"><div class="link-brand">${branding.icon}</div><div class="platform-label">${branding.name}</div></div>`;
            }

            const mediaContainer = document.createElement('div');
            mediaContainer.className = 'media-container';
            mediaContainer.innerHTML = `
                ${mediaContentHTML}
                ${embedURL ? '<div class="play-overlay"><svg viewBox="0 0 24 24"><path d="M8,5.14V19.14L19,12.14L8,5.14Z" fill="white"/></svg></div>' : ''}
            `;

            // Click to Play Logic
            if (embedURL) {
                mediaContainer.style.cursor = 'pointer';
                mediaContainer.onclick = () => {
                    if (currentPlayingContainer && currentPlayingContainer !== mediaContainer) {
                        // Restore previous container to poster
                        currentPlayingContainer.innerHTML = currentPlayingContainer.getAttribute('data-original-html');
                    }
                    
                    if (!mediaContainer.getAttribute('data-original-html')) {
                        mediaContainer.setAttribute('data-original-html', mediaContainer.innerHTML);
                    }

                    mediaContainer.innerHTML = `<iframe src="${embedURL}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
                    currentPlayingContainer = mediaContainer;
                };
            }

            card.innerHTML = `
                <div class="card-content">
                    <div class="card-tags">
                        <span class="tag category">${item.category}</span>
                        <span class="tag platform">${item.platform}</span>
                    </div>
                    <h3 class="card-title">${item.name}</h3>
                    <p class="card-genre">${item.genre}</p>
                    <div class="card-footer">
                        <a href="${item.link}" target="_blank" class="visit-link">Visit Source</a>
                    </div>
                </div>
            `;
            card.prepend(mediaContainer);
            targetGrid.appendChild(card);
            if (isVertical) vCount++; else hCount++;
        });

        if (hCount === 0) horizontalGrid.innerHTML = '<div class="no-results">No horizontal videos found.</div>';
        if (vCount === 0) verticalGrid.innerHTML = '<div class="no-results">No reels found.</div>';
    }

    function populateFilters(data) {
        categoryFilter.innerHTML = '<option value="all">All Categories</option>';
        platformFilter.innerHTML = '<option value="all">All Platforms</option>';
        const categories = [...new Set(data.map(item => item.category).filter(Boolean))].sort();
        const platforms = [...new Set(data.map(item => item.platform).filter(Boolean))].sort();
        categories.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat; opt.textContent = cat;
            categoryFilter.appendChild(opt);
        });
        platforms.forEach(plat => {
            const opt = document.createElement('option');
            opt.value = plat; opt.textContent = plat;
            platformFilter.appendChild(opt);
        });
    }

    function filterData() {
        const searchTerm = searchInput.value.toLowerCase();
        const catValue = categoryFilter.value;
        const platValue = platformFilter.value;
        const filtered = allLinksData.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm) || item.category.toLowerCase().includes(searchTerm);
            const matchesCat = catValue === 'all' || item.category === catValue;
            const matchesPlat = platValue === 'all' || item.platform === platValue;
            return matchesSearch && matchesCat && matchesPlat;
        });
        renderGrid(filtered);
    }

    function loadLinksFromSheet() {
        fetch(googleSheetURL)
            .then(res => res.ok ? res.text() : Promise.reject('Network error'))
            .then(text => {
                allLinksData = parseCSV(text);
                populateFilters(allLinksData);
                renderGrid(allLinksData);
            })
            .catch(err => {
                console.warn("Using sample data");
                renderGrid([]);
            });
    }

    searchInput.addEventListener('input', filterData);
    categoryFilter.addEventListener('change', filterData);
    platformFilter.addEventListener('change', filterData);
    loadLinksFromSheet();
});
