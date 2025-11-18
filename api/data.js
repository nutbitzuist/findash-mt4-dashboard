/**
 * VERCEL SERVERLESS FUNCTION
 * Filepath: /api/data.js
 * * This API endpoint is called by the dashboard.html.
 * It scans the Vercel KV database for all account keys,
 * retrieves the data for each one, and returns them as a JSON array.
 */

import { kv } from '@vercel/kv';

export default async function handler(request, response) {
    // 1. Only allow GET requests
    if (request.method !== 'GET') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    // 2. SECURITY: In a real app, you would also secure this endpoint.
    // The easiest way is to use Vercel's "Password Protection" feature
    // for your entire project, which you can set in the Vercel Dashboard.

    try {
        // 1. Scan for all keys that start with "account:"
        const keys = await kv.keys('account:*');

        if (!keys || keys.length === 0) {
            return response.status(200).json([]); // Return empty array if no accounts found
        }

        // 2. Get the data for all keys
        // kv.mget() (multi-get) is the fastest way to get all of them.
        const accounts = await kv.mget(...keys);

        // 3. Return the array of account data
        return response.status(200).json(accounts);

    } catch (error) {
        console.error("KV Read Error:", error);
        return response.status(500).json({ error: 'Failed to retrieve data.' });
    }
}