document.addEventListener('DOMContentLoaded', () => {
    const googleSheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQZy6HsBu6eHeXTXzap2TeAlozXV5R3TM-Jo4Qbg1_YuBlISqVWR6IOB0WyF7zkyJU9Szx7hjXTDsry/pub?output=csv';

    const horizontalGrid = document.getElementById('horizontal-grid');
    const verticalGrid = document.getElementById('vertical-grid');
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const platformFilter = document.getElementById('platform-filter');

    let allLinksData = [];
    let lastActiveIframe = null; // Track only the currently playing video

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
        // Added enablejsapi=1 so we can pause YouTube videos seamlessly
        if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?enablejsapi=1`;
        
        const instaMatch = url.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:reel|p)\/([a-zA-Z0-9_-]+)/);
        if (instaMatch) return `https://www.instagram.com/p/${instaMatch[1]}/embed/`;
        
        const vimeoMatch = url.match(/(?:https?:\/\/)?(?:\w+\.)?vimeo\.com\/(\d+)/);
        // Added api=1 for seamless Vimeo pausing
        if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?api=1`;
        
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
                mediaHTML = `
                    <div class="media-container">
                        <div class="iframe-wrapper">
                            <iframe src="${embedURL}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                        </div>
                    </div>`;
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

            targetGrid.appendChild(card);
        });
    }

    // Seamlessly pause the PREVIOUS video when a NEW one is clicked
    window.addEventListener('blur', () => {
        setTimeout(() => {
            const active = document.activeElement;
            if (active && active.tagName === 'IFRAME') {
                if (lastActiveIframe && lastActiveIframe !== active) {
                    const src = lastActiveIframe.src || '';
                    if (src.includes('youtube.com')) {
                        // Pause YT cleanly without reloading
                        lastActiveIframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                    } else if (src.includes('vimeo.com')) {
                        // Pause Vimeo cleanly
                        lastActiveIframe.contentWindow.postMessage('{"method":"pause"}', '*');
                    } else if (src.includes('instagram.com')) {
                        // Instagram has no pause API, so we only reload this ONE previous video
                        const currentSrc = lastActiveIframe.src;
                        lastActiveIframe.src = '';
                        lastActiveIframe.src = currentSrc;
                    }
                }
                lastActiveIframe = active; // Update the currently playing video
            }
        }, 100);
    });

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
