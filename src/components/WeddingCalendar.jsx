export default function WeddingCalendar({ dateStr }) {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = date.getMonth()
  const weddingDay = date.getDate()

  const monthName = date.toLocaleDateString('vi-VN', { month: 'long' })
  const weekday = date.toLocaleDateString('vi-VN', { weekday: 'long' })

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startOffset = firstDay === 0 ? 6 : firstDay - 1 // Thứ 2 = 0

  const cells = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className="wedding-calendar">
      <p className="wedding-calendar__month">{monthName} {year}</p>
      <div className="wedding-calendar__weekdays">
        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="wedding-calendar__grid">
        {cells.map((day, i) => (
          <span
            key={i}
            className={`wedding-calendar__day ${day === weddingDay ? 'wedding-calendar__day--wedding' : ''} ${!day ? 'wedding-calendar__day--empty' : ''}`}
          >
            <span>{day || ''}</span>
          </span>
        ))}
      </div>
      <p className="wedding-calendar__note">
        {weekday}, {date.toLocaleDateString('vi-VN')}
      </p>
    </div>
  )
}
