import { ChevronDown, ChevronLeft } from 'lucide-react'
import { S, C } from './styles'
import { useLang } from './i18n'

// The provider's navy banner. On a tab it shows the logo, the address and the
// screen title; on a pushed sub-screen `onBack` turns it into the compact
// variant with a back link and a smaller logo.

// A map pin whose centre is a true hole: both shapes live in one path, so
// evenodd cuts the dot out and the header art shows through.
function PinFilled({ size = 15, color = '#FFFFFF' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      aria-hidden="true"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"
      />
    </svg>
  )
}

export default function ProviderHeader({
  org, address, onChangeAddress, title, onBack, backLabel,
}) {
  const { t } = useLang()
  // KurbConnect's own chrome, every tenant. Only the logo is the provider's —
  // a per-org colour would clash with the blue used for every control, and
  // can't be trusted to keep white text legible.
  const compact = !!onBack

  const logo = org?.logo_url ? (
    <img
      src={org.logo_url}
      alt={org.organization_name || ''}
      style={{ ...S.headLogo, height: compact ? 44 : 62 }}
    />
  ) : (
    <span style={S.headWordLockup} aria-label="KurbConnect">
      <img
        src="/kurbconnect-mark.png"
        alt=""
        style={{
          ...S.headWordMark,
          width: compact ? 28 : 36,
          height: compact ? 28 : 36,
        }}
      />
      <span style={{ ...S.headWordText, fontSize: compact ? 20 : 25 }}>
        Kurb<span style={S.brandWordAccent}>Connect</span>
      </span>
    </span>
  )

  return (
    <header
      style={{
        ...S.headWrap,
        background: C.navy,
        paddingBottom: compact ? 16 : 20,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div aria-hidden="true" style={S.headArcs} />

      <div style={{ position: 'relative' }}>
        {compact && (
          <button
            onClick={onBack}
            style={{ ...S.backBtn, position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)' }}
          >
            <ChevronLeft size={21} strokeWidth={2.2} />
            {backLabel || t.back}
          </button>
        )}
        <div style={S.headLogoRow}>{logo}</div>
      </div>

      {org && (
        <img
          src="/powered-by.webp"
          alt="Powered by KurbConnect"
          style={{ ...S.headLockup, width: compact ? 132 : 166 }}
        />
      )}

      {!compact && address && onChangeAddress && (
        <button onClick={onChangeAddress} style={{ ...S.headAddress, position: 'relative' }}>
          <PinFilled size={16} />
          <span style={S.headAddressText}>{address}</span>
          <ChevronDown size={16} strokeWidth={2.2} />
        </button>
      )}

      {title && (
        <h1
          style={{
            ...S.headTitle,
            fontSize: compact ? 26 : 28,
            position: 'relative',
          }}
        >
          {title}
        </h1>
      )}
    </header>
  )
}
