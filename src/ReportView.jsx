import { useState } from 'react'
import { CircleAlert, Wrench, PackagePlus, Truck, MessageSquare, Check } from 'lucide-react'
import { submitReport } from './supabase'
import { S, C } from './styles'
import { useLang } from './i18n'

export default function ReportView({ coords, address, accent }) {
  const { t } = useLang()
  const [type, setType] = useState(null)
  const [description, setDescription] = useState('')
  const [contact, setContact] = useState('')
  const [busy, setBusy] = useState(false)
  const [sentId, setSentId] = useState(null)
  const [error, setError] = useState(null)

  const TYPES = [
    { id: 'missed_pickup',     label: t.typeMissed,  Icon: CircleAlert },
    { id: 'damaged_container', label: t.typeDamaged, Icon: Wrench },
    { id: 'new_container',     label: t.typeNewCart, Icon: PackagePlus },
    { id: 'bulk_pickup',       label: t.typeBulk,    Icon: Truck },
    { id: 'other',             label: t.typeOther,   Icon: MessageSquare },
  ]

  if (!coords) {
    return <div style={S.empty}>{t.needLocation}</div>
  }

  if (sentId) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <div style={successMark}>
          <Check size={26} color="#fff" strokeWidth={2.6} />
        </div>
        <h2 style={successTitle}>{t.reportSent}</h2>
        <p style={successBody}>
          {t.reportSentBody.replace('{id}', sentId.slice(0, 8).toUpperCase())}
        </p>
        <button
          onClick={() => {
            setSentId(null)
            setType(null)
            setDescription('')
          }}
          style={{ ...S.buttonQuiet, marginTop: 24 }}
        >
          {t.reportAnother}
        </button>
      </div>
    )
  }

  async function send() {
    setBusy(true)
    setError(null)
    try {
      const id = await submitReport({
        lat: coords.lat,
        lng: coords.lng,
        type,
        description,
        contact,
        address,
      })
      setSentId(id)
    } catch {
      setError(t.reportFailed)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div style={{ padding: '18px 20px 4px' }}>
        <h2 style={pageTitle}>{t.reportTitle}</h2>
        <p style={intro}>{t.reportIntro}</p>
        <p style={addressLine}>{address}</p>
      </div>

      <div style={S.groupHead}>{t.whatHappened}</div>
      {TYPES.map(({ id, label, Icon }) => {
        const active = type === id
        return (
          <button
            key={id}
            onClick={() => setType(id)}
            style={{
              ...typeRow,
              background: active ? '#F8FAFC' : 'transparent',
              borderLeft: active ? `3px solid ${accent}` : '3px solid transparent',
            }}
          >
            <Icon size={19} color={active ? accent : C.muted} strokeWidth={1.9} />
            <span style={{ color: active ? C.ink : C.body, fontWeight: active ? 600 : 400 }}>
              {label}
            </span>
          </button>
        )
      })}

      {type && (
        <div style={{ padding: '22px 20px 0' }}>
          <label style={S.label} htmlFor="desc">{t.describeIt}</label>
          <textarea
            id="desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.describePlaceholder}
            rows={4}
            style={{ ...S.input, resize: 'vertical', lineHeight: 1.5 }}
          />

          <label style={{ ...S.label, marginTop: 18 }} htmlFor="contact">
            {t.contactOptional}
          </label>
          <input
            id="contact"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            style={S.input}
          />
          <div style={{ ...S.settingHint, marginTop: 6 }}>{t.contactHint}</div>

          {error && <div style={{ ...S.notice, margin: '16px 0 0' }}>{error}</div>}

          <button
            onClick={send}
            disabled={busy}
            style={{ ...S.button, background: accent, opacity: busy ? 0.45 : 1, marginTop: 20 }}
          >
            {busy ? t.sending : t.submitReport}
          </button>
        </div>
      )}
    </>
  )
}

const pageTitle = {
  fontSize: 22,
  fontWeight: 700,
  color: C.ink,
  margin: 0,
  letterSpacing: '-0.02em',
}

const intro = {
  fontSize: 14,
  color: C.muted,
  lineHeight: 1.5,
  margin: '6px 0 0',
}

const addressLine = {
  fontSize: 13,
  color: C.faint,
  margin: '10px 0 0',
}

const typeRow = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: 13,
  padding: '14px 20px',
  border: 'none',
  borderBottom: `1px solid ${C.ruleSoft}`,
  fontSize: 15,
  fontFamily: 'inherit',
  cursor: 'pointer',
  textAlign: 'left',
}

const successMark = {
  width: 52,
  height: 52,
  borderRadius: '50%',
  background: '#16A34A',
  display: 'grid',
  placeItems: 'center',
  margin: '0 auto 18px',
}

const successTitle = {
  fontSize: 20,
  fontWeight: 700,
  color: C.ink,
  margin: 0,
  letterSpacing: '-0.015em',
}

const successBody = {
  fontSize: 14,
  color: C.muted,
  lineHeight: 1.55,
  margin: '8px 0 0',
}