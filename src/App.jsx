import { useState, useEffect, useRef } from 'react'
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
import SplashView from './SplashView'
import WelcomeView from './WelcomeView'
import GuidelinesView from './GuidelinesView'
import HolidayView from './HolidayView'
import ProviderHeader from './ProviderHeader'
import { S, C, parseDate } from './styles'
import { useLang } from './i18n'

// The point the saved address resolved to. Re-geocoding the stored label on
// every launch was losing the address whenever the geocoder missed it, so the
// coordinates are kept and the schedule loads straight from them.
function readCoords() {
  try {
    return JSON.parse(localStorage.getItem('coords') || 'null')
  } catch {
    return null
  }
}

// The provider we launched into last time. Cached so the branded splash can
// paint immediately instead of waiting on the network.
function readLastProvider() {
  try {
    return JSON.parse(localStorage.getItem('lastProvider') || 'null')
  } catch {
    return null
  }
}

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
  // 'splash' while the saved address resolves, 'welcome' when there isn't one.
  const [phase, setPhase] = useState('splash')
  const [guideCategory, setGuideCategory] = useState(null)
  const [calCursor, setCalCursor] = useState(() => {
    const n = new Date()
    return new Date(n.getFullYear(), n.getMonth(), 1)
  })
  const [calSelected, setCalSelected] = useState(null)
  // The holiday being inspected, with the pickup dates it is judged against.
  const [holiday, setHoliday] = useState(null)
  const [holidayDates, setHolidayDates] = useState([])
  const swipe = useRef(null)
  // Where the resident has been. Every navigation records the screen it left,
  // so a swipe back can return across tabs as well as out of a pushed screen.
  const [history, setHistory] = useState([])
  const [splashOrg, setSplashOrg] = useState(readLastProvider)

  const accent = '#0078FE'

  useEffect(() => {
    // Hold the splash briefly even on a fast load, so it reads as a launch
    // screen rather than a flash of navy.
    const started = Date.now()
    const done = (next) =>
      setTimeout(() => setPhase(next), Math.max(0, 2000 - (Date.now() - started)))

    const saved = readCoords()
    if (saved) {
      setBusy(true)
      loadSchedule(saved.lat, saved.lng).finally(() => {
        setBusy(false)
        done('app')
      })
    } else if (pinned) {
      setBusy(true)
      loadSchedule(pinned.lat, pinned.lng).finally(() => {
        setBusy(false)
        done('app')
      })
    } else if (address) {
      lookup().finally(() => done('app'))
    } else {
      done('welcome')
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

  // The service the resident tapped decides which guidance section opens.
  function openGuidelines(category) {
    setGuideCategory(typeof category === 'string' ? category : null)
    navigate(tab, 'guidelines')
  }

  function openHoliday(h, pickupDates) {
    setHoliday(h)
    setHolidayDates(pickupDates || [])
    navigate(tab, 'holiday')
  }

  // The single way to move. Anything that changes screen goes through here,
  // which is what keeps the back stack honest.
  function navigate(nextTab, nextSub = null) {
    if (nextTab === tab && nextSub === sub) return
    setHistory((h) => [...h.slice(-9), { tab, sub }])
    setTab(nextTab)
    setSub(nextSub)
  }

  function goBack() {
    if (history.length === 0) {
      setSub(null)
      return
    }
    const prev = history[history.length - 1]
    setHistory(history.slice(0, -1))
    setTab(prev.tab)
    setSub(prev.sub)
  }

  function changeTab(next) {
    navigate(next, null)
  }

  function changeAddress() {
    navigate('home', null)
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

  // The device's own position, handed to the same path as a dropped pin: it
  // resolves the provider and reverse-geocodes the nearest street address.
  function useMyLocation() {
    if (!navigator.geolocation) {
      setStatus(t.locationDenied)
      return
    }
    setBusy(true)
    setStatus(null)
    setShowMap(false)
    navigator.geolocation.getCurrentPosition(
      (pos) => usePin({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {
        setBusy(false)
        setStatus(t.locationDenied)
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    )
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
    const brand = { name: found.organization_name || '', logo: found.logo_url || '' }
    setSplashOrg(brand)
    localStorage.setItem('lastProvider', JSON.stringify(brand))

    const data = await getSchedule(lat, lng, 60)
    if (!data || data.length === 0) {
      setStatus(t.noScheduleYet)
      setCollections(null)
      return false
    }

    setCollections(data)
    setStatus(null)
    setCoords({ lat, lng })
    localStorage.setItem('coords', JSON.stringify({ lat, lng }))
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
    reminders: t.remindersTitle,
    settings: t.settingsTitle,
    guidelines: t.guidelinesTitle,
    holiday: holiday?.name || t.holidayTitle,
    report: t.reportIssueTitle,
  }

  // Name the screen the back arrow actually returns to, rather than assuming
  // it is the current tab.
  function backLabel() {
    const prev = history[history.length - 1]
    if (!prev) return t.navHome
    return prev.sub ? SUB_TITLES[prev.sub] : TITLES[prev.tab]
  }

  if (phase === 'splash') return <SplashView provider={splashOrg} />
  if (phase === 'welcome') {
    return (
      <WelcomeView
        onStart={() => {
          setPhase('app')
          setTab('home')
          setSub(null)
          setEditing(true)
        }}
      />
    )
  }

  // Swipe right to go back a screen, matching the iOS back gesture — out of a
  // pushed screen, or across to wherever the resident came from. The map pans
  // horizontally, so a swipe starting inside it is left alone.
  function onTouchStart(e) {
    if (e.touches.length !== 1 || e.target.closest?.('.leaflet-container')) {
      swipe.current = null
      return
    }
    swipe.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  function onTouchEnd(e) {
    const from = swipe.current
    swipe.current = null
    if (!from || !sub) return
    const to = e.changedTouches[0]
    if (to.clientX - from.x > 70 && Math.abs(to.clientY - from.y) < 50) goBack()
  }

  return (
    <div style={S.page} data-page onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div style={S.shell}>
        <ProviderHeader
          org={org}
          address={!sub && !editing ? address : null}
          onChangeAddress={changeAddress}
          title={sub ? SUB_TITLES[sub] : TITLES[tab]}
          onBack={sub ? goBack : null}
          backLabel={backLabel()}
        />

        <div style={S.contentSheet}>
        {sub === 'reminders' && (
          <SettingsView accent={accent} org={org} section="reminders" />
        )}
        {sub === 'settings' && (
          <SettingsView accent={accent} org={org} section="general" />
        )}
        {sub === 'holiday' && (
          <HolidayView holiday={holiday} pickupDates={holidayDates} />
        )}
        {sub === 'guidelines' && (
          <GuidelinesView org={org} openCategory={guideCategory} />
        )}
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
            onReport={() => navigate(tab, 'report')}
            setoutTime={setoutTime}
            reminder={reminder}
            onReminder={() => navigate(tab, 'reminders')}
            onGuidelines={openGuidelines}
            onUseLocation={useMyLocation}
          />
        )}

        {!sub && tab === 'calendar' && (
          <CalendarView
            org={org}
            coords={coords}
            setoutTime={setoutTime}
            onGuidelines={openGuidelines}
            onHoliday={openHoliday}
            cursor={calCursor}
            setCursor={setCalCursor}
            selected={calSelected}
            setSelected={setCalSelected}
          />
        )}

        {!sub && tab === 'messages' && (
          <AlertsView alerts={alerts} loading={alertsLoading} unreadIds={unreadIds} />
        )}

        {!sub && tab === 'more' && (
          <MoreView onOpen={(key) => navigate('more', key)} accent={accent} />
        )}
        </div>
      </div>

      <BottomNav tab={tab} setTab={changeTab} accent={accent} alertCount={unread} />
    </div>
  )
}
