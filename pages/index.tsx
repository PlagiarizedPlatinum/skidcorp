import Link from 'next/link';
import { GetStaticProps } from 'next';
import { getDb } from '../lib/db';

interface Story {
  id: number;
  title: string;
  slug: string;
  created_at: string;
}

export default function Home({ dox }: { dox: Story[] }) {
  return (
    <div className="page-center" style={{ gap: '1.5rem' }}>
      <h1 className="title">Skidcorp</h1>

      <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1rem' }}>
        <a href="https://discord.gg/bX8jXpvdAK" target="_blank" rel="noreferrer" className="btn">
          Discord
        </a>
        <Link href="/dox" className="btn">Stories</Link>
      </div>

      {dox.length > 0 && (
        <div style={{ marginTop: '3rem', width: '100%', maxWidth: '680px' }}>
          <p style={{ textAlign: 'center', fontSize: '0.7rem', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: '1.2rem' }}>
            Latest Stories
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {dox.slice(0, 3).map(s => (
              <Link key={s.id} href={`/dox/${s.slug}`} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.9rem 1.2rem',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                backdropFilter: 'blur(4px)',
                transition: 'all 0.2s',
                color: 'var(--muted)',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>{s.title}</span>
                <span style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                  {new Date(s.created_at).toLocaleDateString()}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    const sql = getDb();
    const dox = await sql`SELECT id, title, slug, created_at FROM dox ORDER BY created_at DESC LIMIT 3`;
    return {
      props: { dox: dox.map(s => ({ ...s, created_at: s.created_at.toISOString() })) },
      revalidate: 30,
    };
  } catch {
    return { props: { dox: [] }, revalidate: 30 };
  }
};
