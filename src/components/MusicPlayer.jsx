import { useState, forwardRef, useImperativeHandle, useRef, useEffect } from 'react'

const MusicPlayer = forwardRef(function MusicPlayer({ url }, ref) {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !url) return
    audio.volume = 0.4
    audio.load()
  }, [url])

  useImperativeHandle(ref, () => ({
    play: () => {
      const audio = audioRef.current
      if (!audio) return Promise.resolve(false)
      audio.volume = 0.4
      return audio.play().then(
        () => {
          setPlaying(true)
          return true
        },
        () => false,
      )
    },
    pause: () => {
      audioRef.current?.pause()
      setPlaying(false)
    },
  }))

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.volume = 0.4
      audio.play().then(() => setPlaying(true)).catch(() => {})
    }
  }

  if (!url) return null

  return (
    <>
      <audio
        ref={audioRef}
        src={url}
        loop
        preload="auto"
        playsInline
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <button
        type="button"
        className={`music-toggle ${playing ? 'music-toggle--playing' : ''}`}
        onClick={toggle}
        aria-label={playing ? 'Tắt nhạc' : 'Bật nhạc'}
        title={playing ? 'Tắt nhạc' : 'Bật nhạc'}
      >
        <span className="music-icon">{playing ? '♫' : '♪'}</span>
        <span className="music-label">{playing ? 'Đang phát' : 'Nhạc nền'}</span>
      </button>
    </>
  )
})

export default MusicPlayer
