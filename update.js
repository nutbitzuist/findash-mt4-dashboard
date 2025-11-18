import { kv } from '@vercel/kv';

/**
 * Vercel Serverless Function to receive data from MT4 EA.
 * The EA will send a POST request to this endpoint.
 *
 * @param {object} req The request object.
 * @param {object} res The response object.
 */
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { apiKey, ...accountData } = req.body;

        if (!apiKey || !accountData.id) {
            return res.status(400).json({ message: 'API Key and Account ID are required.' });
        }

        // 1. Get the stored API key from Vercel KV
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

        // 4. Send a success response
        return res.status(200).json({ message: 'Data received successfully.' });

    } catch (error) {
        console.error('Error in /api/update:', error);
        return res.status(500).json({ message: 'Internal Server Error.' });
    }
}