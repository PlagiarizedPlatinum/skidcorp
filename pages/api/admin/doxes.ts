import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../../lib/db';
import { isAdmin } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const sql = getDb();
    const dox = await sql`SELECT id, title, slug, created_at FROM dox ORDER BY created_at DESC`;
    return res.status(200).json({ dox: dox.map(s => ({ ...s, created_at: s.created_at.toISOString() })) });
  } catch (err) {
    return res.status(500).json({ error: 'Database error.' });
  }
}
