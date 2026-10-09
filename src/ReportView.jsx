import { useState, useEffect, useMemo } from 'react'
import { CircleAlert, Wrench, PackagePlus, Truck, MessageSquare, Check, Camera, X } from 'lucide-react'
import { submitReport, getRecentCollections } from './supabase'
import { pickPhoto, uploadPhotos, attachPhotos, MAX_PHOTOS } from './photos'
import { S, C, parseDate } from './styles'
import { useLang, CATEGORY_LABELS } from './i18n'

export default function ReportView({ coords, address, accent }) {
  const { t, lang, locale } = useLang()
  const labels = CATEGORY_LABELS[lang]
  const [type, setType] = useState(null)
  const [description, setDescription] = useState('')
  const [contact, setContact] = useState('')
  const [photos, setPhotos] = useState([])
  const [busy, setBusy] = useState(false)
  const [stage, setStage] = useState(null)
  const [sentId, setSentId] = useState(null)
  const [error, setError] = useState(null)
  // Which collection was missed: asked as two fields so the resident does not
  // have to spell it out in prose, and offered from their real history so the
  // pair is always one that actually existed.
  const [recent, setRecent] = useState([])
  const [svcType, setSvcType] = useState('')
  const [svcDate, setSvcDate] = useState('')

  const missed = type === 'missed_pickup'

  useEffect(() => {
    if (!missed || !coords) return
    let live = true
    getRecentCollections(coords.lat, coords.lng)
      .then((rows) => { if (live) setRecent(rows || []) })
      .catch(() => { if (live) setRecent([]) })
    return () => { live = false }
  }, [missed, coords?.lat, coords?.lng])

  // One entry per service the resident actually has.
  const svcOptions = useMemo(() => {
    const by = new Map()
    for (const r of recent) {
      if (!by.has(r.service_type_id)) {
        by.set(r.service_type_id, {
          id: r.service_type_id,
          label: labels[r.service_category] || r.service_type_name,
        })
      }
    }
    return [...by.values()]
  }, [recent, labels])

  // Dates filtered by the chosen service, newest first, so the two answers
  // can never contradict each other.
  const dateOptions = useMemo(() => {
    if (!svcType) return []
    return [...new Set(
      recent.filter((r) => r.service_type_id === svcType).map((r) => r.pickup_date),
    )].sort((a, b) => b.localeCompare(a))
  }, [recent, svcType])

  const TYPES = [
    { id: 'missed_pickup',     label: t.typeMissed,  Icon: CircleAlert },
    { id: 'damaged_container', label: t.typeDamaged, Icon: Wrench },
    { id: 'new_container',     label: t.typeNewCart, Icon: PackagePlus },
    { id: 'bulk_pickup',       label: t.typeBulk,    Icon: Truck },
    { id: 'other',             label: t.typeOther,   Icon: MessageSquare },
  ]

  if (!coords) return <div style={S.empty}>{t.needLocation}</div>

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
            setPhotos([])
            setSvcType('')
            setSvcDate('')
          }}
          style={{ ...S.buttonQuiet, marginTop: 24 }}
        >
          {t.reportAnother}
        </button>
      </div>
    )
  }

  async function addPhoto() {
    try {
      const result = await pickPhoto()
      if (result) setPhotos((p) => [...p, result].slice(0, MAX_PHOTOS))
    } catch {
      // cancelled or denied — nothing to report
    }
  }

  function removePhoto(i) {
    setPhotos((p) => p.filter((_, idx) => idx !== i))
  }

  async function send() {
    setBusy(true)
    setError(null)
    try {
      setStage(t.sending)
      const id = await submitReport({
        lat: coords.lat,
        lng: coords.lng,
        type,
        description,
        contact,
        address,
        serviceTypeId: missed ? svcType || null : null,
        requestedDate: missed ? svcDate || null : null,
      })

      if (photos.length) {
        setStage(t.uploading)
        const paths = await uploadPhotos(photos.map((p) => p.blob))
        await attachPhotos(id, paths)
      }

      setSentId(id)
    } catch {
      setError(t.reportFailed)
    } finally {
      setBusy(false)
      setStage(null)
    }
  }

  return (
    <>
       <div style={{ padding: '18px 20px 14px', background: C.paper }}>
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
              background: active ? '#EFF6FF' : C.paper,
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
        <div style={{ padding: '22px 20px', background: C.paper, borderTop: `1px solid ${C.rule}` }}>
          {missed && svcOptions.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <label style={S.label} htmlFor="svctype">{t.whichCollection}</label>
              <select
                id="svctype"
                value={svcType}
                onChange={(e) => { setSvcType(e.target.value); setSvcDate('') }}
                style={S.input}
              >
                <option value="">{t.choosePlaceholder}</option>
                {svcOptions.map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>

              <label style={{ ...S.label, marginTop: 14 }} htmlFor="svcdate">
                {t.whichDate}
              </label>
              <select
                id="svcdate"
                value={svcDate}
                onChange={(e) => setSvcDate(e.target.value)}
                disabled={!svcType}
                style={{ ...S.input, opacity: svcType ? 1 : 0.5 }}
              >
                <option value="">
                  {svcType ? t.choosePlaceholder : t.chooseCollectionFirst}
                </option>
                {dateOptions.map((d) => (
                  <option key={d} value={d}>
                    {parseDate(d).toLocaleDateString(locale, {
                      weekday: 'long', month: 'long', day: 'numeric',
                    })}
                  </option>
                ))}
              </select>
            </div>
          )}

          <label style={S.label} htmlFor="desc">{t.describeIt}</label>
          <textarea
            id="desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.describePlaceholder}
            rows={4}
            style={{ ...S.input, resize: 'vertical', lineHeight: 1.5 }}
          />

          <div style={{ ...S.label, marginTop: 20 }}>{t.photos}</div>
          <div style={{ ...S.settingHint, marginBottom: 10 }}>{t.photosHint}</div>

          <div style={photoRow}>
            {photos.map((p, i) => (
              <div key={i} style={thumb}>
                <img src={p.preview} alt="" style={thumbImg} />
                <button
                  onClick={() => removePhoto(i)}
                  aria-label={t.removePhoto}
                  style={thumbRemove}
                >
                  <X size={13} color="#fff" strokeWidth={2.6} />
                </button>
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <button onClick={addPhoto} style={addTile}>
                <Camera size={20} color={C.muted} strokeWidth={1.8} />
                <span style={{ fontSize: 11, color: C.muted }}>{t.addPhoto}</span>
              </button>
            )}
          </div>

          <label style={{ ...S.label, marginTop: 20 }} htmlFor="contact">
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
            {busy ? stage || t.sending : t.submitReport}
          </button>
        </div>
      )}
    </>
  )
}

