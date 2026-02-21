import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../../lib/db';
import { isAdmin } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') return res.status(405).end();
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });

  const id = parseInt(req.query.id as string);
  if (!id) return res.status(400).json({ error: 'Missing id.' });

  try {
    const sql = getDb();
    await sql`DELETE FROM dox WHERE id = ${id}`;
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(500).json({ error: 'Database error.' });
  }
}
