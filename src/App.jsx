import { useState, useEffect, useCallback, useRef } from "react";
import { weddingConfig } from "./data/weddingConfig";
import MusicPlayer from "./components/MusicPlayer";
import PhotoGallery from "./components/PhotoGallery";
import ScrollReveal from "./components/ScrollReveal";
import SectionDivider from "./components/SectionDivider";
import WeddingCalendar from "./components/WeddingCalendar";
import CopyButton from "./components/CopyButton";
import FallingHearts from "./components/FallingHearts";
import "./App.css";

function useCountdown(targetDate) {
  const calc = useCallback(() => {
    const diff = new Date(targetDate) - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  }, [targetDate]);

  const [time, setTime] = useState(calc);

  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);

  return time;
}

function Envelope({ onOpen }) {
  return (
    <div className="envelope-screen">
      <div className="petals" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className="petal" style={{ "--i": i }} />
        ))}
      </div>
      <div className="envelope-content">
        <div className="envelope-frame">
          <p className="envelope-sub">Trân trọng kính mời</p>
          <h1 className="envelope-names">
            {weddingConfig.groom.name}
            <span className="ampersand"> & </span>
            {weddingConfig.bride.name}
          </h1>
          <p className="envelope-date">
            {new Date(weddingConfig.weddingDate).toLocaleDateString("vi-VN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <button type="button" className="open-btn" onClick={onOpen}>
            Mở thiệp
          </button>
        </div>
      </div>
    </div>
  );
}

function Countdown() {
  const time = useCountdown(weddingConfig.weddingDate);

  return (
    <div className="countdown">
      {[
        ["Ngày", time.days],
        ["Giờ", time.hours],
        ["Phút", time.minutes],
        ["Giây", time.seconds],
      ].map(([label, value]) => (
        <div key={label} className="countdown-item">
          <span className="countdown-value">
            {String(value).padStart(2, "0")}
          </span>
          <span className="countdown-label">{label}</span>
        </div>
      ))}
    </div>
  );
}

