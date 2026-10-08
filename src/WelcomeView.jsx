import { ChevronRight } from 'lucide-react'
import { S } from './styles'
import { useLang } from './i18n'

// Shown once at first run, when there is no saved address to launch into.
// "Find my address" hands off to the address screen.
export default function WelcomeView({ onStart }) {
  const { t } = useLang()

  return (
    <div style={S.brandScreen}>
      <div aria-hidden="true" style={S.brandArt} />
      <div style={S.brandInner}>
        <div style={S.brandCenter}>
          <span style={S.brandMarkFrame}>
            <img src="/kurbconnect-mark.png" alt="" style={S.brandMarkImg} />
          </span>
          <div style={S.brandWord}>
            Kurb<span style={S.brandWordAccent}>Connect</span>
          </div>
          <h1 style={S.brandHeadline}>{t.welcomeHeadline}</h1>
          <p style={S.brandSub}>{t.welcomeSub}</p>
        </div>

        <div>
          <button onClick={onStart} style={S.brandCta}>
            <span style={{ flex: 1, textAlign: 'center' }}>{t.findMyAddress}</span>
            <ChevronRight size={22} strokeWidth={2.4} />
          </button>
          <div style={S.brandCtaHint}>{t.welcomeHint}</div>
        </div>
      </div>
    </div>
  )
}
