document.addEventListener('DOMContentLoaded', () => {
    // --- PASTE YOUR PUBLISHED GOOGLE SHEET CSV URL HERE ---
    const googleSheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQZy6HsBu6eHeXTXzap2TeAlozXV5R3TM-Jo4Qbg1_YuBlISqVWR6IOB0WyF7zkyJU9Szx7hjXTDsry/pub?gid=207549302&single=true&output=csv';
    // ----------------------------------------------------

    const linkGrid = document.getElementById('linkGrid');

    function loadLinksFromSheet() {
        fetch(googleSheetURL)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(csvText => {
                // Clear the grid to prevent duplicates on re-run
                linkGrid.innerHTML = ''; 
                
                // Split the CSV text into rows and skip the header row (index 0)
                const rows = csvText.trim().split('\n').slice(1);

                rows.reverse().forEach(row => { // .reverse() to show newest entries first
                    // Split each row by commas. Be careful of commas within fields.
                    const values = row.split(',');
                    
                    if (values.length < 6) return; // Skip any empty or malformed rows

                    const linkData = {
                        // Assuming the order in your sheet is:
                        // Timestamp, Name, Link, Category, Genre, Platform
                        name: values[1],
                        link: values[2],
                        category: values[3],
                        genre: values[4],
                        platform: values[5]
                    };
                    addLinkToDOM(linkData);
                });
            })
            .catch(error => {
                console.error("Error fetching or parsing sheet data:", error);
                linkGrid.innerHTML = `<p>Sorry, there was an error loading the links.</p>`;
            });
    }

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
        li.innerHTML = `
            <a href="${linkData.link}" target="_blank">${linkData.name}</a>
            <span>${linkData.platform} | Genre: ${linkData.genre}</span>
        `;
        ol.appendChild(li);
    }

    // Load the links as soon as the page is ready
    loadLinksFromSheet();
});