const pageTitle = {
  fontSize: 22, fontWeight: 700, color: C.ink, margin: 0, letterSpacing: '-0.02em',
}
const intro = {
  fontSize: 14, color: C.muted, lineHeight: 1.5, margin: '6px 0 0',
}
const addressLine = {
  fontSize: 13, color: C.faint, margin: '10px 0 0',
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
const photoRow = { display: 'flex', gap: 10, flexWrap: 'wrap' }
const thumb = {
  position: 'relative', width: 78, height: 78,
  borderRadius: 8, overflow: 'hidden', border: `1px solid ${C.rule}`,
}
const thumbImg = { width: '100%', height: '100%', objectFit: 'cover', display: 'block' }
const thumbRemove = {
  position: 'absolute', top: 4, right: 4,
  width: 20, height: 20, borderRadius: '50%',
  background: 'rgba(15,23,42,0.75)', border: 'none',
  display: 'grid', placeItems: 'center', cursor: 'pointer', padding: 0,
}
const addTile = {
  width: 78, height: 78, borderRadius: 8,
  border: `1px dashed ${C.rule}`, background: 'transparent',
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  justifyContent: 'center', gap: 5, cursor: 'pointer', fontFamily: 'inherit',
}
const successMark = {
  width: 52, height: 52, borderRadius: '50%', background: '#16A34A',
  display: 'grid', placeItems: 'center', margin: '0 auto 18px',
}
const successTitle = {
  fontSize: 20, fontWeight: 700, color: C.ink, margin: 0, letterSpacing: '-0.015em',
}
const successBody = {
  fontSize: 14, color: C.muted, lineHeight: 1.55, margin: '8px 0 0',
}