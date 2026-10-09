import { CalendarDays, CalendarCheck, CircleCheck, TriangleAlert } from 'lucide-react'
import { S, C, parseDate } from './styles'
import { useLang } from './i18n'
import { holidayImpact, shiftedDate, weekdayName } from './holidayImpact'

// What one holiday means for this address. Leads with the resident's own
// service, because that is the question they tapped the card to ask; the
// provider-wide change follows as context.
export default function HolidayView({ holiday, pickupDates = [] }) {
  const { t, locale } = useLang()
  if (!holiday) return <div style={S.empty}>{t.loading}</div>

  const { changed, weekday, movedTo } = holidayImpact(holiday, pickupDates)
  const mine = weekdayName(weekday, locale)
  const long = (d) =>
    d && d.toLocaleDateString(locale, {
      weekday: 'long', month: 'long', day: 'numeric',
    })

  const observed = parseDate(holiday.observed_date)
  const shifted = shiftedDate(holiday)

  const headline = changed
    ? holiday.observance === 'skip'
      ? (mine ? t.yourPickupSkipped(mine) : t.yourPickupSkippedPlain)
      : (mine ? t.yourPickupMoves(mine, long(movedTo)) : t.yourPickupMovesPlain(long(movedTo)))
    : (mine ? t.yourPickupUnchanged(mine) : t.yourPickupUnchangedPlain)

  return (
    <div style={{ padding: '4px 0 20px' }}>
      <div style={{ ...S.card, marginTop: 8 }}>
        <div style={{ padding: '15px 16px 16px' }}>
          <div style={S.holidayHeroName}>{holiday.name}</div>
          <div style={S.holidayHeroDate}>
            {observed.toLocaleDateString(locale, {
              weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
            })}
          </div>
        </div>
      </div>

      {/* Their service, stated plainly, before anything about the provider. */}
      <div style={{ ...(changed ? S.alertCard : S.okCard), marginTop: 12 }}>
        <span style={S.alertCardIcon}>
          {changed
            ? <TriangleAlert size={20} color={C.holidayInk} strokeWidth={2} />
            : <CircleCheck size={20} color="#15803D" strokeWidth={2} />}
        </span>
        <span style={{ ...S.alertCardText, color: changed ? C.holidayInk : '#166534' }}>
          {headline}
        </span>
      </div>

      <div style={S.groupHead}>{t.holidayWhatChanges}</div>
      <div style={S.card}>
        <div style={{ ...S.setRow, gap: 13 }}>
          <CalendarDays size={19} color={C.muted} strokeWidth={1.9} />
          <span style={{ ...S.settingName, flex: 1 }}>{t.holidayOriginal}</span>
          <span style={S.valueRight}>
            {observed.toLocaleDateString(locale, { month: 'short', day: 'numeric' })}
          </span>
        </div>
        {shifted && (
          <div style={{ ...S.setRow, gap: 13 }}>
            <CalendarCheck size={19} color={C.muted} strokeWidth={1.9} />
            <span style={{ ...S.settingName, flex: 1 }}>{t.holidayReplacement}</span>
            <span style={S.valueRight}>
              {shifted.toLocaleDateString(locale, { month: 'short', day: 'numeric' })}
            </span>
          </div>
        )}
        <div style={{ ...S.setRowLast, gap: 13, alignItems: 'flex-start' }}>
          <span style={{ ...S.settingHint, flex: 1, marginTop: 0 }}>
            {holiday.note || providerLine(holiday, shifted, locale, t)}
          </span>
        </div>
      </div>
    </div>
  )
}

// Only ever says what the stored rule entails: which day's routes move, and
// where to. Anything more specific would be invented.
function providerLine(holiday, shifted, locale, t) {
  const from = parseDate(holiday.observed_date).toLocaleDateString(locale, { weekday: 'long' })
  if (holiday.observance === 'normal') return t.obsNormal
  if (holiday.observance === 'skip') return t.routesSkipped(from)
  if (!shifted) return t.obsShiftDay
  return t.routesMove(
    from,
    shifted.toLocaleDateString(locale, { weekday: 'long' }),
    shifted.toLocaleDateString(locale, { month: 'long', day: 'numeric' }),
  )
}
