import { Clock, Bell, ChevronRight } from 'lucide-react'
import { S, C, catColor, parseDate, formatDate, daysUntil } from './styles'
import ServiceIcon from './ServiceIcon'
import { useLang, CATEGORY_LABELS } from './i18n'

// One day of collections.
//   variant 'block' (Home)     — coloured date block on the left
//   variant 'list'  (Calendar) — uppercase date heading, chevrons on each service
export default function DayCard({
  group, setoutTime, reminder, onReminder, onGuidelines, lead, variant = 'block',
}) {
  const { t, lang, locale } = useLang()
  const labels = CATEGORY_LABELS[lang]
  const name = (c) => labels[c.service_category] || c.service_name

  const d = parseDate(group.date)
  const near = daysUntil(group.date) <= 1
  const list = variant === 'list'

  const heading = list
    ? d
        .toLocaleDateString(locale, { weekday: 'long', month: 'short', day: 'numeric' })
        .toUpperCase()
    : formatDate(group.date, locale)

  const ORDER = { trash: 0, recycling: 1, bulk: 2, yard_waste: 3 }
  const ordered = [...group.items].sort(
    (a, b) => (ORDER[a.service_category] ?? 9) - (ORDER[b.service_category] ?? 9),
  )

  const services = ordered.map((c) => {
    const cc = catColor(c.service_category)
    const Row = list && onGuidelines ? 'button' : 'div'
    return (
      <Row
        key={c.service_category}
        onClick={list && onGuidelines ? onGuidelines : undefined}
        style={
          list && onGuidelines
            ? { ...S.svcRow, width: '100%', font: 'inherit', textAlign: 'left' }
            : S.svcRow
        }
      >
        <span style={{ ...S.svcIconTile, background: cc.tint }}>
          <ServiceIcon
            category={c.service_category}
            iconName={c.icon_name}
            size={17}
            color={cc.solid}
          />
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ ...S.svcName, display: 'block' }}>{name(c)}</span>
          {c.schedule_changed && (
            <span style={{ ...S.changed, display: 'block' }}>{c.change_reason}</span>
          )}
        </span>
        {list && <ChevronRight size={18} color={C.faint} />}
      </Row>
    )
  })

  // The count pill is a hero-card affordance only. On Coming-up cards the
  // mockup shows just the date and a chevron, and the services are listed
  // right below anyway — adding the pill there forces the date to wrap.
  const pills =
    (lead || list) && group.items.length > 1 ? (
      <span style={S.pill}>{t.collections(group.items.length)}</span>
    ) : null

  const setout = setoutTime && (
    <div style={S.setoutRow}>
      <Clock size={13} strokeWidth={2} />
      {t.setOutBy(setoutTime)}
    </div>
  )

  const strip = lead && onReminder && (
    <button onClick={onReminder} style={S.reminderStrip}>
      <Bell size={16} color="#1D4ED8" strokeWidth={2} />
      <span style={S.reminderText}>{reminder || t.manageReminders}</span>
      <ChevronRight size={16} color="#1D4ED8" />
    </button>
  )

  if (list) {
    return (
      <div style={S.dayCard}>
        <div style={{ padding: '13px 14px 14px' }}>
          <div style={{ ...S.dayHeadRow, marginBottom: 2 }}>
            <span style={S.listHead}>{heading}</span>
            <span style={{ display: 'flex', gap: 6 }}>{pills}</span>
          </div>
          {services}
          {setout}
        </div>
        {strip}
      </div>
    )
  }

  return (
    <div style={S.dayCard}>
      <div style={S.dayCardTop}>
        <div
          style={{ ...S.dateBlock, background: lead ? C.tint : C.tintSoft }}
        >
          <div style={lead ? S.dateBlockDow : { ...S.dateBlockDow, ...S.dateBlockDowSm }}>
            {d.toLocaleDateString(locale, { weekday: 'short' }).toUpperCase()}
          </div>
          <div style={lead ? S.dateBlockNum : { ...S.dateBlockNum, ...S.dateBlockNumSm }}>
            {String(d.getDate()).padStart(2, '0')}
          </div>
          <div style={lead ? S.dateBlockMon : { ...S.dateBlockMon, ...S.dateBlockMonSm }}>
            {d.toLocaleDateString(locale, { month: 'short' }).toUpperCase()} {d.getFullYear()}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {(() => {
            const row = (
              <div style={S.dayHeadRow}>
                <span style={S.dayHeadDate}>{heading}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {pills}
                  {!lead && <ChevronRight size={16} color={C.faint} />}
                </span>
              </div>
            )
            return !lead && onGuidelines ? (
              <button onClick={onGuidelines} style={S.rowBtn}>{row}</button>
            ) : row
          })()}
          {services}
          {setout}
        </div>
      </div>
      {strip}
    </div>
  )
}
