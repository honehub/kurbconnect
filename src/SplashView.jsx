import { S } from './styles'

// The launch screen. Until a saved address resolves we show KurbConnect's own
// mark; once the provider is known — or remembered from the last run — the
// same screen carries their logo over the "Powered by" lockup instead.
export default function SplashView({ provider }) {
  const branded = !!provider?.logo

  return (
    <div style={S.brandScreen}>
      <div aria-hidden="true" style={S.brandArt} />
      <div style={S.brandInner}>
        <div style={S.brandCenter}>
          {branded ? (
            <>
              <img
                src={provider.logo}
                alt={provider.name || ''}
                style={S.brandProviderLogo}
              />
              <img
                src="/powered-by.webp"
                alt="Powered by KurbConnect"
                style={S.brandLockup}
              />
            </>
          ) : (
            <>
              <span style={S.brandMarkFrame}>
                <img src="/kurbconnect-mark.png" alt="" style={S.brandMarkImg} />
              </span>
              <div style={S.brandWord}>
                Kurb<span style={S.brandWordAccent}>Connect</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
