const fs = require("fs");
const delay = require("delay");
const fetch = require("node-fetch");

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
    const urlTele = `https://api.telegram.org/bot6591408622:AAFbplOpsV47eehg6p0fb18Fbj05VLRYOlI/sendMessage`;
    try {
        await fetch(urlTele, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id:  -1002329976638,
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
                (item.store === "Indomaret" || item.store === "Alfamart")
            );

            for (const campaign of activeCampaigns) {
                // Tentukan URL berdasarkan domain
                let url = "";
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
                } else if (campaign.domain === "paduannya-nikmat.frestea") {
                    url = `https://paduannya-nikmat.frestea.co.id/c/${campaign.public_code}`;
                } else {
                    url = campaign.redirect_url;
                }

                // Skip URL
                if (url === "https://grivy.app/c/rb24-grivy") {
                    console.log(`Skipping campaign with URL: ${url}`);
                    continue; // Lewati iterasi jika URL cocok
                }

                const message = `🤖 Nama Produk: ${campaign.head_line}\n` +
                    `🔗 URL: ${url}\n\n`;

                await sendToTelegram(message);
                //await delay(15000); // Delay 15 detik sebelum mengirim pesan berikutnya
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
        //await delay(60000); // Delay 1 menit sebelum memeriksa ulang
    }
})();

