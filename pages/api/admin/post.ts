import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, initDb } from '../../../lib/db';
import { isAdmin } from '../../../lib/auth';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { title, content } = req.body;
  if (!title?.trim() || !content?.trim()) {
    return res.status(400).json({ error: 'Title and content are required.' });
  }

  try {
    await initDb();
    const sql = getDb();

    let slug = slugify(title);
    if (!slug) slug = `story-${Date.now()}`;

    // Ensure unique slug
    const existing = await sql`SELECT id FROM doxes WHERE slug = ${slug}`;
    if (existing.length > 0) {
      slug = `${slug}-${Date.now()}`;
    }

    const [story] = await sql`
      INSERT INTO doxes (title, slug, content)
      VALUES (${title.trim()}, ${slug}, ${content.trim()})
      RETURNING id, slug
    `;

    return res.status(200).json({ id: story.id, slug: story.slug });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: 'Database error.' });
  }
}
