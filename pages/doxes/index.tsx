import Link from 'next/link';
import { GetStaticProps } from 'next';
import { getDb } from '../../lib/db';

interface Story {
  id: number;
  title: string;
  slug: string;
  created_at: string;
}

export default function doxesIndex({ doxes }: { doxes: Story[] }) {
  return (
    <div style={{ maxWidth: '760px', width: '90%', margin: '0 auto', padding: '4rem 0' }}>
      <div style={{ marginBottom: '3rem' }}>
        <Link href="/" className="btn" style={{ fontSize: '0.75rem' }}>← Home</Link>
      </div>

      <h1 className="subtitle">doxes</h1>

      {doxes.length === 0 ? (
        <p style={{ color: 'var(--dim)', fontStyle: 'italic', fontSize: '0.9rem', letterSpacing: '1px' }}>
          No doxes published yet...
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {doxes.map(s => (
            <Link key={s.id} href={`/doxes/${s.slug}`} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.2rem 1.5rem',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s',
              textDecoration: 'none',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
              e.currentTarget.style.transform = 'translateX(4px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.transform = 'none';
            }}
            >
              <span style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text)' }}>{s.title}</span>
              <span style={{ fontSize: '0.72rem', letterSpacing: '1px', color: 'var(--dim)', textTransform: 'uppercase' }}>
                {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    const sql = getDb();
    const doxes = await sql`SELECT id, title, slug, created_at FROM doxes ORDER BY created_at DESC`;
    return {
      props: { doxes: doxes.map(s => ({ ...s, created_at: s.created_at.toISOString() })) },
      revalidate: 30,
    };
  } catch {
    return { props: { doxes: [] }, revalidate: 30 };
  }
};
