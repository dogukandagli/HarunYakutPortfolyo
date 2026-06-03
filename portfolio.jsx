/* global React, ReactDOM */
const { useState, useEffect, useRef, useMemo } = React;

/* ---------------- Reveal hook ---------------- */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          el.classList.add('in');
          io.unobserve(el);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

/* ---------------- Custom cursor ---------------- */
function CustomCursor() {
  const dotRef = useRef(null);
  useEffect(() => {
    if (matchMedia('(hover: none)').matches) return;
    let x = 0, y = 0, tx = 0, ty = 0;
    const move = (e) => { x = e.clientX; y = e.clientY; };
    const tick = () => {
      tx += (x - tx) * 0.22;
      ty += (y - ty) * 0.22;
      if (dotRef.current) dotRef.current.style.transform = `translate(${tx}px, ${ty}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };
    let raf = requestAnimationFrame(tick);
    document.addEventListener('mousemove', move);
    const overEls = 'a, button, .work, .service-row, .nav-cta, .contact-mail';
    const onOver = (e) => { if (e.target.closest(overEls)) dotRef.current?.classList.add('hover'); };
    const onOut = (e) => { if (e.target.closest(overEls)) dotRef.current?.classList.remove('hover'); };
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
    };
  }, []);
  return <div ref={dotRef} className="cursor"></div>;
}

/* ---------------- Nav ---------------- */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <a href="#top" className="nav-logo"><span className="dot"></span>Harun Yakut</a>
      <div className="nav-links">
        <a href="#works">İşler</a>
        <a href="#about">Hakkında</a>
        <a href="#services">Hizmetler</a>
        <a href="#contact">İletişim</a>
      </div>
      <a href="#contact" className="nav-cta"><span className="pulse"></span>2026 · Müsait</a>
    </nav>
  );
}

/* ---------------- Hero ---------------- */
function Hero() {
  const heroRef = useRef(null);
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const opts = { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Europe/Istanbul', hour12: false };
      setTime(new Intl.DateTimeFormat('tr-TR', opts).format(d) + ' IST');
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Parallax
  useEffect(() => {
    const onScroll = () => {
      if (!heroRef.current) return;
      const y = window.scrollY;
      const img = heroRef.current.querySelector('.hero-img img');
      const title = heroRef.current.querySelector('.hero-title');
      if (img) img.style.transform = `translateY(${y * 0.18}px)`;
      if (title) title.style.transform = `translateY(${y * -0.05}px)`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section className="hero" id="top" ref={heroRef}>
      <div className="hero-grid-bg"></div>
      <div className="container">
        <div className="hero-meta">
          <span><strong>2020'den beri</strong> · İzmir, Türkiye</span>
          <span>Bağımsız grafik tasarımcı & sanat yönetmeni</span>
          <span>Portfolyo · Cilt 07</span>
        </div>

        <div className="hero-main">
          <h1 className="hero-title">
            <span className="line"><span>Harun</span></span>
            <span className="line"><span>Yakut<span className="accent">/studio</span></span></span>
          </h1>
          <div className="hero-side">
            <div className="hero-img">
              <img src="WhatsApp Image 2026-06-03 at 22.21.52.jpeg" alt="Harun Yakut" />
            </div>
            <p className="hero-intro">
              <b>Bağımsız bir grafik tasarımcı.</b> Marka kimliği, sanat yönetimi ve editöryel tasarım üzerine çalışıyorum. Cesur tipografi, sade kompozisyon ve dikkatli detaylarla — kültür, moda ve müzik dünyasından markalar için iş çıkarıyorum.
            </p>
          </div>
        </div>

        <div className="hero-foot">
          <span className="scroll-cue">Aşağı kaydır <span className="arrow"></span></span>
          <span style={{justifySelf:'center'}}>{time}</span>
          <div className="hero-stats">
            <div className="stat"><strong>05</strong>YIL</div>
            <div className="stat"><strong>+80</strong>PROJE</div>
            <div className="stat"><strong>14</strong>ÖDÜL</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Marquee ---------------- */
function Marquee({ words, duration }) {
  const items = [...words, ...words];
  return (
    <div className="marquee">
      <div className="marquee-track" style={{ '--marquee-duration': `${duration}s` }}>
        {items.map((w, i) => (
          <span key={i} className={`marquee-item ${i % 3 === 1 ? 'outlined' : ''}`}>
            {w}
            <svg className="star" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z"/></svg>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Lightbox ---------------- */
function Lightbox({ work, onClose }) {
  const [index, setIndex] = useState(0);
  const images = work.images || (work.img ? [work.img] : []);
  const total = images.length;

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % total);
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + total) % total);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [total, onClose]);

  if (!images.length) return null;

  return (
    <div className="lb-overlay" onClick={onClose}>
      <div className="lb-box" onClick={(e) => e.stopPropagation()}>
        <button className="lb-close" onClick={onClose}>✕</button>

        <div className="lb-img-wrap">
          <img key={index} src={images[index]} alt={`${work.title} — ${index + 1}`} className="lb-img" />
        </div>

        {total > 1 && (
          <>
            <button className="lb-prev" onClick={() => setIndex((i) => (i - 1 + total) % total)}>←</button>
            <button className="lb-next" onClick={() => setIndex((i) => (i + 1) % total)}>→</button>
          </>
        )}

        <div className="lb-foot">
          <span className="lb-title">{work.title} — {work.cat}</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Works ---------------- */
function Works({ works }) {
  const ref = useReveal();
  const [active, setActive] = useState(null);

  return (
    <section className="section works" id="works">
      <div className="container">
        <div className="section-header">
          <div>
            <span className="label">Seçili İşler · 2023 — 2025</span>
            <h2 className="section-title" style={{ marginTop: 18 }}>
              Son<br/>çalışmalar<span style={{ color: 'var(--accent)', fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic', fontWeight: 400, fontStretch: '100%' }}>.</span>
            </h2>
          </div>
          <div className="section-meta">
            İzmir merkezli; marka sistemleri, editöryel iş ve görsel kimlikler.
          </div>
        </div>

        <div className="works-grid reveal-stagger" ref={ref}>
          {works.map((w) => (
            <a key={w.num} href="#" className={`work ${w.size}`} onClick={(e) => { e.preventDefault(); if (w.img || w.images) setActive(w); }}>
              <div className="work-img">
                {w.img
                  ? <img src={w.img} alt={w.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <PlaceholderArt seed={w.placeholder} />
                }
                <span className="placeholder-tag">{w.tag}</span>
                <span className="corner">{w.img || w.images ? '↗' : '→'}</span>
              </div>
              <div className="work-overlay">
                <div className="ov-title">{w.title}</div>
                <div className="ov-meta">{w.cat} · {w.year}</div>
              </div>
              <div className="work-info">
                <span>{w.title} — {w.cat}</span>
                <span className="num">{w.num} / {String(works.length).padStart(2, '0')}</span>
              </div>
            </a>
          ))}
        </div>

        {active && <Lightbox work={active} onClose={() => setActive(null)} />}

        <div className="works-cta">
          <span className="label">Proje görsellerini doğrudan bu alanlara bırakabilirsiniz</span>
          <a href="#" className="ghost" onClick={(e) => e.preventDefault()}>
            Tüm arşivi gör
            <svg width="40" height="14" viewBox="0 0 40 14" fill="none"><path d="M0 7 H37 M30 1 L37 7 L30 13" stroke="currentColor" strokeWidth="1.5"/></svg>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Placeholder art (per work) ---------------- */
function PlaceholderArt({ seed }) {
  // Pick a layout based on seed first char
  const c = (seed || 'X').charCodeAt(0);
  const variant = c % 4;
  return (
    <div className="ph-art" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {variant === 0 && (
        <span style={{ fontFamily: 'var(--display-font)', fontWeight: 800, fontStretch: '75%', fontSize: 'clamp(48px, 8vw, 160px)', color: 'currentColor', opacity: 0.08, letterSpacing: '-0.04em' }}>{seed}</span>
      )}
      {variant === 1 && (
        <svg width="60%" height="60%" viewBox="0 0 100 100" style={{ opacity: 0.18, color: 'currentColor' }}>
          <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="0.3" fill="none"/>
          <circle cx="50" cy="50" r="28" stroke="currentColor" strokeWidth="0.3" fill="none"/>
          <circle cx="50" cy="50" r="16" stroke="currentColor" strokeWidth="0.3" fill="none"/>
          <text x="50" y="54" textAnchor="middle" fontSize="10" fill="currentColor" fontFamily="var(--display-font)" fontWeight="700">{seed}</text>
        </svg>
      )}
      {variant === 2 && (
        <div style={{ fontFamily: 'var(--mono-font)', fontSize: 11, color: 'currentColor', opacity: 0.25, letterSpacing: '0.2em', writingMode: 'vertical-rl', textOrientation: 'mixed' }}>{seed} · PROJE</div>
      )}
      {variant === 3 && (
        <svg width="72%" height="72%" viewBox="0 0 100 100" style={{ opacity: 0.22, color: 'currentColor' }}>
          <rect x="10" y="10" width="80" height="80" stroke="currentColor" strokeWidth="0.3" fill="none"/>
          <line x1="10" y1="10" x2="90" y2="90" stroke="currentColor" strokeWidth="0.3"/>
          <line x1="90" y1="10" x2="10" y2="90" stroke="currentColor" strokeWidth="0.3"/>
          <text x="50" y="55" textAnchor="middle" fontSize="14" fill="var(--accent)" fontFamily="var(--display-font)" fontWeight="700">{seed}</text>
        </svg>
      )}
    </div>
  );
}

/* ---------------- About ---------------- */
function About() {
  const ref = useReveal();
  return (
    <section className="section about" id="about">
      <div className="container">
        <div className="section-header">
          <span className="label">Hakkında · 001</span>
          <span className="section-meta">Stüdyodan kısa bir not</span>
        </div>

        <div className="about-grid reveal" ref={ref}>
          <div style={{ display: 'none' }}></div>
          <div className="about-text">
            <h3>Markaları, kelimelerin değil <em>kompozisyonun</em> taşıdığı bir dile çeviriyorum.</h3>
            <div className="about-bio">
              <p>
                <b>Harun Yakut</b> — Dokuz Eylül Üniversitesi Güzel Sanatlar Fakültesi, Grafik Tasarımı mezunu. İzmir merkezli bağımsız grafik tasarımcı; marka kimliği, tipografi ve editöryel tasarım üzerine çalışıyor.
              </p>
              <p>
                Cesur tipografi, sade kompozisyon ve dikkatli detaylarla — kültür, moda ve müzik dünyasından markalar için iş üretiyor.
              </p>
            </div>
            <div className="about-meta">
              <div className="cell"><strong>DEÜ</strong><span>Güzel Sanatlar · Grafik</span></div>
              <div className="cell"><strong>2020</strong><span>Bağımsız · İzmir</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Services ---------------- */
function Services({ services }) {
  const ref = useReveal();
  return (
    <section className="section" id="services">
      <div className="container">
        <div className="section-header">
          <div>
            <span className="label">Yetkinlikler</span>
            <h2 className="section-title" style={{ marginTop: 18 }}>Neyi nasıl<span style={{ color: 'var(--accent)', fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic', fontWeight: 400, fontStretch: '100%' }}>,</span><br/>üretiyorum.</h2>
          </div>
          <div className="section-meta">
            İlk eskizden son baskı provasına kadar — uçtan uca, ellerimle.
          </div>
        </div>

        <div className="services-list reveal-stagger" ref={ref}>
          {services.map((s) => (
            <div key={s.num} className="service-row">
              <span className="s-num">— {s.num}</span>
              <span className="s-name">{s.name}</span>
              <span className="s-tags">{s.tags}</span>
              <span className="s-arrow">↗</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Recognition / Clients ---------------- */
function Recognition({ awards }) {
  const ref = useReveal();
  return (
    <section className="section recognition">
      <div className="container">
        <div className="section-header">
          <span className="label">Tanınırlık</span>
          <span className="section-meta">Ödüller ve anmalar</span>
        </div>

        <div className="recog-grid reveal" ref={ref}>
          <div>
            <h3 style={{ fontFamily: 'var(--display-font)', fontWeight: 800, fontStretch: '75%', fontSize: 'clamp(28px, 3vw, 44px)', letterSpacing: '-0.02em', lineHeight: 0.95, marginBottom: 24 }}>
              Ödüller &<br/>Anmalar<span style={{ color: 'var(--accent)' }}>.</span>
            </h3>
            <div className="awards">
              {awards.map((a, i) => (
                <div key={i} className="award">
                  <span className="yr">{a.yr}</span>
                  <span className="nm">{a.nm}<small>{a.sub}</small></span>
                  <span className="pl">— {a.pl}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ---------------- Contact ---------------- */
function Contact() {
  const ref = useReveal();
  return (
    <section className="contact" id="contact" ref={ref}>
      <div className="container">
        <span className="pretitle">— Yeni iş birliklerine açık · 2026 Q2'den itibaren</span>
        <h2>Birlikte<br/>sıra<br/><em>dışı</em><br/>bir şey yapalım.</h2>
        <a href="mailto:yakutharun86@gmail.com" className="contact-mail">yakutharun86@gmail.com</a>

        <div className="contact-meta">
          <div className="m-cell">
            <span className="lbl">Stüdyo</span>
            <span className="val">İzmir · TR</span>
          </div>
          <div className="m-cell">
            <span className="lbl">Konuş</span>
            <span className="val"><a href="mailto:yakutharun86@gmail.com">yakutharun86@gmail.com</a></span>
          </div>
          <div className="m-cell">
            <span className="lbl">Takip Et</span>
            <span className="val"><a href="https://www.instagram.com/harunykt/" target="_blank" rel="noreferrer">Instagram ↗</a></span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Footer ---------------- */
function Footer() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const opts = { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul', hour12: false };
      setTime(new Intl.DateTimeFormat('tr-TR', opts).format(d));
    };
    tick();
    const id = setInterval(tick, 1000 * 30);
    return () => clearInterval(id);
  }, []);
  return (
    <footer className="footer container">
      <span>© Harun Yakut Studio — 2026</span>
      <span className="clock"><span className="dot"></span>İstanbul · {time} · Müsait</span>
      <span>Özenle tasarlandı ve kodlandı</span>
    </footer>
  );
}

/* ---------------- Tweak panel ---------------- */
const ACCENT_OPTIONS = ['#2563EB', '#1E4DFF', '#3D7BFF', '#5C8DFF', '#0E1F66'];

function TweaksRoot({ onMarqueeSpeed }) {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS);

  // Apply tweaks
  useEffect(() => {
    document.documentElement.style.setProperty('--accent', t.accent);
  }, [t.accent]);

  useEffect(() => {
    const theme = t.theme || 'cream';
    if (theme === 'cream') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [t.theme]);

  useEffect(() => {
    const grid = document.querySelector('.hero-grid-bg');
    if (grid) grid.style.display = t.showGrid ? 'block' : 'none';
  }, [t.showGrid]);

  useEffect(() => {
    const c = document.querySelector('.cursor');
    if (c) c.style.display = t.customCursor ? 'block' : 'none';
  }, [t.customCursor]);

  useEffect(() => {
    if (onMarqueeSpeed) onMarqueeSpeed(t.marqueeSpeed);
  }, [t.marqueeSpeed]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Tema">
        <TweakRadio label="Zemin" value={t.theme || 'cream'} onChange={(v) => setTweak('theme', v)} options={['cream', 'paper', 'midnight']} />
      </TweakSection>
      <TweakSection label="Vurgu">
        <TweakColor label="Aksent rengi" value={t.accent} onChange={(v) => setTweak('accent', v)} options={ACCENT_OPTIONS} />
      </TweakSection>
      <TweakSection label="Hareket">
        <TweakSlider label="Marquee hızı" value={t.marqueeSpeed} onChange={(v) => setTweak('marqueeSpeed', v)} min={10} max={120} step={5} unit="s" />
        <TweakToggle label="Özel imleç" value={t.customCursor} onChange={(v) => setTweak('customCursor', v)} />
        <TweakToggle label="Hero grid arka plan" value={t.showGrid} onChange={(v) => setTweak('showGrid', v)} />
      </TweakSection>
    </TweaksPanel>
  );
}

/* ---------------- App ---------------- */
function App() {
  const [marqueeSpeed, setMarqueeSpeed] = useState(window.TWEAK_DEFAULTS?.marqueeSpeed || 40);
  const data = window.PORTFOLIO_DATA;
  return (
    <>
      <CustomCursor />
      <Nav />
      <main>
        <Hero />
        <Marquee words={data.marqueeWords} duration={marqueeSpeed} />
        <Works works={data.works} />
        <About />
        <Services services={data.services} />
        <Contact />
      </main>
      <Footer />
      <TweaksRoot onMarqueeSpeed={setMarqueeSpeed} />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
