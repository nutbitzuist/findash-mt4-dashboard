/**
 * VERCEL SERVERLESS FUNCTION
 * Filepath: /api/update.js
 * * This API endpoint receives data from the MT4-Sender.mq4 Expert Advisor.
 * It validates the API key and stores the account data in the Vercel KV database.
 */

// Import the Vercel KV client
import { kv } from '@vercel/kv';

export default async function handler(request, response) {
    // 1. Only allow POST requests
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    // 2. Check for the Authorization header
    const authHeader = request.headers.get('authorization');
    const incomingApiKey = authHeader ? authHeader.split(' ')[1] : null;

    // 3. Get the correct API Key from Vercel Environment Variables
    // You MUST set this in your Vercel project settings.
    const SECRET_API_KEY = process.env.MT4_API_KEY;

    if (!SECRET_API_KEY) {
        return response.status(500).json({ error: 'API Key not configured on server.' });
    }

    // 4. Validate the API Key
    if (incomingApiKey !== SECRET_API_KEY) {
        return response.status(401).json({ error: 'Unauthorized' });
    }

    // 5. Get the account data from the request body
    const accountData = await request.json();

    if (!accountData || !accountData.accountId) {
        return response.status(400).json({ error: 'Invalid account data' });
    }

    // 6. Save the data to Vercel KV
    // We use the accountId as the key. This will overwrite the previous
    // entry for this account, which is exactly what we want.
    try {
        await kv.set(`account:${accountData.accountId}`, accountData);
        
        // 7. Send a success response
        return response.status(200).json({ success: true, accountId: accountData.accountId });

    } catch (error) {
        console.error("KV Store Error:", error);
        return response.status(500).json({ error: 'Failed to save data.' });
    }
}