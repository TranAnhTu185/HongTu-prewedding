import { useState, useEffect, useCallback, useRef } from "react";
import { weddingConfig } from "./data/weddingConfig";
import MusicPlayer from "./components/MusicPlayer";
import PhotoGallery from "./components/PhotoGallery";
import LoveTimeline from "./components/LoveTimeline";
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

function Envelope({ onOpen, inviteeName }) {
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
          {inviteeName && <p className="envelope-guest">{inviteeName}</p>}
          <p className="envelope-intro">Đến dự buổi tiệc thân mật chung vui cùng gia đình chúng tôi</p>
          <h1 className="envelope-names">
            <span className="envelope-name">{weddingConfig.groom.name}</span>
            <span className="ampersand" aria-label="và">&</span>
            <span className="envelope-name">{weddingConfig.bride.name}</span>
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

function encodeInviteeName(name) {
  const bytes = new TextEncoder().encode(name);
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function decodeInviteeName(token) {
  try {
    const base64 = token.replaceAll("-", "+").replaceAll("_", "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return new TextDecoder().decode(bytes).trim();
  } catch {
    return "";
  }
}

function getInviteeName() {
  const segments = window.location.pathname.split("/").filter(Boolean);
  if (segments[0] === "moi" && segments[1]) {
    const decoded = decodeInviteeName(segments[1]);
    if (decoded) return decoded;
    return decodeURIComponent(segments.slice(1).join(" ")).replaceAll("-", " ").trim();
  }

  const queryName = new URLSearchParams(window.location.search).get("to");
  if (queryName) return queryName.trim();

  if (segments.length === 1 && segments[0] !== "tao-link" && segments[0] !== "index.html") {
    return decodeURIComponent(segments[0]).replaceAll("+", " ").trim();
  }
  return "";
}

function InviteLinkCreator() {
  const [names, setNames] = useState("");
  const [invitees, setInvitees] = useState([]);
  const [status, setStatus] = useState("");

  const createLink = (event) => {
    event.preventDefault();
    const guestNames = [...new Set(names.split(/\r?\n/).map((guestName) => guestName.trim()).filter(Boolean))];
    if (!guestNames.length) return;
    setInvitees(guestNames.map((guestName) => ({
      name: guestName,
      url: `${window.location.origin}/moi/${encodeInviteeName(guestName)}`,
    })));
    setStatus("");
  };

  const copyText = async (text, successMessage) => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus(successMessage);
    } catch {
      setStatus("Không sao chép tự động được. Hãy chọn và sao chép link cần dùng.");
    }
  };

  return (
    <main className="invite-link-screen">
      <section className="invite-link-panel">
        <p className="envelope-sub">Thiệp cưới Anh Tú & Trần Hồng</p>
        <h1 className="invite-link-title">Tạo link mời riêng</h1>
        <p className="invite-link-intro">Nhập mỗi tên trên một dòng. Mỗi khách mời sẽ có một link riêng.</p>
        <form className="invite-link-form" onSubmit={createLink}>
          <label htmlFor="invitee-names">Danh sách khách mời</label>
          <textarea
            id="invitee-names"
            value={names}
            onChange={(event) => setNames(event.target.value)}
            maxLength={10000}
            rows={6}
            placeholder={'Ví dụ:\nTrần Tú\nNguyễn Minh Anh\nGia đình cô Lan'}
            required
          />
          <button type="submit" className="open-btn">Tạo link riêng cho từng người</button>
        </form>
        {invitees.length > 0 && (
          <div className="invite-link-result">
            <div className="invite-link-list-heading">
              <strong>Đã tạo {invitees.length} link riêng</strong>
              <button
                type="button"
                className="footer-action"
                onClick={() => copyText(invitees.map(({ name, url }) => `${name}: ${url}`).join("\n"), "Đã sao chép toàn bộ danh sách link mời.")}
              >Sao chép tất cả</button>
            </div>
            <div className="invite-link-list">
              {invitees.map(({ name, url }) => (
                <div className="invite-link-item" key={`${name}-${url}`}>
                  <label htmlFor={`invite-link-${encodeInviteeName(name)}`}>{name}</label>
                  <input id={`invite-link-${encodeInviteeName(name)}`} value={url} readOnly onFocus={(event) => event.target.select()} />
                  <div className="invite-link-actions">
                    <button type="button" className="footer-action" onClick={() => copyText(url, `Đã sao chép link của ${name}.`)}>Sao chép link</button>
                    <a className="footer-action" href={url} target="_blank" rel="noreferrer">Xem thử</a>
                  </div>
                </div>
              ))}
            </div>
            {status && <p className="footer-action-status" role="status">{status}</p>}
          </div>
        )}
        <p className="invite-link-note">Tên được mã hóa trong đường dẫn để thiệp có thể hiện lời mời riêng. Đây là mã URL-safe, không phải mã bảo mật.</p>
      </section>
    </main>
  );
}

function Countdown() {
  const time = useCountdown(weddingConfig.weddingDateTime || weddingConfig.weddingDate);

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [submissionError, setSubmissionError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const endpoint = weddingConfig.rsvpEndpoint;
    if (!endpoint) {
      setSubmissionError(true);
      setSubmissionMessage("Form xác nhận đang chờ kết nối Google Sheets. Vui lòng liên hệ cô dâu chú rể để xác nhận.");
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(false);
    try {
      await fetch(endpoint, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          ...form,
          guests: form.attending === "yes" ? form.guests : "0",
          submittedAt: new Date().toISOString(),
        }),
      });
      setSubmitted(true);
      setSubmissionMessage("Đã gửi yêu cầu xác nhận. Cảm ơn bạn!");
    } catch {
      setSubmissionError(true);
      setSubmissionMessage("Chưa gửi được xác nhận. Vui lòng thử lại hoặc liên hệ cô dâu chú rể.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rsvp-thanks">
        <div className="heart-icon">♥</div>
        <h3>Cảm ơn bạn!</h3>
        <p>{submissionMessage}</p>
        <p>Hẹn gặp bạn trong ngày vui!</p>
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
      <button type="submit" className="submit-btn" disabled={isSubmitting}>
        {isSubmitting ? "Đang gửi…" : "Gửi xác nhận"}
      </button>
      {submissionMessage && (
        <p className={`rsvp-storage-note ${submissionError ? "rsvp-storage-note--error" : ""}`} role="status">
          {submissionMessage}
        </p>
      )}
    </form>
  );
}

function ShareInviteButton() {
  const [message, setMessage] = useState("");

  const handleShare = async () => {
    const shareData = {
      title: document.title,
      text: `Mời bạn cùng chung vui ngày cưới của ${weddingConfig.groom.name} và ${weddingConfig.bride.name}.`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        if (error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareData.url);
      setMessage("Đã sao chép liên kết thiệp.");
    } catch {
      setMessage("Bạn có thể sao chép liên kết thiệp từ thanh địa chỉ.");
    }
  };

  return (
    <div className="footer-action-wrap">
      <button type="button" className="footer-action" onClick={handleShare}>
        <span aria-hidden="true">↗</span>
        Chia sẻ thiệp
      </button>
      {message && <span className="footer-action-status" role="status">{message}</span>}
    </div>
  );
}

function saveWeddingDate() {
  const escapeIcs = (value) => String(value || "")
    .replaceAll("\\", "\\\\")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,")
    .replaceAll("\n", "\\n");
  const stamp = new Date().toISOString().replaceAll("-", "").replaceAll(":", "").replace(/\.\d{3}/, "");
  const calendarEvents = weddingConfig.events.map((event, index) => {
    const date = (event.dateISO || weddingConfig.weddingDate).replaceAll("-", "");
    const eventTime = event.time || "09:00";
    const time = eventTime.replace(":", "");
    const [hours, minutes] = eventTime.split(":").map(Number);
    const endMinutes = hours * 60 + minutes + 60;
    const endHour = String(Math.floor(endMinutes / 60) % 24).padStart(2, "0");
    const endMinute = String(endMinutes % 60).padStart(2, "0");
    const nextDate = endMinutes >= 1440
      ? new Date(Date.UTC(Number(date.slice(0, 4)), Number(date.slice(4, 6)) - 1, Number(date.slice(6, 8)) + 1)).toISOString().slice(0, 10).replaceAll("-", "")
      : date;

    return [
      "BEGIN:VEVENT",
      `UID:${date}-${index}-wedding-invitation@card-online`,
      `DTSTAMP:${stamp}`,
      `DTSTART;TZID=Asia/Ho_Chi_Minh:${date}T${time}00`,
      `DTEND;TZID=Asia/Ho_Chi_Minh:${nextDate}T${endHour}${endMinute}00`,
      `SUMMARY:${escapeIcs(`${event.title}: ${weddingConfig.groom.name} & ${weddingConfig.bride.name}`)}`,
      `DESCRIPTION:${escapeIcs(`${event.date}, ${event.time}\n${event.venue}\n${event.address}\nBản đồ: ${event.mapUrl}\n\nThiệp cưới: ${window.location.href}`)}`,
      `LOCATION:${escapeIcs(`${event.venue}, ${event.address}`)}`,
      `URL:${event.mapUrl || window.location.href}`,
      "END:VEVENT",
    ].join("\r\n");
  }).join("\r\n");
  const details = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wedding Invitation//VI",
    "CALSCALE:GREGORIAN",
    calendarEvents,
    "END:VCALENDAR",
  ].join("\r\n");
  const file = new Blob([details], { type: "text/calendar;charset=utf-8" });
  const fileUrl = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = fileUrl;
  link.download = "ngay-cuoi-anh-tu-tran-hong.ics";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
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
  const inviteeName = getInviteeName();
  const isInviteLinkCreator = window.location.pathname.replace(/\/+$/, "") === "/tao-link";
  const musicRef = useRef(null);
  const { groom, bride, events, quote, bankInfo, heroPhoto, heroPhotoMobile, music, album, timeline } =
    weddingConfig;

  const handleOpen = () => {
    // Phát ngay trong sự kiện click (không chờ load — tránh mất quyền autoplay)
    musicRef.current?.play();
    setOpened(true);
  };

  if (isInviteLinkCreator) return <InviteLinkCreator />;

  return (
    <>
      <MusicPlayer ref={musicRef} url={music?.url} />

      {!opened ? (
        <Envelope onOpen={handleOpen} inviteeName={inviteeName} />
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
                <picture className="hero-banner__picture">
                  {heroPhotoMobile && <source media="(max-width: 600px)" srcSet={heroPhotoMobile} />}
                  <img
                    src={heroPhoto}
                    alt={`${groom.name} và ${bride.name}`}
                    fetchPriority="high"
                    decoding="async"
                  />
                </picture>
                <div className="hero-banner__overlay">
                  <p className="hero-sub">Save The Date</p>
                  <h1 className="hero-names hero-names--overlay">
                    <span>{groom.name}</span>
                    <span className="ampersand">&</span>
                    <span>{bride.name}</span>
                  </h1>
                  <p className="hero-banner-date">
                    {new Date(weddingConfig.weddingDate).toLocaleDateString("vi-VN", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  {events?.[0] && (
                    <p className="hero-banner-venue">
                      {events[0].venue} <span aria-hidden="true">·</span> {events[0].address}
                    </p>
                  )}
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

          {timeline?.length > 0 && (
            <ScrollReveal delay={60}>
              <section className="section timeline-section">
                <h2 className="section-title">Chuyện chúng mình</h2>
                <p className="section-sub">Một vài dấu mốc trên hành trình bên nhau</p>
                <LoveTimeline items={timeline} />
              </section>
            </ScrollReveal>
          )}

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
                {weddingConfig.video?.url && (
                  <div className="album-video">
                    <h3 className="album-video__title">{weddingConfig.video.title}</h3>
                    <video
                      className="album-video__player"
                      controls
                      playsInline
                      preload="none"
                      poster={weddingConfig.video.poster}
                      onPlay={() => musicRef.current?.pause()}
                    >
                      <source src={weddingConfig.video.url} type={weddingConfig.video.type || "video/mp4"} />
                      Trình duyệt của bạn không hỗ trợ phát video.
                    </video>
                  </div>
                )}
              </section>
            </ScrollReveal>
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
                {events.map((event) => {
                  const [day = "", month = "", year = ""] = event.date.split(",").at(-1).trim().split(".");
                  const weekday = event.date.split(",")[0];

                  return (
                    <div key={event.title} className="event-card">
                      <div className="event-card__cover">
                        <img src={event.cover} alt="" loading="lazy" decoding="async" />
                        <span className="event-card__side">Tiệc tại {event.side || "nhà trai"}</span>
                        <span className="event-card__cover-mark" aria-hidden="true">H <i>✦</i> T</span>
                      </div>
                      <div className="event-card__body">
                        <div className="event-card__topline">
                          <span className="event-card__eyebrow">Trân trọng kính mời</span>
                        </div>
                        <h3>{event.title}</h3>
                        <div className="event-detail event-detail--schedule">
                          <div className="event-time-lockup">
                            <span className="event-icon" aria-hidden="true">
                              <svg viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="8.5" />
                                <path d="M12 7v5l3.2 2" />
                              </svg>
                            </span>
                            <div>
                              <span className="event-meta-label">Bắt đầu lúc</span>
                              <strong>{event.time}</strong>
                            </div>
                          </div>
                          <div className="event-date-stamp">
                            <strong>{day}</strong>
                            <span>
                              <b>THÁNG {month}</b>
                              <small>{year}</small>
                              <small className="event-date-weekday">{weekday}</small>
                            </span>
                          </div>
                        </div>
                        <div className="event-detail event-detail--venue">
                          <span className="event-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none">
                              <path d="M19 10.2c0 5-7 10.3-7 10.3S5 15.2 5 10.2a7 7 0 1 1 14 0Z" />
                              <circle cx="12" cy="10" r="2.2" />
                            </svg>
                          </span>
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
                          <span>Xem bản đồ</span>
                          <span className="map-link__arrow" aria-hidden="true">↗</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
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
            <div className="footer-actions">
              <ShareInviteButton />
              <button type="button" className="footer-action" onClick={saveWeddingDate}>
                <span aria-hidden="true">▣</span>
                Lưu ngày cưới
              </button>
            </div>
            <p className="footer-action-hint">
              Lưu ngày cưới vào lịch hoặc chia sẻ thiệp với người thân.
            </p>
          </footer>
        </div>
      )}
    </>
  );
}

export default App;
