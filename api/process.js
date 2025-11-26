export default async function handler(req, res) {
    // Setup CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ status: 'error', message: 'Method Not Allowed' });
    }

    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ status: 'error', message: 'URL Required' });
    }

    try {
        // --- UNIVERSAL ENGINE (COBALT) ---
        // Mendukung: YouTube, TikTok, IG, FB, Twitter, Reddit, Soundcloud, dll.
        
        const cobaltData = {
            url: url,
            vCodec: "h264",
            vQuality: "720",
            aFormat: "mp3",
            filenamePattern: "classic",
            isAudioOnly: false
        };

        // Menggunakan public instance Cobalt yang stabil
        const response = await fetch('https://api.cobalt.tools/api/json', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cobaltData)
        });

        const data = await response.json();

        if (data.status === 'error') {
            throw new Error(data.text || "Link tidak didukung atau konten private.");
        }

        // Normalisasi Output agar sesuai dengan Frontend kita
        // Cobalt outputnya bisa stream atau redirect
        let videoUrl = data.url;
        let audioUrl = data.url; // Cobalt biasanya kasih 1 link final
        
        // Jika stream (YouTube biasanya stream), kita oper langsung
        if (data.stream) {
            videoUrl = data.url;
        }

        return res.status(200).json({
            status: 'success',
            data: {
                platform: detectPlatform(url),
                title: data.filename || "Video Downloaded", // Cobalt kadang tidak kasih judul lengkap demi privasi
                cover: "https://via.placeholder.com/600x400?text=Preview+Unavailable", // Cobalt hemat bandwidth tanpa thumbnail
                author: "Universal Source",
                video_url: videoUrl,
                music_url: audioUrl // Dalam mode Cobalt basic, dia return sesuai request.
            }
        });

    } catch (error) {
        return res.status(500).json({ 
            status: 'error', 
            message: "Gagal memproses: " + error.message + ". Pastikan link publik (tidak dikunci/private)." 
        });
    }
}

function detectPlatform(url) {
    if (url.includes('youtube') || url.includes('youtu.be')) return 'YouTube';
    if (url.includes('tiktok')) return 'TikTok';
    if (url.includes('instagram')) return 'Instagram';
    if (url.includes('facebook') || url.includes('fb.watch')) return 'Facebook';
    if (url.includes('twitter') || url.includes('x.com')) return 'Twitter/X';
    if (url.includes('reddit')) return 'Reddit';
    return 'Universal';
}
