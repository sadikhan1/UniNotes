import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  getMyProfile, getUser, getUserNotes,
  updateProfile, updatePassword, uploadAvatar, getSavedNotes,
} from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useLocale } from '../context/LocaleContext'

/* ─── small helpers ─────────────────────────────────────── */

function initials(p) {
  if (p?.first_name || p?.last_name)
    return `${p.first_name?.[0] ?? ''}${p.last_name?.[0] ?? ''}`.toUpperCase()
  return (p?.username?.[0] ?? '?').toUpperCase()
}

function EyeIcon({ open }) {
  return open ? (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}

function NoteCard({ note }) {
  return (
    <Link to={`/notes/${note.id}`}
      className="block bg-[#0b1117] rounded-xl border border-cyan-900/40 p-4 hover:border-cyan-700/60 hover:bg-cyan-900/10 transition">
      <h3 className="font-semibold text-slate-100 truncate">{note.title}</h3>
      {note.course && <p className="text-xs text-cyan-400 mt-1 font-medium">{note.course}</p>}
      {note.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {note.tags.map(tag => (
            <span key={tag} className="text-xs bg-[#10141a] border border-cyan-900/30 text-slate-500 px-2 py-0.5 rounded-full">{tag}</span>
          ))}
        </div>
      )}
      <p className="text-xs text-slate-600 mt-2">{new Date(note.created_at).toLocaleDateString()}</p>
    </Link>
  )
}

function TabButton({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
        active ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
      {children}
    </button>
  )
}

const field = (err) =>
  `w-full px-3 py-2 bg-[#0b1117] border rounded-lg text-slate-100 text-sm
   placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40
   focus:border-cyan-600 transition ${err ? 'border-red-600' : 'border-cyan-900/50'}`

/* ─── InfoField: label + value row ─────────────────────── */
function InfoField({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-600 mb-0.5">{label}</p>
      <p className="text-sm text-slate-200 font-medium">{value || <span className="text-slate-600">—</span>}</p>
    </div>
  )
}

