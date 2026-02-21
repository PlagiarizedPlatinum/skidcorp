import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../../lib/db';
import { isAdmin } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') return res.status(405).end();
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { id, title, content } = req.body;
  if (!id || !title?.trim() || !content?.trim()) {
    return res.status(400).json({ error: 'id, title and content are required.' });
  }

  try {
    const sql = getDb();
    const [updated] = await sql`
      UPDATE stories SET title = ${title.trim()}, content = ${content.trim()}
      WHERE id = ${id}
      RETURNING slug
    `;
    if (!updated) return res.status(404).json({ error: 'Not found.' });
    return res.status(200).json({ slug: updated.slug });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database error.' });
  }
}
