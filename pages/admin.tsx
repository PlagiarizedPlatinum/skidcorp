import { useState, useEffect } from 'react';
import Link from 'next/link';

interface dox {
  id: number;
  title: string;
  slug: string;
  created_at: string;
}

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [checking, setChecking] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [postMsg, setPostMsg] = useState('');
  const [postError, setPostError] = useState('');

  const [dox, setdox] = useState<dox[]>([]);
  const [deleting, setDeleting] = useState<number | null>(null);

  const sessionKey = 'skidcorp_admin_token';

  useEffect(() => {
    const token = sessionStorage.getItem(sessionKey);
    if (token) {
      setAuthed(true);
      fetchdox(token);
    }
  }, []);

  async function fetchdox(token?: string) {
    const t = token || sessionStorage.getItem(sessionKey) || '';
    const res = await fetch('/api/admin/dox', { headers: { 'x-admin-token': t } });
    if (res.ok) {
      const data = await res.json();
      setdox(data.dox);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setChecking(true);
    setAuthError('');
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    setChecking(false);
    if (res.ok) {
      sessionStorage.setItem(sessionKey, password);
      setAuthed(true);
      fetchdox(password);
    } else {
      setAuthError('Wrong password.');
    }
  }

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    setPosting(true);
    setPostMsg('');
    setPostError('');
    const token = sessionStorage.getItem(sessionKey) || '';
    const res = await fetch('/api/admin/post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({ title, content }),
    });
    setPosting(false);
    if (res.ok) {
      const data = await res.json();
      setPostMsg(`Published! View at /dox/${data.slug}`);
      setTitle('');
      setContent('');
      fetchdox();
    } else {
      const err = await res.json();
      setPostError(err.error || 'Failed to publish.');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this dox?')) return;
    setDeleting(id);
    const token = sessionStorage.getItem(sessionKey) || '';
    await fetch(`/api/admin/delete?id=${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-token': token },
    });
    setDeleting(null);
    fetchdox();
  }

  function handleLogout() {
    sessionStorage.removeItem(sessionKey);
    setAuthed(false);
    setPassword('');
  }

  if (!authed) {
    return (
      <div className="page-center">
        <h1 className="subtitle" style={{ marginBottom: '2.5rem' }}>Admin</h1>
        <form onSubmit={handleLogin} style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter admin password"
              autoFocus
            />
          </div>
          {authError && <p className="error">{authError}</p>}
          <button type="submit" className="btn" disabled={checking} style={{ alignSelf: 'flex-end' }}>
            {checking ? 'Checking...' : 'Enter'}
          </button>
        </form>
        <div style={{ marginTop: '2rem' }}>
          <Link href="/" className="btn" style={{ fontSize: '0.75rem' }}>← Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', width: '90%', margin: '0 auto', padding: '3rem 0 5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <Link href="/" className="btn" style={{ fontSize: '0.72rem' }}>← Home</Link>
          <Link href="/dox" className="btn" style={{ fontSize: '0.72rem' }}>dox</Link>
        </div>
        <button onClick={handleLogout} className="btn" style={{ fontSize: '0.72rem' }}>Logout</button>
      </div>

      <h1 className="subtitle">Publish dox</h1>

      <form onSubmit={handlePost} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '4rem' }}>
        <div className="field">
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="dox title (also becomes the URL slug)"
            required
          />
        </div>
        <div className="field">
          <label>Content</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write your dox here..."
            required
          />
        </div>
        {postMsg && (
          <p style={{ color: '#6bffb8', fontSize: '0.85rem', letterSpacing: '1px' }}>{postMsg}</p>
        )}
        {postError && <p className="error">{postError}</p>}
        <button type="submit" className="btn" disabled={posting} style={{ alignSelf: 'flex-end', fontSize: '1rem' }}>
          {posting ? 'Publishing...' : 'Publish →'}
        </button>
      </form>

      {dox.length > 0 && (
        <>
          <h2 style={{ fontSize: '0.7rem', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: '1rem' }}>
            Published dox
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {dox.map(s => (
              <div key={s.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 1.4rem',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                gap: '1rem',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.title}
                  </p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--dim)', letterSpacing: '1px' }}>
                    /dox/{s.slug} · {new Date(s.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', flexShrink: 0 }}>
                  <Link href={`/dox/${s.slug}`} className="btn" style={{ fontSize: '0.72rem', padding: '0.5em 1em' }}>View</Link>
                  <button
                    onClick={() => handleDelete(s.id)}
                    disabled={deleting === s.id}
                    className="btn"
                    style={{ fontSize: '0.72rem', padding: '0.5em 1em', color: '#ff6b6b', borderColor: 'rgba(255,100,100,0.2)' }}
                  >
                    {deleting === s.id ? '...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
