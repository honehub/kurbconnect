import Logo from './Logo'
import { C } from './styles'

const KURB_BLUE = '#1d4ed8'

export default function ProviderHeader({ org }) {
  // No provider resolved yet — KurbConnect stands on its own.
  if (!org) {
    return (
      <header style={{ ...wrap, borderBottom: `3px solid ${KURB_BLUE}` }}>
        <span style={lockup}>
          <Logo size={34} color={KURB_BLUE} />
          KurbConnect
        </span>
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
        <Logo size={14} color={C.faint} />
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

const lockup = {
  display: 'flex',
  alignItems: 'center',
  gap: 11,
  fontSize: 22,
  fontWeight: 700,
  letterSpacing: '-0.025em',
  color: C.ink,
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
  gap: 5,
  fontSize: 12,
  fontWeight: 500,
  color: C.faint,
  flexShrink: 0,
}