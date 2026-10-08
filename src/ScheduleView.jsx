import { useRef, useState, useLayoutEffect } from 'react'
import PinMap, { SAN_ANGELO } from './PinMap'
import { AlertCircle, ChevronRight } from 'lucide-react'
import { S, C } from './styles'
import { useLang } from './i18n'
import AddressInput from './AddressInput'
import DayCard from './DayCard'

export default function ScheduleView({
  address, setAddress, collections, status, busy, accent,
  showMap, onLookup, onSelectAddress, onUsePin, pinned, onCancelMap, editing, setEditing,
  onReport, setoutTime, reminder, onReminder, onGuidelines,
}) {
  const { t } = useLang()

  const groups = groupByDate(collections)
  const first = groups[0]
  const later = groups.slice(1, 5)
  const hasSchedule = groups.length > 0

  const rootRef = useRef(null)
  const listRef = useRef(null)
  const [clip, setClip] = useState(null)
  const [rootH, setRootH] = useState(null)

  // Every card stays mounted and keeps its own height; only the container is
  // clipped. That keeps the measurement stable — shrinking the container can
  // never change what the next measurement sees.
  useLayoutEffect(() => {
    function measure() {
      const root = rootRef.current
      const list = listRef.current
      if (!root || !list) return

      const page = root.closest('[data-page]')
      const padBottom = page ? parseFloat(getComputedStyle(page).paddingBottom) || 0 : 88
      const topDoc = root.getBoundingClientRect().top + window.scrollY
      const box = (el) => {
        if (!el) return 0
        const cs = getComputedStyle(el)
        return el.getBoundingClientRect().height + (parseFloat(cs.marginBottom) || 0)
      }
      // Fill exactly the space between the header and the tab bar, so the
      // report button can sit on the bottom edge instead of floating under
      // whatever cards happened to fit.
      const height = window.innerHeight - topDoc - padBottom
      setRootH(height)

      const avail =
        height -
        box(root.querySelector('[data-hero]')) -
        box(root.querySelector('[data-report]'))

      let used = 0
      let fit = 0
      const kids = Array.from(list.children)
      for (let i = 0; i < kids.length; i++) {
        const h = box(kids[i])
        if (used + h > avail) break
        used += h
        // The "Coming up" heading only earns its space if a card follows it.
        if (i > 0) fit = used
      }
      setClip(Math.max(fit, 0))
    }

    measure()

    // The first pass runs before the web font and the cart images have
    // settled, so the heights it sees are not the ones that end up on screen.
    // Re-measure whenever anything we depend on actually changes size.
    const ro = new ResizeObserver(measure)
    const root = rootRef.current
    const list = listRef.current
    if (root) {
      const hero = root.querySelector('[data-hero]')
      const report = root.querySelector('[data-report]')
      if (hero) ro.observe(hero)
      if (report) ro.observe(report)
    }
    // The children, never the container: clipping the container would
    // otherwise feed its own height change back in as a new measurement.
    if (list) Array.from(list.children).forEach((c) => ro.observe(c))

    if (document.fonts?.ready) document.fonts.ready.then(measure).catch(() => {})
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [collections, setoutTime, reminder, editing, status])

  if (!hasSchedule || editing) {
    return (
      <>
        {status && <div style={{ ...S.notice, marginTop: 8 }}>{status}</div>}

        <div style={S.section}>
          <label style={S.label} htmlFor="addr">{t.yourAddress}</label>
          <AddressInput
            value={address}
            onChange={setAddress}
            onSelect={onSelectAddress}
            onSubmit={onLookup}
            placeholder={t.addressPlaceholder}
          />
          <button
            onClick={onLookup}
            disabled={busy || !address.trim()}
            style={{
              ...S.button,
              background: accent,
              opacity: busy || !address.trim() ? 0.45 : 1,
            }}
          >
            {busy ? t.lookingUp : t.findSchedule}
          </button>
          {hasSchedule && (
            <button onClick={() => setEditing(false)} style={S.buttonQuiet}>
              {t.cancel}
            </button>
          )}
        </div>

        {showMap && (
          <div style={S.section}>
            <PinMap
              center={pinned || SAN_ANGELO}
              onConfirm={onUsePin}
              onCancel={onCancelMap}
              accent={accent}
              busy={busy}
            />
          </div>
        )}
      </>
    )
  }

  return (
    <div
      ref={rootRef}
      style={{
        paddingTop: 16,
        display: 'flex',
        flexDirection: 'column',
        minHeight: rootH === null ? undefined : rootH,
      }}
    >
      <div data-hero>
        <DayCard
          group={first}
          setoutTime={setoutTime}
          reminder={reminder}
          onReminder={onReminder}
          lead
        />
      </div>

      {later.length > 0 && (
        // Clipped to whole cards: the report button below must stay on screen,
        // and a half-visible card reads as a rendering fault.
        <div
          ref={listRef}
          style={{ overflow: 'hidden', maxHeight: clip === null ? undefined : clip }}
        >
          <div style={S.agendaHead}>{t.comingUp}</div>
          {later.map((g) => (
            <DayCard
              key={g.date}
              group={g}
              setoutTime={setoutTime}
              onGuidelines={onGuidelines}
            />
          ))}
        </div>
      )}

      {onReport && (
        <button
          onClick={onReport}
          data-report
          style={{
            marginTop: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            width: 'calc(100% - 28px)',
            marginRight: 14,
            marginLeft: 14,
            marginBottom: 0,
            padding: '14px 15px',
            textAlign: 'left',
            background: C.paper,
            border: `1px solid ${C.rule}`,
            borderRadius: 16,
            font: 'inherit',
            cursor: 'pointer',
            boxSizing: 'border-box',
          }}
        >
          <span
            style={{
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
              background: accent, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <AlertCircle size={20} color="#FFFFFF" strokeWidth={2.2} />
          </span>
          <span style={{ flex: 1 }}>
            <span style={{ ...S.settingName, display: 'block' }}>
              {t.reportIssueTitle}
            </span>
            <span style={{ ...S.settingHint, display: 'block' }}>
              {t.reportIssueHint}
            </span>
          </span>
          <ChevronRight size={18} color={C.faint} />
        </button>
      )}
    </div>
  )
}

export function groupByDate(collections) {
  if (!collections) return []
  const map = new Map()
  for (const c of collections) {
    if (!map.has(c.pickup_date)) map.set(c.pickup_date, [])
    map.get(c.pickup_date).push(c)
  }
  return [...map.entries()]
    .map(([date, items]) => ({ date, items }))
    .sort((a, b) => a.date.localeCompare(b.date))
}
