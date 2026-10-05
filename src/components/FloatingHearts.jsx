export default function FloatingHearts() {
  return (
    <div className="floating-hearts" aria-hidden="true">
      {['♥', '♡', '✦', '♥', '♡'].map((icon, i) => (
        <span key={i} className="floating-heart" style={{ '--i': i }}>
          {icon}
        </span>
      ))}
    </div>
  )
}
