import { C } from './styles'

const KURB_BLUE = '#0078FE'

export default function ProviderHeader({ org }) {
  if (!org) {
    return (
      <header style={{ ...wrap, borderBottom: `3px solid ${KURB_BLUE}` }}>
        <img src="/kurbconnect-logo.png" alt="KurbConnect" style={lockupImg} />
      </header>
    )
  }

  const brand = org.primary_color || C.ink
  const accent = org.secondary_color || brand

  return (
    <header style={{ ...wrap, borderBottom: `3px solid ${accent}` }}>
      <div style={left}>
        {org.logo_url ? (
          <img src={org.logo_url} alt={org.organization_name || ''} style={logo} />
        ) : (
          <>
            <div style={{ ...monogram, background: brand }}>
              {(org.organization_name || '?').charAt(0)}
            </div>
            <span style={{ ...name, color: brand }}>{org.organization_name}</span>
          </>
        )}
      </div>

      <span style={byline}>
        <img src="/kurbconnect-mark.png" alt="" style={{ height: 20, display: 'block' }} />
        KurbConnect
      </span>
    </header>
  )
}

const wrap = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
  padding: '10px 20px',
  background: C.paper,
}

const lockupImg = {
  height: 34,
  display: 'block',
}

const left = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  minWidth: 0,
}

const logo = {
  height: 54,
  maxWidth: 220,
  objectFit: 'contain',
  objectPosition: 'left center',
  display: 'block',
}

const monogram = {
  width: 44,
  height: 44,
  borderRadius: 10,
  display: 'grid',
  placeItems: 'center',
  color: '#fff',
  fontSize: 20,
  fontWeight: 700,
  flexShrink: 0,
}

const name = {
  fontSize: 18,
  fontWeight: 700,
  letterSpacing: '-0.02em',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}

const byline = {
  display: 'flex',
  alignItems: 'center',
  gap: 7,
  fontSize: 14,
  fontWeight: 600,
  color: C.muted,
  flexShrink: 0,
}