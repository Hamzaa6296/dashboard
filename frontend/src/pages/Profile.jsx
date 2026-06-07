import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { User, MapPin, Globe, Calendar, Edit2, Save, X, Lock, FolderKanban } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const STATUS_COLORS = {
  active: 'var(--accent)', completed: 'var(--green)',
  paused: 'var(--yellow)', archived: 'var(--text-3)',
};

function FieldRow({ label, value, editing, onChange, type = 'text', placeholder }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      {editing ? (
        <input
          type={type} value={value || ''} onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            background: 'var(--bg-2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '9px 12px',
            color: 'var(--text)', fontSize: 15, outline: 'none', width: '100%',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
      ) : (
        <span style={{ fontSize: 15, color: value ? 'var(--text)' : 'var(--text-3)' }}>
          {value || `No ${label.toLowerCase()} set`}
        </span>
      )}
    </div>
  );
}

export default function Profile() {
  const { user: currentUser, updateUser } = useAuth();
  const { id } = useParams();
  const userId = id || currentUser?.id;
  const isOwn = userId === currentUser?.id;

  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPwForm, setShowPwForm] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [pwError, setPwError] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/users/${userId}`)
      .then(res => {
        setProfile(res.data.user);
        setForm(res.data.user);
        setProjects(res.data.projects || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  const handleSave = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      const res = await api.put(`/users/${userId}`, {
        name: form.name, bio: form.bio, location: form.location, website: form.website,
      });
      setProfile(res.data.user);
      if (isOwn) updateUser(res.data.user);
      setEditing(false);
      setSuccess('Profile updated!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault(); setPwError('');
    if (pwForm.newPassword.length < 6) return setPwError('New password must be at least 6 characters');
    setPwSaving(true);
    try {
      await api.put(`/users/${userId}/password`, pwForm);
      setShowPwForm(false);
      setPwForm({ currentPassword: '', newPassword: '' });
      setSuccess('Password updated!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setPwError(err.response?.data?.error || 'Failed to update password');
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  if (!profile) return (
    <div style={{ textAlign: 'center', paddingTop: 80, color: 'var(--text-2)' }}>User not found</div>
  );

  const initials = profile.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  const joined = new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="fade-in" style={{ maxWidth: 900 }}>
      <h1 style={{ fontFamily: 'Syne', fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 700, marginBottom: 24 }}>
        {isOwn ? 'My Profile' : `${profile.name}'s Profile`}
      </h1>

      {success && (
        <div style={{
          background: 'rgba(34,217,160,0.1)', border: '1px solid rgba(34,217,160,0.3)',
          borderRadius: 'var(--radius-sm)', padding: '10px 16px',
          color: 'var(--green)', fontSize: 14, marginBottom: 20,
        }}>
          ✓ {success}
        </div>
      )}

      <div className="profile-grid">

        {/* Main card */}
        <div style={{
          background: 'var(--bg-1)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', overflow: 'hidden',
        }}>
          {/* Banner */}
          <div style={{
            height: 90,
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)',
            position: 'relative',
          }}>
            {isOwn && (
              <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8 }}>
                {editing ? (
                  <>
                    <button onClick={() => { setEditing(false); setForm(profile); }} style={{
                      padding: '6px 12px', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(6px)',
                      border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6,
                      color: '#fff', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                    }}>
                      <X size={14} /> Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving} style={{
                      padding: '6px 12px', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)',
                      border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6,
                      color: '#fff', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                    }}>
                      {saving ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <Save size={14} />}
                      Save
                    </button>
                  </>
                ) : (
                  <button onClick={() => setEditing(true)} style={{
                    padding: '6px 12px', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(6px)',
                    border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6,
                    color: '#fff', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                  }}>
                    <Edit2 size={14} /> Edit
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Content */}
          <div style={{ padding: '0 24px 28px' }}>
            {/* Avatar */}
            <div style={{
              width: 76, height: 76, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 700,
              marginTop: -38, marginBottom: 16,
              border: '3px solid var(--bg-1)',
              position: 'relative', zIndex: 1,
            }}>
              {initials}
            </div>

            {error && <div style={{ color: 'var(--red)', fontSize: 13, marginBottom: 16 }}>{error}</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <FieldRow label="Full Name" value={form.name} editing={editing}
                onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Your name" />

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 4 }}>Bio</label>
                {editing ? (
                  <textarea
                    value={form.bio || ''} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    placeholder="Tell us about yourself" rows={3}
                    style={{
                      width: '100%', background: 'var(--bg-2)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)', padding: '9px 12px',
                      color: 'var(--text)', fontSize: 15, outline: 'none', resize: 'vertical',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                ) : (
                  <span style={{ fontSize: 15, color: form.bio ? 'var(--text)' : 'var(--text-3)' }}>
                    {form.bio || 'No bio set'}
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>
                <FieldRow label="Location" value={form.location} editing={editing}
                  onChange={v => setForm(f => ({ ...f, location: v }))} placeholder="City, Country" />
                <FieldRow label="Website" value={form.website} editing={editing} type="url"
                  onChange={v => setForm(f => ({ ...f, website: v }))} placeholder="https://yoursite.com" />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Info */}
          <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
            <h3 style={{ fontFamily: 'Syne', fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Info</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text-2)' }}>
                <User size={15} color="var(--text-3)" />
                <span style={{ textTransform: 'capitalize' }}>{profile.role}</span>
              </div>
              {profile.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text-2)' }}>
                  <MapPin size={15} color="var(--text-3)" />
                  {profile.location}
                </div>
              )}
              {profile.website && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                  <Globe size={15} color="var(--text-3)" />
                  <a href={profile.website} target="_blank" rel="noreferrer"
                    style={{ color: 'var(--accent)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text-2)' }}>
                <Calendar size={15} color="var(--text-3)" />
                Joined {joined}
              </div>
            </div>
          </div>

          {/* Recent projects */}
          <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <FolderKanban size={15} color="var(--text-3)" />
              <h3 style={{ fontFamily: 'Syne', fontSize: 15, fontWeight: 600 }}>Recent Projects</h3>
            </div>
            {projects.length === 0 ? (
              <p style={{ fontSize: 14, color: 'var(--text-3)' }}>No projects yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {projects.map(p => (
                  <div key={p.id} style={{
                    padding: '10px 12px', background: 'var(--bg-2)',
                    borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }} className="truncate">{p.title}</span>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[p.status] || 'var(--text-3)', flexShrink: 0, marginLeft: 8 }} />
                    </div>
                    <div style={{ height: 4, background: 'var(--bg-3)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${p.progress || 0}%`, background: 'var(--accent)', borderRadius: 2 }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Password change */}
          {isOwn && (
            <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showPwForm ? 16 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Lock size={15} color="var(--text-3)" />
                  <h3 style={{ fontFamily: 'Syne', fontSize: 15, fontWeight: 600 }}>Password</h3>
                </div>
                <button onClick={() => { setShowPwForm(!showPwForm); setPwError(''); }}
                  style={{ background: 'none', border: 'none', color: showPwForm ? 'var(--text-3)' : 'var(--accent)', fontSize: 13, cursor: 'pointer' }}>
                  {showPwForm ? 'Cancel' : 'Change'}
                </button>
              </div>
              {showPwForm && (
                <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {pwError && <div style={{ color: 'var(--red)', fontSize: 12 }}>{pwError}</div>}
                  {[
                    { key: 'currentPassword', placeholder: 'Current password' },
                    { key: 'newPassword', placeholder: 'New password (6+ chars)' },
                  ].map(({ key, placeholder }) => (
                    <input key={key} type="password" placeholder={placeholder}
                      value={pwForm[key]} onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))} required
                      style={{
                        width: '100%', padding: '9px 12px',
                        background: 'var(--bg-2)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontSize: 13, outline: 'none',
                      }}
                      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />
                  ))}
                  <button type="submit" disabled={pwSaving} style={{
                    padding: '9px', background: 'var(--accent)', color: '#fff',
                    border: 'none', borderRadius: 'var(--radius-sm)', fontSize: 13,
                    fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer',
                  }}>
                    {pwSaving && <div className="spinner" style={{ width: 14, height: 14 }} />}
                    Update password
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
