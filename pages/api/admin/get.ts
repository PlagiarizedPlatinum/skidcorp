import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../../lib/db';
import { isAdmin } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });

  const id = parseInt(req.query.id as string);
  if (!id) return res.status(400).json({ error: 'Missing id.' });

  try {
    const sql = getDb();
    const [story] = await sql`SELECT id, title, slug, content FROM stories WHERE id = ${id}`;
    if (!story) return res.status(404).json({ error: 'Not found.' });
    return res.status(200).json(story);
  } catch {
    return res.status(500).json({ error: 'Database error.' });
  }
}
