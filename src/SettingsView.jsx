import { useState, useEffect } from 'react'
import { Trash2, Recycle, Truck, Phone, Mail, Globe, ExternalLink } from 'lucide-react'
import { loadPreferences, savePreferences, getDeviceToken, deactivateDevice } from './push'
import { S, C } from './styles'
import { useLang } from './i18n'

const APP_VERSION = '0.1.0'
const PRIVACY_URL = 'https://honeaenterprises.com/kurbconnect'

const EVENING = [16, 16.5, 17, 17.5, 18, 18.5, 19, 19.5, 20, 20.5, 21, 21.5]
const MORNING = [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5]

const toHM = (v) => ({ h: Math.floor(v), m: v % 1 ? 30 : 0 })
const toVal = (h, m) => h + (m === 30 ? 0.5 : 0)

function timeLabel(v, locale) {
  const { h, m } = toHM(v)
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' })
}

export default function SettingsView({ accent, org }) {
  const { t, lang, locale, setLang } = useLang()
  const [prefs, setPrefs] = useState(null)
  const [saved, setSaved] = useState(false)
  const [confirmStop, setConfirmStop] = useState(false)
  const [stopped, setStopped] = useState(false)
  const hasDevice = !!getDeviceToken()

  const CATEGORIES = [
    { id: 'trash', label: t.trash, Icon: Trash2 },
    { id: 'recycling', label: t.recycling, Icon: Recycle },
    { id: 'bulk', label: t.bulk, Icon: Truck },
  ]

  useEffect(() => {
    loadPreferences().then((p) => {
      setPrefs(p || {
        reminders_enabled: true,
        reminder_timing: 'night_before',
        reminder_hour: 19,
        reminder_minute: 0,
        morning_hour: 6,
        morning_minute: 0,
        enabled_categories: ['trash', 'recycling', 'bulk'],
        language: lang,
        alerts_enabled: true,
        paused_until: null,
      })
    })
  }, [])

  async function update(changes) {
    const next = { ...prefs, ...changes }
    setPrefs(next)
    if (changes.language) setLang(changes.language)
    const ok = await savePreferences({
      enabled: next.reminders_enabled,
      timing: next.reminder_timing,
      hour: next.reminder_hour,
      minute: next.reminder_minute,
      morningHour: next.morning_hour,
      morningMinute: next.morning_minute,
      categories: next.enabled_categories,
      language: next.language,
      alerts: next.alerts_enabled,
      pausedUntil: next.paused_until,
    })
    if (ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 1800)
    }
  }

  function toggleCategory(id) {
    const list = prefs.enabled_categories.includes(id)
      ? prefs.enabled_categories.filter((c) => c !== id)
      : [...prefs.enabled_categories, id]
    update({ enabled_categories: list })
  }

  async function stopEverything() {
    await deactivateDevice()
    setStopped(true)
    setConfirmStop(false)
  }

  if (stopped) {
    return (
      <div style={{ padding: '56px 28px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 19, fontWeight: 700, color: C.ink, margin: 0 }}>
          {t.stoppedTitle}
        </h2>
        <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, marginTop: 10 }}>
          {t.stoppedBody}
        </p>
      </div>
    )
  }

  if (!prefs) return <div style={S.empty}>{t.loading}</div>

  const isPaused = prefs.paused_until && new Date(prefs.paused_until) >= new Date()
  const showEvening = prefs.reminder_timing === 'night_before' || prefs.reminder_timing === 'both'
  const showMorning = prefs.reminder_timing === 'day_of' || prefs.reminder_timing === 'both'

  return (
    <div style={{ paddingTop: 4 }}>
      {!hasDevice && <div style={{ ...S.notice, marginTop: 12 }}>{t.openOnPhone}</div>}

      {isPaused && (
        <div style={pausedBar}>
          <span>
            {t.pausedUntil.replace(
              '{date}',
              new Date(prefs.paused_until).toLocaleDateString(locale, {
                month: 'short',
                day: 'numeric',
              }),
            )}
          </span>
          <button
            onClick={() => update({ paused_until: null })}
            style={{ ...S.textLink, color: accent }}
          >
            {t.resume}
          </button>
        </div>
      )}

      {/* ── Pickup reminders ─────────────────────────── */}
      <div style={S.groupHead}>{t.pickupReminders}</div>
      <div style={S.card}>
        <div style={prefs.reminders_enabled ? S.settingRow : S.settingRowLast}>
          <div style={{ minWidth: 0 }}>
            <div style={S.settingName}>{t.pickupReminders}</div>
            <div style={S.settingHint}>{t.reminderSubtitle}</div>
          </div>
          <Toggle
            on={prefs.reminders_enabled}
            accent={accent}
            onChange={(v) => update({ reminders_enabled: v })}
          />
        </div>

        {prefs.reminders_enabled && (
          <>
            <div style={{ ...S.cardPad, borderBottom: `1px solid ${C.ruleSoft}` }}>
              <div style={S.label}>{t.when}</div>
              <Segment
                value={prefs.reminder_timing}
                onChange={(v) => update({ reminder_timing: v })}
                options={[
                  { id: 'night_before', label: t.nightBefore },
                  { id: 'day_of', label: t.morningOf },
                  { id: 'both', label: t.bothTimes },
                ]}
              />

              {showEvening && (
                <>
                  <div style={{ ...S.label, marginTop: 16 }}>{t.eveningTime}</div>
                  <select
                    value={toVal(prefs.reminder_hour, prefs.reminder_minute)}
                    onChange={(e) => {
                      const { h, m } = toHM(Number(e.target.value))
                      update({ reminder_hour: h, reminder_minute: m })
                    }}
                    style={S.input}
                  >
                    {EVENING.map((v) => (
                      <option key={v} value={v}>{timeLabel(v, locale)}</option>
                    ))}
                  </select>
                </>
              )}

              {showMorning && (
                <>
                  <div style={{ ...S.label, marginTop: 16 }}>{t.morningTime}</div>
                  <select
                    value={toVal(prefs.morning_hour, prefs.morning_minute)}
                    onChange={(e) => {
                      const { h, m } = toHM(Number(e.target.value))
                      update({ morning_hour: h, morning_minute: m })
                    }}
                    style={S.input}
                  >
                    {MORNING.map((v) => (
                      <option key={v} value={v}>{timeLabel(v, locale)}</option>
                    ))}
                  </select>
                </>
              )}
            </div>

            <div style={{ padding: '14px 16px 6px' }}>
              <div style={S.label}>{t.remindMeAbout}</div>
            </div>
            {CATEGORIES.map(({ id, label, Icon }, i) => (
              <div
                key={id}
                style={i === CATEGORIES.length - 1 ? S.settingRowLast : S.settingRow}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Icon size={18} color={C.muted} strokeWidth={1.8} />
                  <span style={S.settingName}>{label}</span>
                </span>
                <Toggle
                  on={prefs.enabled_categories.includes(id)}
                  accent={accent}
                  onChange={() => toggleCategory(id)}
                />
              </div>
            ))}
          </>
        )}
      </div>

      {/* ── Service alerts ───────────────────────────── */}
      <div style={S.groupHead}>{t.serviceAlerts}</div>
      <div style={S.card}>
        <div style={S.settingRowLast}>
          <div style={{ minWidth: 0 }}>
            <div style={S.settingName}>{t.serviceAlerts}</div>
            <div style={S.settingHint}>{t.serviceAlertsHint}</div>
          </div>
          <Toggle
            on={prefs.alerts_enabled}
            accent={accent}
            onChange={(v) => update({ alerts_enabled: v })}
          />
        </div>
      </div>

      {/* ── Pause ────────────────────────────────────── */}
      <div style={S.groupHead}>{t.pauseReminders}</div>
      <div style={S.card}>
        <div style={S.cardPad}>
          <div style={{ ...S.settingHint, marginTop: 0, marginBottom: 10 }}>
            {t.pauseHint}
          </div>
          <input
            type="date"
            value={prefs.paused_until || ''}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => update({ paused_until: e.target.value || null })}
            style={S.input}
          />
        </div>
      </div>

      {/* ── Language ─────────────────────────────────── */}
      <div style={S.groupHead}>{t.language}</div>
      <div style={S.card}>
        <div style={S.cardPad}>
          <Segment
            value={lang}
            onChange={(v) => update({ language: v })}
            options={[
              { id: 'en', label: 'English' },
              { id: 'es', label: 'Español' },
            ]}
          />
        </div>
      </div>

      {/* ── Provider ─────────────────────────────────── */}
      {org && (org.phone || org.email || org.website) && (
        <>
          <div style={S.groupHead}>{t.provider}</div>
          <div style={S.card}>
            {org.organization_name && (
              <div style={{ ...S.settingRow, display: 'block' }}>
                <div style={{ ...S.settingName, fontWeight: 600 }}>
                  {org.organization_name}
                </div>
              </div>
            )}
            {org.phone && (
              <LinkRow href={`tel:${org.phone}`} Icon={Phone} label={org.phone} accent={accent} />
            )}
            {org.email && (
              <LinkRow href={`mailto:${org.email}`} Icon={Mail} label={org.email} accent={accent} />
            )}
            {org.website && (
              <LinkRow href={org.website} Icon={Globe} label={t.visitWebsite} accent={accent} external last />
            )}
          </div>
        </>
      )}

      {/* ── About ────────────────────────────────────── */}
      <div style={S.groupHead}>{t.about}</div>
      <div style={S.card}>
        <div style={S.settingRow}>
          <span style={S.settingName}>{t.version}</span>
          <span style={S.muted}>{APP_VERSION}</span>
        </div>
        <LinkRow
          href={PRIVACY_URL}
          Icon={ExternalLink}
          label={t.privacyPolicy}
          accent={accent}
          external
          last
        />
      </div>

      {/* ── Stop ─────────────────────────────────────── */}
      <div style={{ padding: '26px 14px 10px' }}>
        {confirmStop ? (
          <>
            <div style={{ ...S.notice, margin: '0 0 12px' }}>{t.stopConfirm}</div>
            <button onClick={stopEverything} style={{ ...S.button, background: '#B91C1C', marginTop: 0 }}>
              {t.stopConfirmAction}
            </button>
            <button onClick={() => setConfirmStop(false)} style={S.buttonQuiet}>
              {t.keepGoing}
            </button>
          </>
        ) : (
          <button
            onClick={() => setConfirmStop(true)}
            style={{ ...S.buttonQuiet, marginTop: 0, color: '#B91C1C', borderColor: '#FECACA' }}
          >
            {t.stopEverything}
          </button>
        )}
      </div>

      {saved && (
        <div style={{ ...S.muted, textAlign: 'center', color: C.faint, paddingBottom: 12 }}>
          {t.saved}
        </div>
      )}
    </div>
  )
}

