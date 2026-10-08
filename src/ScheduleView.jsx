import PinMap, { SAN_ANGELO } from './PinMap'
import { AlertCircle, ChevronRight, LocateFixed } from 'lucide-react'
import { S, C, daysUntil } from './styles'
import { useLang } from './i18n'
import AddressInput from './AddressInput'
import DayCard from './DayCard'

export default function ScheduleView({
  address, setAddress, collections, status, busy, accent,
  showMap, onLookup, onSelectAddress, onUsePin, pinned, onCancelMap, editing, setEditing,
  onReport, setoutTime, reminder, onReminder, onGuidelines, onUseLocation,
}) {
  const { t } = useLang()

  const groups = groupByDate(collections)
  const first = groups[0]
  // Six weeks ahead; the list scrolls behind the report bar.
  const later = groups.slice(1).filter((g) => daysUntil(g.date) <= 42)
  const hasSchedule = groups.length > 0

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
          {onUseLocation && (
            <button onClick={onUseLocation} disabled={busy} style={S.locBtn}>
              <LocateFixed size={18} strokeWidth={2} />
              {busy ? t.locating : t.useMyLocation}
            </button>
          )}
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
    <div style={{ paddingTop: 16, paddingBottom: 96 }}>
      <div>
        <DayCard
          group={first}
          setoutTime={setoutTime}
          reminder={reminder}
          onReminder={onReminder}
          lead
        />
      </div>

      {later.length > 0 && (
        <div>
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
        <div style={S.reportDock}>
        <button
          onClick={onReport}
          data-report
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            width: '100%',
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
        </div>
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
