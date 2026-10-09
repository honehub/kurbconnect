import { Trash2, Recycle, Truck, Package, Leaf } from 'lucide-react'

export const ICONS = { trash: Trash2, recycle: Recycle, truck: Truck, box: Package, leaf: Leaf }

// The icon a service category always gets, whatever icon_name the row carries.
export const CAT_ICONS = {
  trash: Trash2,
  recycling: Recycle,
  bulk: Package,
  yard_waste: Leaf,
}

// Illustrated carts, where we have artwork. Anything without one falls back
// to the line icon above, so a new category never renders blank.
export const CAT_IMAGES = {
  trash: '/icons/cart-trash.webp',
}

export function svcIcon(c) {
  return CAT_ICONS[c.service_category] || ICONS[c.icon_name] || Trash2
}

export const C = {
  navy: '#012158',
  arc: 'rgba(86, 138, 243, 0.26)',  // header ring graphic, on navy
  brand: '#0461FE',
  ink: '#001233',
  body: '#334155',
  muted: '#64748B',
  faint: '#94A3B8',
  rule: '#EDF1F7',
  tint: '#EAF6FE',       // hero date block
  tintSoft: '#EFF7FE',   // later date blocks
  heroBg: '#E4EFFC',     // hero card body
  reminderBg: '#D3ECFD',
  cell: '#EEF5FC',       // calendar day cell
  holiday: '#FEE1A3',    // holiday day cell
  holidaySoft: '#FEEDCA',// holiday date block on the cards
  holidayWarn: '#FEF1D8',// schedule-change note
  holidayInk: '#92400E',
  ruleSoft: '#F4F7FB',
  paper: '#FFFFFF',
  alert: '#B45309',
  alertBg: '#FFFBEB',
}

export const CAT = {
  trash:      { solid: '#8A5A2B', tint: '#F8F0E7' },  // light brown
  recycling:  { solid: '#15803D', tint: '#F0FDF4' },  // green
  bulk:       { solid: '#A16207', tint: '#FEFBEB' },  // cardboard
  yard_waste: { solid: '#4D7C0F', tint: '#F7FEE7' },
}

export function catColor(category) {
  return CAT[category] || CAT.trash
}

const font = "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"

