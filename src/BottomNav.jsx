import { Home, Calendar, MessageSquare, MoreHorizontal } from 'lucide-react'
import { C } from './styles'
import { useLang } from './i18n'

const BAR = {
  position: 'fixed',
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  background: C.paper,
  borderTop: `1px solid ${C.rule}`,
  paddingBottom: 'env(safe-area-inset-bottom)',
  zIndex: 40,
}

const INNER = { display: 'flex', width: '100%', maxWidth: 480, margin: '0 auto' }

const ITEM = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 4,
  padding: '9px 0 7px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  font: 'inherit',
  position: 'relative',
}

const LABEL = { fontSize: 11, fontWeight: 500, letterSpacing: '-0.01em' }

const BADGE = {
  position: 'absolute',
  top: 4,
  left: 'calc(50% + 6px)',
  minWidth: 17,
  height: 17,
  padding: '0 5px',
  borderRadius: 9,
  background: '#DC2626',
  color: '#FFFFFF',
  fontSize: 10,
  fontWeight: 700,
  lineHeight: '17px',
  textAlign: 'center',
  boxSizing: 'border-box',
}

export default function BottomNav({ tab, setTab, accent, alertCount = 0 }) {
  const { t } = useLang()

  const tabs = [
    { key: 'home',     label: t.navHome,     Icon: Home },
    { key: 'calendar', label: t.navCalendar, Icon: Calendar },
    { key: 'messages', label: t.navMessages, Icon: MessageSquare, badge: alertCount },
    { key: 'more',     label: t.navMore,     Icon: MoreHorizontal },
  ]

  return (
    <nav style={BAR}>
      <div style={INNER}>
        {tabs.map(({ key, label, Icon, badge }) => {
          const on = tab === key
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={ITEM}
              aria-current={on ? 'page' : undefined}
              aria-label={label}
            >
              <Icon
                size={23}
                strokeWidth={on ? 2.3 : 1.8}
                color={on ? accent : C.faint}
              />
              <span style={{ ...LABEL, color: on ? accent : C.faint }}>{label}</span>
              {badge > 0 && <span style={BADGE}>{badge > 99 ? '99+' : badge}</span>}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
