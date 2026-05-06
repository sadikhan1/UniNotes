import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createNote, updateNote, getNote } from '../services/api'
import { useLocale } from '../context/LocaleContext'

function NoteFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { t } = useLocale()
  const isEdit = Boolean(id)

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    course: '',
    is_public: false,
    tags: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    getNote(id)
      .then(note => {
        setFormData({
          title: note.title,
          content: note.content || '',
          course: note.course || '',
          is_public: note.is_public,
          tags: (note.tags || []).join(', '),
        })
      })
      .catch(() => navigate('/notes'))
  }, [id, isEdit, navigate])

  const validate = () => {
    const errs = {}
    if (!formData.title.trim()) errs.title = t('titleRequired')
    const tagList = formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    if (tagList.length > 10) errs.tags = t('maxTagsError')
    return errs
  }

  const handleChange = (field) => (e) =>
    setFormData(p => ({ ...p, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    const payload = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
    }

    setLoading(true)
    try {
      if (isEdit) {
        await updateNote(id, payload)
        navigate(`/notes/${id}`)
      } else {
        const note = await createNote(payload)
        navigate(`/notes/${note.id}`)
      }
    } catch (err) {
      setErrors({ api: err.message })
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEdit ? t('editNote') : t('createNote')}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-gray-200 space-y-5">
        {errors.api && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {errors.api}
          </div>
        )}

        <div>
          {errors.title && <p className="text-sm text-red-600 mb-1">{errors.title}</p>}
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('title')} *</label>
          <input
            type="text"
            value={formData.title}
            onChange={handleChange('title')}
            placeholder={t('noteTitlePlaceholder')}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('content')}</label>
          <textarea
            rows={8}
            value={formData.content}
            onChange={handleChange('content')}
            placeholder={t('noteContentPlaceholder')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('course')}</label>
          <input
            type="text"
            value={formData.course}
            onChange={handleChange('course')}
            placeholder={t('coursePlaceholder')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          {errors.tags && <p className="text-sm text-red-600 mb-1">{errors.tags}</p>}
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('tags')} <span className="text-gray-400 font-normal">({t('tagsPlaceholder')})</span>
          </label>
          <input
            type="text"
            value={formData.tags}
            onChange={handleChange('tags')}
            placeholder="e.g. exam, midterm, calculus"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.tags ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setFormData(p => ({ ...p, is_public: !p.is_public }))}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              formData.is_public ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                formData.is_public ? 'translate-x-5' : ''
              }`}
            />
          </button>
          <span className="text-sm text-gray-700">
            {formData.is_public ? t('public') : t('private')}
          </span>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? t('saving') : isEdit ? t('saveNote') : t('createNote')}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            {t('cancel')}
          </button>
        </div>
      </form>
    </div>
  )
}

export default NoteFormPage
