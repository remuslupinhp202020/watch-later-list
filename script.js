document.addEventListener('DOMContentLoaded', () => {
    const linkForm = document.getElementById('linkForm');
    const linkGrid = document.getElementById('linkGrid');

    loadLinks();

    linkForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get values from all form fields, including platform
        const name = document.getElementById('nameInput').value;
        const link = document.getElementById('linkInput').value;
        const category = document.getElementById('categorySelect').value;
        const genre = document.getElementById('genreSelect').value;
        const platform = document.getElementById('platformSelect').value; // Get platform value

        // Validation now checks all dropdowns
        if (!category || !genre || !platform) {
            alert('Please select a category, genre, and platform.');
            return;
        }

        const linkData = {
            id: Date.now(),
            name,
            link,
            category,
            genre,
            platform // Add platform to the data object
        };

        addLinkToDOM(linkData);
        saveLinkToStorage(linkData);
        linkForm.reset();
    });

    function addLinkToDOM(linkData) {
        let categoryColumn = document.getElementById(`category-${linkData.category}`);
        if (!categoryColumn) {
            categoryColumn = document.createElement('div');
            categoryColumn.id = `category-${linkData.category}`;
            categoryColumn.className = 'category-column';
            categoryColumn.innerHTML = `<h2>${linkData.category}</h2><ol></ol>`;
            linkGrid.appendChild(categoryColumn);
        }

        const ol = categoryColumn.querySelector('ol');
        const li = document.createElement('li');

        // Display the platform along with the genre
        li.innerHTML = `
            <a href="${linkData.link}" target="_blank">${linkData.name}</a>
            <span>${linkData.platform} | Genre: ${linkData.genre}</span>
        `;
        ol.appendChild(li);
    }

    function saveLinkToStorage(linkData) {
        let links = JSON.parse(localStorage.getItem('mySavedLinks')) || [];
        links.push(linkData);
        localStorage.setItem('mySavedLinks', JSON.stringify(links));
    }

    function loadLinks() {
        let links = JSON.parse(localStorage.getItem('mySavedLinks')) || [];
        links.forEach(link => {
            addLinkToDOM(link);
        });
    }
});
