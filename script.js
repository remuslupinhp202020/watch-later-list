document.addEventListener('DOMContentLoaded', () => {
    const linkForm = document.getElementById('linkForm');
    const linkGrid = document.getElementById('linkGrid');

    // Load links from local storage when the page starts
    loadLinks();

    linkForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get values from all the form fields
        const name = document.getElementById('nameInput').value;
        const link = document.getElementById('linkInput').value;
        const category = document.getElementById('categorySelect').value;
        const genre = document.getElementById('genreSelect').value;

        // Simple validation to ensure dropdowns are selected
        if (!category || !genre) {
            alert('Please select a category and genre.');
            return;
        }

        const linkData = {
            id: Date.now(), // Unique ID for each link
            name,
            link,
            category,
            genre
        };

        addLinkToDOM(linkData);
        saveLinkToStorage(linkData);
        linkForm.reset(); // Clear the form fields
    });

    function addLinkToDOM(linkData) {
        // Find or create the column for the link's category
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

        // Create a more descriptive list item
        li.innerHTML = `
            <a href="${linkData.link}" target="_blank">${linkData.name}</a>
            <span>Genre: ${linkData.genre}</span>
        `;
        ol.appendChild(li);
    }

    function saveLinkToStorage(linkData) {
        // Get existing links from storage or create an empty array
        let links = JSON.parse(localStorage.getItem('mySavedLinks')) || [];
        // Add the new link
        links.push(linkData);
        // Save the updated array back to storage
        localStorage.setItem('mySavedLinks', JSON.stringify(links));
    }

    function loadLinks() {
        // Get all links from storage
        let links = JSON.parse(localStorage.getItem('mySavedLinks')) || [];
        // Add each link to the display
        links.forEach(link => {
            addLinkToDOM(link);
        });
    }
});
