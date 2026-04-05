import { useState, useEffect, useRef } from "react";

/* ─── THEME (Euro Summer / Tulum) ─── */
const C = {
  deep: "#122c35", teal: "#1a3d4a", green: "#2d6b5a", greenLt: "#3a8a7a",
  sand: "#d4a574", cream: "#e8c9a0", warmWhite: "#f5e6d0",
  card: "rgba(255,255,255,0.96)", text: "#fff", dark: "#1a3a4a",
  muted: "rgba(255,255,255,0.6)", glass: "rgba(255,255,255,0.08)",
  glassBorder: "rgba(255,255,255,0.1)",
};
const F = { display: "'Fraunces', serif", body: "'Outfit', sans-serif" };

/* ─── HOOKS ─── */
function useInView(t = 0.12) {
  const r = useRef(null); const [v, s] = useState(false);
  useEffect(() => { const el = r.current; if (!el) return; const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) s(true) }, { threshold: t }); o.observe(el); return () => o.disconnect() }, [t]);
  return [r, v];
}
function useCd(target) {
  const [d, s] = useState(target - new Date());
  useEffect(() => { const i = setInterval(() => s(target - new Date()), 1000); return () => clearInterval(i) }, [target]);
  const v = n => Math.max(0, n);
  return { d: v(Math.floor(d / 864e5)), h: v(Math.floor((d % 864e5) / 36e5)), m: v(Math.floor((d % 36e5) / 6e4)), s: v(Math.floor((d % 6e4) / 1e3)) };
}

/* ─── MICRO COMPONENTS ─── */
const Reveal = ({ ch, delay = 0, dir = "up", sx = {} }) => {
  const [r, v] = useInView();
  const t = { up: "translateY(28px)", left: "translateX(28px)", scale: "scale(0.93)" };
  return <div ref={r} style={{ opacity: v ? 1 : 0, transform: v ? "none" : (t[dir] || t.up), transition: `all 0.75s cubic-bezier(0.22,1,0.36,1) ${delay}s`, willChange: "transform, opacity", ...sx }}>{ch}</div>;
};

const Avatar = ({ init, color, size = 32, border = "2px solid rgba(255,255,255,0.2)", photo, onClick, sx = {} }) => (
  <div onClick={onClick} style={{ width: size, height: size, borderRadius: "50%", background: photo ? `url(${photo}) center/cover` : color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: size * 0.38, fontFamily: F.body, border, flexShrink: 0, cursor: onClick ? "pointer" : "default", transition: "transform 0.2s", ...sx }}>
    {!photo && init}
  </div>
);

const Badge = ({ text, bg, color }) => (
  <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10, background: bg, color, fontFamily: F.body, letterSpacing: 0.3 }}>{text}</span>
);

