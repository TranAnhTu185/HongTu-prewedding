const hearts = [
  { icon: '♥', left: '6%', size: '1rem', duration: '10s', delay: '-2s' },
  { icon: '♥', left: '5%', size: '0.65rem', duration: '12s', delay: '-25s' },
  { icon: '♡', left: '8%', size: '0.6rem', duration: '14s', delay: '-10s' },
  { icon: '♥', left: '3%', size: '0.65rem', duration: '13s', delay: '-7s' },
  { icon: '♥', left: '11%', size: '0.8rem', duration: '15s', delay: '-11s' },
  { icon: '♡', left: '14%', size: '0.7rem', duration: '12s', delay: '-3s' },
  { icon: '♡', left: '18%', size: '1.4rem', duration: '13s', delay: '-8s' },
  { icon: '♡', left: '19%', size: '0.7rem', duration: '15s', delay: '-32s' },
  { icon: '♥', left: '22%', size: '0.65rem', duration: '15s', delay: '-4s' },
  { icon: '♥', left: '27%', size: '0.75rem', duration: '11s', delay: '-9s' },
  { icon: '♡', left: '30%', size: '0.6rem', duration: '15s', delay: '-3s' },
  { icon: '♥', left: '34%', size: '0.9rem', duration: '9s', delay: '-5s' },
  { icon: '♥', left: '36%', size: '0.65rem', duration: '11s', delay: '-21s' },
  { icon: '♡', left: '39%', size: '0.7rem', duration: '12s', delay: '-10s' },
  { icon: '♡', left: '43%', size: '0.85rem', duration: '16s', delay: '-6s' },
  { icon: '♥', left: '45%', size: '0.6rem', duration: '13s', delay: '-11s' },
  { icon: '♥', left: '47%', size: '0.7rem', duration: '13s', delay: '-12s' },
  { icon: '♥', left: '52%', size: '1.25rem', duration: '12s', delay: '-10s' },
  { icon: '♡', left: '54%', size: '0.7rem', duration: '16s', delay: '-35s' },
  { icon: '♥', left: '57%', size: '0.65rem', duration: '14s', delay: '-1s' },
  { icon: '♥', left: '61%', size: '0.75rem', duration: '10s', delay: '-9s' },
  { icon: '♡', left: '64%', size: '0.7rem', duration: '14s', delay: '-2s' },
  { icon: '♥', left: '66%', size: '0.6rem', duration: '16s', delay: '-6s' },
  { icon: '♡', left: '68%', size: '1rem', duration: '11s', delay: '-4s' },
  { icon: '♥', left: '70%', size: '0.65rem', duration: '13s', delay: '-26s' },
  { icon: '♡', left: '72%', size: '0.65rem', duration: '13s', delay: '-8s' },
  { icon: '♥', left: '76%', size: '0.9rem', duration: '15s', delay: '-13s' },
  { icon: '♥', left: '79%', size: '0.75rem', duration: '12s', delay: '-5s' },
  { icon: '♥', left: '83%', size: '1.5rem', duration: '14s', delay: '-7s' },
  { icon: '♡', left: '81%', size: '0.7rem', duration: '15s', delay: '-30s' },
  { icon: '♡', left: '86%', size: '0.65rem', duration: '12s', delay: '-9s' },
  { icon: '♥', left: '94%', size: '0.85rem', duration: '10s', delay: '-1s' },
  { icon: '♡', left: '89%', size: '0.7rem', duration: '16s', delay: '-12s' },
  { icon: '♥', left: '97%', size: '0.65rem', duration: '12s', delay: '-22s' },
]

export default function FallingHearts() {
  return (
    <div className="falling-hearts" aria-hidden="true">
      {hearts.map((heart, index) => (
        <span
          key={index}
          className="falling-heart"
          style={{
            '--heart-left': heart.left,
            '--heart-size': heart.size,
            '--heart-duration': heart.duration,
            '--heart-delay': heart.delay,
          }}
        >
          {heart.icon}
        </span>
      ))}
    </div>
  )
}
