document.getElementById('generateBtn').addEventListener('click', function() {
    fetch('/generate')
        .then(response => response.json())
        .then(data => {
            const ideasElement = document.getElementById('ideas');
            ideasElement.innerHTML = ''; // Clear previous content
            if (data.message) {
                // Display each idea as a new paragraph
                data.message.split('\n').forEach(idea => {
                    const p = document.createElement('p');
                    p.textContent = idea;
                    ideasElement.appendChild(p);
                });
            }
        })
        .catch(error => console.error('Error fetching post ideas:', error));
});
