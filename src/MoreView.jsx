import { Settings, Recycle, FileText, AlertCircle, ChevronRight } from 'lucide-react'
import { S, C } from './styles'
import { useLang } from './i18n'

// KurbConnect's own terms, identical for every provider.
// Confirm this page exists before shipping.
const TERMS_URL = 'https://honeaenterprises.com/kurbconnect/terms-of-service/'

const TINT = {
  settings:   '#EEF2FF',
  guidelines: '#ECFDF5',
  report:     '#FEF2F2',
  terms:      '#EFF6FF',
}

const ICON_WRAP = {
  width: 38,
  height: 38,
  borderRadius: 9,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
}

const ROW = {
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  width: '100%',
  textAlign: 'left',
  padding: '14px 16px',
  background: 'none',
  border: 'none',
  font: 'inherit',
  cursor: 'pointer',
}

export default function MoreView({ onOpen, accent }) {
  const { t } = useLang()

  const items = [
    {
      key: 'settings',
      Icon: Settings,
      color: '#4F46E5',
      title: t.settingsTitle,
      hint: t.settingsHint,
    },
    {
      key: 'guidelines',
      Icon: Recycle,
      color: '#059669',
      title: t.guidelinesTitle,
      hint: t.guidelinesHint,
    },
    {
      key: 'report',
      Icon: AlertCircle,
      color: '#DC2626',
      title: t.reportIssueTitle,
      hint: t.reportIssueHint,
    },
    {
      key: 'terms',
      Icon: FileText,
      color: '#2563EB',
      title: t.termsTitle,
      hint: t.termsHint,
      external: TERMS_URL,
    },
  ]

  return (
    <>
      <div style={{ ...S.card, marginTop: 16 }}>
        {items.map((item, i) => {
          const { key, Icon, color, title, hint, external } = item
          const last = i === items.length - 1
          const body = (
            <>
              <span style={{ ...ICON_WRAP, background: TINT[key] }}>
                <Icon size={20} color={color} strokeWidth={1.9} />
              </span>
              <span style={{ flex: 1 }}>
                <span style={{ ...S.settingName, display: 'block' }}>{title}</span>
                <span style={{ ...S.settingHint, display: 'block' }}>{hint}</span>
              </span>
              <ChevronRight size={18} color={C.faint} />
            </>
          )
          const style = {
            ...ROW,
            borderBottom: last ? 'none' : `1px solid ${C.ruleSoft}`,
          }
          return external ? (
            <a
              key={key}
              href={external}
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...style, textDecoration: 'none', color: 'inherit' }}
            >
              {body}
            </a>
          ) : (
            <button key={key} onClick={() => onOpen(key)} style={style}>
              {body}
            </button>
          )
        })}
      </div>

      <div
        style={{
          textAlign: 'center',
          padding: '34px 20px 10px',
          color: C.faint,
          fontSize: 12,
        }}
      >
        <div>{t.poweredBy}</div>
        <div
          style={{
            marginTop: 4,
            fontSize: 17,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: accent,
          }}
        >
          KurbConnect
        </div>
      </div>
    </>
  )
}
