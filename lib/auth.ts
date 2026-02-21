import type { NextApiRequest } from 'next';

export function isAdmin(req: NextApiRequest): boolean {
  const token = req.headers['x-admin-token'];
  return token === process.env.ADMIN_PASSWORD;
}
