const fs = require("fs");
const delay = require("delay");
const fetch = require("node-fetch");

// Membaca URL dari file url.txt
function readUrlsFromFile() {
    return new Promise((resolve, reject) => {
        fs.readFile('url.txt', 'utf8', (err, data) => {
            if (err) {
                reject("Error reading URL file: " + err);
            } else {
                const urls = data.split('\n').map(line => line.trim()).filter(line => line.length > 0);
                resolve(urls);
            }
        });
    });
}

async function getData() {
    const response = await fetch('https://cdn.grivy.com/FRONT/GRIVY/CACHE/WALLET/active-campaigns.json', {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:130.0) Gecko/20100101 Firefox/130.0',
            'Accept': 'application/json'
        }
    });
    const data = await response.json();
    return data;
}

async function sendToTelegram(message) {
    const urlTele = `https://api.telegram.org/bot7676663552:AAEzmr8BLsCeC61N8Z4fqPLC5OQNPEAYka8/sendMessage`;
    try {
        await fetch(urlTele, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: -1002442776010,
                text: message,
                parse_mode: 'Markdown'
            })
        });
        console.log("Message sent:", message);
    } catch (error) {
        console.error("Error sending message:", error);
    }
}

(async () => {
    // Membaca URL dari file
    let urls = [];
    try {
        urls = await readUrlsFromFile();
    } catch (error) {
        console.error(error);
        return;
    }

    while (true) {
        try {
            const data = await getData();
            const activeCampaigns = data.filter(item => 
                item.campaign_status === "active" && 
                (item.store === "Toko Modern") &&
                item.coupons_finished === false
            );

            for (const campaign of activeCampaigns) {
                // Pilih URL secara acak dari file
                let url = "";
                if (urls.length > 0) {
                    url = urls[Math.floor(Math.random() * urls.length)]; // Pilih URL secara acak dari file
                } else {
                    url = campaign.redirect_url; // fallback ke redirect URL dari kampanye
                }

                // Skip URL tertentu
                if (url === "https://grivy.app/c/rb24-grivy") {
                    console.log(`Skipping campaign with URL: ${url}`);
                    continue; // Lewati iterasi jika URL cocok
                }

                const message = `🤖 Nama Produk: ${campaign.head_line}\n` +
                    `🔗 URL: ${url}\n\n`;

                await sendToTelegram(message);
                // await delay(15000); // Delay 15 detik sebelum mengirim pesan berikutnya
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
        // await delay(60000); // Delay 1 menit sebelum memeriksa ulang
    }
})();
