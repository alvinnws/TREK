import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useSettingsStore } from '../store/settingsStore'
import { useTranslation } from '../i18n'
import Navbar from '../components/Layout/Navbar'
import CustomSelect from '../components/shared/CustomSelect'
import { useToast } from '../components/shared/Toast'
import { Save, Map, Palette, User, Moon, Sun, Shield, Camera, Trash2 } from 'lucide-react'

const MAP_PRESETS = [
  { name: 'OpenStreetMap', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' },
  { name: 'OpenStreetMap DE', url: 'https://tile.openstreetmap.de/{z}/{x}/{y}.png' },
  { name: 'CartoDB Light', url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png' },
  { name: 'CartoDB Dark', url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' },
  { name: 'Stadia Smooth', url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png' },
]

function Section({ title, icon: Icon, children }) {
  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
      <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--border-secondary)' }}>
        <Icon className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
        <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
      </div>
      <div className="p-6 space-y-4">
        {children}
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { user, updateProfile, uploadAvatar, deleteAvatar } = useAuthStore()
  const avatarInputRef = React.useRef(null)
  const { settings, updateSetting, updateSettings } = useSettingsStore()
  const { t, locale } = useTranslation()
  const toast = useToast()
  const navigate = useNavigate()

  const [saving, setSaving] = useState({})

  // Map settings
  const [mapTileUrl, setMapTileUrl] = useState(settings.map_tile_url || '')
  const [defaultLat, setDefaultLat] = useState(settings.default_lat || 48.8566)
  const [defaultLng, setDefaultLng] = useState(settings.default_lng || 2.3522)
  const [defaultZoom, setDefaultZoom] = useState(settings.default_zoom || 10)

  // Display
  const [tempUnit, setTempUnit] = useState(settings.temperature_unit || 'celsius')

  // Account
  const [username, setUsername] = useState(user?.username || '')
  const [email, setEmail] = useState(user?.email || '')

  useEffect(() => {
    setMapTileUrl(settings.map_tile_url || '')
    setDefaultLat(settings.default_lat || 48.8566)
    setDefaultLng(settings.default_lng || 2.3522)
    setDefaultZoom(settings.default_zoom || 10)
    setTempUnit(settings.temperature_unit || 'celsius')
  }, [settings])

  useEffect(() => {
    setUsername(user?.username || '')
    setEmail(user?.email || '')
  }, [user])

  const saveMapSettings = async () => {
    setSaving(s => ({ ...s, map: true }))
    try {
      await updateSettings({
        map_tile_url: mapTileUrl,
        default_lat: parseFloat(defaultLat),
        default_lng: parseFloat(defaultLng),
        default_zoom: parseInt(defaultZoom),
      })
      toast.success(t('settings.toast.mapSaved'))
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(s => ({ ...s, map: false }))
    }
  }

  const saveDisplay = async () => {
    setSaving(s => ({ ...s, display: true }))
    try {
      await updateSetting('temperature_unit', tempUnit)
      toast.success(t('settings.toast.displaySaved'))
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(s => ({ ...s, display: false }))
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await uploadAvatar(file)
      toast.success(t('settings.avatarUploaded'))
    } catch {
      toast.error(t('settings.avatarError'))
    }
    if (avatarInputRef.current) avatarInputRef.current.value = ''
  }

  const handleAvatarRemove = async () => {
    try {
      await deleteAvatar()
      toast.success(t('settings.avatarRemoved'))
    } catch {
      toast.error(t('settings.avatarError'))
    }
  }

  const saveProfile = async () => {
    setSaving(s => ({ ...s, profile: true }))
    try {
      await updateProfile({ username, email })
      toast.success(t('settings.toast.profileSaved'))
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(s => ({ ...s, profile: false }))
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-secondary)' }}>
      <Navbar />

      <div className="pt-14">
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('settings.title')}</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{t('settings.subtitle')}</p>
          </div>

          {/* Map settings */}
          <Section title={t('settings.map')} icon={Map}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('settings.mapTemplate')}</label>
              <CustomSelect
                value=""
                onChange={value => { if (value) setMapTileUrl(value) }}
                placeholder={t('settings.mapTemplatePlaceholder.select')}
                options={MAP_PRESETS.map(p => ({
                  value: p.url,
                  label: p.name,
                }))}
                size="sm"
                style={{ marginBottom: 8 }}
              />
              <input
                type="text"
                value={mapTileUrl}
                onChange={e => setMapTileUrl(e.target.value)}
                placeholder="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-400 focus:border-transparent"
              />
              <p className="text-xs text-slate-400 mt-1">{t('settings.mapDefaultHint')}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('settings.latitude')}</label>
                <input
                  type="number"
                  step="any"
                  value={defaultLat}
                  onChange={e => setDefaultLat(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('settings.longitude')}</label>
                <input
                  type="number"
                  step="any"
                  value={defaultLng}
                  onChange={e => setDefaultLng(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={saveMapSettings}
              disabled={saving.map}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-700 disabled:bg-slate-400"
            >
              {saving.map ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              {t('settings.saveMap')}
            </button>
          </Section>

          {/* Display */}
          <Section title={t('settings.display')} icon={Palette}>
            {/* Dark Mode Toggle */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>{t('settings.colorMode')}</label>
              <div className="flex gap-3">
                {[
                  { value: false, label: t('settings.light'), icon: Sun },
                  { value: true, label: t('settings.dark'), icon: Moon },
                ].map(opt => (
                  <button
                    key={String(opt.value)}
                    onClick={async () => {
                      try {
                        await updateSetting('dark_mode', opt.value)
                      } catch (e) { toast.error(e.message) }
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '10px 20px', borderRadius: 10, cursor: 'pointer',
                      fontFamily: 'inherit', fontSize: 14, fontWeight: 500,
                      border: settings.dark_mode === opt.value ? '2px solid var(--text-primary)' : '2px solid var(--border-primary)',
                      background: settings.dark_mode === opt.value ? 'var(--bg-hover)' : 'var(--bg-card)',
                      color: 'var(--text-primary)',
                      transition: 'all 0.15s',
                    }}
                  >
                    <opt.icon size={16} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sprache */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>{t('settings.language')}</label>
              <div className="flex gap-3">
                {[
                  { value: 'de', label: 'Deutsch' },
                  { value: 'en', label: 'English' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={async () => {
                      try { await updateSetting('language', opt.value) }
                      catch (e) { toast.error(e.message) }
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '10px 20px', borderRadius: 10, cursor: 'pointer',
                      fontFamily: 'inherit', fontSize: 14, fontWeight: 500,
                      border: settings.language === opt.value ? '2px solid var(--text-primary)' : '2px solid var(--border-primary)',
                      background: settings.language === opt.value ? 'var(--bg-hover)' : 'var(--bg-card)',
                      color: 'var(--text-primary)',
                      transition: 'all 0.15s',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Temperature */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>{t('settings.temperature')}</label>
              <div className="flex gap-3">
                {[
                  { value: 'celsius', label: '°C Celsius' },
                  { value: 'fahrenheit', label: '°F Fahrenheit' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={async () => {
                      setTempUnit(opt.value)
                      try { await updateSetting('temperature_unit', opt.value) }
                      catch (e) { toast.error(e.message) }
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '10px 20px', borderRadius: 10, cursor: 'pointer',
                      fontFamily: 'inherit', fontSize: 14, fontWeight: 500,
                      border: tempUnit === opt.value ? '2px solid var(--text-primary)' : '2px solid var(--border-primary)',
                      background: tempUnit === opt.value ? 'var(--bg-hover)' : 'var(--bg-card)',
                      color: 'var(--text-primary)',
                      transition: 'all 0.15s',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Zeitformat */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>{t('settings.timeFormat')}</label>
              <div className="flex gap-3">
                {[
                  { value: '24h', label: '24h (14:30)' },
                  { value: '12h', label: '12h (2:30 PM)' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={async () => {
                      try { await updateSetting('time_format', opt.value) }
                      catch (e) { toast.error(e.message) }
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '10px 20px', borderRadius: 10, cursor: 'pointer',
                      fontFamily: 'inherit', fontSize: 14, fontWeight: 500,
                      border: settings.time_format === opt.value ? '2px solid var(--text-primary)' : '2px solid var(--border-primary)',
                      background: settings.time_format === opt.value ? 'var(--bg-hover)' : 'var(--bg-card)',
                      color: 'var(--text-primary)',
                      transition: 'all 0.15s',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </Section>

          {/* Account */}
          <Section title={t('settings.account')} icon={User}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('settings.username')}</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('settings.email')}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-400 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-4">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div style={{
                  width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, fontWeight: 700,
                  background: 'var(--bg-hover)', color: 'var(--text-secondary)',
                }}>
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col gap-2">
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  <span className="font-medium" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)' }}>
                    {user?.role === 'admin' ? <><Shield size={13} /> {t('settings.roleAdmin')}</> : t('settings.roleUser')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    style={{ display: 'none' }}
                  />
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    style={{
                      border: '1px solid var(--border-primary)',
                      background: 'var(--bg-card)',
                      color: 'var(--text-secondary)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}
                  >
                    <Camera size={14} />
                    {t('settings.uploadAvatar')}
                  </button>
                  {user?.avatar_url && (
                    <button
                      onClick={handleAvatarRemove}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      style={{
                        border: '1px solid var(--border-primary)',
                        background: 'var(--bg-card)',
                        color: '#ef4444',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}
                    >
                      <Trash2 size={14} />
                      {t('settings.removeAvatar')}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={saveProfile}
              disabled={saving.profile}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-700 disabled:bg-slate-400"
            >
              {saving.profile ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              {t('settings.saveProfile')}
            </button>
          </Section>
        </div>
      </div>
    </div>
  )
}
