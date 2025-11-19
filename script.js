document.addEventListener('DOMContentLoaded', () => {
    const linkForm = document.getElementById('linkForm');
    const linkGrid = document.getElementById('linkGrid');

    // Load links from local storage on page load
    loadLinks();

    linkForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const link = document.getElementById('linkInput').value;
        const category = document.getElementById('categorySelect').value;
        const platform = document.getElementById('platformSelect').value;

        const linkData = {
            link,
            category,
            platform,
            id: Date.now()
        };

        addLink(linkData);
        saveLink(linkData);
        linkForm.reset();
    });

    function addLink(linkData) {
        let categoryColumn = document.getElementById(linkData.category);

        if (!categoryColumn) {
            categoryColumn = document.createElement('div');
            categoryColumn.id = linkData.category;
            categoryColumn.className = 'category-column';
            categoryColumn.innerHTML = `<h2>${linkData.category}</h2><ol></ol>`;
            linkGrid.appendChild(categoryColumn);
        }

        const ol = categoryColumn.querySelector('ol');
        const li = document.createElement('li');
        li.innerHTML = `<a href="${linkData.link}" target="_blank">${linkData.platform}: ${linkData.link}</a>`;
        ol.appendChild(li);
    }

    function saveLink(linkData) {
        let links = JSON.parse(localStorage.getItem('watchLaterLinks')) || [];
        links.push(linkData);
        localStorage.setItem('watchLaterLinks', JSON.stringify(links));
    }

    function loadLinks() {
        let links = JSON.parse(localStorage.getItem('watchLaterLinks')) || [];
        links.forEach(link => {
            addLink(link);
        });
    }
});