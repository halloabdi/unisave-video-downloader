document.getElementById('download-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const url = document.getElementById('url').value;
    
    // Call backend API to process URL and check availability
    fetch('/process-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Show options to user
            document.getElementById('options').style.display = 'block';
            document.getElementById('download-btn').onclick = () => downloadFile(url, data.filename);
        } else {
            document.getElementById('status').textContent = 'Gagal memproses URL. Pastikan URL valid.';
        }
    })
    .catch(error => {
        document.getElementById('status').textContent = 'Terjadi kesalahan.';
    });
});

function downloadFile(url, filename) {
    const customFilename = document.getElementById('filename').value || filename;
    
    fetch(`/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(customFilename)}`)
        .then(response => response.blob())
        .then(blob => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = customFilename;
            link.click();
        })
        .catch(error => {
            document.getElementById('status').textContent = 'Gagal mengunduh file.';
        });
}
