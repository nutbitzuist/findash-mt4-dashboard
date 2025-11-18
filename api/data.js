/**
 * VERCEL SERVERLESS FUNCTION
 * Filepath: /api/data.js
 * * This API endpoint is called by the dashboard.html.
 * It scans the Vercel KV database for all account keys,
 * retrieves the data for each one, and returns them as a JSON array.
 */

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // 1. Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // 2. SECURITY: In a real app, you would also secure this endpoint.
    // The easiest way is to use Vercel's "Password Protection" feature
    // for your entire project, which you can set in the Vercel Dashboard.
    try {
        // Fetch all account data from the 'accounts' hash in Vercel KV
        const accounts = await kv.hgetall('accounts');

        // If no accounts are found, return an empty array
        if (!accounts) {
            return res.status(200).json([]);
        }

        // The data is stored as an object of objects, so we convert it to an array.
        const dataArray = Object.values(accounts);
        return res.status(200).json(dataArray);

    } catch (error) {
        console.error('Error in /api/data:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}