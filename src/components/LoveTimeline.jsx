import { useState } from 'react'

export default function LoveTimeline({ items }) {
  const [lightbox, setLightbox] = useState(null)

  if (!items?.length) return null

  const photos = items.filter((item) => item.image)
  const openLightbox = (index) => setLightbox(index)
  const closeLightbox = () => setLightbox(null)
  const prev = () => setLightbox((i) => (i > 0 ? i - 1 : photos.length - 1))
  const next = () => setLightbox((i) => (i < photos.length - 1 ? i + 1 : 0))

  const photoIndex = (image) => photos.findIndex((p) => p.image === image)

  return (
    <>
      <div className="timeline">
        {items.map((item, i) => (
          <div key={`${item.date}-${item.title}`} className={`timeline-item ${i % 2 === 0 ? 'timeline-item--left' : 'timeline-item--right'}`}>
            <div className="timeline-marker">
              <span className="timeline-dot" />
            </div>

            <div className="timeline-card">
              <time className="timeline-date" dateTime={item.date}>
                {item.dateLabel || formatDate(item.date)}
              </time>
              <h3 className="timeline-title">{item.title}</h3>
              {item.description && <p className="timeline-desc">{item.description}</p>}
              {item.image && (
                <button
                  type="button"
                  className="timeline-photo"
                  onClick={() => openLightbox(photoIndex(item.image))}
                  aria-label={`Xem ảnh: ${item.title}`}
                >
                  <img src={item.image} alt={item.title} loading="lazy" />
                </button>
              )}
            </div>
          </div>
        ))}
        <div className="timeline-end">
          <span className="timeline-heart">♥</span>
        </div>
      </div>

      {lightbox !== null && photos[lightbox] && (
        <div className="lightbox" onClick={closeLightbox} role="dialog" aria-modal="true">
          <button type="button" className="lightbox-close" onClick={closeLightbox} aria-label="Đóng">
            ×
          </button>
          <button
            type="button"
            className="lightbox-nav lightbox-prev"
            onClick={(e) => { e.stopPropagation(); prev() }}
            aria-label="Ảnh trước"
          >
            ‹
          </button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={photos[lightbox].image} alt={photos[lightbox].title} />
            <p className="lightbox-caption">
              {photos[lightbox].title}
              {photos[lightbox].dateLabel && ` — ${photos[lightbox].dateLabel}`}
            </p>
          </div>
          <button
            type="button"
            className="lightbox-nav lightbox-next"
            onClick={(e) => { e.stopPropagation(); next() }}
            aria-label="Ảnh sau"
          >
            ›
          </button>
        </div>
      )}
    </>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
