import Logo from './Logo'
import { C } from './styles'

export default function ProviderHeader({ org, kurblyColor = '#1d4ed8' }) {
  const brand = org?.primary_color || C.ink
  const accent = org?.secondary_color || brand

  return (
    <header style={{ ...wrap, borderBottom: `3px solid ${accent}` }}>
      <div style={left}>
        {org?.logo_url ? (
          <img src={org.logo_url} alt={org.organization_name || ''} style={logo} />
        ) : (
          <>
            <div style={{ ...monogram, background: brand }}>
              {(org?.organization_name || 'K').charAt(0)}
            </div>
            <span style={{ ...name, color: brand }}>
              {org?.organization_name || 'Kurbly'}
            </span>
          </>
        )}
      </div>

      <span style={byline}>
        <Logo size={14} color={C.faint} />
        Kurbly
      </span>
    </header>
  )
}

const wrap = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
  padding: '13px 20px',
  background: C.paper,
}

const left = {
  display: 'flex',
  alignItems: 'center',
  gap: 11,
  minWidth: 0,
}

const logo = {
  height: 34,
  maxWidth: 200,
  objectFit: 'contain',
  objectPosition: 'left center',
  display: 'block',
}

const monogram = {
  width: 34,
  height: 34,
  borderRadius: 8,
  display: 'grid',
  placeItems: 'center',
  color: '#fff',
  fontSize: 17,
  fontWeight: 700,
  flexShrink: 0,
}

const name = {
  fontSize: 17,
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