import { CAT_ICONS, ICONS, CAT_IMAGES } from './styles'

// One service's icon: the illustrated cart when we have artwork for that
// category, otherwise the line icon. Sized to the same optical weight either
// way, so a row of mixed icons still lines up.
export default function ServiceIcon({ category, iconName, size = 19, color }) {
  const src = CAT_IMAGES[category]

  if (src) {
    const box = Math.round(size * 1.3)
    return (
      <img
        src={src}
        alt=""
        width={box}
        height={box}
        style={{ width: box, height: box, objectFit: 'contain', display: 'block' }}
      />
    )
  }

  const Icon = CAT_ICONS[category] || ICONS[iconName] || CAT_ICONS.trash
  return <Icon size={size} color={color} strokeWidth={2} />
}