/* ─── main ──────────────────────────────────────────────── */
function ProfilePage() {
  const { id } = useParams()
  const { user: authUser } = useAuth()
  const { t } = useLocale()
  const isOwn = authUser?.id === id

  /* data */
  const [profile, setProfile]     = useState(null)
  const [notes, setNotes]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [loadError, setLoadError] = useState('')

  /* tabs */
  const [tab, setTab]             = useState('public')
  const [saved, setSaved]         = useState([])
  const [loadingSaved, setLS]     = useState(false)
  const [savedLoaded, setSL]      = useState(false)

  /* avatar */
  const fileRef                   = useRef(null)
  const [uploadingAv, setUA]      = useState(false)
  const [avError, setAvError]     = useState('')

  /* profile edit */
  const [editing, setEditing]     = useState(false)
  const [draft, setDraft]         = useState({})
  const [pErr, setPErr]           = useState('')
  const [pOk, setPOk]             = useState('')
  const [saving, setSaving]       = useState(false)

  /* password */
  const [pwd, setPwd]             = useState('')
  const [showPwd, setShowPwd]     = useState(false)
  const [pwdErr, setPwdErr]       = useState('')
  const [pwdOk, setPwdOk]         = useState('')
  const [savingPwd, setSavingPwd] = useState(false)

  /* load */
  useEffect(() => {
    const fetch1 = isOwn ? getMyProfile() : getUser(id)
    Promise.all([fetch1, getUserNotes(id)])
      .then(([p, n]) => { setProfile(p); setNotes(n) })
      .catch(e => setLoadError(e.message || 'error'))
      .finally(() => setLoading(false))
  }, [id, isOwn])

  const loadSaved = async () => {
    if (savedLoaded) return
    setLS(true)
    try { const d = await getSavedNotes(); setSaved(d); setSL(true) }
    catch (e) { console.error(e) }
    finally { setLS(false) }
  }

  /* avatar upload */
  const handleAvatarFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUA(true); setAvError('')
    try {
      const res = await uploadAvatar(file)
      setProfile(p => ({ ...p, avatar_url: res.avatar_url }))
    } catch (e) { setAvError(e.message) }
    finally { setUA(false); e.target.value = '' }
  }

  /* profile save */
  const startEdit = () => {
    setDraft({ username: profile.username ?? '', first_name: profile.first_name ?? '',
               last_name: profile.last_name ?? '', department: profile.department ?? '' })
    setPErr(''); setPOk(''); setEditing(true)
  }

  const saveProfile = async () => {
    setSaving(true); setPErr(''); setPOk('')
    try {
      const upd = await updateProfile(draft)
      setProfile(p => ({ ...p, ...upd }))
      setEditing(false); setPOk(t('profileUpdated'))
      setTimeout(() => setPOk(''), 3000)
    } catch (e) { setPErr(e.message) }
    finally { setSaving(false) }
  }

  /* password save */
  const savePwd = async () => {
    if (!pwd || pwd.length < 8) { setPwdErr(t('passwordMinLength')); return }
    setSavingPwd(true); setPwdErr(''); setPwdOk('')
    try {
      await updatePassword(pwd)
      setPwd(''); setPwdOk(t('passwordUpdated'))
      setTimeout(() => setPwdOk(''), 3000)
    } catch (e) { setPwdErr(e.message) }
    finally { setSavingPwd(false) }
  }

  /* ── states ── */
  if (loading)
    return <div className="min-h-screen flex items-center justify-center bg-[#0b1117]">
      <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
    </div>

  if (!profile)
    return <div className="text-center py-20 text-slate-500">{loadError || t('userNotFound')}</div>

  const displayName = profile.first_name || profile.last_name
    ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim()
    : profile.username

  /* ── render ── */
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

      {/* ══ Main profile card ══════════════════════════════════ */}
      <div className="bg-[#10141a] rounded-xl border border-cyan-900/40 overflow-hidden">

        {/* Note count banner */}
        <div className="flex justify-end items-center px-6 pt-4 pb-0">
          <div className="text-right">
            <span className="text-2xl font-bold text-cyan-400">{profile.note_count}</span>
            <span className="text-xs text-slate-500 ml-1.5">{t('publicNotesTab')}</span>
          </div>
        </div>

        {/* ── Avatar + Info side-by-side ── */}
        <div className="flex flex-col sm:flex-row gap-6 p-6 pt-3">

          {/* Avatar column */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="relative group">
              <div
                className={`w-32 h-32 rounded-full border-2 border-cyan-700/40 bg-[#0b1117]
                  flex items-center justify-center overflow-hidden
                  ${isOwn ? 'cursor-pointer' : ''}`}
                onClick={() => isOwn && fileRef.current?.click()}
              >
                {profile.avatar_url
                  ? <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                  : <span className="text-4xl font-bold text-cyan-400 select-none">{initials(profile)}</span>
                }
                {isOwn && (
                  <div className="absolute inset-0 rounded-full bg-black/60 flex flex-col items-center justify-center
                    opacity-0 group-hover:opacity-100 transition gap-1">
                    {uploadingAv
                      ? <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                      : <>
                          <svg className="w-7 h-7 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-cyan-400 text-xs font-medium">{t('changePhoto') ?? 'Değiştir'}</span>
                        </>
                    }
                  </div>
                )}
              </div>

              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
            </div>

            {avError && <p className="text-xs text-red-400 text-center max-w-[9rem]">{avError}</p>}

            {/* hint text below circle – own profile only */}
            {isOwn && !uploadingAv && (
              <button
                onClick={() => fileRef.current?.click()}
                className="text-xs text-slate-600 hover:text-cyan-400 transition"
              >
                {t('changePhoto') ?? 'Fotoğraf değiştir'}
              </button>
            )}
          </div>

          {/* Info column */}
          <div className="flex-1 min-w-0">

            {/* view mode */}
            {!editing && (
              <>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-xl font-bold text-slate-100">{displayName}</h1>
                    <p className="text-sm text-cyan-400 mt-0.5">@{profile.username}</p>
                    <p className="text-xs text-slate-600 mt-1">
                      {t('joined')} {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {isOwn && (
                    <button onClick={startEdit}
                      className="text-xs text-cyan-400 hover:text-cyan-300 border border-cyan-900/50 px-3 py-1 rounded-lg transition shrink-0 ml-2">
                      {t('editProfile')}
                    </button>
                  )}
                </div>

                {pOk && <p className="mb-3 text-xs text-cyan-400">{pOk}</p>}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  <InfoField label={t('firstName')}  value={profile.first_name} />
                  <InfoField label={t('lastName')}   value={profile.last_name} />
                  <InfoField label={t('username')}   value={`@${profile.username}`} />
                  <InfoField label={t('department')} value={profile.department} />
                  {isOwn && (
                    <InfoField label={t('email')} value={authUser?.email} />
                  )}
                </div>
              </>
            )}

            {/* edit mode */}
            {editing && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">{t('firstName')}</label>
                    <input className={field(false)} value={draft.first_name}
                      onChange={e => setDraft(d => ({ ...d, first_name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">{t('lastName')}</label>
                    <input className={field(false)} value={draft.last_name}
                      onChange={e => setDraft(d => ({ ...d, last_name: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">{t('username')}</label>
                  <input className={field(false)} value={draft.username}
                    onChange={e => setDraft(d => ({ ...d, username: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">{t('department')}</label>
                  <input className={field(false)} value={draft.department}
                    onChange={e => setDraft(d => ({ ...d, department: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">{t('email')}</label>
                  <input className={`${field(false)} opacity-50 cursor-not-allowed`}
                    value={authUser?.email ?? ''} readOnly />
                </div>
                {pErr && <p className="text-xs text-red-400">{pErr}</p>}
                <div className="flex gap-2 pt-1">
                  <button onClick={saveProfile} disabled={saving}
                    className="px-4 py-2 bg-cyan-400 text-[#0b1117] text-sm font-semibold rounded-lg
                      hover:bg-cyan-300 transition disabled:opacity-50">
                    {saving ? t('saving') : t('saveProfile')}
                  </button>
                  <button onClick={() => setEditing(false)}
                    className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition">
                    {t('cancel')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Change password (own profile only) ── */}
        {isOwn && (
          <div className="border-t border-cyan-900/30 px-6 py-4">
            <p className="text-sm font-semibold text-slate-300 mb-3">{t('changePassword')}</p>
            {pwdOk && <p className="mb-2 text-xs text-cyan-400">{pwdOk}</p>}
            <div className="flex gap-2 items-start max-w-md">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder={t('newPassword')}
                    value={pwd}
                    onChange={e => { setPwd(e.target.value); setPwdErr('') }}
                    className={`${field(pwdErr)} pr-9`}
                  />
                  <button type="button"
                    onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition"
                    aria-label={showPwd ? t('hidePassword') : t('showPassword')}>
                    <EyeIcon open={showPwd} />
                  </button>
                </div>
                {pwdErr && <p className="mt-1 text-xs text-red-400">{pwdErr}</p>}
              </div>
              <button onClick={savePwd} disabled={savingPwd}
                className="px-4 py-2 bg-cyan-400 text-[#0b1117] text-sm font-semibold rounded-lg
                  hover:bg-cyan-300 transition disabled:opacity-50 whitespace-nowrap">
                {savingPwd ? t('saving') : t('save')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══ Tabs ══════════════════════════════════════════════ */}
      {isOwn && (
        <div className="flex gap-1 border-b border-cyan-900/40">
          <TabButton active={tab === 'public'} onClick={() => setTab('public')}>
            {t('publicNotesTab')}
          </TabButton>
          <TabButton active={tab === 'saved'} onClick={() => { setTab('saved'); loadSaved() }}>
            {t('savedNotesTab')}
          </TabButton>
        </div>
      )}

      {!isOwn && (
        <h2 className="text-base font-semibold text-slate-300">{t('publicNotesTab')}</h2>
      )}

      {/* ══ Notes grid ════════════════════════════════════════ */}
      {tab === 'public' && (
        notes.length === 0
          ? <p className="text-slate-500 text-center py-12">{t('noPublicNotes')}</p>
          : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map(n => <NoteCard key={n.id} note={n} />)}
            </div>
      )}

      {tab === 'saved' && (
        loadingSaved
          ? <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            </div>
          : saved.length === 0
            ? <p className="text-slate-500 text-center py-12">{t('noSavedNotes')}</p>
            : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {saved.map(n => <NoteCard key={n.id} note={n} />)}
              </div>
      )}
    </div>
  )
}

export default ProfilePage
