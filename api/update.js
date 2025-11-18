/**
 * VERCEL SERVERLESS FUNCTION
 * Filepath: /api/update.js
 * * This API endpoint receives data from the MT4-Sender.mq4 Expert Advisor.
 * It validates the API key and stores the account data in the Vercel KV database.
 */

// Import the Vercel KV client
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // 1. Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { apiKey, ...accountData } = await req.json();

        // The accountId from your EA is now 'id' in the JSON body
        if (!apiKey || !accountData.id) {
            return res.status(400).json({ message: 'API Key and Account ID are required.' });
        }

        // 1. Get the stored API key from Vercel KV (powered by Upstash)
        const storedApiKey = await kv.get('api_key');

        // 2. Validate the key
        if (!storedApiKey || apiKey !== storedApiKey) {
            return res.status(401).json({ message: 'Unauthorized: Invalid API Key.' });
        }

        // 3. Store the received account data
        // We use a hash `accounts` and store each account by its ID.
        // The `hset` command will create or update the entry for this account ID.
        await kv.hset('accounts', { [accountData.id]: accountData });

        console.log(`Updated data for account: ${accountData.id}`);
        
        return res.status(200).json({ message: 'Data received successfully.' });

    } catch (error) {
        console.error("Error in /api/update:", error.message);
        return res.status(500).json({ message: 'Internal Server Error.' });
    }
}