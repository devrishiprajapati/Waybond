const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");

// ── Icon helpers ────────────────────────────────────────────────────────────
const {
  FaGlobe, FaSearch, FaRoute, FaLock, FaCode, FaServer,
  FaMobileAlt, FaReact, FaNodeJs, FaGithub, FaCheck,
  FaMapMarkedAlt, FaCubes, FaChartBar, FaUsers, FaTrophy,
  FaLightbulb, FaRocket
} = require("react-icons/fa");
const { SiTypescript, SiTailwindcss, SiThreeDotJs } = require("react-icons/si");

async function iconPng(Icon, color = "#FFFFFF", size = 256) {
  try {
    const element = React.createElement(Icon, { color, size: String(size) });
    const svg = ReactDOMServer.renderToStaticMarkup(element);
    const buf = await sharp(Buffer.from(svg)).png().toBuffer();
    return "image/png;base64," + buf.toString("base64");
  } catch (e) {
    // Fallback to a simple colored shape if React rendering fails
    const svg = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="16" height="16" rx="2" fill="${color}" opacity="0.8" />
    </svg>`;
    const buf = await sharp(Buffer.from(svg)).png().toBuffer();
    return "image/png;base64," + buf.toString("base64");
  }
}

// ── Color palette (travel / teal-blue theme) ──────────────────────────────
const C = {
  teal:      "0D7377",
  tealDark:  "0A5A5E",
  tealLight: "14BDCC",
  blue:      "2563EB",
  gold:      "F5A623",
  white:     "FFFFFF",
  offWhite:  "F0F8F9",
  dark:      "0D2626",
  mid:       "2D5F61",
  grey:      "64748B",
  lightGrey: "E2EFF0",
  cardBg:    "FFFFFF",
};

// ── Shadow factory ──────────────────────────────────────────────────────────
const mkShadow = () => ({ type: "outer", color: "000000", blur: 8, offset: 3, angle: 135, opacity: 0.12 });

async function build() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9"; // 10 × 5.625"
  pres.title = "infiYATRA – Modern Travel & Tourism Platform";
  pres.author = "infiYATRA Team";

  // Pre-render icons
  const icons = {
    globe:   await iconPng(FaGlobe,       "#FFFFFF"),
    search:  await iconPng(FaSearch,      "#FFFFFF"),
    route:   await iconPng(FaRoute,       "#FFFFFF"),
    lock:    await iconPng(FaLock,        "#FFFFFF"),
    code:    await iconPng(FaCode,        "#FFFFFF"),
    server:  await iconPng(FaServer,      "#FFFFFF"),
    mobile:  await iconPng(FaMobileAlt,   "#FFFFFF"),
    react:   await iconPng(FaReact,       "#61DAFB"),
    node:    await iconPng(FaNodeJs,      "#8CC84B"),
    ts:      await iconPng(SiTypescript,  "#3178C6"),
    tw:      await iconPng(SiTailwindcss, "#06B6D4"),
    three:   await iconPng(SiThreeDotJs,  "#FFFFFF"),
    check:   await iconPng(FaCheck,       "#FFFFFF"),
    map:     await iconPng(FaMapMarkedAlt,"#FFFFFF"),
    cube:    await iconPng(FaCubes,       "#FFFFFF"),
    chart:   await iconPng(FaChartBar,    "#FFFFFF"),
    users:   await iconPng(FaUsers,       "#FFFFFF"),
    trophy:  await iconPng(FaTrophy,      "#FFFFFF"),
    bulb:    await iconPng(FaLightbulb,   "#FFFFFF"),
    rocket:  await iconPng(FaRocket,      "#FFFFFF"),
    // dark versions
    routeD:  await iconPng(FaRoute,       "#0D7377"),
    codeD:   await iconPng(FaCode,        "#0D7377"),
    checkD:  await iconPng(FaCheck,       "#0D7377"),
  };

  // ============================================================
  // SLIDE 1 — Title
  // ============================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.dark };

    // Left teal accent band
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.15, h: 5.625, fill: { color: C.teal }, line: { color: C.teal } });

    // Big teal circle decoration top-right
    s.addShape(pres.shapes.OVAL, { x: 7.5, y: -1.2, w: 3.8, h: 3.8, fill: { color: C.teal, transparency: 80 }, line: { color: C.teal, transparency: 80 } });
    s.addShape(pres.shapes.OVAL, { x: 8.2, y: -0.5, w: 2.5, h: 2.5, fill: { color: C.tealLight, transparency: 70 }, line: { color: C.tealLight, transparency: 70 } });

    // Bottom-left small circle
    s.addShape(pres.shapes.OVAL, { x: -0.5, y: 4.2, w: 2.2, h: 2.2, fill: { color: C.blue, transparency: 80 }, line: { color: C.blue, transparency: 80 } });

    // Globe icon
    s.addImage({ data: icons.globe, x: 0.5, y: 0.55, w: 0.55, h: 0.55 });

    // Tag
    s.addText("COMPUTER ENGINEERING  |  PROJECT PRESENTATION  |  2025-26", {
      x: 1.15, y: 0.6, w: 8.2, h: 0.45,
      fontSize: 9, fontFace: "Calibri", color: C.tealLight, bold: false, align: "left", charSpacing: 1.5
    });

    // Main title
    s.addText("infi", {
      x: 0.5, y: 1.2, w: 3, h: 1.1,
      fontSize: 62, fontFace: "Calibri", bold: true, color: C.white, align: "left", margin: 0
    });
    s.addText("YATRA", {
      x: 1.82, y: 1.2, w: 4.5, h: 1.1,
      fontSize: 62, fontFace: "Calibri", bold: true, color: C.blue, align: "left", margin: 0
    });

    s.addText("A Modern Travel & Tourism Platform", {
      x: 0.5, y: 2.35, w: 8, h: 0.6,
      fontSize: 20, fontFace: "Calibri", color: C.lightGrey, italic: true, align: "left"
    });

    // Divider
    s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 3.1, w: 3.5, h: 0.04, fill: { color: C.blue }, line: { color: C.blue } });

    // Meta info
    s.addText([
      { text: "Presented by: ", options: { bold: true, color: C.tealLight } },
      { text: "[Student Name 1]  |  [Student Name 2]", options: { color: C.lightGrey } }
    ], { x: 0.5, y: 3.35, w: 8.5, h: 0.4, fontSize: 13, fontFace: "Calibri" });

    s.addText([
      { text: "Guide: ", options: { bold: true, color: C.tealLight } },
      { text: "[Guide Name]  |  [Institute Name]", options: { color: C.lightGrey } }
    ], { x: 0.5, y: 3.8, w: 8.5, h: 0.4, fontSize: 13, fontFace: "Calibri" });

    // Tech stack pills bottom-right
    const techs = ["React 18", "TypeScript", "Tailwind CSS", "Three.js", "Node.js", "Express"];
    techs.forEach((t, i) => {
      const col = i % 3, row = Math.floor(i / 3);
      const px = 6.4 + col * 1.22, py = 4.3 + row * 0.55;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: px, y: py, w: 1.1, h: 0.38, fill: { color: C.mid, transparency: 30 }, line: { color: C.tealLight, transparency: 60 }, rectRadius: 0.08 });
      s.addText(t, { x: px, y: py, w: 1.1, h: 0.38, fontSize: 8.5, fontFace: "Calibri", color: C.tealLight, align: "center", valign: "middle" });
    });
  }

  // ============================================================
  // SLIDE 2 — Problem & Objective
  // ============================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.offWhite };

    // Top bar
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.8, fill: { color: C.tealDark }, line: { color: C.tealDark } });
    s.addText("PROBLEM & OBJECTIVES", {
      x: 0.4, y: 0, w: 9.2, h: 0.8, fontSize: 20, fontFace: "Calibri", bold: true,
      color: C.white, align: "left", valign: "middle"
    });
    s.addImage({ data: icons.bulb, x: 9.3, y: 0.15, w: 0.5, h: 0.5 });

    // LEFT – Problem card
    s.addShape(pres.shapes.RECTANGLE, { x: 0.35, y: 1.05, w: 4.4, h: 3.9, fill: { color: C.white }, line: { color: C.lightGrey }, shadow: mkShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.35, y: 1.05, w: 4.4, h: 0.45, fill: { color: C.blue }, line: { color: C.blue } });
    s.addText("THE PROBLEM", { x: 0.45, y: 1.05, w: 4.2, h: 0.45, fontSize: 13, fontFace: "Calibri", bold: true, color: C.white, valign: "middle" });

    const problems = [
      "Travel info scattered across multiple platforms",
      "Cluttered, non-responsive travel websites",
      "No real-time updates or dynamic content",
      "No day-by-day itinerary breakdowns",
      "Poor mobile experience for travelers",
    ];
    s.addText(problems.map((p, i) => ([
      { text: "✕  " + p, options: { bullet: false, color: C.dark, breakLine: i < problems.length - 1 } }
    ])).flat(), {
      x: 0.55, y: 1.6, w: 4.1, h: 3.2, fontSize: 12.5, fontFace: "Calibri", paraSpaceAfter: 7
    });

    // RIGHT – Objectives card
    s.addShape(pres.shapes.RECTANGLE, { x: 5.25, y: 1.05, w: 4.4, h: 3.9, fill: { color: C.white }, line: { color: C.lightGrey }, shadow: mkShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 5.25, y: 1.05, w: 4.4, h: 0.45, fill: { color: C.teal }, line: { color: C.teal } });
    s.addText("OUR OBJECTIVES", { x: 5.35, y: 1.05, w: 4.2, h: 0.45, fontSize: 13, fontFace: "Calibri", bold: true, color: C.white, valign: "middle" });

    const objs = [
      "Unified interface for trip discovery & planning",
      "Dynamic day-by-day itinerary system",
      "Immersive 3D visual experience (Three.js)",
      "Real-time admin content management",
      "Mobile-first responsive design",
    ];
    s.addText(objs.map((o, i) => ([
      { text: "→  " + o, options: { bullet: false, color: C.dark, breakLine: i < objs.length - 1 } }
    ])).flat(), {
      x: 5.4, y: 1.6, w: 4.1, h: 3.2, fontSize: 12.5, fontFace: "Calibri", paraSpaceAfter: 7
    });
  }

  // ============================================================
  // SLIDE 3 — Tech Stack
  // ============================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.dark };

    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.8, fill: { color: C.teal }, line: { color: C.teal } });
    s.addText("TECHNOLOGY STACK", {
      x: 0.4, y: 0, w: 9.2, h: 0.8, fontSize: 20, fontFace: "Calibri", bold: true, color: C.white, align: "left", valign: "middle"
    });
    s.addImage({ data: icons.code, x: 9.3, y: 0.15, w: 0.5, h: 0.5 });

    const techs = [
      { label: "React 18", sub: "Vite-based frontend framework", icon: icons.react, col: C.teal },
      { label: "TypeScript 5.6", sub: "Type-safe codebase throughout", icon: icons.ts, col: "3178C6" },
      { label: "Tailwind CSS", sub: "Mobile-first responsive styling", icon: icons.tw, col: "0891B2" },
      { label: "Framer Motion", sub: "Smooth page animations", icon: icons.rocket, col: "2563EB" },
      { label: "Three.js / R3F", sub: "3D GLB model rendering", icon: icons.three, col: C.mid },
      { label: "Node.js + Express", sub: "RESTful API backend", icon: icons.node, col: "3D7A3D" },
    ];

    const cols = 3, rows = 2;
    const cw = 3.0, ch = 1.7, gx = 0.35, gy = 1.0, pw = 0.4;

    techs.forEach((t, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const px = gx + col * (cw + 0.15);
      const py = gy + row * (ch + 0.18);

      s.addShape(pres.shapes.RECTANGLE, { x: px, y: py, w: cw, h: ch, fill: { color: "1A3535" }, line: { color: C.mid }, shadow: mkShadow() });
      // Left accent
      s.addShape(pres.shapes.RECTANGLE, { x: px, y: py, w: 0.06, h: ch, fill: { color: t.col }, line: { color: t.col } });
      // Icon circle
      s.addShape(pres.shapes.OVAL, { x: px + 0.18, y: py + 0.35, w: 0.52, h: 0.52, fill: { color: t.col }, line: { color: t.col } });
      s.addImage({ data: t.icon, x: px + 0.22, y: py + 0.39, w: 0.44, h: 0.44 });
      // Text
      s.addText(t.label, { x: px + 0.82, y: py + 0.28, w: 2.1, h: 0.42, fontSize: 13.5, fontFace: "Calibri", bold: true, color: C.white, valign: "middle" });
      s.addText(t.sub, { x: px + 0.82, y: py + 0.72, w: 2.1, h: 0.6, fontSize: 10.5, fontFace: "Calibri", color: "9ECFD1", valign: "top" });
    });
  }

  // ============================================================
  // SLIDE 4 — System Architecture
  // ============================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.offWhite };

    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.8, fill: { color: C.tealDark }, line: { color: C.tealDark } });
    s.addText("SYSTEM ARCHITECTURE", {
      x: 0.4, y: 0, w: 9.2, h: 0.8, fontSize: 20, fontFace: "Calibri", bold: true, color: C.white, align: "left", valign: "middle"
    });
    s.addImage({ data: icons.cube, x: 9.3, y: 0.15, w: 0.5, h: 0.5 });

    // Three layer boxes
    const layers = [
      { title: "FRONTEND  (React + Vite)", items: ["Home / Discover / Trip Details / Admin pages", "Components: Navbar, HeroSection, TripCard, LensModel", "State: useState / useEffect  |  Routing: React Router DOM", "Animations: Framer Motion  |  3D: React Three Fiber"], col: C.teal, x: 0.3 },
      { title: "BACKEND  (Node.js + Express)", items: ["RESTful API: /api/trips  /api/hero", "CRUD endpoints: GET / POST / PUT / DELETE", "CORS configured  |  JSON data store (db.json)", "Vite proxy → Express (port 5173 → 3001)"], col: C.blue, x: 3.65 },
      { title: "DATA LAYER  (JSON Store)", items: ["db.json — Trip records with full itinerary arrays", "Hero slides — Managed via Admin Dashboard", "Designed for migration to PostgreSQL / MongoDB", "Lightweight & fast for development phase"], col: C.gold, x: 7.0 },
    ];

    layers.forEach(l => {
      s.addShape(pres.shapes.RECTANGLE, { x: l.x, y: 1.05, w: 2.95, h: 4.15, fill: { color: C.white }, line: { color: C.lightGrey }, shadow: mkShadow() });
      s.addShape(pres.shapes.RECTANGLE, { x: l.x, y: 1.05, w: 2.95, h: 0.5, fill: { color: l.col }, line: { color: l.col } });
      s.addText(l.title, { x: l.x + 0.08, y: 1.05, w: 2.8, h: 0.5, fontSize: 10, fontFace: "Calibri", bold: true, color: C.white, valign: "middle" });
      s.addText(l.items.map((item, i) => ({
        text: "▸  " + item,
        options: { color: C.dark, breakLine: i < l.items.length - 1 }
      })), { x: l.x + 0.1, y: 1.65, w: 2.75, h: 3.4, fontSize: 10.5, fontFace: "Calibri", paraSpaceAfter: 8 });
    });

    // Arrows between boxes
    s.addShape(pres.shapes.LINE, { x: 3.25, y: 3.1, w: 0.4, h: 0, line: { color: C.grey, width: 2, dashType: "dash" } });
    s.addShape(pres.shapes.LINE, { x: 6.6, y: 3.1, w: 0.4, h: 0, line: { color: C.grey, width: 2, dashType: "dash" } });
  }

  // ============================================================
  // SLIDE 5 — Key Features
  // ============================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.dark };

    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.8, fill: { color: C.teal }, line: { color: C.teal } });
    s.addText("KEY FEATURES", {
      x: 0.4, y: 0, w: 9.2, h: 0.8, fontSize: 20, fontFace: "Calibri", bold: true, color: C.white, align: "left", valign: "middle"
    });
    s.addImage({ data: icons.trophy, x: 9.3, y: 0.15, w: 0.5, h: 0.5 });

    const features = [
      { icon: icons.globe, title: "Dynamic Hero Section", desc: "Rotating high-res destination slides with animated text overlays, fully managed via Admin Dashboard.", col: C.teal },
      { icon: icons.search, title: "Smart Trip Filter", desc: "Real-time search + filter by destination, category tag, and price range on the Discover page.", col: C.blue },
      { icon: icons.route, title: "Day-by-Day Itinerary", desc: "Interactive timeline view showing daily activities, highlights, and accommodation for each trip.", col: "9B59B6" },
      { icon: icons.cube, title: "3D Immersive Landing", desc: "Real-time GLB model rendered via React Three Fiber — a visual metaphor for discovery & perspective.", col: C.gold },
      { icon: icons.lock, title: "Admin Dashboard", desc: "Secure CRUD interface for managing all trip records, hero slides, pricing, and descriptions.", col: "E74C3C" },
      { icon: icons.mobile, title: "Mobile-First Design", desc: "Tailwind CSS responsive grid, tested on iPhone 13, iPad Air, and all desktop breakpoints.", col: "27AE60" },
    ];

    const cw = 3.0, ch = 1.65;
    features.forEach((f, i) => {
      const col = i % 3, row = Math.floor(i / 3);
      const px = 0.35 + col * (cw + 0.15);
      const py = 1.05 + row * (ch + 0.2);

      s.addShape(pres.shapes.RECTANGLE, { x: px, y: py, w: cw, h: ch, fill: { color: "1A3535" }, line: { color: C.mid }, shadow: mkShadow() });
      s.addShape(pres.shapes.RECTANGLE, { x: px, y: py, w: cw, h: 0.06, fill: { color: f.col }, line: { color: f.col } });
      s.addShape(pres.shapes.OVAL, { x: px + 0.18, y: py + 0.25, w: 0.5, h: 0.5, fill: { color: f.col }, line: { color: f.col } });
      s.addImage({ data: f.icon, x: px + 0.22, y: py + 0.29, w: 0.42, h: 0.42 });
      s.addText(f.title, { x: px + 0.8, y: py + 0.22, w: 2.1, h: 0.4, fontSize: 12, fontFace: "Calibri", bold: true, color: C.white });
      s.addText(f.desc, { x: px + 0.12, y: py + 0.72, w: 2.78, h: 0.85, fontSize: 10, fontFace: "Calibri", color: "9ECFD1" });
    });
  }

  // ============================================================
  // SLIDE 6 — How It Works (User Flow)
  // ============================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.offWhite };

    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.8, fill: { color: C.tealDark }, line: { color: C.tealDark } });
    s.addText("HOW IT WORKS — USER FLOW", {
      x: 0.4, y: 0, w: 9.2, h: 0.8, fontSize: 20, fontFace: "Calibri", bold: true, color: C.white, align: "left", valign: "middle"
    });
    s.addImage({ data: icons.route, x: 9.3, y: 0.15, w: 0.5, h: 0.5 });

    const steps = [
      { n: "1", title: "Land on Home", body: "User sees the immersive hero section with rotating destination slides and the interactive 3D lens model.", icon: icons.globe },
      { n: "2", title: "Discover Trips", body: "User applies filters (destination, category, price) on the Discover page to find their perfect trip.", icon: icons.search },
      { n: "3", title: "Explore Details", body: "Clicking a trip card opens the Trip Details page — photo gallery, highlights, and full day-by-day itinerary.", icon: icons.map },
      { n: "4", title: "Admin Manages", body: "Admin logs in to the dashboard and can create, edit, or delete any trip record or hero slide in real time.", icon: icons.chart },
    ];

    const sw = 2.1;
    steps.forEach((step, i) => {
      const px = 0.4 + i * (sw + 0.23);

      // Number circle
      s.addShape(pres.shapes.OVAL, { x: px + 0.65, y: 1.0, w: 0.72, h: 0.72, fill: { color: C.teal }, line: { color: C.teal } });
      s.addText(step.n, { x: px + 0.65, y: 1.0, w: 0.72, h: 0.72, fontSize: 20, fontFace: "Calibri", bold: true, color: C.white, align: "center", valign: "middle" });

      // Connector arrow (not last)
      if (i < steps.length - 1) {
        s.addShape(pres.shapes.LINE, { x: px + sw + 0.05, y: 1.36, w: 0.18, h: 0, line: { color: C.teal, width: 2 } });
      }

      // Card
      s.addShape(pres.shapes.RECTANGLE, { x: px, y: 1.9, w: sw, h: 2.85, fill: { color: C.white }, line: { color: C.lightGrey }, shadow: mkShadow() });
      s.addShape(pres.shapes.OVAL, { x: px + 0.72, y: 2.05, w: 0.58, h: 0.58, fill: { color: C.teal, transparency: 15 }, line: { color: C.teal, transparency: 15 } });
      s.addImage({ data: step.icon, x: px + 0.75, y: 2.08, w: 0.52, h: 0.52 });
      s.addText(step.title, { x: px + 0.1, y: 2.72, w: sw - 0.2, h: 0.45, fontSize: 12.5, fontFace: "Calibri", bold: true, color: C.tealDark, align: "center" });
      s.addText(step.body, { x: px + 0.15, y: 3.22, w: sw - 0.3, h: 1.45, fontSize: 10.5, fontFace: "Calibri", color: C.grey, align: "center" });
    });
  }

  // ============================================================
  // SLIDE 7 — Travel Packages (Results)
  // ============================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.dark };

    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.8, fill: { color: C.teal }, line: { color: C.teal } });
    s.addText("CURATED TRAVEL PACKAGES", {
      x: 0.4, y: 0, w: 9.2, h: 0.8, fontSize: 20, fontFace: "Calibri", bold: true, color: C.white, align: "left", valign: "middle"
    });
    s.addImage({ data: icons.map, x: 9.3, y: 0.15, w: 0.5, h: 0.5 });

    const trips = [
      { name: "Spiti Valley Expedition", days: "8 Days", tag: "Adventure", emoji: "🏔" },
      { name: "Leh Ladakh Expedition", days: "7 Days", tag: "Road Trip", emoji: "🛣" },
      { name: "Kashmir Winter Wonderland", days: "6 Days", tag: "Nature", emoji: "❄" },
      { name: "Backpacking Meghalaya", days: "6 Days", tag: "Backpacking", emoji: "🌿" },
      { name: "Kerala Backwaters", days: "5 Days", tag: "Serenity", emoji: "🚢" },
    ];

    trips.forEach((t, i) => {
      const py = 1.02 + i * 0.88;
      s.addShape(pres.shapes.RECTANGLE, { x: 0.35, y: py, w: 9.3, h: 0.78, fill: { color: "1A3535" }, line: { color: C.mid }, shadow: mkShadow() });
      s.addShape(pres.shapes.RECTANGLE, { x: 0.35, y: py, w: 0.08, h: 0.78, fill: { color: C.blue }, line: { color: C.blue } });
      // Emoji
      s.addText(t.emoji, { x: 0.52, y: py + 0.1, w: 0.7, h: 0.55, fontSize: 22, align: "center", valign: "middle" });
      // Name
      s.addText(t.name, { x: 1.32, y: py + 0.08, w: 5.5, h: 0.55, fontSize: 14, fontFace: "Calibri", bold: true, color: C.white, valign: "middle" });
      // Days tag
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 7.2, y: py + 0.18, w: 1.0, h: 0.4, fill: { color: C.teal }, line: { color: C.teal }, rectRadius: 0.08 });
      s.addText(t.days, { x: 7.2, y: py + 0.18, w: 1.0, h: 0.4, fontSize: 10, fontFace: "Calibri", color: C.white, align: "center", valign: "middle", bold: true });
      // Category tag
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 8.3, y: py + 0.18, w: 1.1, h: 0.4, fill: { color: C.blue, transparency: 20 }, line: { color: C.blue }, rectRadius: 0.08 });
      s.addText(t.tag, { x: 8.3, y: py + 0.18, w: 1.1, h: 0.4, fontSize: 10, fontFace: "Calibri", color: C.white, align: "center", valign: "middle", bold: true });
    });
  }

  // ============================================================
  // SLIDE 8 — Testing & Results
  // ============================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.offWhite };

    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.8, fill: { color: C.tealDark }, line: { color: C.tealDark } });
    s.addText("TESTING & RESULTS", {
      x: 0.4, y: 0, w: 9.2, h: 0.8, fontSize: 20, fontFace: "Calibri", bold: true, color: C.white, align: "left", valign: "middle"
    });
    s.addImage({ data: icons.check, x: 9.3, y: 0.15, w: 0.5, h: 0.5 });

    // Big stat cards
    const stats = [
      { num: "15", label: "Test Cases", sub: "All Passed ✓", col: C.teal },
      { num: "3", label: "Browsers", sub: "Chrome · Firefox · Safari", col: C.blue },
      { num: "3", label: "Device Types", sub: "Mobile · Tablet · Desktop", col: "9B59B6" },
      { num: "100%", label: "API Tests", sub: "Verified via Postman", col: "27AE60" },
    ];

    stats.forEach((st, i) => {
      const px = 0.35 + i * 2.4;
      s.addShape(pres.shapes.RECTANGLE, { x: px, y: 1.0, w: 2.2, h: 1.5, fill: { color: C.white }, line: { color: C.lightGrey }, shadow: mkShadow() });
      s.addShape(pres.shapes.RECTANGLE, { x: px, y: 1.0, w: 2.2, h: 0.1, fill: { color: st.col }, line: { color: st.col } });
      s.addText(st.num, { x: px, y: 1.12, w: 2.2, h: 0.65, fontSize: 38, fontFace: "Calibri", bold: true, color: st.col, align: "center" });
      s.addText(st.label, { x: px, y: 1.76, w: 2.2, h: 0.35, fontSize: 12.5, fontFace: "Calibri", bold: true, color: C.dark, align: "center" });
      s.addText(st.sub, { x: px + 0.1, y: 2.1, w: 2.0, h: 0.35, fontSize: 9.5, fontFace: "Calibri", color: C.grey, align: "center", italic: true });
    });

    // Test result table
    const tableData = [
      [
        { text: "Test Case", options: { bold: true, color: C.white, fill: { color: C.tealDark } } },
        { text: "Result", options: { bold: true, color: C.white, fill: { color: C.tealDark } } },
      ],
      ["Hero section rotation & animations", "✓ Pass"],
      ["3D model loading without layout shift", "✓ Pass"],
      ["Real-time trip filter (keyword + category + price)", "✓ Pass"],
      ["Admin CRUD — Create / Update / Delete trip", "✓ Pass"],
      ["API endpoints (/api/trips, /api/hero)", "✓ Pass"],
      ["Responsive layout across all breakpoints", "✓ Pass"],
    ];

    s.addTable(tableData, {
      x: 0.35, y: 2.75, w: 9.3, h: 2.7,
      colW: [7.0, 2.3],
      border: { pt: 1, color: C.lightGrey },
      fontSize: 11, fontFace: "Calibri",
      fill: { color: C.white },
      align: "left",
    });
  }

  // ============================================================
  // SLIDE 9 — Challenges
  // ============================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.dark };

    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.8, fill: { color: C.teal }, line: { color: C.teal } });
    s.addText("CHALLENGES & SOLUTIONS", {
      x: 0.4, y: 0, w: 9.2, h: 0.8, fontSize: 20, fontFace: "Calibri", bold: true, color: C.white, align: "left", valign: "middle"
    });

    const challenges = [
      {
        challenge: "3D Performance Optimization",
        solution: "GLB model compressed via gltf-pipeline. React Suspense used for async loading. WebGL canvas performance settings tuned → smooth 60 fps.",
        col: C.blue
      },
      {
        challenge: "Mobile Navigation Complexity",
        solution: "Tailwind CSS breakpoint classes for responsive nav. Dedicated slide-in mobile menu component with nested category support.",
        col: "9B59B6"
      },
      {
        challenge: "Admin Real-Time State Sync",
        solution: "Optimistic UI updates — local React state updated immediately on successful API response, avoiding stale data on the public listing.",
        col: C.gold
      },
      {
        challenge: "CORS & Dev Environment Config",
        solution: "Express cors middleware + Vite proxy in vite.config.ts forwarding /api to port 3001 → zero CORS errors in development.",
        col: "27AE60"
      },
    ];

    challenges.forEach((c, i) => {
      const row = Math.floor(i / 2), col = i % 2;
      const px = 0.35 + col * 4.9;
      const py = 1.0 + row * 2.15;

      s.addShape(pres.shapes.RECTANGLE, { x: px, y: py, w: 4.6, h: 1.95, fill: { color: "1A3535" }, line: { color: C.mid }, shadow: mkShadow() });
      s.addShape(pres.shapes.RECTANGLE, { x: px, y: py, w: 4.6, h: 0.06, fill: { color: c.col }, line: { color: c.col } });
      s.addText("⚠ " + c.challenge, { x: px + 0.15, y: py + 0.1, w: 4.3, h: 0.42, fontSize: 12.5, fontFace: "Calibri", bold: true, color: c.col });
      s.addText(c.solution, { x: px + 0.15, y: py + 0.54, w: 4.3, h: 1.3, fontSize: 10.5, fontFace: "Calibri", color: "B0D4D6" });
    });
  }

  // ============================================================
  // SLIDE 10 — Future Scope & Conclusion
  // ============================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.tealDark };

    // Big decorative circle
    s.addShape(pres.shapes.OVAL, { x: 6.2, y: -0.5, w: 5, h: 5, fill: { color: C.teal, transparency: 70 }, line: { color: C.teal, transparency: 70 } });
    s.addShape(pres.shapes.OVAL, { x: 7.0, y: 0.2, w: 3.5, h: 3.5, fill: { color: C.tealLight, transparency: 75 }, line: { color: C.tealLight, transparency: 75 } });

    s.addText("CONCLUSION &", {
      x: 0.5, y: 0.35, w: 6, h: 0.7, fontSize: 32, fontFace: "Calibri", bold: true, color: C.white
    });
    s.addText("FUTURE SCOPE", {
      x: 0.5, y: 1.0, w: 6, h: 0.7, fontSize: 32, fontFace: "Calibri", bold: true, color: C.blue
    });

    s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.85, w: 3, h: 0.05, fill: { color: C.blue }, line: { color: C.blue } });

    s.addText("infiYATRA successfully delivers a modern,\nimmersive travel discovery platform using\ncutting-edge web technologies.", {
      x: 0.5, y: 2.05, w: 5.5, h: 0.9, fontSize: 12.5, fontFace: "Calibri", color: "C8E6E8", italic: true
    });

    // Future scope items
    const future = [
      { icon: icons.lock, text: "User Auth + Wishlist System" },
      { icon: icons.server, text: "PostgreSQL / MongoDB Migration" },
      { icon: icons.bulb, text: "AI-driven Trip Recommendations" },
      { icon: icons.chart, text: "Payment Gateway (Razorpay / Stripe)" },
      { icon: icons.users, text: "User Reviews & Photo Galleries" },
    ];

    s.addText("FUTURE ENHANCEMENTS", {
      x: 0.5, y: 3.1, w: 4, h: 0.35, fontSize: 10, fontFace: "Calibri", bold: true, color: C.tealLight, charSpacing: 1.2
    });

    future.forEach((f, i) => {
      const py = 3.52 + i * 0.41;
      s.addShape(pres.shapes.OVAL, { x: 0.5, y: py + 0.04, w: 0.3, h: 0.3, fill: { color: C.blue }, line: { color: C.blue } });
      s.addImage({ data: f.icon, x: 0.52, y: py + 0.06, w: 0.26, h: 0.26 });
      s.addText(f.text, { x: 0.92, y: py, w: 4.8, h: 0.38, fontSize: 12, fontFace: "Calibri", color: C.white, valign: "middle" });
    });
  }

  // ============================================================
  // SLIDE 11 — Thank You
  // ============================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.dark };

    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.07, fill: { color: C.teal }, line: { color: C.teal } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.555, w: 10, h: 0.07, fill: { color: C.blue }, line: { color: C.blue } });

    // Big circle decorations
    s.addShape(pres.shapes.OVAL, { x: -1, y: 0.5, w: 4, h: 4, fill: { color: C.teal, transparency: 85 }, line: { color: C.teal, transparency: 85 } });
    s.addShape(pres.shapes.OVAL, { x: 7.5, y: 1.5, w: 3, h: 3, fill: { color: C.blue, transparency: 85 }, line: { color: C.blue, transparency: 85 } });

    s.addImage({ data: icons.globe, x: 4.65, y: 0.6, w: 0.7, h: 0.7 });

    s.addText("infiYATRA", {
      x: 1, y: 1.4, w: 8, h: 1.1, fontSize: 60, fontFace: "Calibri", bold: true, color: C.white, align: "center"
    });

    s.addText("THANK YOU", {
      x: 1, y: 2.45, w: 8, h: 0.65, fontSize: 28, fontFace: "Calibri", bold: true, color: C.blue, align: "center", charSpacing: 6
    });

    s.addShape(pres.shapes.RECTANGLE, { x: 3.5, y: 3.25, w: 3, h: 0.05, fill: { color: C.tealLight }, line: { color: C.tealLight } });

    s.addText("Questions & Discussion Welcome", {
      x: 1, y: 3.45, w: 8, h: 0.45, fontSize: 15, fontFace: "Calibri", color: "9ECFD1", align: "center", italic: true
    });

    s.addText("[Student Name 1]  •  [Student Name 2]\nGuide: [Guide Name]  •  [Institute Name]  •  2025-26", {
      x: 1, y: 4.2, w: 8, h: 0.9, fontSize: 12, fontFace: "Calibri", color: C.grey, align: "center"
    });

    s.addText("github.com/pokemonmaster6969/infiYATRA", {
      x: 1, y: 5.1, w: 8, h: 0.35, fontSize: 11, fontFace: "Calibri", color: C.tealLight, align: "center", italic: true
    });
  }

  await pres.writeFile({ fileName: "infiYATRA_Presentation.pptx" });
  console.log("PPT generated successfully at: infiYATRA_Presentation.pptx");
}

build().catch(e => { console.error(e); process.exit(1); });
