import { kv } from '@vercel/kv';
import { randomUUID } from 'crypto';

/**
 * Vercel Serverless Function to generate and store a new API key.
 *
 * @param {object} req The request object.
 * @param {object} res The response object.
 */
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const newApiKey = `sk_${randomUUID().replace(/-/g, '')}`;

        // Store the new key in Vercel KV, overwriting any previous key.
        await kv.set('api_key', newApiKey);

        return res.status(200).json({ apiKey: newApiKey });
    } catch (error) {
        console.error('Error in /api/generate-key:', error);
        return res.status(500).json({ message: 'Internal Server Error.' });
    }
}