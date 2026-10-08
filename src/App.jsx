import { useState, useEffect } from 'react'
import {
  geocodeAddress,
  reverseGeocode,
  getSchedule,
  getAnnouncements,
  findOrganization,
  getProviderInfo,
  logLookup,
} from './supabase'
import { registerForPush, loadPreferences } from './push'
import BottomNav from './BottomNav'
import ScheduleView from './ScheduleView'
import CalendarView from './CalendarView'
import SettingsView from './SettingsView'
import AlertsView from './AlertsView'
import ReportView from './ReportView'
import MoreView from './MoreView'
import GuidelinesView from './GuidelinesView'
import ProviderHeader from './ProviderHeader'
import { S, C, parseDate } from './styles'
import { useLang } from './i18n'

// '07:00:00' -> '7:00 AM'
function clockLabel(time, locale) {
  if (!time) return null
  const [h, m] = String(time).split(':').map(Number)
  const d = new Date(2000, 0, 1, h, m || 0)
  return d.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' })
}

export default function App() {
  const { t, locale } = useLang()
  const [tab, setTab] = useState('home')
  // A pushed sub-screen: 'settings' | 'guidelines' | 'report'. null = the tab itself.
  const [sub, setSub] = useState(null)
  const [address, setAddress] = useState(() => localStorage.getItem('address') || '')
  const [collections, setCollections] = useState(null)
  const [status, setStatus] = useState(null)
  const [busy, setBusy] = useState(false)
  const [org, setOrg] = useState(null)
  const [provider, setProvider] = useState(null)
  const [prefs, setPrefs] = useState(null)
  const [showMap, setShowMap] = useState(false)
  const [editing, setEditing] = useState(false)
  const [coords, setCoords] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [alertsLoading, setAlertsLoading] = useState(false)
  const [unreadIds, setUnreadIds] = useState(new Set())
  const [seenAlerts, setSeenAlerts] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('seenAlerts') || '[]'))
    } catch {
      return new Set()
    }
  })
  const [pinned, setPinned] = useState(() => {
    const saved = localStorage.getItem('pinned')
    return saved ? JSON.parse(saved) : null
  })

  const accent = '#0078FE'

  useEffect(() => {
    if (pinned) {
      setBusy(true)
      loadSchedule(pinned.lat, pinned.lng).finally(() => setBusy(false))
    } else if (address) {
      lookup()
    }
  }, [])

  useEffect(() => {
    if (tab !== 'messages' || alerts.length === 0) return
    const fresh = alerts.filter((a) => !seenAlerts.has(a.id)).map((a) => a.id)
    if (fresh.length) setUnreadIds(new Set(fresh))
    const ids = new Set([...seenAlerts, ...alerts.map((a) => a.id)])
    setSeenAlerts(ids)
    localStorage.setItem('seenAlerts', JSON.stringify([...ids]))
  }, [tab, alerts])

  useEffect(() => {
    if (tab !== 'messages' && unreadIds.size) setUnreadIds(new Set())
  }, [tab])

  function changeTab(next) {
    setSub(null)
    setTab(next)
  }

  function changeAddress() {
    setTab('home')
    setSub(null)
    setEditing(true)
  }

  async function lookup() {
    setBusy(true)
    setStatus(null)
    setShowMap(false)
    const typed = address
    try {
      const place = await geocodeAddress(typed)
      if (!place) {
        logLookup({ raw: typed, geocoded: false, inArea: false })
        setStatus(t.notFound)
        setShowMap(true)
        return
      }
      const ok = await loadSchedule(place.lat, place.lng)
      logLookup({
        raw: typed, geocoded: true, inArea: ok,
        lat: place.lat, lng: place.lng,
      })
      if (ok) {
        localStorage.setItem('address', typed)
        localStorage.removeItem('pinned')
        setPinned(null)
        setEditing(false)
      }
    } catch (e) {
      setStatus(e.message)
    } finally {
      setBusy(false)
    }
  }

  async function useSuggestion(s) {
    setBusy(true)
    setStatus(null)
    setShowMap(false)
    try {
      const ok = await loadSchedule(s.lat, s.lng)
      logLookup({
        raw: s.label, geocoded: true, inArea: ok,
        lat: s.lat, lng: s.lng, source: 'address',
      })
      if (ok) {
        setAddress(s.label)
        localStorage.setItem('address', s.label)
        localStorage.removeItem('pinned')
        setPinned(null)
        setEditing(false)
      }
    } catch (e) {
      setStatus(e.message)
    } finally {
      setBusy(false)
    }
  }

  async function usePin(pos) {
    setBusy(true)
    setStatus(null)
    try {
      const found = await loadSchedule(pos.lat, pos.lng)
      logLookup({
        raw: address, geocoded: true, inArea: found,
        lat: pos.lat, lng: pos.lng, source: 'pin',
      })
      if (found) {
        setShowMap(false)
        setEditing(false)
        setPinned({ lat: pos.lat, lng: pos.lng })
        localStorage.setItem('pinned', JSON.stringify({ lat: pos.lat, lng: pos.lng }))
        const label =
          (await reverseGeocode(pos.lat, pos.lng)) ||
          `${t.pinnedLocation} (${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)})`
        setAddress(label)
        localStorage.setItem('address', label)
      }
    } catch (e) {
      setStatus(e.message)
    } finally {
      setBusy(false)
    }
  }

  async function loadSchedule(lat, lng) {
    // Who serves this point? Nothing is assumed until this resolves.
    const found = await findOrganization(lat, lng)
    if (!found) {
      setStatus(t.outsideArea)
      setCollections(null)
      setOrg(null)
      setProvider(null)
      setAlerts([])
      setCoords(null)
      return false
    }
    setOrg(found)

    const data = await getSchedule(lat, lng, 60)
    if (!data || data.length === 0) {
      setStatus(t.noScheduleYet)
      setCollections(null)
      return false
    }

    setCollections(data)
    setStatus(null)
    setCoords({ lat, lng })
    registerForPush(lat, lng).catch(() => {})

    // Set-out time, branding and contact details for this route.
    getProviderInfo(found.organization_id, lat, lng)
      .then(setProvider)
      .catch(() => {})

    // Reminder state. Returns null on web, where there is no push token.
    loadPreferences().then(setPrefs).catch(() => {})

    setAlertsLoading(true)
    getAnnouncements(lat, lng)
      .then(setAlerts)
      .catch(() => {})
      .finally(() => setAlertsLoading(false))

    return true
  }

  const unread = alerts.filter((a) => !seenAlerts.has(a.id)).length
  const setoutTime = clockLabel(provider?.setout_time, locale)

  // "Sunday reminder • 7:00 PM" for the next pickup, when reminders are on.
  let reminder = null
  if (prefs?.reminders_enabled && collections?.length) {
    const firstDate = collections
      .map((c) => c.pickup_date)
      .sort((a, b) => a.localeCompare(b))[0]
    const morning = prefs.reminder_timing === 'day_of'
    const when = parseDate(firstDate)
    if (!morning) when.setDate(when.getDate() - 1)
    const time = clockLabel(
      morning
        ? `${prefs.morning_hour ?? 6}:${String(prefs.morning_minute ?? 0).padStart(2, '0')}`
        : `${prefs.reminder_hour ?? 19}:${String(prefs.reminder_minute ?? 0).padStart(2, '0')}`,
      locale,
    )
    reminder = t.reminderAt(when.toLocaleDateString(locale, { weekday: 'long' }), time)
  }

  const TITLES = {
    home: t.yourNextPickup,
    calendar: t.navCalendar,
    messages: t.navMessages,
    more: t.navMore,
  }
  const SUB_TITLES = {
    settings: t.settingsTitle,
    guidelines: t.guidelinesTitle,
    report: t.reportIssueTitle,
  }

  return (
    <div style={S.page} data-page>
      <div style={S.shell}>
        <ProviderHeader
          org={org}
          address={!sub && !editing ? address : null}
          onChangeAddress={changeAddress}
          title={sub ? SUB_TITLES[sub] : TITLES[tab]}
          onBack={sub ? () => setSub(null) : null}
          backLabel={tab === 'more' ? t.navMore : t.navHome}
        />

        <div style={S.contentSheet}>
        {sub === 'settings' && <SettingsView accent={accent} org={org} />}
        {sub === 'guidelines' && <GuidelinesView org={org} />}
        {sub === 'report' && (
          <ReportView coords={coords} address={address} accent={accent} />
        )}

        {!sub && tab === 'home' && (
          <ScheduleView
            address={address}
            setAddress={setAddress}
            collections={collections}
            status={status}
            busy={busy}
            accent={accent}
            showMap={showMap}
            onLookup={lookup}
            onSelectAddress={useSuggestion}
            onUsePin={usePin}
            pinned={pinned}
            onCancelMap={() => { setShowMap(false); setStatus(null) }}
            editing={editing}
            setEditing={setEditing}
            onReport={() => setSub('report')}
            setoutTime={setoutTime}
            reminder={reminder}
            onReminder={() => setSub('settings')}
            onGuidelines={() => setSub('guidelines')}
          />
        )}

        {!sub && tab === 'calendar' && (
          <CalendarView
            org={org}
            coords={coords}
            setoutTime={setoutTime}
            onGuidelines={() => setSub('guidelines')}
          />
        )}

        {!sub && tab === 'messages' && (
          <AlertsView alerts={alerts} loading={alertsLoading} unreadIds={unreadIds} />
        )}

        {!sub && tab === 'more' && <MoreView onOpen={setSub} accent={accent} />}
        </div>
      </div>

      <BottomNav tab={tab} setTab={changeTab} accent={accent} alertCount={unread} />
    </div>
  )
}
