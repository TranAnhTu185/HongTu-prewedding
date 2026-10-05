import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const INITIAL_COUNT = 6

export default function PhotoGallery({ photos }) {
  const [lightbox, setLightbox] = useState(null)
  const [previousLightbox, setPreviousLightbox] = useState(null)
  const [showAll, setShowAll] = useState(false)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const thumbsRef = useRef(null)
  const photoItems = photos || []
  const visiblePhotos = showAll ? photoItems : photoItems.slice(0, INITIAL_COUNT)
  const hasMore = !showAll && photoItems.length > INITIAL_COUNT

  const resetView = useCallback(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }, [])

  const open = useCallback((index) => {
    resetView()
    setPreviousLightbox(null)
    setLightbox(index)
  }, [resetView])

  const close = useCallback(() => setLightbox(null), [])
  const prev = useCallback(() => {
    resetView()
    setLightbox((index) => {
      if (index === null) return null
      setPreviousLightbox(index)
      return index > 0 ? index - 1 : photoItems.length - 1
    })
  }, [photoItems.length, resetView])
  const next = useCallback(() => {
    resetView()
    setLightbox((index) => {
      if (index === null) return null
      setPreviousLightbox(index)
      return index < photoItems.length - 1 ? index + 1 : 0
    })
  }, [photoItems.length, resetView])

  useEffect(() => {
    if (lightbox === null) return
    document.body.style.overflow = 'hidden'

    const onKeyDown = (e) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [close, lightbox, next, prev])

  useEffect(() => {
    if (lightbox === null) return

    const el = thumbsRef.current?.children?.[lightbox]

    el?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    })
  }, [lightbox])

  useEffect(() => {
    if (lightbox === null || photoItems.length < 2) return

    const intervalId = window.setInterval(() => {
      setLightbox((index) => {
        if (index === null) return null
        setPreviousLightbox(index)
        return (index + 1) % photoItems.length
      })
      resetView()
    }, 3000)

    return () => window.clearInterval(intervalId)
  }, [lightbox, photoItems.length, resetView])

  const zoom = (e) => {
    e.preventDefault()

    setScale((old) => {
      const next = old + (e.deltaY < 0 ? 0.2 : -0.2)
      return Math.min(4, Math.max(1, next))
    })
  }

  const resetZoom = () => {
    if (scale === 1) {
      setScale(2)
    } else {
      setScale(1)
      setPosition({ x: 0, y: 0 })
    }
  }

  if (!photoItems.length) return null

  return (
    <>
      <div className="gallery-grid photo-list">
        {visiblePhotos.map((photo, i) => (
          <button
            key={photo.src}
            type="button"
            className="gallery-item"
            onClick={() => open(i)}
          >
            <img src={photo.src} alt={photo.caption || ''} loading="lazy" />
          </button>
        ))}
      </div>

      {hasMore && (
        <button
          type="button"
          className="gallery-show-more submit-btn"
          onClick={() => open(0)}
        >
          <span>Khám phá thêm kỷ niệm</span>
          <span className="gallery-show-more__count">+{photoItems.length - INITIAL_COUNT} ảnh</span>
        </button>
      )}

      {lightbox !== null && createPortal(
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          onClick={close}
        >
          <div
            className="lightbox-header"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="lightbox-counter">
              {lightbox + 1} / {photoItems.length}
            </span>

            <button
              type="button"
              className="lightbox-close"
              onClick={close}
            >
              ×
            </button>
          </div>

          <button
            className="lightbox-nav lightbox-prev"
            onClick={(e) => {
              e.stopPropagation()
              prev()
            }}
          >
            ❮
          </button>
          <div
            className="lightbox-stage"
            onClick={(e) => e.stopPropagation()}
            onWheel={zoom}
          >
            <div className="lightbox-slide">
              {previousLightbox !== null && previousLightbox !== lightbox && (
                <div className="lightbox-photo-frame lightbox-photo-frame--leaving" key={`leaving-${photoItems[previousLightbox].src}`}>
                  <img src={photoItems[previousLightbox].fullSrc || photoItems[previousLightbox].src} alt="" draggable={false} />
                </div>
              )}
              <div className="lightbox-photo-frame lightbox-photo-frame--entering" key={`entering-${photoItems[lightbox].src}`}>
                <img
                  src={photoItems[lightbox].fullSrc || photoItems[lightbox].src}
                  alt={photoItems[lightbox].caption || ''}
                  draggable={false}
                  decoding="async"
                  onDoubleClick={resetZoom}
                  style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` }}
                />
              </div>
            </div>
          </div>

          <button
            className="lightbox-nav lightbox-next"
            onClick={(e) => {
              e.stopPropagation()
              next()
            }}
          >
            ❯
          </button>

          <div
            className="lightbox-thumbnails"
            ref={thumbsRef}
            onClick={(e) => e.stopPropagation()}
          >
            {photoItems.map((photo, index) => (
              <button
                key={photo.src}
                type="button"
                className={`lightbox-thumb ${index === lightbox ? 'active' : ''
                  }`}
                onClick={() => open(index)}
                aria-label={`Xem ảnh ${index + 1}: ${photo.caption || ''}`}
              >
                <img src={photo.src} alt="" loading="lazy" decoding="async" />
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