function RSVPForm() {
  const [form, setForm] = useState({
    name: "",
    guests: "1",
    attending: "yes",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const rsvps = JSON.parse(localStorage.getItem("wedding-rsvp") || "[]");
    rsvps.push({ ...form, submittedAt: new Date().toISOString() });
    localStorage.setItem("wedding-rsvp", JSON.stringify(rsvps));
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rsvp-thanks">
        <div className="heart-icon">♥</div>
        <h3>Cảm ơn bạn!</h3>
        <p>
          Lời xác nhận của bạn đã được ghi nhận. Hẹn gặp bạn trong ngày vui!
        </p>
        <p className="rsvp-storage-note">
          Thông tin đang được lưu trên thiết bị của bạn.
        </p>
      </div>
    );
  }

  return (
    <form className="rsvp-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name">Họ và tên</label>
        <input
          id="name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Nhập tên của bạn"
        />
      </div>
      <div className="form-group">
        <label htmlFor="attending">Bạn có tham dự không?</label>
        <select
          id="attending"
          value={form.attending}
          onChange={(e) => setForm({ ...form, attending: e.target.value })}
        >
          <option value="yes">Có, tôi sẽ đến</option>
          <option value="no">Rất tiếc, tôi không thể đến</option>
        </select>
      </div>
      {form.attending === "yes" && (
        <div className="form-group">
          <label htmlFor="guests">Số người tham dự</label>
          <select
            id="guests"
            value={form.guests}
            onChange={(e) => setForm({ ...form, guests: e.target.value })}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={String(n)}>
                {n} người
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="form-group">
        <label htmlFor="message">Lời chúc</label>
        <textarea
          id="message"
          rows={3}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Gửi lời chúc đến cô dâu chú rể..."
        />
      </div>
      <button type="submit" className="submit-btn">
        Gửi xác nhận
      </button>
      <p className="rsvp-storage-note">Xác nhận được lưu trên thiết bị này.</p>
    </form>
  );
}

function BankQr({ bank, bankCode, account, name }) {
  if (!bankCode) return null;

  const qrUrl = `https://img.vietqr.io/image/${bankCode}-${account}-compact2.png?addInfo=${encodeURIComponent("Mung cuoi")}&accountName=${encodeURIComponent(name)}`;

  return (
    <img
      className="bank-qr"
      src={qrUrl}
      alt={`Mã QR chuyển khoản ${bank}`}
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  );
}

function App() {
  const [opened, setOpened] = useState(false);
  const musicRef = useRef(null);
  const { groom, bride, events, quote, bankInfo, heroPhoto, music, album } =
    weddingConfig;

  const handleOpen = () => {
    // Phát ngay trong sự kiện click (không chờ load — tránh mất quyền autoplay)
    musicRef.current?.play();
    setOpened(true);
  };

  return (
    <>
      <MusicPlayer ref={musicRef} url={music?.url} />

      {!opened ? (
        <Envelope onOpen={handleOpen} />
      ) : (
        <div className="wedding-app wedding-app--open">
          <FallingHearts />
          <div className="petals petals--light" aria-hidden="true">
            {Array.from({ length: 14 }).map((_, i) => (
              <span key={i} className="petal" style={{ "--i": i }} />
            ))}
          </div>

          {/* Hero */}
          <header className="hero">
            {heroPhoto ? (
              <div className="hero-banner">
                <img
                  src={heroPhoto}
                  alt={`${groom.name} và ${bride.name}`}
                  fetchPriority="high"
                  decoding="async"
                />
                <div className="hero-banner__overlay">
                  <p className="hero-sub">Save The Date</p>
                  <h1 className="hero-names hero-names--overlay">
                    <span>{groom.name}</span>
                    <span className="ampersand">&</span>
                    <span>{bride.name}</span>
                  </h1>
                  {/* <p className="hero-banner-date">
                {new Date(weddingConfig.weddingDate).toLocaleDateString('vi-VN', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p> */}
                </div>
              </div>
            ) : (
              <>
                <p className="hero-sub">Save The Date</p>
                <h1 className="hero-names">
                  <span>{groom.name}</span>
                  <span className="ampersand">&</span>
                  <span>{bride.name}</span>
                </h1>
              </>
            )}
            {/* {!heroPhoto && (
          <p className="hero-date">
            {new Date(weddingConfig.weddingDate).toLocaleDateString('vi-VN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        )} */}
            {/* {events[0] && (
          <a className="hero-event" href={events[0].mapUrl} target="_blank" rel="noreferrer">
            <span>{events[0].time}</span>
            <span aria-hidden="true">·</span>
            <span>{events[0].venue}</span>
          </a>
        )} */}
            <div className="divider">
              <span>♥</span>
            </div>
            <WeddingCalendar dateStr={weddingConfig.weddingDate} />
          </header>

          <SectionDivider />

          {/* Quote */}
          <ScrollReveal>
            <section className="section quote-section">
              <blockquote>{quote}</blockquote>
            </section>
          </ScrollReveal>

          <SectionDivider />

          {/* Couple */}
          <ScrollReveal delay={80}>
            <section className="section couple-section">
              <h2 className="section-title">Cô Dâu & Chú Rể</h2>
              <div className="couple-cards">
                <div className="couple-card">
                  <div className="couple-avatar groom">
                    {groom.photo ? (
                      <img
                        src={groom.photo}
                        alt={groom.name}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      groom.name.charAt(0)
                    )}
                  </div>
                  <h3>{groom.fullName}</h3>
                  <p className="couple-parents">Con {groom.parents}</p>
                </div>
                <div className="couple-heart">♥</div>
                <div className="couple-card">
                  <div className="couple-avatar bride">
                    {bride.photo ? (
                      <img
                        src={bride.photo}
                        alt={bride.name}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      bride.name.charAt(0)
                    )}
                  </div>
                  <h3>{bride.fullName}</h3>
                  <p className="couple-parents">Con {bride.parents}</p>
                </div>
              </div>
            </section>
          </ScrollReveal>

          <SectionDivider />

          {/* Album ảnh cưới */}
          {album?.length > 0 && (
            <ScrollReveal delay={100}>
              <section className="section album-section">
                <h2 className="section-title">Album Ảnh Cưới</h2>
                <p className="section-sub">
                  Những khoảnh khắc đẹp nhất của chúng mình
                </p>
                <PhotoGallery photos={album} />
              </section>
            </ScrollReveal>
          )}

          {weddingConfig.video?.url && (
            <div>
              <SectionDivider />
              <ScrollReveal delay={100}>
                <section className="section album-section">
                  <div className="album-video">
                    {weddingConfig.video.title && (
                      <h2 className="section-title">
                        {" "}
                        {weddingConfig.video.title}
                      </h2>
                    )}
                <video
                  className="album-video__player"
                  controls
                  playsInline
                  preload="metadata"
                  poster={weddingConfig.video.poster}
                  onPlay={() => musicRef.current?.pause()}
                >
                      <source
                        src={weddingConfig.video.url}
                        type={weddingConfig.video.type || "video/mp4"}
                      />
                      Trình duyệt của bạn không hỗ trợ phát video.
                    </video>
                  </div>
                </section>
              </ScrollReveal>
            </div>
          )}

          <SectionDivider />

          {/* Countdown */}
          <ScrollReveal delay={80}>
            <section className="section countdown-section">
              <h2 className="section-title">Đếm Ngược</h2>
              <p className="section-sub">Đến ngày trọng đại</p>
              <Countdown />
            </section>
          </ScrollReveal>

          <SectionDivider />

          {/* Events */}
          <ScrollReveal delay={80}>
            <section className="section events-section">
              <h2 className="section-title">Thông Tin Sự Kiện</h2>
              <div className="events-grid">
                {events.map((event) => (
                  <div key={event.title} className="event-card">
                    <h3>{event.title}</h3>
                    <div className="event-detail">
                      <span className="event-icon">🕐</span>
                      <div>
                        <strong>{event.time}</strong>
                        <p>{event.date}</p>
                      </div>
                    </div>
                    <div className="event-detail">
                      <span className="event-icon">📍</span>
                      <div>
                        <strong>{event.venue}</strong>
                        <p>{event.address}</p>
                      </div>
                    </div>
                    <a
                      href={event.mapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="map-link"
                    >
                      Xem bản đồ
                    </a>
                  </div>
                ))}
              </div>
            </section>
          </ScrollReveal>

          <SectionDivider />

          {/* RSVP */}
          <ScrollReveal delay={80}>
            <section className="section rsvp-section">
              <h2 className="section-title">Xác Nhận Tham Dự</h2>
              <p className="section-sub">
                Sự hiện diện của bạn là niềm vinh hạnh của chúng tôi
              </p>
              <RSVPForm />
            </section>
          </ScrollReveal>

          <SectionDivider />

          {/* Gift */}
          <ScrollReveal delay={80}>
            <section className="section gift-section">
              <h2 className="section-title">Mừng Cưới</h2>
              <p className="section-sub">
                Nếu bạn muốn gửi lời chúc qua tài khoản
              </p>
              <div className="gift-cards">
                <div className="gift-card">
                  <p className="gift-label">Chú rể</p>
                  <p className="gift-name">{bankInfo.groom.name}</p>
                  <p>{bankInfo.groom.bank}</p>
                  <p className="gift-account">{bankInfo.groom.account}</p>
                  <BankQr {...bankInfo.groom} />
                  <CopyButton
                    text={bankInfo.groom.account}
                    label="Sao chép STK"
                  />
                </div>
                <div className="gift-card">
                  <p className="gift-label">Cô dâu</p>
                  <p className="gift-name">{bankInfo.bride.name}</p>
                  <p>{bankInfo.bride.bank}</p>
                  <p className="gift-account">{bankInfo.bride.account}</p>
                  <BankQr {...bankInfo.bride} />
                  <CopyButton
                    text={bankInfo.bride.account}
                    label="Sao chép STK"
                  />
                </div>
              </div>
            </section>
          </ScrollReveal>

          {/* Footer */}
          <footer className="footer">
            <p className="footer-names">
              {groom.name} & {bride.name}
            </p>
            <p className="footer-thanks">
              Cảm ơn bạn đã chia sẻ niềm vui cùng chúng tôi!
            </p>
            <p className="footer-date">
              {new Date(weddingConfig.weddingDate).toLocaleDateString("vi-VN")}
            </p>
          </footer>
        </div>
      )}
    </>
  );
}

export default App;