function LinkRow({ href, Icon, label, accent, external, last }) {
  return (
    <a href={href}
       target={external ? '_blank' : undefined}
       rel={external ? 'noreferrer' : undefined}
       style={{ ...linkRow, borderBottom: last ? 'none' : `1px solid ${C.ruleSoft}` }}>
      <Icon size={18} color={accent} strokeWidth={1.8} />
      <span style={{ color: C.ink, fontSize: 15 }}>{label}</span>
    </a>
  )
}

function Segment({ value, onChange, options }) {
  return (
    <div style={{ ...segment, gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map((opt) => {
        const active = value === opt.id
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            style={{
              ...segItem,
              background: active ? C.ink : 'transparent',
              color: active ? C.paper : C.muted,
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function Toggle({ on, onChange, accent }) {
  return (
    <button
      onClick={() => onChange(!on)}
      aria-pressed={on}
      style={{
        width: 44, height: 26, borderRadius: 13, border: 'none',
        background: on ? accent : C.rule,
        position: 'relative', cursor: 'pointer',
        transition: 'background 0.15s', flexShrink: 0, padding: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: on ? 21 : 3,
        width: 20, height: 20, borderRadius: '50%',
        background: '#fff', transition: 'left 0.15s',
      }} />
    </button>
  )
}

const pausedBar = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  margin: '12px 14px 0',
  padding: '11px 14px',
  background: '#FFFBEB',
  border: '1px solid #FDE68A',
  borderRadius: 8,
  fontSize: 14,
  color: '#B45309',
}

const linkRow = {
  display: 'flex',
  alignItems: 'center',
  gap: 13,
  padding: '14px 16px',
  textDecoration: 'none',
}

const segment = {
  display: 'grid',
  gap: 2,
  background: C.ruleSoft,
  borderRadius: 7,
  padding: 3,
}

const segItem = {
  padding: '9px 6px',
  border: 'none',
  borderRadius: 5,
  fontSize: 14,
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
  transition: 'background 0.12s',
}