const GlassCard = ({ children, sx = {} }) => (
  <div style={{ background: C.glass, borderRadius: 18, padding: "18px", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", border: `1px solid ${C.glassBorder}`, ...sx }}>{children}</div>
);

const SolidCard = ({ children, sx = {} }) => (
  <div style={{ background: C.card, borderRadius: 18, overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.12)", ...sx }}>{children}</div>
);

const SectionLabel = ({ icon, text }) => (
  <div style={{ fontSize: 11, color: C.cream, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.8, fontFamily: F.body, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
    <span>{icon}</span><span>{text}</span>
  </div>
);

/* ─── DATA ─── */
const TRIP = { name: "Tulum", tagline: "Sun, cenotes & mezcal", dates: "Jul 16–19, 2026", deadline: new Date("2026-06-01") };

const ORG = { name: "Andrew", init: "A", color: "#2d6b5a", bio: "Trip organizer extraordinaire. Will make a spreadsheet about anything.", ig: "@andrew.s", phone: "+1 (555) 123-4567" };

const COLLAGE = [
  { c: "#3a8a7a", l: "Beach sunset", col: "1/3", row: "1/2" },
  { c: "#1a3d4a", l: "Cenote swim", col: "1/2", row: "2/3" },
  { c: "#d4a574", l: "Tulum ruins", col: "2/3", row: "2/3" },
  { c: "#c4956a", l: "The crew 📸", col: "3/4", row: "1/3" },
  { c: "#2d6b5a", l: "Rooftop vibes", col: "1/4", row: "3/4" },
];

const HOUSE = {
  title: "Casa Palapa — Beachfront Villa with Pool",
  loc: "Tulum Beach Road, Quintana Roo",
  ppn: 580,
  imgs: [{ c: "#3a8a7a", l: "Pool & Ocean View" }, { c: "#2d6b5a", l: "Open-Air Living" }, { c: "#c4956a", l: "Master Suite" }, { c: "#1a3d4a", l: "Rooftop Terrace" }],
  tags: ["Private pool", "Beachfront", "6 BR", "Chef kitchen"],
};

const BLOCKS = [
  { e: "✈️", tag: "Flights", tc: "#1a3d4a", title: "JFK → CUN", sub: "JetBlue • Direct • 3h 45m", cost: 280, cl: "per person", type: "individual", link: "Search flights →", note: "Book your own" },
  { e: "🚗", tag: "Rental Car", tc: "#6b4c3b", title: "SUV from Cancún Airport", sub: "Fits 6 + bags • ~$45/day", cost: 135, cl: "split 6 ways", type: "shared", link: "Check rates →" },
  { e: "🤿", tag: "Activities", tc: "#2d6b5a", title: "Cenote day trip + snorkeling", sub: "Gran Cenote → Calavera → beach club", cost: 65, cl: "per person", type: "individual" },
  { e: "🧘", tag: "Activities", tc: "#2d6b5a", title: "Sunrise yoga at Ahau", sub: "Friday morning • beachfront", cost: 25, cl: "per person", type: "individual", note: "Optional but trust me" },
  { e: "🍽️", tag: "Meals", tc: "#8b6f5c", title: "Groceries + group dinners", sub: "Stock the kitchen + Hartwood + Arca", cost: 120, cl: "split 6 ways", type: "shared" },
];

const GUESTS = [
  { name: "Andrew", st: "in", init: "A", c: "#2d6b5a", bio: "Trip dad. Will make a spreadsheet about it.", ig: "@andrew.s" },
  { name: "Dempsey", st: "in", init: "D", c: "#c4956a", bio: "Here for the cenotes and the mezcal.", ig: "@dempsey" },
  { name: "Marcus", st: "in", init: "M", c: "#3a8a7a", bio: "Professional taco finder. Semi-pro sunset watcher.", ig: "@marcus.j" },
  { name: "Priya", st: "maybe", init: "P", c: "#d4a574", bio: "Checking PTO. Spiritually already there.", ig: "@priya.k" },
  { name: "Jake", st: "none", init: "J", c: "#1a3d4a", bio: "", ig: "" },
  { name: "Lily", st: "none", init: "L", c: "#8b6f5c", bio: "", ig: "" },
];

const COMMENTS = [
  { n: "Andrew", i: "A", c: "#2d6b5a", t: "This house is INSANE. Look at that pool 🏊‍♂️", tm: "2d", rx: ["🔥", "🔥", "🙌"] },
  { n: "Dempsey", i: "D", c: "#c4956a", t: "Booking the 7am JetBlue direct. Who's matching?", tm: "1d", rx: ["✈️", "✈️"] },
  { n: "Marcus", i: "M", c: "#3a8a7a", t: "Adding a taco crawl to the agenda. Non-negotiable 🌮", tm: "18h", rx: ["🌮", "🌮", "🌮", "😂"] },
  { n: "Priya", i: "P", c: "#d4a574", t: "90% I can make it. Manifesting PTO approval 🤞", tm: "4h", rx: ["🤞", "💛"] },
];

/* ─── MAIN ─── */
export default function RallySellPage() {
  const cd = useCd(TRIP.deadline);
  const [rsvp, setRsvp] = useState(null);
  const [confetti, setConfetti] = useState(false);
  const [selDates, setSelDates] = useState([]);
  const [cmts, setCmts] = useState(COMMENTS);
  const [newCmt, setNewCmt] = useState("");
  const [liked, setLiked] = useState(new Set());
  const [profileOpen, setProfileOpen] = useState(null);
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => { const t = setInterval(() => setImgIdx(i => (i + 1) % HOUSE.imgs.length), 3500); return () => clearInterval(t) }, []);

  const conf = GUESTS.filter(g => g.st === "in").length;
  const sharedPP = Math.round(HOUSE.ppn * 3 / conf + 135 + 120);
  const indPP = 280 + 65 + 25;
  const totalPP = sharedPP + indPP;
  const breakdown = [
    { label: "Accommodation", val: Math.round(HOUSE.ppn * 3 / conf), icon: "🏠" },
    { label: "Flights", val: 280, icon: "✈️" },
    { label: "Rental car", val: Math.round(135), icon: "🚗" },
    { label: "Meals", val: 120, icon: "🍽️" },
    { label: "Activities", val: 90, icon: "🤿" },
  ];

  const doRsvp = s => { setRsvp(s); if (s === "in") { setConfetti(true); setTimeout(() => setConfetti(false), 3500); } };
  const addCmt = () => { if (!newCmt.trim()) return; setCmts(p => [...p, { n: "You", i: "Y", c: "#d4a574", t: newCmt, tm: "now", rx: [] }]); setNewCmt(""); };
  const togLike = (ci, r) => setLiked(p => { const n = new Set(p); const k = `${ci}-${r}`; n.has(k) ? n.delete(k) : n.add(k); return n; });

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(168deg, ${C.deep} 0%, ${C.teal} 12%, ${C.green} 28%, ${C.greenLt} 42%, ${C.sand} 62%, ${C.cream} 78%, ${C.warmWhite} 92%, #faf3eb 100%)`, fontFamily: F.body, position: "relative" }}>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,800;1,9..144,400&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Confetti */}
      {confetti && <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 999, overflow: "hidden" }}>
        {Array.from({ length: 60 }).map((_, i) => {
          const cols = [C.cream, C.green, C.greenLt, C.sand, "#ff6b6b", "#ffd93d", C.warmWhite];
          return <div key={i} style={{ position: "absolute", left: `${Math.random() * 100}%`, top: -10, width: 5 + Math.random() * 9, height: (5 + Math.random() * 9) * (Math.random() > 0.5 ? 1 : .5), background: cols[i % cols.length], borderRadius: Math.random() > .4 ? "50%" : 2, transform: `rotate(${Math.random() * 360}deg)`, animation: `cFall ${1.2 + Math.random() * 2.5}s ease-in ${Math.random() * .6}s forwards` }} />;
        })}
      </div>}

      {/* Profile modal */}
      {profileOpen && <div onClick={() => setProfileOpen(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 998, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, animation: "modalIn .3s ease" }}>
        <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 22, padding: "28px 24px", maxWidth: 320, width: "100%", textAlign: "center", animation: "modalPop .4s cubic-bezier(.16,1,.3,1)" }}>
          <Avatar init={profileOpen.init} color={profileOpen.c} size={72} border="3px solid #f0ebe5" sx={{ margin: "0 auto 12px" }} />
          <div style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, color: C.dark }}>{profileOpen.name}</div>
          {profileOpen.bio && <div style={{ fontSize: 14, color: "#888", marginTop: 4, lineHeight: 1.4 }}>{profileOpen.bio}</div>}
          {profileOpen.ig && <div style={{ marginTop: 12, display: "flex", justifyContent: "center", gap: 8 }}>
            <a href="#" style={{ fontSize: 13, color: C.green, fontWeight: 600, textDecoration: "none", background: "#e0f0eb", padding: "6px 14px", borderRadius: 10 }}>📸 {profileOpen.ig}</a>
          </div>}
          {profileOpen.name === ORG.name && <div style={{ marginTop: 12 }}>
            <a href={`sms:${ORG.phone}`} style={{ display: "inline-block", fontSize: 13, color: "#fff", fontWeight: 600, textDecoration: "none", background: C.green, padding: "8px 18px", borderRadius: 10 }}>Message organizer 💬</a>
          </div>}
          <button onClick={() => setProfileOpen(null)} style={{ marginTop: 16, fontSize: 13, color: "#aaa", background: "none", border: "none", cursor: "pointer", fontFamily: F.body }}>Close</button>
        </div>
      </div>}

      {/* Grain overlay */}
      <div style={{ position: "fixed", inset: 0, opacity: .03, pointerEvents: "none", mixBlendMode: "overlay", backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
      <div style={{ position: "fixed", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,201,160,0.1) 0%, transparent 70%)", top: "5%", right: "-15%", animation: "drift 9s ease-in-out infinite", pointerEvents: "none" }} />

      <div style={{ maxWidth: 420, margin: "0 auto", position: "relative" }}>

        {/* ═══════ COLLAGE HEADER ═══════ */}
        <div style={{ position: "relative", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gridTemplateRows: "110px 90px 80px", gap: 2, animation: "fadeIn 1.2s cubic-bezier(.16,1,.3,1)" }}>
            {COLLAGE.map((p, i) => (
              <div key={i} style={{ gridColumn: p.col, gridRow: p.row, background: `linear-gradient(${130 + i * 20}deg, ${p.c}, ${p.c}dd)`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: `linear-gradient(${45 + i * 30}deg, rgba(255,255,255,.08) 0%, transparent 50%)` }} />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,.45)", fontWeight: 500, fontFamily: F.body }}>{p.l}</span>
              </div>
            ))}
          </div>

          {/* Gradient overlay */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "75%", background: `linear-gradient(to top, ${C.deep}f2 0%, ${C.deep}99 40%, transparent 100%)` }} />

          {/* Hero text */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 24px 22px", textAlign: "center" }}>
            <div style={{ display: "inline-block", padding: "3px 12px", borderRadius: 14, background: "rgba(255,255,255,.12)", fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 2.5, fontWeight: 600, border: `1px solid ${C.glassBorder}`, marginBottom: 10, animation: "slideUp .9s cubic-bezier(.16,1,.3,1) .2s both" }}>
              {ORG.name}'s trip
            </div>
            <h1 style={{ fontFamily: F.display, fontSize: 56, fontWeight: 800, color: C.text, margin: "4px 0 0", lineHeight: .95, letterSpacing: -1.5, textShadow: "0 2px 30px rgba(0,0,0,.3)", animation: "slideUp 1s cubic-bezier(.16,1,.3,1) .1s both" }}>
              {TRIP.name}
            </h1>
            <p style={{ fontFamily: F.display, fontSize: 17, fontStyle: "italic", color: C.cream, margin: "6px 0 14px", fontWeight: 400, opacity: .9, animation: "slideUp 1s cubic-bezier(.16,1,.3,1) .25s both" }}>
              {TRIP.tagline}
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13, color: C.muted, animation: "slideUp 1s cubic-bezier(.16,1,.3,1) .35s both" }}>
              <span>✈️</span><span style={{ fontWeight: 600, color: C.text }}>{TRIP.dates}</span>
              <span style={{ opacity: .3 }}>•</span><span>{conf} going</span>
            </div>
            {/* Friend faces */}
            <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
              {GUESTS.map((g, i) => (
                <div key={i} style={{ animation: `popIn .45s cubic-bezier(.16,1,.3,1) ${.5 + i * .07}s both` }}>
                  <Avatar init={g.init} color={g.c} size={30} border={`2px solid ${C.deep}`} onClick={() => setProfileOpen(g)} sx={{ marginLeft: i ? -7 : 0, zIndex: 10 - i, cursor: "pointer" }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: "0 20px" }}>

          {/* ═══════ ORGANIZER CARD ═══════ */}
          <Reveal ch={
            <div style={{ marginTop: 16, marginBottom: 4 }}>
              <GlassCard>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar init={ORG.init} color={ORG.color} size={44} border="2px solid rgba(255,255,255,.2)" onClick={() => setProfileOpen(GUESTS[0])} sx={{ cursor: "pointer" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{ORG.name}</span>
                      <Badge text="Organizer" bg="rgba(45,107,90,.35)" color="#7ecdb8" />
                    </div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 1 }}>{ORG.bio}</div>
                  </div>
                  <a href={`sms:${ORG.phone}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,.1)", border: `1px solid ${C.glassBorder}`, textDecoration: "none", fontSize: 16, flexShrink: 0 }}>💬</a>
                </div>
              </GlassCard>
            </div>
          } delay={.15} />

          {/* ═══════ COUNTDOWN ═══════ */}
          <Reveal ch={
            <div style={{ marginTop: 14 }}>
              <GlassCard sx={{ textAlign: "center", padding: "16px 12px" }}>
                <div style={{ fontSize: 11, color: C.cream, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>⏳ Time to lock it in</div>
                <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                  {[["d", "days"], ["h", "hrs"], ["m", "min"], ["s", "sec"]].map(([k, l], i) => (
                    <div key={k} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {i > 0 && <span style={{ color: "rgba(255,255,255,.2)", fontSize: 18, animation: "pulse 1s infinite", fontWeight: 300 }}>:</span>}
                      <div style={{ textAlign: "center", minWidth: 48 }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: C.text, background: "rgba(255,255,255,.12)", borderRadius: 10, padding: "6px 8px", lineHeight: 1, fontFamily: F.body, fontVariantNumeric: "tabular-nums" }}>{String(cd[k]).padStart(2, "0")}</div>
                        <div style={{ fontSize: 9, color: C.muted, marginTop: 3, textTransform: "uppercase", letterSpacing: 1.5 }}>{l}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          } delay={.2} />

          {/* ═══════ THE HOUSE ═══════ */}
          <Reveal ch={
            <div style={{ marginTop: 14 }}>
              <SolidCard>
                {/* Carousel */}
                <div style={{ position: "relative" }}>
                  <div style={{ width: "100%", height: 200, background: HOUSE.imgs[imgIdx].c, display: "flex", alignItems: "center", justifyContent: "center", transition: "background .5s", position: "relative" }}>
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,.1) 0%, transparent 50%)" }} />
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,.5)", fontFamily: F.body }}>📷 {HOUSE.imgs[imgIdx].l}</span>
                    {[-1, 1].map(d => <button key={d} onClick={() => setImgIdx(i => (i + d + HOUSE.imgs.length) % HOUSE.imgs.length)} style={{ position: "absolute", [d < 0 ? "left" : "right"]: 8, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,.25)", border: "none", color: "#fff", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>{d < 0 ? "‹" : "›"}</button>)}
                  </div>
                  <div style={{ display: "flex", gap: 4, justifyContent: "center", padding: "8px 0 0" }}>
                    {HOUSE.imgs.map((_, i) => <div key={i} onClick={() => setImgIdx(i)} style={{ width: i === imgIdx ? 16 : 5, height: 5, borderRadius: 3, background: i === imgIdx ? C.sand : "#ccc", transition: "all .3s", cursor: "pointer" }} />)}
                  </div>
                </div>
                <div style={{ padding: "12px 14px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                    <Badge text="🏠 The House" bg={C.green} color="#fff" />
                    <span style={{ fontSize: 10, color: C.sand, fontWeight: 600 }}>~${HOUSE.ppn}/night • Split</span>
                  </div>
                  <h3 style={{ fontFamily: F.display, fontSize: 16, color: C.dark, margin: "0 0 2px", fontWeight: 700, lineHeight: 1.3 }}>{HOUSE.title}</h3>
                  <p style={{ fontSize: 11, color: "#888", margin: "0 0 8px" }}>📍 {HOUSE.loc}</p>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
                    {HOUSE.tags.map(t => <span key={t} style={{ fontSize: 10, color: C.dark, background: "#f0ebe5", padding: "3px 8px", borderRadius: 14, fontWeight: 500 }}>{t}</span>)}
                  </div>
                  <a href="#" style={{ display: "block", textAlign: "center", padding: "8px", borderRadius: 10, border: `1.5px solid ${C.green}`, color: C.green, fontSize: 12, fontWeight: 600, textDecoration: "none", transition: "all .2s" }}>View full listing →</a>
                </div>
              </SolidCard>
            </div>
          } delay={.1} />

          {/* ═══════ TRIP BLOCKS ═══════ */}
          {BLOCKS.map((b, i) => (
            <Reveal key={i} ch={
              <div style={{ marginTop: 12 }}>
                <SolidCard sx={{ padding: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 5, flexWrap: "wrap" }}>
                        <Badge text={`${b.e} ${b.tag}`} bg={b.tc} color="#fff" />
                        <Badge text={b.type === "shared" ? "Split" : "Book yours"} bg={b.type === "shared" ? "#e0f0eb" : "#e0ebf0"} color={b.type === "shared" ? C.green : C.dark} />
                      </div>
                      <div style={{ fontFamily: F.display, fontSize: 15, fontWeight: 700, color: C.dark, lineHeight: 1.3 }}>{b.title}</div>
                      <div style={{ fontSize: 11, color: "#888", marginTop: 1 }}>{b.sub}</div>
                      {b.note && <div style={{ fontSize: 10, color: C.sand, marginTop: 3, fontStyle: "italic" }}>{b.note}</div>}
                    </div>
                    <div style={{ textAlign: "right", marginLeft: 10, flexShrink: 0 }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: C.green, fontFamily: F.body }}>~${b.cost}</div>
                      <div style={{ fontSize: 9, color: "#999" }}>{b.cl}</div>
                    </div>
                  </div>
                  {b.link && <a href="#" style={{ display: "block", textAlign: "center", marginTop: 10, padding: "7px", borderRadius: 8, border: `1px solid ${b.tc}25`, color: b.tc, fontSize: 11, fontWeight: 600, textDecoration: "none", background: `${b.tc}08` }}>{b.link}</a>}
                </SolidCard>
              </div>
            } delay={.04 * i} />
          ))}

          {/* ═══════ PER-PERSON COST ═══════ */}
          <Reveal ch={
            <div style={{ marginTop: 14 }}>
              <GlassCard sx={{ textAlign: "center", padding: "22px 16px" }}>
                <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 2.5, marginBottom: 4, fontWeight: 600 }}>Estimated per person</div>
                <div style={{ fontFamily: F.display, fontSize: 52, fontWeight: 800, color: C.text, lineHeight: 1 }}>~${totalPP}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 3, marginBottom: 16 }}>3 nights • {conf} people</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7, textAlign: "left" }}>
                  {breakdown.map(b => (
                    <div key={b.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <span style={{ fontSize: 13 }}>{b.icon}</span>
                        <span style={{ fontSize: 12, color: C.muted }}>{b.label}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 70, height: 4, borderRadius: 2, background: "rgba(255,255,255,.1)", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${(b.val / totalPP) * 100}%`, background: C.cream, borderRadius: 2, transition: "width 1s ease" }} />
                        </div>
                        <span style={{ fontSize: 12, color: C.text, fontWeight: 600, minWidth: 36, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>${b.val}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 14, justifyContent: "center", flexWrap: "wrap" }}>
                  <Badge text={`🏠 Shared: ~$${sharedPP}/pp`} bg="rgba(45,107,90,.2)" color="#7ecdb8" />
                  <Badge text={`✈️ Book yours: ~$${indPP}`} bg="rgba(26,58,74,.2)" color="rgba(255,255,255,.7)" />
                </div>
              </GlassCard>
            </div>
          } delay={.1} />

          {/* ═══════ DATE POLL ═══════ */}
          <Reveal ch={
            <div style={{ marginTop: 14 }}>
              <GlassCard>
                <SectionLabel icon="📅" text="Which dates work?" />
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {["Jul 16–19", "Jul 23–26", "Jul 30–Aug 2"].map(d => {
                    const sel = selDates.includes(d);
                    const votes = d === "Jul 16–19" ? 3 : d === "Jul 23–26" ? 1 : 0;
                    return <button key={d} onClick={() => setSelDates(p => sel ? p.filter(x => x !== d) : [...p, d])} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: 11, border: "none",
                      background: sel ? "rgba(232,201,160,.18)" : "rgba(255,255,255,.05)", cursor: "pointer", transition: "all .25s",
                      outline: sel ? "2px solid rgba(232,201,160,.45)" : `1px solid ${C.glassBorder}`, transform: sel ? "scale(1.015)" : "none",
                    }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: F.body }}>{d}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {votes > 0 && <div style={{ display: "flex" }}>{Array.from({ length: votes }).map((_, i) => <Avatar key={i} init={GUESTS[i]?.init} color={GUESTS[i]?.c} size={16} border="1.5px solid rgba(255,255,255,.1)" sx={{ marginLeft: i ? -5 : 0, fontSize: 8 }} />)}</div>}
                        <span style={{ fontSize: 10, color: C.muted }}>{votes}</span>
                        <div style={{ width: 18, height: 18, borderRadius: 5, background: sel ? C.cream : "rgba(255,255,255,.08)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }}>
                          {sel && <span style={{ color: C.dark, fontSize: 12, fontWeight: 700 }}>✓</span>}
                        </div>
                      </div>
                    </button>;
                  })}
                </div>
              </GlassCard>
            </div>
          } delay={.05} />

          {/* ═══════ WHO'S IN ═══════ */}
          <Reveal ch={
            <div style={{ marginTop: 14 }}>
              <GlassCard>
                <SectionLabel icon="👥" text="Who's in?" />
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {GUESTS.map((g, i) => (
                    <Reveal key={g.name} ch={
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }} onClick={() => (g.bio || g.ig) && setProfileOpen(g)}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9, cursor: (g.bio || g.ig) ? "pointer" : "default" }}>
                          <Avatar init={g.init} color={g.c} size={32} border="2px solid rgba(255,255,255,.15)" />
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                              <span style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{g.name}</span>
                              {g.name === ORG.name && <Badge text="Organizer" bg="rgba(45,107,90,.3)" color="#7ecdb8" />}
                            </div>
                            {g.ig && <span style={{ fontSize: 10, color: C.muted }}>{g.ig}</span>}
                          </div>
                        </div>
                        <Badge
                          text={g.st === "in" ? "I'm in! ✈️" : g.st === "maybe" ? "Maybe 🤔" : "Waiting..."}
                          bg={g.st === "in" ? "rgba(45,107,90,.3)" : g.st === "maybe" ? "rgba(212,165,116,.3)" : "rgba(255,255,255,.05)"}
                          color={g.st === "in" ? "#7ecdb8" : g.st === "maybe" ? C.cream : "rgba(255,255,255,.3)"}
                        />
                      </div>
                    } delay={.04 * i} dir="left" />
                  ))}
                </div>
              </GlassCard>
            </div>
          } delay={.05} />

          {/* ═══════ GROUP CHAT ═══════ */}
          <Reveal ch={
            <div style={{ marginTop: 14 }}>
              <GlassCard>
                <SectionLabel icon="💬" text="The group chat" />
                <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                  {cmts.map((c, ci) => (
                    <div key={ci} style={{ display: "flex", gap: 8 }}>
                      <Avatar init={c.i} color={c.c} size={26} border="none" sx={{ marginTop: 1 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{c.n}</span>
                          <span style={{ fontSize: 9, color: "rgba(255,255,255,.2)" }}>{c.tm}</span>
                        </div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,.8)", marginTop: 1, lineHeight: 1.45 }}>{c.t}</div>
                        {c.rx.length > 0 && <div style={{ display: "flex", gap: 3, marginTop: 4 }}>
                          {[...new Set(c.rx)].map(r => {
                            const cnt = c.rx.filter(x => x === r).length;
                            const lk = liked.has(`${ci}-${r}`);
                            return <button key={r} onClick={() => togLike(ci, r)} style={{ background: lk ? "rgba(232,201,160,.2)" : "rgba(255,255,255,.05)", border: lk ? "1px solid rgba(232,201,160,.3)" : `1px solid ${C.glassBorder}`, borderRadius: 10, padding: "1px 6px", cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", gap: 2, transition: "all .2s" }}>
                              <span>{r}</span><span style={{ fontSize: 9, color: C.muted }}>{cnt + (lk ? 1 : 0)}</span>
                            </button>;
                          })}
                        </div>}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 14, alignItems: "center" }}>
                  <Avatar init="Y" color="#d4a574" size={24} border="none" />
                  <div style={{ flex: 1, display: "flex", background: "rgba(255,255,255,.05)", borderRadius: 11, border: `1px solid ${C.glassBorder}`, overflow: "hidden" }}>
                    <input value={newCmt} onChange={e => setNewCmt(e.target.value)} onKeyDown={e => e.key === "Enter" && addCmt()} placeholder="Drop some hype..." style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: C.text, fontSize: 12, padding: "9px 10px", fontFamily: F.body }} />
                    <button onClick={addCmt} style={{ background: newCmt.trim() ? C.cream : "transparent", border: "none", color: newCmt.trim() ? C.dark : "rgba(255,255,255,.15)", padding: "0 12px", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: F.body, transition: "all .2s", borderRadius: "0 10px 10px 0" }}>Send</button>
                  </div>
                </div>
              </GlassCard>
            </div>
          } delay={.05} />

          {/* ═══════ RSVP ═══════ */}
          <Reveal ch={
            <div style={{ marginTop: 14 }}>
              {rsvp ? (
                <GlassCard sx={{ textAlign: "center", padding: "28px 18px", background: rsvp === "in" ? "rgba(45,107,90,.2)" : C.glass, animation: "modalPop .5s cubic-bezier(.16,1,.3,1)" }}>
                  <div style={{ fontSize: 42, marginBottom: 8, animation: rsvp === "in" ? "bounce .6s ease" : "none" }}>{rsvp === "in" ? "🎉" : rsvp === "maybe" ? "🤔" : "😢"}</div>
                  <div style={{ fontFamily: F.display, fontSize: 22, color: C.text, fontWeight: 700 }}>{rsvp === "in" ? "You're in!" : rsvp === "maybe" ? "We'll hold your spot" : "Maybe next time"}</div>
                  <div style={{ fontSize: 13, color: C.muted, marginTop: 3 }}>{rsvp === "in" ? "We'll text you updates ✈️" : rsvp === "maybe" ? "We'll nudge you before the deadline" : "We'll miss you!"}</div>
                  {rsvp === "in" && <button style={{ marginTop: 16, padding: "10px 20px", borderRadius: 11, border: `1px solid rgba(255,255,255,.2)`, background: "rgba(255,255,255,.08)", color: C.text, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: F.body }}>Share to Story 📸</button>}
                </GlassCard>
              ) : (
                <GlassCard sx={{ textAlign: "center", padding: "22px 16px" }}>
                  <div style={{ fontFamily: F.display, fontSize: 22, color: C.text, fontWeight: 700, marginBottom: 2 }}>You coming or what?</div>
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>Lock it in before the countdown hits zero</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <button onClick={() => doRsvp("in")} style={{ padding: "14px", borderRadius: 13, border: "none", background: `linear-gradient(135deg, ${C.green}, ${C.greenLt})`, color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: F.body, boxShadow: "0 4px 24px rgba(45,107,90,.35)", transition: "all .15s" }}>I'm so in 🙌</button>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => doRsvp("maybe")} style={{ flex: 1, padding: "11px", borderRadius: 12, cursor: "pointer", border: `1px solid ${C.glassBorder}`, background: C.glass, color: C.text, fontSize: 13, fontWeight: 600, fontFamily: F.body }}>Maybe... 🤔</button>
                      <button onClick={() => doRsvp("out")} style={{ flex: 1, padding: "11px", borderRadius: 12, cursor: "pointer", border: `1px solid ${C.glassBorder}`, background: C.glass, color: C.muted, fontSize: 13, fontWeight: 600, fontFamily: F.body }}>Can't make it 😢</button>
                    </div>
                  </div>
                </GlassCard>
              )}
            </div>
          } delay={.1} />

          {/* ═══════ FOOTER ═══════ */}
          <div style={{ padding: "24px 0 44px", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.15)" }}>Made with <span style={{ fontFamily: F.display, fontWeight: 700, color: "rgba(255,255,255,.22)" }}>Rally</span></div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.08)", marginTop: 2, cursor: "pointer" }}>Plan your own trip →</div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes popIn{from{opacity:0;transform:scale(.4)}to{opacity:1;transform:scale(1)}}
        @keyframes drift{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-16px) rotate(2deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.25}}
        @keyframes bounce{0%{transform:scale(1)}25%{transform:scale(1.25)}50%{transform:scale(.92)}75%{transform:scale(1.08)}100%{transform:scale(1)}}
        @keyframes modalIn{from{opacity:0}to{opacity:1}}
        @keyframes modalPop{from{opacity:0;transform:scale(.88) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes cFall{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}
        button:active{transform:scale(.97)!important}
        *{box-sizing:border-box;margin:0}
        input::placeholder{color:rgba(255,255,255,.22)}
        ::-webkit-scrollbar{display:none}
      `}</style>
    </div>
  );
}