export const S = {
  page: {
    minHeight: '100vh',
    background: '#FFFFFF',
    fontFamily: font,
    color: C.body,
    paddingBottom: 'calc(68px + env(safe-area-inset-bottom))',
    WebkitFontSmoothing: 'antialiased',
  },
  shell: {
    maxWidth: 480, margin: '0 auto',
    paddingLeft: 'env(safe-area-inset-left)',
    paddingRight: 'env(safe-area-inset-right)',
  },

  topbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px 12px',
    background: C.paper,
  },
  wordmark: {
    display: 'flex',
    alignItems: 'center',
    gap: 9,
    fontSize: 19,
    fontWeight: 600,
    letterSpacing: '-0.02em',
    color: C.ink,
  },
  provider: { fontSize: 13, color: C.faint, fontWeight: 400 },

  addressBar: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 16,
    padding: '10px 20px',
    background: C.paper,
    borderTop: `1px solid ${C.ruleSoft}`,
    borderBottom: `1px solid ${C.rule}`,
  },
  addressText: {
    fontSize: 14,
    color: C.muted,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  textLink: {
    background: 'none',
    border: 'none',
    padding: 0,
    font: 'inherit',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    flexShrink: 0,
  },

  agendaRow: {
    display: 'grid',
    gridTemplateColumns: '72px 1fr',
    gap: 12,
    padding: '12px 20px',
    background: C.paper,
    borderTop: `1px solid ${C.ruleSoft}`,
    alignItems: 'start',
  },
  agendaDate: {
    fontSize: 14,
    fontWeight: 600,
    color: C.ink,
    letterSpacing: '-0.01em',
  },
  agendaWeekday: { fontSize: 12, color: C.faint, marginTop: 1 },
  agendaServices: {
    fontSize: 15,
    color: C.body,
    lineHeight: 1.5,
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  },
  agendaService: { display: 'flex', alignItems: 'flex-start', gap: 9 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
    marginTop: 7,
  },

  // Settings grouping
  cardPad: { padding: 16 },
  settingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    textAlign: 'left',
    gap: 16,
    padding: '14px 16px',
    borderBottom: `1px solid ${C.ruleSoft}`,
  },
  settingRowLast: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    textAlign: 'left',
    gap: 16,
    padding: '14px 16px',
  },
  settingHint: { fontSize: 13, color: C.muted, marginTop: 2, lineHeight: 1.45 },

  section: { padding: '20px' },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: C.ink,
    marginBottom: 8,
    textAlign: 'left',
  },
  input: {
    width: '100%',
    padding: '12px 13px',
    fontSize: 16,
    fontFamily: font,
    color: C.ink,
    background: C.paper,
    border: `1px solid ${C.rule}`,
    borderRadius: 6,
    boxSizing: 'border-box',
    outline: 'none',
  },
  locBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    width: '100%', marginTop: 10, padding: '12px',
    fontSize: 15, fontWeight: 600, fontFamily: font,
    color: C.brand, background: C.paper,
    border: `1px solid ${C.tint}`, borderRadius: 6,
    cursor: 'pointer', letterSpacing: '-0.01em',
  },
  button: {
    width: '100%',
    marginTop: 10,
    padding: '13px',
    fontSize: 15,
    fontWeight: 600,
    fontFamily: font,
    color: C.paper,
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    letterSpacing: '-0.01em',
  },
  buttonQuiet: {
    width: '100%',
    marginTop: 8,
    padding: '13px',
    fontSize: 15,
    fontWeight: 500,
    fontFamily: font,
    background: C.paper,
    border: `1px solid ${C.rule}`,
    borderRadius: 6,
    cursor: 'pointer',
    color: C.body,
  },
  notice: {
    margin: '0 14px 12px',
    padding: '13px 15px',
    background: C.alertBg,
    borderLeft: `2px solid ${C.alert}`,
    borderRadius: 4,
    color: C.alert,
    fontSize: 14,
    lineHeight: 1.5,
    textAlign: 'left',
  },
  changed: { fontSize: 13, color: C.alert, marginTop: 3 },

  muted: { fontSize: 14, color: C.muted },
  empty: {
    textAlign: 'center',
    color: C.faint,
    padding: '64px 32px',
    fontSize: 15,
    lineHeight: 1.6,
  },
  // ---- Branded header ----
  headWrap: {
    // Runs under the status bar / notch; the inset keeps content clear of it.
    padding: '10px 20px 36px',
    paddingTop: 'calc(16px + env(safe-area-inset-top))',
    color: '#FFFFFF',
  },
  // The provider-neutral header artwork. WebP (10.6 KB) with the navy
  // underneath as the fallback if a browser can't decode it.
  headArcs: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    backgroundImage: "url('/header-bg.webp')",
    backgroundSize: 'cover',
    backgroundPosition: 'right center',
    backgroundRepeat: 'no-repeat',
  },
  headLogoRow: { display: 'flex', justifyContent: 'center' },

  // Provider first, KurbConnect second: their mark and name at full size with
  // the powered-by lockup tucked underneath.
  headBrandRow: { display: 'flex', alignItems: 'center', gap: 12, position: 'relative' },
  headBrandLogo: { objectFit: 'contain', display: 'block', flexShrink: 0 },
  headOrgName: {
    fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, color: '#FFFFFF',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  headPoweredBy: { display: 'block', height: 'auto', marginTop: 3 },

  // The screen title now sits on the white sheet rather than the navy header,
  // which is what gives it room to breathe under the banner.
  pageTitle: {
    margin: 0, padding: '17px 16px 3px', fontSize: 27, fontWeight: 800,
    letterSpacing: '-0.035em', lineHeight: 1.18, color: C.ink,
  },

  // ---- Hero card (next pickup) ----
  heroCard: {
    margin: '4px 14px 12px', background: C.heroBg,
    border: `1px solid ${C.tint}`, borderRadius: 18, overflow: 'hidden',
  },
  heroBody: { padding: '12px 14px 12px' },
  heroPill: {
    display: 'inline-block', padding: '4px 11px', borderRadius: 999,
    background: C.brand, color: '#FFFFFF', fontSize: 11.5, fontWeight: 700,
    letterSpacing: '0.05em', textTransform: 'uppercase', lineHeight: 1.3,
  },
  heroDate: {
    fontSize: 24, fontWeight: 800, letterSpacing: '-0.035em',
    lineHeight: 1.2, color: C.ink, margin: '9px 0 7px',
  },
  heroSvcRow: { display: 'flex', alignItems: 'center', gap: 10, minHeight: 28 },
  heroSvcName: { fontSize: 17, fontWeight: 600, letterSpacing: '-0.015em', color: C.ink },
  heroSetout: {
    display: 'flex', alignItems: 'center', gap: 6, marginTop: 8,
    fontSize: 14.5, fontWeight: 600, lineHeight: 1.2, color: C.muted,
  },
  heroStrip: {
    display: 'flex', alignItems: 'center', gap: 9, width: '100%',
    padding: '11px 14px', background: 'transparent',
    borderTop: `1px solid ${C.tint}`, borderLeft: 'none', borderRight: 'none',
    borderBottom: 'none', font: 'inherit', textAlign: 'left', cursor: 'pointer',
  },
  // Before an address is set there is no provider logo, and the full-colour
  // KurbConnect PNG has navy lettering that vanishes on the navy header. This
  // is the same lockup drawn light, so it reads on the banner.
  headWordLockup: { display: 'flex', alignItems: 'center', gap: 8 },
  headWordMark: {
    borderRadius: 9, border: '2px solid #FFFFFF', boxSizing: 'border-box',
    background: '#0B1E3F', objectFit: 'cover', display: 'block', flexShrink: 0,
  },
  headWordText: { fontWeight: 800, letterSpacing: '-0.03em', color: '#FFFFFF', lineHeight: 1 },
  headLogo: { height: 52, maxWidth: 250, objectFit: 'contain', display: 'block' },
  headLockup: {
    display: 'block', margin: '5px auto 0', height: 'auto',
    objectFit: 'contain',
    position: 'relative',   // must sit above the absolutely-positioned artwork
  },
  headKurb: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 2 },
  headKurbName: { fontSize: 15, fontWeight: 600, letterSpacing: '-0.02em' },
  headAddress: {
    display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 5,
    width: '100%', marginTop: 6, padding: 0,
    background: 'none', border: 'none', font: 'inherit', fontSize: 14.5,
    color: 'rgba(255,255,255,0.92)', cursor: 'pointer',
  },
  headAddressText: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '72%' },
  headTitle: { margin: '4px 0 0', fontSize: 28, lineHeight: 1.28, fontWeight: 700, letterSpacing: '-0.035em', color: '#FFFFFF' },

  // ---- Splash / welcome (full-screen brand) ----
  brandScreen: {
    position: 'fixed', inset: 0, zIndex: 100, overflow: 'hidden',
    background: C.navy, fontFamily: font, color: '#FFFFFF',
    display: 'flex', flexDirection: 'column',
  },
  // The art is a 1200x800 landscape; stretched over a portrait phone the arcs
  // swallow the screen, so it is sized to the viewport width and parked in the
  // bottom-right corner. Its own navy is lighter than C.navy, so the top edge
  // would draw a seam across the screen — the mask fades that edge out. Sizing
  // the element to the artwork (rather than the screen) keeps that fade on the
  // edge whatever the screen's shape.
  brandArt: {
    position: 'absolute', right: 0, bottom: 0, pointerEvents: 'none',
    width: 'min(165%, 760px)', aspectRatio: '1200 / 800',
    backgroundImage: "url('/header-bg.webp')",
    backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat',
    WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 16%)',
    maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 16%)',
  },
  brandInner: {
    position: 'relative', flex: 1, boxSizing: 'border-box',
    width: '100%', maxWidth: 480, margin: '0 auto',
    display: 'flex', flexDirection: 'column',
    padding: '0 28px',
    paddingTop: 'calc(24px + env(safe-area-inset-top))',
    paddingBottom: 'calc(26px + env(safe-area-inset-bottom))',
  },
  brandCenter: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', textAlign: 'center',
  },
  // The mark is itself a navy rounded tile, so the frame supplies the white
  // outline and clips the artwork's own corners to the same radius.
  brandMarkFrame: {
    display: 'flex', width: 104, height: 104, borderRadius: 26,
    border: '3px solid #FFFFFF', boxSizing: 'border-box',
    background: '#0B1E3F', overflow: 'hidden', flexShrink: 0,
    boxShadow: '0 0 30px rgba(4, 97, 254, 0.45)',
  },
  brandMarkImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  brandWord: {
    marginTop: 18, fontSize: 38, fontWeight: 800,
    letterSpacing: '-0.035em', lineHeight: 1.05, color: '#FFFFFF',
  },
  brandWordAccent: { color: '#2B7BFF' },
  brandHeadline: {
    margin: '34px 0 0', fontSize: 30, fontWeight: 800,
    letterSpacing: '-0.035em', lineHeight: 1.2, color: '#FFFFFF',
    whiteSpace: 'pre-line',
  },
  brandSub: {
    margin: '12px 0 0', fontSize: 16, fontWeight: 500,
    lineHeight: 1.45, color: 'rgba(255, 255, 255, 0.78)',
  },
  brandCta: {
    display: 'flex', alignItems: 'center', gap: 6, width: '100%',
    padding: '17px 20px', borderRadius: 999, border: 'none',
    background: C.brand, color: '#FFFFFF', fontFamily: 'inherit',
    fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em',
    cursor: 'pointer', boxSizing: 'border-box',
    boxShadow: '0 10px 26px rgba(4, 97, 254, 0.42)',
  },
  brandCtaHint: {
    marginTop: 14, textAlign: 'center', fontSize: 14,
    color: 'rgba(255, 255, 255, 0.62)',
  },
  brandProviderLogo: { maxWidth: 250, maxHeight: 160, objectFit: 'contain', display: 'block' },
  brandLockup: { display: 'block', width: 196, height: 'auto', margin: '20px auto 0' },

  // ---- Info card (an explanation, not a warning) ----
  infoCard: {
    display: 'flex', gap: 12, alignItems: 'flex-start',
    margin: '14px 14px 0', padding: '13px 14px',
    background: C.tintSoft, border: `1px solid ${C.tint}`, borderRadius: 16,
  },
  infoIcon: {
    width: 38, height: 38, borderRadius: 11, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: C.paper,
  },
  infoTitle: { fontSize: 15.5, fontWeight: 700, color: C.ink, letterSpacing: '-0.01em' },
  infoBody: { fontSize: 13.5, color: C.muted, lineHeight: 1.45, marginTop: 2 },
  // Stand-ins for the store badges, so the card showing them is laid out now
  // and only the artwork and links change when the listings go live.
  storeRow: { display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  storeBtn: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    padding: '7px 14px', borderRadius: 9, background: C.paper,
    border: `1px solid ${C.tint}`, color: C.faint,
    fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em',
  },
  storeNote: { display: 'block', marginTop: 7, fontSize: 12, color: C.faint },

  // The same card as infoCard above, in the warning palette: used where a
  // message reports a problem rather than explaining something.
  alertCard: {
    display: 'flex', gap: 12, alignItems: 'center',
    margin: '14px 14px 0', padding: '13px 14px',
    background: C.holidayWarn, border: `1px solid ${C.holiday}`, borderRadius: 16,
  },
  alertCardIcon: {
    width: 38, height: 38, borderRadius: 11, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: C.paper,
  },
  alertCardText: {
    flex: 1, minWidth: 0, fontSize: 14.5, fontWeight: 600,
    color: C.holidayInk, lineHeight: 1.45, letterSpacing: '-0.01em',
  },

  // ---- Day cards ----
  dayCard: {
    margin: '0 14px 6px', background: C.paper,
    border: `1px solid ${C.rule}`, borderRadius: 18, overflow: 'hidden',
    boxShadow: '0 1px 2px rgba(2, 20, 60, 0.05)',
  },
  dayCardTop: { display: 'flex', gap: 11, padding: '8px 9px 9px' },
  dateBlock: { width: 62, flexShrink: 0, borderRadius: 11, padding: '6px 0 6px', textAlign: 'center', alignSelf: 'flex-start' },
  dateBlockDow: { fontSize: 12.5, fontWeight: 700, lineHeight: 1.1, letterSpacing: '0.03em', color: C.brand },
  dateBlockNum: { fontSize: 42, fontWeight: 700, lineHeight: 0.98, letterSpacing: '-0.04em', color: C.ink, margin: '2px 0 3px' },
  // Coming-up days are secondary, so their block is a size down.
  dateBlockNumSm: { fontSize: 33, margin: '1px 0 2px' },
  dateBlockDowSm: { fontSize: 11.5 },
  dateBlockMonSm: { fontSize: 10 },
  dateBlockMon: { fontSize: 10.5, fontWeight: 700, lineHeight: 1.1, letterSpacing: '0.04em', color: C.body },
  dayHeadRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  dayHeadDate: { fontSize: 15, fontWeight: 700, lineHeight: 1.25, color: C.ink, letterSpacing: '-0.025em' },
  dayHeadRel: { fontSize: 16.5, fontWeight: 700, color: C.ink, letterSpacing: '-0.015em' },
  pill: {
    fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 999,
    background: C.brand, color: '#FFFFFF', whiteSpace: 'nowrap', flexShrink: 0,
  },
  svcRow: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px',
    borderRadius: 8, marginTop: 4, minHeight: 24,
    background: C.paper, border: `1px solid ${C.rule}`,
  },
  svcRowPlain: {
    display: 'flex', alignItems: 'center', gap: 9, padding: 0,
    marginTop: 2, minHeight: 23, background: 'none', border: 'none',
  },
  svcIconTile: { width: 22, height: 22, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  svcName: { fontSize: 15, fontWeight: 600, lineHeight: 1.2, letterSpacing: '-0.012em', color: C.ink },
  setoutRow: { display: 'flex', alignItems: 'center', gap: 5, marginTop: 5, fontSize: 12.5, fontWeight: 600, lineHeight: 1.2, color: C.muted },
  reminderStrip: {
    display: 'flex', alignItems: 'center', gap: 9, width: '100%',
    padding: '6px 13px', background: C.reminderBg,
    borderTop: `1px solid ${C.rule}`, borderLeft: 'none', borderRight: 'none', borderBottom: 'none',
    font: 'inherit', textAlign: 'left', cursor: 'pointer',
  },
  reminderText: { flex: 1, fontSize: 14, fontWeight: 600, lineHeight: 1.3, color: C.brand },

  // ---- Calendar strip ----
  stripWrap: { display: 'flex', gap: 6, padding: '0 14px 14px' },
  stripDay: {
    flex: 1, borderRadius: 10, padding: '7px 0 6px', textAlign: 'center',
    border: `1px solid ${C.rule}`, background: C.paper, font: 'inherit',
  },
  stripDow: { fontSize: 10.5, fontWeight: 600 },
  stripNum: { fontSize: 15.5, fontWeight: 700, marginTop: 1, letterSpacing: '-0.02em' },

  // ---- Restyle overrides (later keys win) ----
  groupHead: {
    fontSize: 22, fontWeight: 700, color: C.ink, letterSpacing: '-0.03em',
    textAlign: 'left', padding: '13px 16px 6px',
  },
  agendaHead: {
    fontSize: 22, fontWeight: 700, color: C.ink, letterSpacing: '-0.03em',
    textAlign: 'left', padding: '5px 16px 5px',
  },
  card: {
    margin: '0 14px', background: C.paper, border: `1px solid ${C.rule}`,
    borderRadius: 18, overflow: 'hidden',
    boxShadow: '0 1px 2px rgba(2, 20, 60, 0.05)',
  },
  settingName: { fontSize: 15.5, fontWeight: 600, color: C.ink, letterSpacing: '-0.01em' },

  // A reassurance, the counterpart to alertCard: nothing is changing.
  okCard: {
    display: 'flex', gap: 12, alignItems: 'center',
    margin: '0 14px', padding: '13px 14px',
    background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 16,
  },
  holidayHeroName: {
    fontSize: 21, fontWeight: 800, letterSpacing: '-0.03em',
    lineHeight: 1.2, color: C.ink,
  },
  holidayHeroDate: { fontSize: 14.5, color: C.muted, marginTop: 4 },

  // ---- Guidelines accordion ----
  accHead: {
    display: 'flex', alignItems: 'center', gap: 12, width: '100%',
    padding: '13px 14px', background: 'none', border: 'none',
    font: 'inherit', textAlign: 'left', cursor: 'pointer',
  },
  accTitle: { fontSize: 16.5, fontWeight: 700, color: C.ink, letterSpacing: '-0.02em' },
  accBody: { padding: '0 14px 4px', borderTop: `1px solid ${C.ruleSoft}` },
  accSection: { padding: '12px 0 2px' },
  accSectionTitle: {
    fontSize: 15, fontWeight: 700, color: C.ink,
    letterSpacing: '-0.015em', marginBottom: 4,
  },
  accSectionBody: { fontSize: 14.5, lineHeight: 1.55, color: C.body },

  // ---- Settings rows ----
  setRow: {
    display: 'flex', alignItems: 'center', gap: 13, width: '100%',
    padding: '10px 14px', textAlign: 'left', background: 'none',
    border: 'none', borderBottom: `1px solid ${C.ruleSoft}`,
    font: 'inherit', textDecoration: 'none', boxSizing: 'border-box',
  },
  setRowLast: {
    display: 'flex', alignItems: 'center', gap: 13, width: '100%',
    padding: '10px 14px', textAlign: 'left', background: 'none',
    border: 'none', font: 'inherit', textDecoration: 'none', boxSizing: 'border-box',
  },
  iconTile: {
    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  valueRight: { fontSize: 15, color: C.muted, marginLeft: 'auto', whiteSpace: 'nowrap' },

  // ---- Segmented control ----
  segTrack: { display: 'grid', gap: 3, background: C.ruleSoft, borderRadius: 999, padding: 3 },
  segBtn: {
    padding: '10px 6px', border: 'none', borderRadius: 999, fontSize: 14.5,
    fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
    background: 'transparent', color: C.muted, transition: 'background 0.12s',
  },
  segBtnOn: { background: C.brand, color: C.paper },

  // ---- Danger ----
  dangerCard: {
    display: 'flex', alignItems: 'center', gap: 12, width: 'calc(100% - 28px)',
    margin: '20px 14px 4px', padding: '14px 15px', textAlign: 'left',
    background: C.paper, border: '1.5px solid #FECACA', borderRadius: 16,
    font: 'inherit', cursor: 'pointer', boxSizing: 'border-box',
  },
  dangerText: { flex: 1, fontSize: 15.5, fontWeight: 700, color: '#DC2626', lineHeight: 1.3 },

  // ---- Calendar header card ----
  calCard: { margin: '16px 14px 14px', background: C.paper, border: `1px solid ${C.rule}`, borderRadius: 16 },
  monthRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 10px 10px' },
  monthLabel: { fontSize: 18, fontWeight: 700, color: C.navy, letterSpacing: '-0.025em' },
  monthBtn: {
    width: 34, height: 34, borderRadius: 10, border: `1px solid ${C.rule}`,
    background: C.paper, display: 'flex', alignItems: 'center',
    justifyContent: 'center', cursor: 'pointer', padding: 0, flexShrink: 0,
  },
  // A whole row that navigates — reset so it inherits the card's type.
  rowBtn: {
    display: 'block', width: '100%', background: 'none', border: 'none',
    padding: 0, margin: 0, font: 'inherit', textAlign: 'left', cursor: 'pointer',
  },
  listHead: { fontSize: 13.5, fontWeight: 700, color: C.ink, letterSpacing: '0.025em' },

  // The white content area tucks under the navy with rounded top corners.
  contentSheet: {
    position: 'relative',
    marginTop: -20,
    background: C.paper,
    borderRadius: '22px 22px 0 0',
    // flow-root, not padding: without it a child's top margin collapses out
    // of this box and drags the panel down instead of the child, so the first
    // card lands on the rounded edge.
    display: 'flow-root',
  },

  // Report bar: fixed above the tab bar so the schedule scrolls behind it.
  // Sits in the flow under the hero card. It used to be pinned above the tab
  // bar, which meant the list had to be padded to clear it.
  reportRow: {
    display: 'flex', alignItems: 'center', gap: 12,
    width: 'calc(100% - 28px)', margin: '0 14px 14px', padding: '14px 15px',
    textAlign: 'left', background: C.paper, border: `1px solid ${C.rule}`,
    borderRadius: 16, font: 'inherit', cursor: 'pointer', boxSizing: 'border-box',
    boxShadow: '0 1px 2px rgba(2, 20, 60, 0.05)',
  },
  reportIcon: {
    width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },

  // ---- Month calendar ----
  monthGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, padding: '0 8px 10px' },
  dowCell: { textAlign: 'center', fontSize: 10, fontWeight: 700, color: C.faint, letterSpacing: '0.04em', paddingBottom: 4 },
  dayCell: {
    position: 'relative', aspectRatio: '1 / 1', minHeight: 38, borderRadius: 9,
    background: C.cell, border: '1.5px solid transparent',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', font: 'inherit', padding: 0, cursor: 'default',
  },
  dayNum: { fontSize: 14.5, fontWeight: 600, color: C.ink, lineHeight: 1 },
  dayDot: { width: 6, height: 6, borderRadius: '50%', background: C.brand, marginTop: 3 },
  dayDotSpacer: { width: 6, height: 6, marginTop: 3 },
  legendRow: {
    display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap',
    padding: '0 12px 12px', fontSize: 11.5, color: C.muted,
  },
  legendSwatch: { width: 9, height: 9, borderRadius: '50%', flexShrink: 0 },

  // ---- Holiday cards ----
  holidayBlock: {
    width: 58, flexShrink: 0, borderRadius: 10, padding: '7px 0',
    textAlign: 'center', background: C.holidaySoft, alignSelf: 'stretch',
    display: 'flex', flexDirection: 'column', justifyContent: 'center',
  },
  holidayMon: { fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', color: C.holidayInk },
  holidayNum: { fontSize: 23, fontWeight: 700, lineHeight: 1.05, color: C.ink, letterSpacing: '-0.03em' },
  holidayName: { fontSize: 15.5, fontWeight: 700, color: C.ink, letterSpacing: '-0.015em' },
  holidayWhat: { fontSize: 13.5, fontWeight: 600, marginTop: 1 },
  holidayWhen: { fontSize: 12.5, color: C.muted, marginTop: 2 },

  // ---- Day sheet ----
  scrim: {
    position: 'fixed', inset: 0, background: 'rgba(6, 18, 44, 0.45)',
    zIndex: 60, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    border: 'none', padding: 0,
  },
  sheet: {
    width: '100%', maxWidth: 480, background: C.paper,
    borderRadius: '20px 20px 0 0', padding: '8px 16px 16px',
    paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
    boxShadow: '0 -8px 30px rgba(2, 20, 60, 0.18)', textAlign: 'left',
  },
  sheetGrip: { width: 38, height: 4, borderRadius: 2, background: C.rule, margin: '0 auto 10px' },
  sheetTitle: { fontSize: 23, fontWeight: 700, color: C.ink, letterSpacing: '-0.03em', lineHeight: 1.15 },
  sheetSub: { fontSize: 14, color: C.muted, marginTop: 2 },
  sheetClose: {
    width: 30, height: 30, borderRadius: '50%', border: 'none', flexShrink: 0,
    background: C.ruleSoft, display: 'flex', alignItems: 'center',
    justifyContent: 'center', cursor: 'pointer', padding: 0,
  },
  warnCard: {
    display: 'flex', gap: 10, marginTop: 12, padding: '11px 13px',
    background: C.holidayWarn, borderRadius: 12,
  },
  warnTitle: { fontSize: 14.5, fontWeight: 700, color: C.holidayInk, lineHeight: 1.25 },
  warnBody: { fontSize: 13.5, color: C.holidayInk, opacity: 0.85, marginTop: 1 },
  doneBtn: {
    width: '100%', marginTop: 14, padding: '14px 0', borderRadius: 13,
    border: 'none', background: C.brand, color: '#FFFFFF',
    fontFamily: 'inherit', fontSize: 16.5, fontWeight: 700, cursor: 'pointer',
  },

  // ---- Compact header (sub-screens) ----
  headCompactRow: { display: 'flex', alignItems: 'center', gap: 10, minHeight: 30 },
  backBtn: {
    display: 'flex', alignItems: 'center', gap: 1, background: 'none', border: 'none',
    padding: 0, font: 'inherit', fontSize: 15.5, fontWeight: 500,
    color: 'rgba(255,255,255,0.92)', cursor: 'pointer', flexShrink: 0,
  },
}

export function parseDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function formatDate(iso, locale = 'en-US') {
  return parseDate(iso).toLocaleDateString(locale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

export function shortDate(iso, locale = 'en-US') {
  return parseDate(iso).toLocaleDateString(locale, { month: 'short', day: 'numeric' })
}

export function weekday(iso, locale = 'en-US') {
  return parseDate(iso).toLocaleDateString(locale, { weekday: 'long' })
}

export function daysUntil(iso) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((parseDate(iso) - today) / 86400000)
}

export function relative(iso, t) {
  const days = daysUntil(iso)
  if (days === 0) return t.today
  if (days === 1) return t.tomorrow
  return t.inDays(days)
}