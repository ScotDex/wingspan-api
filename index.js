import express from 'express';
import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 9090;
const TRIPWIRE_URL = "https://tw.torpedodelivery.com";

let tripwireData = null;
let sessionMask = "";

const jar = new CookieJar();
const client = wrapper(axios.create({
    jar,
    withCredentials: true,
    baseURL : TRIPWIRE_URL,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'

    }
}));

async function login() {
    try {
        const formData = new URLSearchParams({
            username: process.env.TRIPWIRE_USER,
            password: process.env.TRIPWIRE_PASS,
            mode: 'login'
        });

        const { data } = await client.post('/login.php', formData, {
            headers: { 'Referer': `${TRIPWIRE_URL}/login.php` }
        });

        console.log("Full Login Response:", JSON.stringify(data, null, 2));

        if (data.result === "success" && data.session?.mask) {
            sessionMask = data.session.mask
            console.log(`✅ [Fetcher] Logged in. Mask captured: ${sessionMask}`);

        }else{
            throw new Error ("Tripwire login failed: " + (data.message || "No mask returned"));

        }
    } catch (err) {
        console.error(`❌ [Fetcher] Fatal login error: ${err.message}`);
        
    }
}

async function updateTripwireData() {
    if (!sessionMask) await login();

    try {
        const formData = new URLSearchParams({
            mode: 'init',
            systemID: '30000142', // Jita
            mask: sessionMask
        });

        const { data } = await client.post('/refresh.php', formData, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Referer': `${TRIPWIRE_URL}/?system=Jita`
            }
        });

        tripwireData = data;
        console.log(`📡 [Fetcher] Tripwire data updated: ${new Date().toLocaleTimeString()}`);
    } catch (err) {
        console.warn(`⚠️ [Fetcher] Fetch failed: ${err.message}. Forcing re-login next cycle.`);
        sessionMask = ""; 
    }
}

const app = express ();

app.get('/data', (req, res) => {
    if (!tripwireData) {
        return res.status(503).json({ error: "Data initializing..." });
    }
    res.json(tripwireData);
});

app.listen(PORT, () => {
    console.log(`🚀 API Server listening on port ${PORT}`);
    
    // Start the background service
    login().then(() => {
        updateTripwireData(); // Initial run
        setInterval(updateTripwireData, 2 * 60 * 1000); // 10-minute cycle
    });
});