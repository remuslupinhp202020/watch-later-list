document.addEventListener('DOMContentLoaded', () => {
    const googleSheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQZy6HsBu6eHeXTXzap2TeAlozXV5R3TM-Jo4Qbg1_YuBlISqVWR6IOB0WyF7zkyJU9Szx7hjXTDsry/pub?output=csv';

    const horizontalGrid = document.getElementById('horizontal-grid');
    const verticalGrid = document.getElementById('vertical-grid');
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const platformFilter = document.getElementById('platform-filter');

    let allLinksData = [];

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
            return [];
        }
    }

    function getEmbedURL(url) {
        if (!url) return null;
        const ytMatch = url.match(/(?:https?:\/\/)?(?:\w+\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
        if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
        
        const instaMatch = url.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:reel|p)\/([a-zA-Z0-9_-]+)/);
        if (instaMatch) return `https://www.instagram.com/p/${instaMatch[1]}/embed/`;
        
        const vimeoMatch = url.match(/(?:https?:\/\/)?(?:\w+\.)?vimeo\.com\/(\d+)/);
        if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
        
        return null;
    }

    function renderGrid(data) {
        horizontalGrid.innerHTML = '';
        verticalGrid.innerHTML = '';
        
        data.forEach(item => {
            const isVertical = item.link.includes('shorts') || item.link.includes('reel') || item.link.includes('instagram.com');
            const targetGrid = isVertical ? verticalGrid : horizontalGrid;
            
            const card = document.createElement('div');
            card.className = isVertical ? 'link-card vertical' : 'link-card horizontal';
            
            const embedURL = getEmbedURL(item.link);
            const customThumb = item.thumbnail && item.thumbnail.startsWith('http') ? item.thumbnail : null;

            let mediaHTML = '';
            if (embedURL) {
                // Wrap iframe for better cropping control
                mediaHTML = `<div class="media-container"><div class="iframe-wrapper"><iframe src="${embedURL}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div></div>`;
            } else if (customThumb) {
                mediaHTML = `<div class="media-container thumbnail-view" style="background-image: url('${customThumb}')"></div>`;
            } else {
                mediaHTML = `<div class="media-container link-preview"><div class="link-brand">🔗</div></div>`;
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
                        <a href="${item.link}" target="_blank" class="visit-link">Visit Source</a>
                    </div>
                </div>
            `;

            // SMART STOP LOGIC: Only stops others when you click a NEW one
            card.addEventListener('click', (e) => {
                // If clicking the Visit Source link, don't reset
                if (e.target.closest('.visit-link')) return;

                const currentIframe = card.querySelector('iframe');
                if (!currentIframe) return;

                const allIframes = document.querySelectorAll('iframe');
                allIframes.forEach(ifrm => {
                    if (ifrm !== currentIframe) {
                        const src = ifrm.src;
                        ifrm.src = '';
                        ifrm.src = src;
                    }
                });
            });

            targetGrid.appendChild(card);
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
                renderGrid(allLinksData);
            })
            .catch(() => {
                renderGrid([]);
            });
    }

    searchInput.addEventListener('input', filterData);
    categoryFilter.addEventListener('change', filterData);
    platformFilter.addEventListener('change', filterData);
    loadLinksFromSheet();
});
