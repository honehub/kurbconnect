import { useState, useEffect, useRef } from 'react'
import { searchAddresses } from './supabase'
import { S, C } from './styles'

export default function AddressInput({ value, onChange, onSelect, onSubmit, placeholder }) {
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const skipNext = useRef(false)

  useEffect(() => {
    if (skipNext.current) {
      skipNext.current = false
      return
    }
    const q = value.trim()
    if (q.length < 3) {
      setItems([])
      setOpen(false)
      return
    }
    const timer = setTimeout(async () => {
      const rows = await searchAddresses(q)
      setItems(rows)
      setOpen(rows.length > 0)
      setActive(-1)
    }, 220)
    return () => clearTimeout(timer)
  }, [value])

  function choose(item) {
    skipNext.current = true
    setOpen(false)
    setItems([])
    onSelect({
      label: pretty(item.full_address) + (item.unit ? ` #${item.unit}` : ''),
      lat: item.lat,
      lng: item.lng,
    })
  }

  function onKeyDown(e) {
    if (!open || items.length === 0) {
      if (e.key === 'Enter') onSubmit()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, items.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (active >= 0) choose(items[active])
      else onSubmit()
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <input
        id="addr"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => items.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 160)}
        placeholder={placeholder}
        style={S.input}
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
      />

      {open && (
        <ul style={list}>
          {items.map((it, i) => (
            <li key={`${it.full_address}|${it.unit || ''}|${i}`}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(it)}
                style={{ ...row, background: i === active ? '#F1F5F9' : '#fff' }}
              >
                {pretty(it.full_address)}
                {it.unit ? <span style={unitTag}> #{it.unit}</span> : null}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function pretty(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/\b[a-z]/g, (c) => c.toUpperCase())
    .replace(/\bFm\b/g, 'FM')
    .replace(/\bUs\b/g, 'US')
    .replace(/\bRr\b/g, 'RR')
    .replace(/\b(\d+)(St|Nd|Rd|Th)\b/g, (_, n, suf) => n + suf.toLowerCase())
}

const list = {
  position: 'absolute',
  top: 'calc(100% + 4px)',
  left: 0,
  right: 0,
  margin: 0,
  padding: 0,
  listStyle: 'none',
  background: '#fff',
  border: `1px solid ${C.rule}`,
  borderRadius: 8,
  boxShadow: '0 6px 20px rgba(15,23,42,0.10)',
  overflow: 'hidden',
  zIndex: 50,
  maxHeight: 280,
  overflowY: 'auto',
}

const row = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  padding: '11px 14px',
  border: 'none',
  borderBottom: `1px solid ${C.ruleSoft}`,
  fontSize: 15,
  fontFamily: 'inherit',
  color: C.ink,
  cursor: 'pointer',
}

const unitTag = { color: C.muted, fontSize: 13 }