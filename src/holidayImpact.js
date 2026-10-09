import { parseDate } from './styles'

// What a provider-wide holiday rule actually means for one address.
//
// The rule is stored per organization — "pickups shift a day" — but it only
// bites on the routes collected that day. A Tuesday address reading "pickup
// moved to the following day" about a Thursday holiday is being told something
// untrue about its own service, which is the whole point of working this out
// per address rather than showing the org's rule verbatim.

const DAY_MS = 86400000

export function shiftedDate(holiday) {
  if (holiday.moved_to) return parseDate(holiday.moved_to)
  if (holiday.observance === 'shift_day' || holiday.observance === 'shift_week') {
    return new Date(parseDate(holiday.observed_date).getTime() + DAY_MS)
  }
  return null
}

// `pickupDates` are the resident's own collection dates (ISO) for the window
// in view. Returns { changed, weekday, movedTo } — weekday is their usual
// collection day when they have exactly one, so the copy can name it.
export function holidayImpact(holiday, pickupDates) {
  const observed = holiday.observed_date
  const changed =
    holiday.observance !== 'normal' && pickupDates.includes(observed)

  const weekdays = new Set(pickupDates.map((d) => parseDate(d).getDay()))
  const weekday = weekdays.size === 1 ? [...weekdays][0] : null

  return { changed, weekday, movedTo: changed ? shiftedDate(holiday) : null }
}

export function weekdayName(dayIndex, locale) {
  if (dayIndex === null || dayIndex === undefined) return null
  // Any Sunday works as an anchor; only the weekday name is read off it.
  const d = new Date(2024, 0, 7 + dayIndex)
  return d.toLocaleDateString(locale, { weekday: 'long' })
}
