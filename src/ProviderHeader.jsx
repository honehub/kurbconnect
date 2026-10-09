import { ChevronDown, ChevronLeft } from 'lucide-react'
import { S, C } from './styles'
import { useLang } from './i18n'

// The provider's navy banner. The provider leads — their mark and name at full
// size — and KurbConnect sits under it as the "powered by" lockup, deliberately
// secondary. On a pushed sub-screen `onBack` gives the compact variant.

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
  org, address, onChangeAddress, onBack, backLabel,
}) {
  const { t } = useLang()
  // KurbConnect's own chrome, every tenant. Only the logo is the provider's —
  // a per-org colour would clash with the blue used for every control, and
  // can't be trusted to keep white text legible.
  const compact = !!onBack

  // With a provider: their mark and name, KurbConnect small underneath.
  // Without one: KurbConnect's own lockup, drawn light so it reads on navy.
  const brand = org?.logo_url ? (
    <div style={S.headBrandRow}>
      <img
        src={org.logo_url}
        alt=""
        style={{
          ...S.headBrandLogo,
          width: compact ? 42 : 58,
          height: compact ? 42 : 58,
        }}
      />
      <span style={{ minWidth: 0 }}>
        {org.organization_name && (
          <span
            style={{
              ...S.headOrgName,
              fontSize: compact ? 17 : 21,
              display: 'block',
            }}
          >
            {org.organization_name}
          </span>
        )}
        <img
          src="/powered-by.webp"
          alt="Powered by KurbConnect"
          style={{ ...S.headPoweredBy, width: compact ? 104 : 126 }}
        />
      </span>
    </div>
  ) : (
    <div style={S.headBrandRow}>
      <span style={S.headWordLockup} aria-label="KurbConnect">
        <img
          src="/kurbconnect-mark.png"
          alt=""
          style={{
            ...S.headWordMark,
            width: compact ? 28 : 38,
            height: compact ? 28 : 38,
          }}
        />
        <span style={{ ...S.headWordText, fontSize: compact ? 20 : 26 }}>
          Kurb<span style={S.brandWordAccent}>Connect</span>
        </span>
      </span>
    </div>
  )

  return (
    <header
      style={{
        ...S.headWrap,
        background: C.navy,
        // contentSheet pulls up 20px, so this is 20 more than the visible gap.
        paddingBottom: compact ? 28 : 30,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div aria-hidden="true" style={S.headArcs} />

      {compact && (
        <button onClick={onBack} style={{ ...S.backBtn, position: 'relative', marginBottom: 10 }}>
          <ChevronLeft size={21} strokeWidth={2.2} />
          {backLabel || t.back}
        </button>
      )}

      {brand}

      {!compact && address && onChangeAddress && (
        <button onClick={onChangeAddress} style={{ ...S.headAddress, position: 'relative' }}>
          <PinFilled size={16} />
          <span style={S.headAddressText}>{address}</span>
          <ChevronDown size={16} strokeWidth={2.2} />
        </button>
      )}
    </header>
  )
}
