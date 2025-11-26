export default async function handler(req, res) {
    // Setup CORS (Agar frontend bisa akses)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
    // Handle Preflight Options
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ status: 'error', message: 'Method Not Allowed' });
    }

    // Ambil URL dan Tipe (Video/Audio) dari request
    const { url, type } = req.body;

    if (!url) {
        return res.status(400).json({ status: 'error', message: 'URL Required' });
    }

    try {
        // --- UNIVERSAL ENGINE (COBALT) ---
        // Konfigurasi untuk Video vs Audio
        const isAudioMode = type === 'audio';

        const cobaltData = {
            url: url,
            vCodec: "h264",
            vQuality: "720",
            aFormat: "mp3",
            filenamePattern: "classic",
            isAudioOnly: isAudioMode // Jika true, Cobalt akan convert ke MP3
        };

        const response = await fetch('https://api.cobalt.tools/api/json', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cobaltData)
        });

        const data = await response.json();

        // Handle Error dari Cobalt
        if (data.status === 'error') {
            // Cek pesan error spesifik
            const errText = data.text || "Unknown Error";
            if (errText.includes("YouTube")) {
                 throw new Error("Konten YouTube ini diproteksi atau berdurasi terlalu panjang.");
            }
            throw new Error(errText);
        }

        // Jika sukses, Cobalt mengembalikan data.url (Link Download)
        // Jika mode audio, link tersebut adalah link MP3.
        
        // Menyiapkan response
        return res.status(200).json({
            status: 'success',
            data: {
                platform: detectPlatform(url),
                // Jika audio mode, tidak ada thumbnail, pakai placeholder
                title: data.filename || "UniSave Download",
                url: data.url // Ini link final (bisa video mp4 atau audio mp3)
            }
        });

    } catch (error) {
        return res.status(500).json({ 
            status: 'error', 
            message: "Gagal: " + error.message 
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
