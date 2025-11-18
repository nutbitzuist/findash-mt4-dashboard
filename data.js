import { kv } from '@vercel/kv';

/**
 * Vercel Serverless Function to provide data to the dashboard.
 *
 * @param {object} req The request object.
 * @param {object} res The response object.
 */
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

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