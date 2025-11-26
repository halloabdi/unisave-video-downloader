// Ini adalah "Serverless Function" pengganti PHP untuk Vercel
// Vercel menjalankan ini sebagai Node.js

export default async function handler(req, res) {
    // 1. Setup CORS agar bisa diakses
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
  
    // Handle Preflight Request
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // 2. Hanya terima POST
    if (req.method !== 'POST') {
        return res.status(405).json({ status: 'error', message: 'Method Not Allowed' });
    }

    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ status: 'error', message: 'URL Required' });
    }

    try {
        // 3. Logika Fetch Data (Pengganti cURL PHP)
        // Kita gunakan TikWM API publik untuk demo
        if (url.includes('tiktok.com')) {
            
            // Siapkan Form Data
            const formData = new URLSearchParams();
            formData.append('url', url);
            formData.append('count', 12);
            formData.append('cursor', 0);
            formData.append('web', 1);
            formData.append('hd', 1);

            // Fetch ke API Eksternal
            const apiResponse = await fetch('https://www.tikwm.com/api/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData
            });

            const json = await apiResponse.json();

            if (json.data) {
                return res.status(200).json({
                    status: 'success',
                    data: {
                        platform: 'TikTok',
                        title: json.data.title || 'TikTok Video',
                        cover: json.data.cover,
                        author: json.data.author.nickname,
                        video_url: json.data.play,
                        music_url: json.data.music
                    }
                });
            } else {
                return res.status(500).json({ status: 'error', message: 'Gagal mengambil data dari TikTok API.' });
            }

        } else {
            return res.status(400).json({ status: 'error', message: 'Hanya TikTok yang didukung di versi Demo Vercel ini.' });
        }

    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
}