import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

interface Dox {
  id: number;
  title: string;
  slug: string;
  created_at: string;
}

type Mode = 'create' | 'edit';

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [checking, setChecking] = useState(false);

  const [mode, setMode] = useState<Mode>('create');
  const [editId, setEditId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [postMsg, setPostMsg] = useState('');
  const [postError, setPostError] = useState('');

  const [dox, setDox] = useState<Dox[]>([]);
  const [deleting, setDeleting] = useState<number | null>(null);

  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sessionKey = 'skidcorp_admin_token';

  useEffect(() => {
    const token = sessionStorage.getItem(sessionKey);
    if (token) { setAuthed(true); fetchDox(token); }
  }, []);

  async function fetchDox(token?: string) {
    const t = token || sessionStorage.getItem(sessionKey) || '';
    const res = await fetch('/api/admin/stories', { headers: { 'x-admin-token': t } });
    if (res.ok) {
      const data = await res.json();
      setDox(data.dox);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setChecking(true); setAuthError('');
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    setChecking(false);
    if (res.ok) {
      sessionStorage.setItem(sessionKey, password);
      setAuthed(true);
      fetchDox(password);
    } else { setAuthError('Wrong password.'); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPosting(true); setPostMsg(''); setPostError('');
    const token = sessionStorage.getItem(sessionKey) || '';

    if (mode === 'edit' && editId !== null) {
      const res = await fetch('/api/admin/edit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ id: editId, title, content }),
      });
      setPosting(false);
      if (res.ok) {
        const data = await res.json();
        setPostMsg(`Updated! View at /dox/${data.slug}`);
        resetForm(); fetchDox();
      } else {
        const err = await res.json();
        setPostError(err.error || 'Failed to update.');
      }
    } else {
      const res = await fetch('/api/admin/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ title, content }),
      });
      setPosting(false);
      if (res.ok) {
        const data = await res.json();
        setPostMsg(`Published! View at /dox/${data.slug}`);
        resetForm(); fetchDox();
      } else {
        const err = await res.json();
        setPostError(err.error || 'Failed to publish.');
      }
    }
  }

  function resetForm() {
    setTitle(''); setContent(''); setMode('create'); setEditId(null);
  }

  function startEdit(item: Dox) {
    const token = sessionStorage.getItem(sessionKey) || '';
    fetch(`/api/admin/get?id=${item.id}`, { headers: { 'x-admin-token': token } })
      .then(r => r.json())
      .then(data => {
        setTitle(data.title);
        setContent(data.content);
        setEditId(item.id);
        setMode('edit');
        setPostMsg(''); setPostError('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
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
    fetchDox();
  }

  function handleLogout() {
    sessionStorage.removeItem(sessionKey);
    setAuthed(false); setPassword('');
  }

  function readTxtFile(file: File) {
    if (!file.name.endsWith('.txt') && file.type !== 'text/plain') {
      alert('Only .txt files are supported.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setTitle(prev => prev.trim() ? prev : file.name.replace(/\.txt$/i, ''));
      setContent(text);
      setPostMsg(''); setPostError('');
    };
    reader.readAsText(file);
  }

  const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(true); }, []);
  const onDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(false); }, []);
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) readTxtFile(file);
  }, []);

  if (!authed) {
    return (
      <div className="page-center">
        <h1 className="subtitle" style={{ marginBottom: '2.5rem' }}>Admin</h1>
        <form onSubmit={handleLogin} style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter admin password" autoFocus />
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
          <Link href="/dox" className="btn" style={{ fontSize: '0.72rem' }}>Dox</Link>
        </div>
        <button onClick={handleLogout} className="btn" style={{ fontSize: '0.72rem' }}>Logout</button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <h1 className="subtitle" style={{ marginBottom: 0 }}>
          {mode === 'edit' ? 'Edit Dox' : 'Publish Dox'}
        </h1>
        {mode === 'edit' && (
          <button onClick={resetForm} className="btn" style={{ fontSize: '0.72rem', padding: '0.4em 1em' }}>+ New</button>
        )}
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.12)'}`,
          borderRadius: '10px',
          padding: '1.8rem',
          textAlign: 'center',
          cursor: 'pointer',
          marginBottom: '1.5rem',
          background: dragging ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.02)',
          transition: 'all 0.2s',
          userSelect: 'none',
        }}
      >
        <p style={{ color: dragging ? 'var(--text)' : 'var(--dim)', fontSize: '0.82rem', letterSpacing: '1.5px', textTransform: 'uppercase', pointerEvents: 'none' }}>
          {dragging ? '↓ Drop it!' : '📄 Drag & drop a .txt file — or click to browse'}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,text/plain"
          style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) readTxtFile(f); e.target.value = ''; }}
        />
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '4rem' }}>
        <div className="field">
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Dox title (also becomes the URL slug)"
            required
          />
        </div>
        <div className="field">
          <label>Content</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write your dox here, or drag in a .txt file above..."
            required
            style={{ minHeight: '280px' }}
          />
        </div>
        {postMsg && <p style={{ color: '#6bffb8', fontSize: '0.85rem', letterSpacing: '1px' }}>{postMsg}</p>}
        {postError && <p className="error">{postError}</p>}
        <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
          {mode === 'edit' && (
            <button type="button" onClick={resetForm} className="btn" style={{ fontSize: '0.9rem' }}>Cancel</button>
          )}
          <button type="submit" className="btn" disabled={posting} style={{ fontSize: '1rem' }}>
            {posting
              ? (mode === 'edit' ? 'Saving...' : 'Publishing...')
              : (mode === 'edit' ? 'Save Changes →' : 'Publish →')}
          </button>
        </div>
      </form>

      {dox.length > 0 && (
        <>
          <h2 style={{ fontSize: '0.7rem', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: '1rem' }}>
            Published Dox
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {dox.map(s => (
              <div key={s.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 1.4rem',
                background: editId === s.id ? 'rgba(255,255,255,0.07)' : 'var(--surface)',
                border: `1px solid ${editId === s.id ? 'rgba(255,255,255,0.25)' : 'var(--border)'}`,
                borderRadius: '8px',
                gap: '1rem',
                transition: 'all 0.2s',
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
                    onClick={() => startEdit(s)}
                    className="btn"
                    style={{ fontSize: '0.72rem', padding: '0.5em 1em', color: '#6bbbff', borderColor: 'rgba(100,180,255,0.2)' }}
                  >
                    Edit
                  </button>
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
