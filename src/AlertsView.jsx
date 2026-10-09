import { CalendarClock, CloudRain, Wrench, Info } from 'lucide-react'
import { S, C } from './styles'
import { useLang } from './i18n'

const CATS = {
  holiday:     { Icon: CalendarClock, color: '#A16207', tint: '#FEFCE8', key: 'catHoliday' },
  weather:     { Icon: CloudRain,     color: '#0369A1', tint: '#EFF6FF', key: 'catWeather' },
  maintenance: { Icon: Wrench,        color: '#475569', tint: '#F1F5F9', key: 'catMaintenance' },
  notice:      { Icon: Info,          color: '#475569', tint: '#F1F5F9', key: 'catNotice' },
}

// A notice either reached this address because it was aimed at it, or because
// it went to everyone. Saying which stops a provider-wide note about Thursday
// routes reading as though it concerns a Tuesday address.
function reach(a) {
  return a.is_targeted
    ? { key: 'affectsYourPickup', fg: '#0C4A8A', bg: '#E0F0FE', bd: '#BAE0FD' }
    : { key: 'providerWide', fg: C.muted, bg: C.ruleSoft, bd: C.rule }
}

// Only notices with an end date carry a status; an open-ended one is just
// standing guidance and a badge would be noise.
function status(a) {
  if (!a.ends_at) return null
  return new Date(a.ends_at) > new Date()
    ? { key: 'statusActive', fg: '#166534', bg: '#F0FDF4', bd: '#BBF7D0' }
    : { key: 'statusResolved', fg: C.faint, bg: C.ruleSoft, bd: C.rule }
}

export default function AlertsView({ alerts, loading, unreadIds }) {
  const { t, lang, locale } = useLang()

  if (loading) return <div style={S.empty}>{t.loading}</div>
  if (!alerts || alerts.length === 0) {
    return <div style={S.empty}>{t.noAlertsYet}</div>
  }

  return (
    // The rows are full-bleed white, so they start below the sheet's 22px
    // corner radius — otherwise they square off its rounded top.
    <div style={{ paddingTop: 24 }}>
      {alerts.map((a) => {
        const cat = CATS[a.category] || CATS.notice
        const title = lang === 'es' && a.title_es ? a.title_es : a.title
        const body = lang === 'es' && a.body_es ? a.body_es : a.body
        const isUnread = unreadIds?.has(a.id)
        const r = reach(a)
        const st = status(a)
        const done = st?.key === 'statusResolved'

        return (
          <article key={a.id} style={row}>
            <div style={{ ...badge, background: cat.tint, position: 'relative', opacity: done ? 0.55 : 1 }}>
              <cat.Icon size={18} color={cat.color} strokeWidth={1.9} />
              {isUnread && <span style={unreadDot} />}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={meta}>
                <span style={{ color: cat.color, fontWeight: 600 }}>{t[cat.key]}</span>
                <span style={{ color: C.faint }}>{when(a.starts_at, locale)}</span>
              </div>

              <div style={chipRow}>
                <span style={{ ...chip, color: r.fg, background: r.bg, borderColor: r.bd }}>
                  {t[r.key]}
                </span>
                {st && (
                  <span style={{ ...chip, color: st.fg, background: st.bg, borderColor: st.bd }}>
                    {t[st.key]}
                  </span>
                )}
              </div>

              <h3 style={{ ...heading, fontWeight: isUnread ? 700 : 600, opacity: done ? 0.7 : 1 }}>
                {title}
              </h3>
              <p style={{ ...text, opacity: done ? 0.7 : 1 }}>{body}</p>
            </div>
          </article>
        )
      })}
    </div>
  )
}

function when(iso, locale) {
  const d = new Date(iso)
  const days = Math.round((Date.now() - d) / 86400000)
  if (days === 0) return d.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' })
  return d.toLocaleDateString(locale, { month: 'short', day: 'numeric' })
}

const row = {
  display: 'grid',
  gridTemplateColumns: '36px 1fr',
  gap: 14,
  padding: '16px 20px',
  background: C.paper,
  borderTop: `1px solid ${C.ruleSoft}`,
  alignItems: 'start',
}

const badge = {
  width: 36,
  height: 36,
  borderRadius: 8,
  display: 'grid',
  placeItems: 'center',
}

const unreadDot = {
  position: 'absolute',
  top: -3,
  right: -3,
  width: 10,
  height: 10,
  borderRadius: '50%',
  background: '#0EA5E9',
  border: '2px solid #fff',
}

const meta = {
  display: 'flex',
  gap: 10,
  fontSize: 12,
  marginBottom: 6,
}

const chipRow = { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 7 }

const chip = {
  fontSize: 11.5,
  fontWeight: 700,
  letterSpacing: '-0.005em',
  padding: '3px 9px',
  borderRadius: 999,
  border: '1px solid transparent',
  whiteSpace: 'nowrap',
}

const heading = {
  fontSize: 16,
  fontWeight: 600,
  color: C.ink,
  margin: 0,
  letterSpacing: '-0.01em',
  lineHeight: 1.35,
}

const text = {
  fontSize: 14,
  color: C.body,
  lineHeight: 1.55,
  margin: '5px 0 0',
}
