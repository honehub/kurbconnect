import { useState, useEffect } from 'react'
import {
  Trash2, Phone, Mail, Globe, ExternalLink, Clock, Bell, BellOff, Smartphone,
  CalendarDays, Building2, FileText, ShieldCheck, ChevronRight,
} from 'lucide-react'
import {
  loadPreferences, savePreferences, getDeviceToken, deactivateDevice,
  isNativeApp, getNotificationPermission, requestNotificationPermission, openAppSettings,
} from './push'
import { S, C, catColor } from './styles'
import ServiceIcon from './ServiceIcon'
import { useLang } from './i18n'

// Injected from package.json at build time; see vite.config.js
const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev'
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

// One component, two screens: 'reminders' holds everything that needs a push
// token, 'general' the rest. They share all the preference state.
export default function SettingsView({ accent, org, section = 'reminders' }) {
  const { t, lang, locale, setLang } = useLang()
  const [prefs, setPrefs] = useState(null)
  const [saved, setSaved] = useState(false)
  const [confirmStop, setConfirmStop] = useState(false)
  const [stopped, setStopped] = useState(false)
  const [perm, setPerm] = useState(null)
  const hasDevice = !!getDeviceToken()
  const native = isNativeApp()

  useEffect(() => {
    getNotificationPermission().then(setPerm)
  }, [])

  async function askForNotifications() {
    setPerm(await requestNotificationPermission())
  }

  // Everything below depends on a push token. On the web there isn't one, so
  // the controls would accept input and silently fail to save.
  const reminders = section === 'reminders'
  const pushOff = !native
  const dim = pushOff
    ? { opacity: 0.45, pointerEvents: 'none', filter: 'saturate(0.4)' }
    : null

  const CATEGORIES = [
    { id: 'trash', label: t.trash },
    { id: 'recycling', label: t.recycling },
    { id: 'bulk', label: t.bulk },
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
    <div>
      {reminders && pushOff && (
        <div style={S.infoCard}>
          <span style={S.infoIcon}>
            <Smartphone size={20} color={C.brand} strokeWidth={2} />
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ ...S.infoTitle, display: 'block' }}>{t.openOnPhoneTitle}</span>
            <span style={{ ...S.infoBody, display: 'block' }}>{t.openOnPhone}</span>
          </span>
        </div>
      )}

      {reminders && native && perm && perm !== 'granted' && (
        <div style={{ ...S.warnCard, margin: '12px 14px 0' }}>
          <BellOff size={19} color={C.holidayInk} strokeWidth={2.2} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>
            <span style={{ ...S.warnTitle, display: 'block' }}>{t.notifsOffTitle}</span>
            <span style={{ ...S.warnBody, display: 'block' }}>
              {perm === 'denied' ? t.notifsBlockedBody : t.notifsOffBody}
            </span>
            {(
              <button
                onClick={perm === 'denied' ? openAppSettings : askForNotifications}
                style={{
                  marginTop: 9, padding: '9px 14px', borderRadius: 10, border: 'none',
                  background: C.brand, color: '#FFFFFF', fontFamily: 'inherit',
                  fontSize: 14, fontWeight: 700, cursor: 'pointer',
                }}
              >
                {perm === 'denied' ? t.openSettings : t.turnOnNotifs}
              </button>
            )}
          </span>
        </div>
      )}

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

      {reminders && (
      <div style={dim} aria-disabled={pushOff || undefined}>
      <div style={S.groupHead}>{t.pickupReminders}</div>
      <div style={S.card}>
        <div style={{ ...(prefs.reminders_enabled ? S.setRow : S.setRowLast), gap: 16 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
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
            <div style={{ padding: '13px 15px 14px' }}>
              <div style={{ ...S.label, fontSize: 15.5, fontWeight: 700, color: C.ink }}>
                {t.when}
              </div>
              <Segment
                value={prefs.reminder_timing}
                onChange={(v) => update({ reminder_timing: v })}
                options={[
                  { id: 'night_before', label: t.nightBefore },
                  { id: 'day_of', label: t.morningOf },
                  { id: 'both', label: t.bothTimes },
                ]}
              />
            </div>

            {showEvening && (
              <TimeRow
                Icon={Clock}
                label={t.eveningBefore}
                value={toVal(prefs.reminder_hour, prefs.reminder_minute)}
                options={EVENING}
                locale={locale}
                last={!showMorning}
                onChange={(v) => {
                  const { h, m } = toHM(v)
                  update({ reminder_hour: h, reminder_minute: m })
                }}
              />
            )}

            {showMorning && (
              <TimeRow
                Icon={Clock}
                label={t.morningOfLabel}
                value={toVal(prefs.morning_hour, prefs.morning_minute)}
                options={MORNING}
                locale={locale}
                last
                onChange={(v) => {
                  const { h, m } = toHM(v)
                  update({ morning_hour: h, morning_minute: m })
                }}
              />
            )}
          </>
        )}
      </div>

      {/* ── Remind me about ──────────────────────────── */}
      {prefs.reminders_enabled && (
        <>
          <div style={S.groupHead}>{t.remindMeAbout}</div>
          <div style={S.card}>
            {CATEGORIES.map(({ id, label }, i) => {
              const cc = catColor(id === 'bulk' ? 'bulk' : id)
              return (
                <div
                  key={id}
                  style={{
                    ...(i === CATEGORIES.length - 1 ? S.setRowLast : S.setRow),
                    gap: 13,
                  }}
                >
                  <span style={{ ...S.iconTile, background: cc.tint }}>
                    <ServiceIcon category={id} size={19} color={cc.solid} />
                  </span>
                  <span style={{ ...S.settingName, flex: 1 }}>{label}</span>
                  <Toggle
                    on={prefs.enabled_categories.includes(id)}
                    accent={accent}
                    onChange={() => toggleCategory(id)}
                  />
                </div>
              )
            })}
          </div>
        </>
      )}

      </div>
      )}

      {/* ── Service alerts (reminders screen) ─────────── */}
      {reminders && (
      <div style={dim} aria-disabled={pushOff || undefined}>
      <div style={S.groupHead}>{t.serviceAlerts}</div>
      <div style={S.card}>
        <div style={{ ...S.setRowLast, gap: 13 }}>
          <span style={{ ...S.iconTile, background: '#EFF6FF' }}>
            <Bell size={19} color={C.brand} strokeWidth={2} />
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
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

      </div>
      )}

      {/* ── Pause (reminders screen) ─────────────────── */}
      {reminders && (
      <div style={dim} aria-disabled={pushOff || undefined}>
      <div style={S.groupHead}>{t.pauseReminders}</div>
      <div style={S.card}>
        <div style={{ ...S.setRow, gap: 13, alignItems: 'flex-start' }}>
          <span style={{ ...S.iconTile, background: C.ruleSoft }}>
            <BellOff size={19} color={C.muted} strokeWidth={2} />
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={S.settingName}>{t.pauseReminders}</div>
            <div style={S.settingHint}>{t.pauseHint}</div>
          </div>
        </div>
        <label style={{ ...S.setRowLast, gap: 13, cursor: 'pointer' }}>
          <CalendarDays size={19} color={C.muted} strokeWidth={1.9} />
          <span style={{ ...S.settingName, flex: 1, whiteSpace: 'nowrap' }}>
            {t.chooseDate}
          </span>
          <input
            type="date"
            value={prefs.paused_until || ''}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => update({ paused_until: e.target.value || null })}
            style={bareInput}
          />
          <ChevronRight size={18} color={C.faint} />
        </label>
      </div>

      </div>
      )}

      {/* ── Language ─────────────────────────────────── */}
      {!reminders && (<>
      <div style={S.groupHead}>{t.language}</div>
      <div style={S.card}>
        <div style={{ ...S.setRowLast, gap: 13 }}>
          <Globe size={20} color={C.muted} strokeWidth={1.9} />
          <div style={{ flex: 1, minWidth: 0 }}>
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
      </div>

      {/* ── Provider ─────────────────────────────────── */}
      {org && (org.organization_name || org.phone || org.email || org.website) && (
        <>
          <div style={S.groupHead}>{t.provider}</div>
          <div style={S.card}>
            {org.organization_name && (
              <div style={{ ...S.setRow, gap: 13 }}>
                <Building2 size={19} color={C.muted} strokeWidth={1.9} />
                <span style={{ ...S.settingName, flex: 1 }}>{org.organization_name}</span>
              </div>
            )}
            {org.phone && (
              <LinkRow href={`tel:${org.phone}`} Icon={Phone} label={org.phone} accent={accent} />
            )}
            {org.email && (
              <LinkRow href={`mailto:${org.email}`} Icon={Mail} label={org.email} accent={accent} last={!org.website} />
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
        <div style={{ ...S.setRow, gap: 13 }}>
          <FileText size={19} color={C.muted} strokeWidth={1.9} />
          <span style={{ ...S.settingName, flex: 1 }}>{t.version}</span>
          <span style={S.valueRight}>{APP_VERSION}</span>
        </div>
        <LinkRow
          href={PRIVACY_URL}
          Icon={ShieldCheck}
          label={t.privacyPolicy}
          accent={accent}
          external
          last
        />
      </div>

      </>)}

      {/* ── Stop (general screen) ────────────────────── */}
      {!reminders && (confirmStop ? (
        <div style={{ padding: '20px 14px 10px' }}>
          <div style={{ ...S.notice, margin: '0 0 12px' }}>{t.stopConfirm}</div>
          <button
            onClick={stopEverything}
            style={{ ...S.button, background: '#B91C1C', marginTop: 0 }}
          >
            {t.stopConfirmAction}
          </button>
          <button onClick={() => setConfirmStop(false)} style={S.buttonQuiet}>
            {t.keepGoing}
          </button>
        </div>
      ) : (
        <button onClick={() => setConfirmStop(true)} style={S.dangerCard}>
          <Trash2 size={20} color="#DC2626" strokeWidth={2} />
          <span style={S.dangerText}>{t.stopEverything}</span>
          <ChevronRight size={18} color="#DC2626" />
        </button>
      ))}

      {saved && (
        <div style={{ ...S.muted, textAlign: 'center', color: C.faint, padding: '14px 0 4px' }}>
          {t.saved}
        </div>
      )}
    </div>
  )
}

function TimeRow({ Icon, label, value, options, locale, onChange, last }) {
  return (
    <label style={{ ...(last ? S.setRowLast : S.setRow), gap: 13, cursor: 'pointer' }}>
      <Icon size={19} color={C.muted} strokeWidth={1.9} />
      <span style={{ ...S.settingName, flex: 1 }}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={bareInput}
      >
        {options.map((v) => (
          <option key={v} value={v}>{timeLabel(v, locale)}</option>
        ))}
      </select>
      <ChevronRight size={18} color={C.faint} />
    </label>
  )
}

function LinkRow({ href, Icon, label, accent, external, last }) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      style={{ ...(last ? S.setRowLast : S.setRow), gap: 13 }}
    >
      <Icon size={19} color={accent} strokeWidth={1.9} />
      <span style={{ ...S.settingName, flex: 1 }}>{label}</span>
      {external ? (
        <ExternalLink size={17} color={C.faint} />
      ) : (
        <ChevronRight size={18} color={C.faint} />
      )}
    </a>
  )
}

function Segment({ value, onChange, options }) {
  return (
    <div style={{ ...S.segTrack, gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map((opt) => {
        const active = value === opt.id
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            style={{ ...S.segBtn, ...(active ? S.segBtnOn : null) }}
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
        width: 50, height: 30, borderRadius: 15, border: 'none',
        background: on ? accent : C.rule,
        position: 'relative', cursor: 'pointer',
        transition: 'background 0.15s', flexShrink: 0, padding: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: on ? 23 : 3,
        width: 24, height: 24, borderRadius: '50%',
        background: '#fff', transition: 'left 0.15s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  )
}

const bareInput = {
  appearance: 'none',
  WebkitAppearance: 'none',
  border: 'none',
  background: 'none',
  font: 'inherit',
  fontSize: 15,
  color: C.muted,
  textAlign: 'right',
  padding: 0,
  cursor: 'pointer',
  maxWidth: 128,
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
  borderRadius: 10,
  fontSize: 14,
  color: '#B45309',
}
