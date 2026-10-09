import { Clock, Bell, ChevronRight } from 'lucide-react'
import { S, C, catColor, parseDate, formatDate, daysUntil } from './styles'
import ServiceIcon from './ServiceIcon'
import { useLang, CATEGORY_LABELS } from './i18n'

const ORDER = { trash: 0, recycling: 1, bulk: 2, yard_waste: 3 }

// One day of collections.
//   lead                       — the hero card on Home: relative label, big date
//   variant 'block' (Home)     — coloured date block on the left
//   variant 'list'  (Calendar) — uppercase date heading, chevrons on each service
export default function DayCard({
  group, setoutTime, reminder, onReminder, onGuidelines, lead, variant = 'block',
}) {
  const { t, lang, locale } = useLang()
  const labels = CATEGORY_LABELS[lang]
  const name = (c) => labels[c.service_category] || c.service_name

  const d = parseDate(group.date)
  const list = variant === 'list'

  const ordered = [...group.items].sort(
    (a, b) => (ORDER[a.service_category] ?? 9) - (ORDER[b.service_category] ?? 9),
  )

  // ── Hero card ────────────────────────────────────────────────────────────
  // The next pickup is the reason people open the app, so it leads with how
  // soon it is rather than making them work that out from the date.
  if (lead) {
    const away = daysUntil(group.date)
    const relative = away <= 0 ? t.today : away === 1 ? t.tomorrow : t.inDays(away)

    return (
      <div style={S.heroCard}>
        <div style={S.heroBody}>
          <span style={S.heroPill}>{relative}</span>
          <div style={S.heroDate}>{formatDate(group.date, locale)}</div>

          {ordered.map((c) => {
            const cc = catColor(c.service_category)
            return (
              <div key={c.service_category} style={S.heroSvcRow}>
                <span style={{ ...S.svcIconTile, background: cc.tint, width: 26, height: 26 }}>
                  <ServiceIcon
                    category={c.service_category}
                    iconName={c.icon_name}
                    size={19}
                    color={cc.solid}
                  />
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ ...S.heroSvcName, display: 'block' }}>{name(c)}</span>
                  {c.schedule_changed && (
                    <span style={{ ...S.changed, display: 'block' }}>{c.change_reason}</span>
                  )}
                </span>
              </div>
            )
          })}

          {setoutTime && (
            <div style={S.heroSetout}>
              <Clock size={15} strokeWidth={2} />
              {t.setOutBy(setoutTime)}
            </div>
          )}
        </div>

        {onReminder && (
          <button onClick={onReminder} style={S.heroStrip}>
            <Bell size={17} color={C.brand} strokeWidth={2} />
            <span style={S.reminderText}>{reminder || t.manageReminders}</span>
            <ChevronRight size={17} color={C.brand} />
          </button>
        )}
      </div>
    )
  }

  // ── Calendar and Coming-up cards ─────────────────────────────────────────
  const heading = list
    ? d
        .toLocaleDateString(locale, { weekday: 'long', month: 'short', day: 'numeric' })
        .toUpperCase()
    : formatDate(group.date, locale)

  const services = ordered.map((c) => {
    const cc = catColor(c.service_category)
    const tappable = list && onGuidelines
    const Row = tappable ? 'button' : 'div'
    return (
      <Row
        key={c.service_category}
        onClick={tappable ? () => onGuidelines(c.service_category) : undefined}
        style={
          tappable
            ? { ...S.svcRow, width: '100%', font: 'inherit', textAlign: 'left' }
            : S.svcRowPlain
        }
      >
        <span
          style={
            tappable
              ? { ...S.svcIconTile, background: cc.tint }
              : { ...S.svcIconTile, background: 'none', width: 24, height: 24 }
          }
        >
          <ServiceIcon
            category={c.service_category}
            iconName={c.icon_name}
            size={tappable ? 17 : 19}
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

  const pills =
    list && group.items.length > 1 ? (
      <span style={S.pill}>{t.collections(group.items.length)}</span>
    ) : null

  const setout = setoutTime && (
    <div style={S.setoutRow}>
      <Clock size={13} strokeWidth={2} />
      {t.setOutBy(setoutTime)}
    </div>
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
      </div>
    )
  }

  return (
    <div style={S.dayCard}>
      <div style={S.dayCardTop}>
        <div style={{ ...S.dateBlock, background: C.tintSoft }}>
          <div style={{ ...S.dateBlockDow, ...S.dateBlockDowSm }}>
            {d.toLocaleDateString(locale, { weekday: 'short' }).toUpperCase()}
          </div>
          <div style={{ ...S.dateBlockNum, ...S.dateBlockNumSm }}>
            {String(d.getDate()).padStart(2, '0')}
          </div>
          {/* Month alone: the year is noise on a list that never leaves this one. */}
          <div style={{ ...S.dateBlockMon, ...S.dateBlockMonSm }}>
            {d.toLocaleDateString(locale, { month: 'short' }).toUpperCase()}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {onGuidelines ? (
            <button onClick={() => onGuidelines()} style={S.rowBtn}>
              <div style={S.dayHeadRow}>
                <span style={S.dayHeadDate}>{heading}</span>
                <ChevronRight size={16} color={C.faint} />
              </div>
            </button>
          ) : (
            <div style={S.dayHeadRow}>
              <span style={S.dayHeadDate}>{heading}</span>
            </div>
          )}
          {services}
          {setout}
        </div>
      </div>
    </div>
  )
}
