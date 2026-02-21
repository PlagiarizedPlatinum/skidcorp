import Link from 'next/link';
import { GetStaticPaths, GetStaticProps } from 'next';
import { getDb } from '../../lib/db';

interface Story {
  id: number;
  title: string;
  slug: string;
  content: string;
  created_at: string;
}

export default function StoryPage({ story }: { story: Story }) {
  if (!story) return (
    <div className="page-center">
      <h1 style={{ fontSize: '2rem', color: 'var(--dim)' }}>Dox not found.</h1>
      <Link href="/dox" className="btn" style={{ marginTop: '2rem' }}>← All Dox</Link>
    </div>
  );

  return (
    <div style={{ maxWidth: '760px', width: '90%', margin: '0 auto', padding: '4rem 0 6rem' }}>
      <div style={{ marginBottom: '3rem', display: 'flex', gap: '1rem' }}>
        <Link href="/dox" className="btn" style={{ fontSize: '0.75rem' }}>← All Dox</Link>
        <Link href="/" className="btn" style={{ fontSize: '0.75rem' }}>Home</Link>
      </div>

      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ fontSize: '0.7rem', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: '0.8rem' }}>
          {new Date(story.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 800,
          letterSpacing: '2px',
          textTransform: 'uppercase',
          lineHeight: 1.1,
        }}>
          {story.title}
        </h1>
      </div>

      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        backdropFilter: 'blur(8px)',
        padding: '2.5rem',
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        lineHeight: 1.8,
        fontSize: '1.05rem',
        color: '#d0d8e8',
      }}>
        {story.content}
      </div>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const sql = getDb();
    const dox = await sql`SELECT slug FROM dox`;
    return {
      paths: dox.map(s => ({ params: { slug: s.slug } })),
      fallback: 'blocking',
    };
  } catch {
    return { paths: [], fallback: 'blocking' };
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  try {
    const sql = getDb();
    const [story] = await sql`SELECT * FROM dox WHERE slug = ${params!.slug as string}`;
    if (!story) return { notFound: true };
    return {
      props: { story: { ...story, created_at: story.created_at.toISOString() } },
      revalidate: 60,
    };
  } catch {
    return { notFound: true };
  }
};
