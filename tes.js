const fs = require("fs");
const delay = require("delay");
const fetch = require("node-fetch");

// Mendapatkan data dari API Grivy
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

// Mengirim pesan ke Telegram
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
    while (true) {
        try {
            const data = await getData();
            const activeCampaigns = data.filter(item => 
                item.campaign_status === "active" && 
                (item.store === "Toko Modern" || item.store === "Indomaret" || item.store === "Alfamart") &&
                item.coupons_finished === false
            );

            for (const campaign of activeCampaigns) {
                console.log(`Processing campaign: ${campaign.head_line} - Store: ${campaign.store} - Domain: ${campaign.domain} - Public Code: ${campaign.public_code}`);

                let message = `🛒 *Nama Produk:* ${campaign.head_line}\n🏬 *Toko:* ${campaign.store}\n`;

                // **Jika campaign berkaitan dengan Frestea di Toko Modern, gunakan link Hero & Hypermart**
                if (campaign.store === "Toko Modern" && campaign.domain.includes("frestea") && campaign.public_code.includes("frestea-lychee")) {
                    const heroURL = `https://paduannya-nikmat.frestea.co.id/c/frestea-lychee-911H`;
                    const hypermartURL = `https://paduannya-nikmat.frestea.co.id/c/frestea-lychee-911F`;
                    message += `🔗 *URL Hero:* [Klik Disini](${heroURL})\n`;
                    message += `🔗 *URL Hypermart:* [Klik Disini](${hypermartURL})\n`;
                } 
                // **Jika bukan Toko Modern, gunakan URL campaign biasa**
                else {
                    let url = campaign.redirect_url || ""; // Pastikan tidak undefined
                    if (campaign.domain === "sunlightbiocarenature") {
                        url = `https://sunlightbiocarenature.com/c/${campaign.public_code}`;
                    } else if (campaign.domain === "djoy9") {
                        url = `https://djoy9.id/c/${campaign.public_code}`;
                    } else if (campaign.domain === "grivy") {
                        url = `https://grivy.app/c/${campaign.public_code}`;
                    } else if (campaign.domain === "chill-aja.sprite") {
                        url = `https://chill-aja.sprite.co.id/c/${campaign.public_code}`;
                    } else if (campaign.domain === "ayo.coca-cola") {
                        url = `https://ayo.coca-cola.co.id/c/${campaign.public_code}`;
                    } else if (campaign.domain === "niveabodyfair") {
                        url = `https://niveabodyfair.com/c/${campaign.public_code}`;
                    } else if (campaign.domain === "id.snacksandmeals.app") {
                        url = `https://id.snacksandmeals.app/c/${campaign.public_code}`;
                    }

                    // Pastikan URL tidak undefined
                    if (!url || url.trim() === "") {
                        console.error(`URL tidak ditemukan untuk campaign: ${campaign.head_line}`);
                        continue; // Lewati campaign jika URL tidak valid
                    }

                    message += `🔗 *URL:* [Klik Disini](${url})\n`;
                }

                await sendToTelegram(message);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }
})();
