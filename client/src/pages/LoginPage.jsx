import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useSettingsStore } from '../store/settingsStore'
import { useTranslation } from '../i18n'
import { authApi } from '../api/client'
import { Plane, Eye, EyeOff, Mail, Lock, MapPin, Calendar, Package, User, Globe } from 'lucide-react'

export default function LoginPage() {
  const { t, language } = useTranslation()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [appConfig, setAppConfig] = useState(null)

  const { login, register } = useAuthStore()
  const { setLanguageLocal } = useSettingsStore()
  const navigate = useNavigate()

  useEffect(() => {
    authApi.getAppConfig?.().catch(() => null).then(config => {
      if (config) {
        setAppConfig(config)
        if (!config.has_users) setMode('register')
      }
    })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      if (mode === 'register') {
        if (!username.trim()) { setError('Username is required'); setIsLoading(false); return }
        if (password.length < 6) { setError('Password must be at least 6 characters'); setIsLoading(false); return }
        await register(username, email, password)
      } else {
        await login(email, password)
      }
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || t('login.error'))
    } finally {
      setIsLoading(false)
    }
  }

  const showRegisterOption = appConfig?.allow_registration || !appConfig?.has_users

  const inputBase = {
    width: '100%', padding: '11px 12px 11px 40px', border: '1px solid #e5e7eb',
    borderRadius: 12, fontSize: 14, fontFamily: 'inherit', outline: 'none',
    color: '#111827', background: 'white', boxSizing: 'border-box', transition: 'border-color 0.15s',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif", position: 'relative' }}>

      {/* Sprach-Toggle oben rechts */}
      <button
        onClick={() => setLanguageLocal(language === 'en' ? 'de' : 'en')}
        style={{
          position: 'absolute', top: 16, right: 16, zIndex: 10,
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 12px', borderRadius: 99,
          background: 'rgba(0,0,0,0.06)', border: 'none',
          fontSize: 13, fontWeight: 500, color: '#374151',
          cursor: 'pointer', fontFamily: 'inherit',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.06)'}
      >
        <Globe size={14} />
        {language === 'en' ? 'DE' : 'EN'}
      </button>

      {/* Left — branding */}
      <div style={{ display: 'none', width: '45%', background: '#111827', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '60px 48px' }}
        className="lg-panel">
        <style>{`@media(min-width:1024px){.lg-panel{display:flex!important}}`}</style>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
          <div style={{ width: 44, height: 44, background: 'white', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Plane size={22} style={{ color: '#111827' }} />
          </div>
          <span style={{ fontSize: 26, fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>NOMAD</span>
        </div>

        <div style={{ maxWidth: 320, textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 32, fontWeight: 800, color: 'white', lineHeight: 1.2 }}>
            {t('login.tagline')}
          </h2>
          <p style={{ margin: 0, fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65 }}>
            {t('login.description')}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 40 }}>
            {[
              { Icon: MapPin, label: t('login.features.places') },
              { Icon: Calendar, label: t('login.features.schedule') },
              { Icon: Package, label: t('login.features.packing') },
            ].map(({ Icon, label }) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: '18px 12px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <Icon size={20} style={{ color: 'rgba(255,255,255,0.6)' }} />
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', background: '#f9fafb' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Mobile logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36, justifyContent: 'center' }}
            className="mobile-logo">
            <style>{`@media(min-width:1024px){.mobile-logo{display:none!important}}`}</style>
            <div style={{ width: 36, height: 36, background: '#111827', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plane size={18} style={{ color: 'white' }} />
            </div>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>NOMAD</span>
          </div>

          <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e5e7eb', padding: '36px 32px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
            <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: '#111827' }}>
              {mode === 'register' ? (!appConfig?.has_users ? t('login.createAdmin') : t('login.createAccount')) : t('login.title')}
            </h2>
            <p style={{ margin: '0 0 28px', fontSize: 13.5, color: '#9ca3af' }}>
              {mode === 'register' ? (!appConfig?.has_users ? t('login.createAdminHint') : t('login.createAccountHint')) : t('login.subtitle')}
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {error && (
                <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, fontSize: 13, color: '#dc2626' }}>
                  {error}
                </div>
              )}

              {/* Username (register only) */}
              {mode === 'register' && (
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{t('login.username')}</label>
                  <div style={{ position: 'relative' }}>
                    <User size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                    <input
                      type="text" value={username} onChange={e => setUsername(e.target.value)} required
                      placeholder="admin" style={inputBase}
                      onFocus={e => e.target.style.borderColor = '#111827'}
                      onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{t('common.email')}</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    placeholder="deine@email.de" style={inputBase}
                    onFocus={e => e.target.style.borderColor = '#111827'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{t('common.password')}</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                  <input
                    type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                    placeholder="••••••••" style={{ ...inputBase, paddingRight: 44 }}
                    onFocus={e => e.target.style.borderColor = '#111827'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)} style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', color: '#9ca3af',
                  }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isLoading} style={{
                marginTop: 4, width: '100%', padding: '12px', background: '#111827', color: 'white',
                border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: isLoading ? 'default' : 'pointer',
                fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: isLoading ? 0.7 : 1, transition: 'opacity 0.15s',
              }}
                onMouseEnter={e => { if (!isLoading) e.currentTarget.style.background = '#1f2937' }}
                onMouseLeave={e => e.currentTarget.style.background = '#111827'}
              >
                {isLoading
                  ? <><div style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />{mode === 'register' ? t('login.creating') : t('login.signingIn')}</>
                  : mode === 'register' ? t('login.createAccount') : t('login.signIn')
                }
              </button>
            </form>

            {/* Toggle login/register */}
            {showRegisterOption && appConfig?.has_users && (
              <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#9ca3af' }}>
                {mode === 'login' ? t('login.noAccount') + ' ' : t('login.hasAccount') + ' '}
                <button onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError('') }}
                  style={{ background: 'none', border: 'none', color: '#111827', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>
                  {mode === 'login' ? t('login.register') : t('login.signIn')}
                </button>
              </p>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
