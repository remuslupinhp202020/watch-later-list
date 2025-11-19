document.addEventListener('DOMContentLoaded', () => {
    // --- PASTE YOUR PUBLISHED GOOGLE SHEET CSV URL HERE ---
    const googleSheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQZy6HsBu6eHeXTXzap2TeAlozXV5R3TM-Jo4Qbg1_YuBlISqVWR6IOB0WyF7zkyJU9Szx7hjXTDsry/pub?output=csv';
    // ----------------------------------------------------

    const tableBody = document.getElementById('links-tbody');
    const tableHeaders = document.querySelectorAll('.links-table th');
    let allLinksData = []; // To store the fetched data
    let currentSort = {
        column: null,
        isAscending: true
    };

    // Fetches and displays the data
    function loadLinksFromSheet() {
        fetch(googleSheetURL)
            .then(response => response.text())
            .then(csvText => {
                const rows = csvText.trim().split('\n').slice(1);
                allLinksData = rows.map(row => {
                    const values = row.split(',');
                    // Assuming order: Timestamp, Name, Link, Category, Genre, Platform
                    return {
                        name: values[1],
                        link: values[2],
                        category: values[3],
                        genre: values[4],
                        platform: values[5]
                    };
                }).filter(data => data.name && data.link); // Filter out empty rows

                // Initial render of the table, sorted by newest first
                sortData('category', false); // Example: initial sort by category
            })
            .catch(error => {
                console.error("Error fetching sheet data:", error);
                tableBody.innerHTML = `<tr><td colspan="4">Sorry, there was an error loading the links.</td></tr>`;
            });
    }

    // Sorts the data array and calls the function to redraw the table
    function sortData(column, isAscending) {
        allLinksData.sort((a, b) => {
            const valA = a[column] ? a[column].toLowerCase() : '';
            const valB = b[column] ? b[column].toLowerCase() : '';

            if (valA < valB) {
                return isAscending ? -1 : 1;
            }
            if (valA > valB) {
                return isAscending ? 1 : -1;
            }
            return 0;
        });
        
        // Update header styles
        updateHeaderStyles(column, isAscending);
        
        // Redraw the table with the sorted data
        renderTable();
    }
    
    // Updates the visual indicators on the table headers
    function updateHeaderStyles(column, isAscending) {
        tableHeaders.forEach(header => {
            header.classList.remove('sorted-asc', 'sorted-desc');
            if (header.dataset.column === column) {
                header.classList.add(isAscending ? 'sorted-asc' : 'sorted-desc');
            }
        });
    }

    // Clears the table and fills it with the current data
    function renderTable() {
        tableBody.innerHTML = ''; // Clear the existing table rows

        allLinksData.forEach(linkData => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td data-label="Category">${linkData.category}</td>
                <td data-label="Platform">${linkData.platform}</td>
                <td data-label="Genre">${linkData.genre}</td>
                <td data-label="Name"><a href="${linkData.link}" target="_blank">${linkData.name}</a></td>
            `;
            tableBody.appendChild(row);
        });
    }
    
    // Add click event listeners to each table header for sorting
    tableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const column = header.dataset.column;
            
            // If clicking the same column, reverse the sort order. Otherwise, start with ascending.
            const isAscending = (currentSort.column === column) ? !currentSort.isAscending : true;

            currentSort = { column, isAscending };
            sortData(column, isAscending);
        });
    });

    // Initial load of the data
    loadLinksFromSheet();
});

