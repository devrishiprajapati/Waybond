const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, PageBreak, BorderStyle, WidthType,
  ShadingType, VerticalAlign, Header, Footer, PageNumber, NumberFormat,
  UnderlineType, ImageRun, LevelFormat, TabStopType, TabStopPosition
} = require('docx');
const fs = require('fs');
const path = require('path');
 
// ─── Constants ────────────────────────────────────────────────────────────────
const TNR = "Times New Roman";
const CW = 9026; // A4 content width in DXA (1" margins)
const LINE = 360; // 1.5 line spacing
 
// ─── Border helpers ───────────────────────────────────────────────────────────
const bdr = { style: BorderStyle.SINGLE, size: 1, color: "AAAAAA" };
const bdrBold = { style: BorderStyle.SINGLE, size: 6, color: "000000" };
const allBorders = { top: bdr, bottom: bdr, left: bdr, right: bdr };
const cm = { top: 80, bottom: 80, left: 120, right: 120 };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
 
// ─── Paragraph helpers ────────────────────────────────────────────────────────
const pCenter = (text, opts = {}) => p(text, { ...opts, align: AlignmentType.CENTER });
const pLeft = (text, opts = {}) => p(text, { ...opts, align: AlignmentType.LEFT });
 
const bold = (text, size = 24) => new TextRun({ text: String(text), font: TNR, size, bold: true });
const italic = (text, size = 24) => new TextRun({ text: String(text), font: TNR, size, italics: true });
const run = (text, size = 24) => new TextRun({ text: String(text), font: TNR, size });
 
const blank = () => new Paragraph({ spacing: { line: LINE }, children: [new TextRun({ text: "", font: TNR, size: 24 })] });
 
const pageBreak = () => new Paragraph({ children: [new PageBreak()] });
 
// Main title: 18pt Bold (guidelines say MAIN TITLE 18 BOLD UNDERLINES)
const chapterHeading = (text) => new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { line: LINE, before: 240, after: 240 },
  children: [new TextRun({ text: text.toUpperCase(), font: TNR, size: 36, bold: true, underline: { type: UnderlineType.SINGLE } })]
});
 
// Inner title: 14pt Bold (guidelines say INNER TITLES 14 BOLD)
const sectionHeading = (text) => new Paragraph({
  alignment: AlignmentType.LEFT,
  spacing: { line: LINE, before: 200, after: 100 },
  children: [new TextRun({ text: text.toUpperCase(), font: TNR, size: 28, bold: true, underline: { type: UnderlineType.SINGLE } })]
});
 
const subHeading = (text) => new Paragraph({
  alignment: AlignmentType.LEFT,
  spacing: { line: LINE, before: 160, after: 80 },
  children: [new TextRun({ text: text, font: TNR, size: 26, bold: true })]
});
 
// Matter: 12pt Normal Justified
const p = (text, opts = {}) => new Paragraph({
  alignment: opts.align ?? AlignmentType.JUSTIFIED,
  spacing: { line: LINE, before: opts.before ?? 0, after: opts.after ?? 120 },
  children: [new TextRun({ text: String(text ?? ''), font: TNR, size: 24, ...opts.run })]
});

// Bullet item
const bullet = (text) => new Paragraph({
  numbering: { reference: "bullets", level: 0 },
  alignment: AlignmentType.JUSTIFIED,
  spacing: { line: LINE, before: 0, after: 80 },
  children: [new TextRun({ text, font: TNR, size: 24 })]
});
 
const numbered = (text) => new Paragraph({
  numbering: { reference: "numbers", level: 0 },
  alignment: AlignmentType.JUSTIFIED,
  spacing: { line: LINE, before: 0, after: 80 },
  children: [new TextRun({ text, font: TNR, size: 24 })]
});
 
// ─── Table helpers ────────────────────────────────────────────────────────────
const hCell = (text, w, shade = "1B4F72") => new TableCell({
  borders: allBorders,
  width: { size: w, type: WidthType.DXA },
  shading: { fill: shade, type: ShadingType.CLEAR },
  margins: cm,
  verticalAlign: VerticalAlign.CENTER,
  children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text, bold: true, font: TNR, size: 24, color: "FFFFFF" })] })]
});
 
const dCell = (text, w, center = false) => new TableCell({
  borders: allBorders,
  width: { size: w, type: WidthType.DXA },
  margins: cm,
  verticalAlign: VerticalAlign.CENTER,
  children: [new Paragraph({ alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT, children: [new TextRun({ text: String(text), font: TNR, size: 24 })] })]
});
 
const dCellBold = (text, w) => new TableCell({
  borders: allBorders,
  width: { size: w, type: WidthType.DXA },
  margins: cm,
  shading: { fill: "D6E4F0", type: ShadingType.CLEAR },
  children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: String(text), font: TNR, size: 24, bold: true })] })]
});

// ─── Figure caption ──────────────────────────────────────────────────────────
// Write figure number at the bottom of figure, E.g. ” Fig. 5(a)” :, followed by title of figure in title case.
const figCaption = (num, title) => new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { line: LINE, before: 60, after: 120 },
  children: [new TextRun({ text: `Fig. ${num}: ${title}`, font: TNR, size: 24, bold: true })]
});
 
// Write table number at the top of table, E.g. “Table 1” : followed by title of table in title case.
const tableCaption = (num, title) => new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { line: LINE, before: 120, after: 60 },
  children: [new TextRun({ text: `Table ${num}: ${title}`, font: TNR, size: 24, bold: true })]
});
 
// ─── Image loader ────────────────────────────────────────────────────────────
const loadImg = (filePath) => {
  try { return fs.readFileSync(filePath); } catch { return null; }
};

const https = require('https');

async function fetchDiagram(mermaidCode) {
  const base64 = Buffer.from(mermaidCode).toString('base64');
  // Try mermaid.ink first, fallback to kroki.io
  const urls = [
    `https://mermaid.ink/img/${base64}`,
    `https://kroki.io/mermaid/png/${base64}` // Kroki also supports base64 for mermaid in some versions
  ];

  for (const url of urls) {
    try {
      const data = await new Promise((resolve, reject) => {
        https.get(url, (res) => {
          if (res.statusCode !== 200) {
            reject(new Error(`Status ${res.statusCode}`));
            return;
          }
          const chunks = [];
          res.on('data', (chunk) => chunks.push(chunk));
          res.on('end', () => resolve(Buffer.concat(chunks)));
        }).on('error', reject);
      });
      if (data) return data;
    } catch (err) {
      console.warn(`Failed to fetch from ${url}: ${err.message}`);
    }
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// BUILD DOCUMENT
// ═══════════════════════════════════════════════════════════════════════════════

const gitDiagramImg = loadImg(path.join(__dirname, 'diagram.png'));

const DIAGRAMS = {
  architecture: `graph TD
    Client((End User / Admin))
    subgraph Frontend [Frontend Tier - React]
        UI[React Components]
        R3F[React Three Fiber - 3D]
        State[State Management]
    end
    subgraph Backend [Backend Tier - Node.js]
        Express[Express.js Server]
        Auth[Login Middleware]
    end
    subgraph Data [Data Tier]
        JSON[(db.json)]
        Storage[Asset Storage]
    end
    Client <--> UI
    UI <--> Express
    UI <--> R3F
    Express <--> JSON
    R3F <--> Storage`,

  adminFlow: `sequenceDiagram
    Admin->>Dashboard: Access Admin Panel
    Dashboard->>API: GET /trips
    API-->>Dashboard: List of Trips
    Admin->>Form: Click "Add New Trip"
    Form-->>Admin: Display Form
    Admin->>Form: Input Details & Submit
    Form->>API: POST /trips
    API->>JSON: Write to db.json
    JSON-->>API: File Updated
    API-->>Dashboard: 201 Created
    Dashboard-->>Admin: Show Success Message`,

  classDiagram: `classDiagram
    class Trip {
        +String id
        +String title
        +String price
        +String image
        +String category
        +List~Itinerary~ itinerary
    }
    class Itinerary {
        +int day
        +String title
        +String description
    }
    class HeroSlide {
        +String id
        +String title
        +String subtitle
        +String image
    }
    class AppState {
        +List~Trip~ trips
        +List~HeroSlide~ slides
    }
    Trip "1" *-- "many" Itinerary
    AppState "1" o-- "many" Trip
    AppState "1" o-- "many" HeroSlide`,

  useCase: `graph LR
    User((Traveler))
    Admin((Administrator))
    subgraph UseCases [infiYATRA Use Cases]
        UC1(Discover Trips)
        UC2(View Itinerary)
        UC3(WhatsApp Enquiry)
        UC4(Admin Login)
        UC5(CRUD Trips)
        UC6(Update Hero)
    end
    User --- UC1
    User --- UC2
    User --- UC3
    Admin --- UC4
    Admin --- UC5
    Admin --- UC6`,

  dfd0: `graph LR
    User((Traveler/Admin))
    System[infiYATRA Platform]
    DB[(Database/JSON)]
    User -- Interaction/Queries --> System
    System -- Response/Data --> User
    System -- CRUD Operations --> DB
    DB -- Data Retrieval --> System`,

  activity: `graph TD
    Start([Start]) --> Search[Search/Filter Trips]
    Search --> Select[Select Trip]
    Select --> View[View Itinerary & Details]
    View --> Enquiry{Want to Enquire?}
    Enquiry -- Yes --> WhatsApp[Open WhatsApp Chat]
    Enquiry -- No --> Search
    WhatsApp --> End([End])`,

  erDiagram: `erDiagram
    TRIP ||--o{ ITINERARY : contains
    TRIP {
        string id PK
        string title
        string price
        string image
        string category
    }
    ITINERARY {
        int day
        string title
        string description
    }
    HERO_SLIDE {
        string id PK
        string title
        string subtitle
        string image
    }
    STAT {
        string label
        string value
    }`
};

async function build() {
  console.log('Fetching diagrams...');
  const imgs = {};
  for (const [key, code] of Object.entries(DIAGRAMS)) {
    imgs[key] = await fetchDiagram(code);
    if (imgs[key]) console.log(`- Fetched ${key} diagram`);
  }
 
const doc = new Document({
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "alpha", levels: [{ level: 0, format: LevelFormat.LOWER_LETTER, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  styles: {
    default: { document: { run: { font: TNR, size: 24 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: TNR, underline: { type: UnderlineType.SINGLE } },
        paragraph: { spacing: { before: 240, after: 240, line: LINE }, outlineLevel: 0, alignment: AlignmentType.CENTER } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: TNR, underline: { type: UnderlineType.SINGLE } },
        paragraph: { spacing: { before: 200, after: 100, line: LINE }, outlineLevel: 1, alignment: AlignmentType.LEFT } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: TNR },
        paragraph: { spacing: { before: 160, after: 80, line: LINE }, outlineLevel: 2, alignment: AlignmentType.LEFT } },
    ]
  },
  sections: [
 
// ══════════════════════════════════════════════════════
// SECTION 1: TITLE PAGE (no page numbers)
// ══════════════════════════════════════════════════════
{
  properties: {
    page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
  },
  children: [
    blank(), blank(), blank(),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: LINE, before: 0, after: 80 }, children: [new TextRun({ text: "A PROJECT REPORT", font: TNR, size: 36, bold: true, color: "2E86C1" })] }),
    blank(),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: LINE, before: 0, after: 80 }, children: [new TextRun({ text: "ON", font: TNR, size: 32, bold: true, color: "000000" })] }),
    blank(),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: LINE, before: 0, after: 80 }, children: [new TextRun({ text: '"INFIYATRA – A MODERN TRAVEL AND TOURISM PLATFORM"', font: TNR, size: 36, bold: true, color: "1B4F72", underline: { type: UnderlineType.SINGLE } })] }),
    blank(), blank(),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: LINE }, children: [italic("Prepared by", 24)] }),
    blank(),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: LINE }, children: [bold("Pooja Patel", 28), new TextRun({ text: " (22BECE3001)", font: TNR, size: 26, bold: true })] }),
    blank(),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: LINE }, children: [bold("Aravind Sharma", 28), new TextRun({ text: " (22BECE3002)", font: TNR, size: 26, bold: true })] }),
    blank(),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: LINE }, children: [italic("Under the guidance of", 24)] }),
    blank(),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: LINE }, children: [new TextRun({ text: "Dr. Nilesh Modi", font: TNR, size: 28, bold: true, color: "1B4F72" }), run("\nAssistant Professor, Department of Computer Engineering", 22)] }),
    blank(), blank(),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: LINE }, children: [bold("ACADEMIC YEAR", 26), run("\n"), bold("2025-26", 28)] }),
    blank(), blank(),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: LINE }, children: [new TextRun({ text: "DEPARTMENT OF COMPUTER ENGINEERING / INFORMATION TECHNOLOGY", font: TNR, size: 24, bold: true, color: "2E86C1" })] }),
    blank(),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: LINE }, children: [bold("L.D. College of Engineering", 26)] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: LINE }, children: [run("Ahmedabad – 380015", 24)] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: LINE }, children: [bold("DIST: AHMEDABAD, GUJARAT", 24)] }),
    blank(),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: LINE }, children: [new TextRun({ text: "MAY 2026", font: TNR, size: 26, bold: true, color: "1B4F72" })] }),
  ]
},
 
// ══════════════════════════════════════════════════════
// SECTION 2: PRE-CHAPTERS (Roman numerals)
// ══════════════════════════════════════════════════════
{
  properties: {
    page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
    pageNumberStart: 1, pageNumberFormatType: NumberFormat.LOWER_ROMAN,
  },
  footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], font: TNR, size: 20 })] })] }) },
  children: [
 
    // ── CERTIFICATE ──────────────────────────────────
    chapterHeading("CERTIFICATE"),
    blank(),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: LINE }, children: [bold("L.D. College of Engineering", 28)] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: LINE }, children: [run("Department of Computer Engineering", 24)] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: LINE, after: 200 }, children: [run("Academic Year 2025-26", 24)] }),
    blank(),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: LINE }, children: [run("Date: _____________", 24)] }),
    blank(),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED, spacing: { line: LINE },
      children: [
        run("This is to certify that the project report entitled "),
        bold('"INFIYATRA – A MODERN TRAVEL AND TOURISM PLATFORM"'),
        run(" has been carried out by "),
        bold("Pooja Patel (22BECE3001)"),
        run(" and "),
        bold("Aravind Sharma (22BECE3002)"),
        run(" under my guidance in partial fulfillment of the requirements for the degree of "),
        bold("Bachelor of Engineering in Computer Engineering (8th Semester)"),
        run(" of L.D. College of Engineering, Ahmedabad, during the academic year 2025-26."),
      ]
    }),
    blank(),
    p("To the best of my knowledge and belief, the matter embodied in this report has not been submitted to any other University or Institution for the award of any Degree or Diploma."),
    blank(), blank(), blank(),
    new Table({
      width: { size: CW, type: WidthType.DXA }, columnWidths: [CW/2, CW/2],
      borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder, insideH: noBorder, insideV: noBorder },
      rows: [new TableRow({ children: [
        new TableCell({ borders: noBorders, width: { size: CW/2, type: WidthType.DXA }, margins: cm, children: [
          pLeft("Internal Guide"), pLeft("Dr. Nilesh Modi"), pLeft("Asst. Professor, CE Dept."), pLeft("L.D. College of Engineering")
        ]}),
        new TableCell({ borders: noBorders, width: { size: CW/2, type: WidthType.DXA }, margins: cm, children: [
          pLeft("Head of Department (HOD)"), pLeft("Dr. Sanjay Shah"), pLeft("Head, CE Department"), pLeft("L.D. College of Engineering")
        ]})
      ]})]
    }),
    blank(), blank(),
    pLeft("Sign Of External Examiner: _______________________________"),
    blank(),
    pLeft("IT Department"),
    pLeft("Date: _____________"),
    pageBreak(),
 
    // ── ACKNOWLEDGEMENT ──────────────────────────────
    chapterHeading("ACKNOWLEDGEMENT"),
    blank(),
    p("Aside from our own efforts, the support and guidance of many individuals played an important role in the successful completion of this project. We would like to express our sincere gratitude to everyone who contributed directly or indirectly to the development of infiYATRA – A Modern Travel and Tourism Platform."),
    blank(),
    p("During the course of this project, we gained valuable practical knowledge and real-world development experience, which significantly helped in improving our technical and problem-solving skills. This project has been an important milestone in deepening our understanding of modern web technologies, full-stack development, and user experience design."),
    blank(),
    p("We would like to thank L.D. College of Engineering, for providing us with the opportunity and necessary resources to participate in and complete this project."),
    blank(),
    new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { line: LINE }, children: [
      run("We would like to express our heartfelt thanks to "), bold("Dr. Sanjay Shah (HOD)"),
      run(", Head of the Department of Computer Engineering, for his continuous support, encouragement, and valuable guidance throughout the project development process. His suggestions and motivation greatly helped in the successful completion of this work.")
    ]}),
    blank(),
    new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { line: LINE }, children: [
      run("We would also like to sincerely thank "), bold("Dr. Nilesh Modi (Project Guide)"),
      run(", for his constant guidance, technical support, and constructive feedback during the project. His valuable suggestions and mentorship helped improve the quality and implementation of the project.")
    ]}),
    blank(),
    p("Finally, we would like to thank all faculty members, friends, fellow students, and everyone who supported us directly or indirectly during the completion of this project. We also extend our gratitude to our parents and family members for their unwavering patience and encouragement throughout this journey."),
    blank(), blank(),
    new Table({
      width: { size: CW, type: WidthType.DXA }, columnWidths: [CW/2, CW/2],
      borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder, insideH: noBorder, insideV: noBorder },
      rows: [new TableRow({ children: [
        new TableCell({ borders: noBorders, width: { size: CW/2, type: WidthType.DXA }, margins: cm, children: [pLeft("Pooja Patel")] }),
        new TableCell({ borders: noBorders, width: { size: CW/2, type: WidthType.DXA }, margins: cm, children: [pLeft("Aravind Sharma")] })
      ]})]
    }),
    pageBreak(),
 
    // ── ABSTRACT ────────────────────────────────────
    chapterHeading("ABSTRACT"),
    blank(),
    p("infiYATRA is a comprehensive, full-stack travel and tourism web application developed to simplify and enrich the process of trip discovery, planning, and booking for modern travelers. The name 'infiYATRA' is derived from 'Infinite' (representing limitless possibilities) and 'YATRA' (the Sanskrit word for journey), encapsulating the platform's vision of offering an endless world of curated travel experiences."),
    blank(),
    p("In an era where travel information is often fragmented across dozens of websites and booking platforms, infiYATRA provides a unified, aesthetically modern interface where users can discover curated travel packages, explore detailed day-by-day itineraries, view destination highlights, and engage with immersive visual content — all from a single platform."),
    blank(),
    p("The application is built using a cutting-edge frontend technology stack comprising React 18 (Vite-based), TypeScript 5.6, Tailwind CSS 3.4, and Framer Motion 11, delivering a highly responsive, animated, and visually engaging user experience. A standout feature of infiYATRA is the integration of real-time 3D rendering via Three.js and React Three Fiber, which presents an interactive 3D lens model on the home page as a visual metaphor for discovery and perspective — a feature rarely seen in travel platforms."),
    blank(),
    p("The backend of the application is powered by Node.js and Express.js, exposing a RESTful API for trip data and hero content management. A JSON-based data store (db.json) is used during the development phase, designed to be easily migrated to a production-grade relational or NoSQL database. Client-side routing is implemented via React Router DOM v6 for a seamless Single Page Application (SPA) experience."),
    blank(),
    p("Key features implemented include: a dynamic hero section with rotating destination slides, a multi-filter trip discovery page (search by keyword, category, and price range), interactive day-by-day itinerary views, a secure administrator dashboard for full CRUD operations on all trip records and hero content, real-time traveler statistics, and a WhatsApp CTA integration widget. The application also includes dedicated destination pages for Himachal Pradesh and Bali, along with static informational pages."),
    blank(),
    p("The main objective of infiYATRA is to demonstrate the potential of modern frontend technologies in creating an immersive, user-centric travel discovery platform. The project successfully achieves its objectives of providing a responsive, feature-rich, and visually unique travel web application with significant potential for future enhancements including payment gateway integration, user authentication with personalized wishlists, AI-driven travel recommendations, and migration to a production database with full-scale deployment."),
    pageBreak(),
 
    // ── INDEX (TABLE OF CONTENTS) ────────────────────
    chapterHeading("INDEX (TABLE OF CONTENTS)"),
    blank(),
    new Table({
      width: { size: CW, type: WidthType.DXA }, columnWidths: [700, 6726, 1600],
      rows: [
        new TableRow({ children: [hCell("Sr. No.", 700), hCell("Title", 6726), hCell("Page No.", 1600)] }),
        ...[
          ["", "Certificate", "II"],
          ["", "Acknowledgement", "III"],
          ["", "Abstract", "IV"],
          ["", "Index (Table of Contents)", "V"],
          ["", "List of Figures", "VI"],
          ["", "List of Tables", "VII"],
          ["1", "CHAPTER 1: INTRODUCTION", "1"],
          ["1.1", "Problem Summary", "1"],
          ["1.2", "Aim and Objectives", "2"],
          ["1.3", "Problem Specification", "3"],
          ["1.4", "Introduction about the Project", "4"],
          ["2", "CHAPTER 2: PLAN OF WORK & MATERIALS AND TOOLS REQUIRED", "7"],
          ["2.1", "Plan of Work", "7"],
          ["2.2", "Hardware Requirements", "8"],
          ["2.3", "Software Requirements", "9"],
          ["2.4", "Technology Used", "10"],
          ["3", "CHAPTER 3: DESIGN AND IMPLEMENTATION STRATEGY", "15"],
          ["3.1", "Data Flow Diagram (DFD)", "15"],
          ["3.2", "System Architecture Diagram", "17"],
          ["3.3", "Use Case Diagram", "18"],
          ["3.4", "Activity Diagram", "20"],
          ["3.5", "Sequence Diagram (Admin CRUD)", "21"],
          ["3.6", "Class Diagram", "23"],
          ["3.7", "Component Structure Diagram", "24"],
          ["3.8", "ER Diagram", "26"],
          ["4", "CHAPTER 4: IMPLEMENTATION", "27"],
          ["4.1", "Actual Implementation Logic", "27"],
          ["4.2", "Project Results and Snapshots", "30"],
          ["4.3", "Testing and Verification", "34"],
          ["5", "CHAPTER 5: CHALLENGES", "36"],
          ["6", "CHAPTER 6: SUMMARY", "38"],
          ["7", "CHAPTER 7: CONCLUSION", "40"],
          ["", "BIBLIOGRAPHY / REFERENCES", "42"],
        ].map(([sr, title, pg]) => new TableRow({ children: [
          dCell(sr, 700, true), dCell(title, 6726), dCell(pg, 1600, true)
        ]}))
      ]
    }),
    pageBreak(),
 
    // ── LIST OF FIGURES ──────────────────────────────
    chapterHeading("LIST OF FIGURES"),
    blank(),
    new Table({
      width: { size: CW, type: WidthType.DXA }, columnWidths: [1200, 6226, 1600],
      rows: [
        new TableRow({ children: [hCell("Figure No.", 1200), hCell("Title", 6226), hCell("Page No.", 1600)] }),
        ...[
          ["Fig. 3.1", "Zero Level DFD (Level-0 DFD)", "15"],
          ["Fig. 3.2", "System Architecture Diagram", "17"],
          ["Fig. 3.3", "Use Case Diagram", "18"],
          ["Fig. 3.4", "Activity Diagram", "20"],
          ["Fig. 3.5", "Sequence Diagram – Admin CRUD Flow", "21"],
          ["Fig. 3.6", "Class Diagram – Data Models", "23"],
          ["Fig. 3.7", "Component Structure Diagram", "24"],
          ["Fig. 3.8", "ER Diagram – Database Schema", "26"],
          ["Fig. 4.1", "Home Page – Hero Section with 3D Model", "27"],
          ["Fig. 4.2", "Home Page – Featured Packages Section", "28"],
          ["Fig. 4.3", "Discover Page – Multi-Filter Sidebar and Trip Grid", "30"],
          ["Fig. 4.4", "Trip Details Page – Day-by-Day Itinerary View", "33"],
          ["Fig. 4.5", "Admin Dashboard – Trip Listing Table", "34"],
        ].map(([fig, title, pg]) => new TableRow({ children: [
          dCell(fig, 1200, true), dCell(title, 6226), dCell(pg, 1600, true)
        ]}))
      ]
    }),
    pageBreak(),
 
    // ── LIST OF TABLES ───────────────────────────────
    chapterHeading("LIST OF TABLES"),
    blank(),
    new Table({
      width: { size: CW, type: WidthType.DXA }, columnWidths: [1200, 6226, 1600],
      rows: [
        new TableRow({ children: [hCell("Table No.", 1200), hCell("Title", 6226), hCell("Page No.", 1600)] }),
        ...[
          ["Table 2.1", "System Hardware Requirements", "8"],
          ["Table 2.2", "System Software Requirements", "9"],
          ["Table 4.1", "Functional Testing Results", "34"],
        ].map(([tbl, title, pg]) => new TableRow({ children: [
          dCell(tbl, 1200, true), dCell(title, 6226), dCell(pg, 1600, true)
        ]}))
      ]
    }),
  ]
},
 
// ══════════════════════════════════════════════════════
// SECTION 3: MAIN CHAPTERS (numeric page numbers)
// ══════════════════════════════════════════════════════
{
  properties: {
    page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
    pageNumberStart: 1, pageNumberFormatType: NumberFormat.DECIMAL,
  },
  footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], font: TNR, size: 20 })] })] }) },
  children: [
 
    // ╔══════════════════════════════════════╗
    // ║  CHAPTER 1: INTRODUCTION             ║
    // ╚══════════════════════════════════════╝
    chapterHeading("CHAPTER 1: INTRODUCTION"),
    blank(),
    sectionHeading("1.1 PROBLEM SUMMARY"),
    blank(),
    p("The travel and tourism industry is one of the fastest-growing sectors in the global economy. With the widespread adoption of smartphones and broadband internet, travelers now rely heavily on digital platforms to research, discover, and book their trips. However, existing travel platforms often suffer from a range of limitations that hamper the user experience."),
    blank(),
    p("Traditional and even many modern travel websites tend to present information in a cluttered, text-heavy format with poor visual hierarchy. Navigation is often non-intuitive, especially on mobile devices, and the lack of clear, day-by-day itinerary breakdowns forces travelers to seek information from multiple sources. Furthermore, very few platforms leverage the immersive potential of modern web technologies such as 3D rendering, fluid animations, or AI-driven personalization."),
    blank(),
    sectionHeading("1.2 AIM AND OBJECTIVES"),
    blank(),
    p("The specific objectives of the infiYATRA project are as follows:"),
    blank(),
    bullet("To design and develop a fully responsive, mobile-first travel web application that provides an intuitive and visually engaging user experience across all device types and screen sizes."),
    bullet("To implement a dynamic and immersive home page experience featuring rotating hero slides, a real-time 3D model rendered via React Three Fiber, live traveler statistics, and curated featured packages."),
    bullet("To build a powerful trip discovery and filtering interface that allows users to simultaneously filter trips by keyword search, category tag, and price range with instant real-time results."),
    bullet("To develop an interactive, day-by-day itinerary viewer within each trip's detail page, providing travelers with a clear and comprehensive view of their planned journey."),
    bullet("To create dedicated destination pages for specific Indian and international travel destinations (Himachal Pradesh, Bali) with relevant packages and visual content."),
    bullet("To implement a secure, feature-rich administrative dashboard enabling non-technical administrators to perform full CRUD operations on all trip records and home page content."),
    bullet("To ensure high code quality, type safety, and maintainability throughout the project by adopting TypeScript 5.6 for the entire frontend codebase."),
    bullet("To demonstrate the practical application of advanced modern web technologies (React Three Fiber, Framer Motion, Tailwind CSS) in a real-world, production-quality web application."),
    blank(),
    sectionHeading("1.3 PROBLEM SPECIFICATION"),
    blank(),
    p("The scope of the infiYATRA platform encompasses the complete development of a frontend-heavy travel web application with a supporting REST API backend. In its current form, the application is designed for use by two distinct user groups: Travelers / End Users and Administrators."),
    blank(),
    p("The system must handle the following technical specifications:"),
    bullet("Frontend: React 18, TypeScript 5.6, Tailwind CSS 3.4, Framer Motion 11, React Three Fiber."),
    bullet("Backend: Node.js, Express.js 5."),
    bullet("Data Store: JSON-based file store (db.json)."),
    bullet("3D Rendering: Three.js / React Three Fiber / @react-three/drei."),
    blank(),
    sectionHeading("1.4 INTRODUCTION ABOUT THE PROJECT"),
    blank(),
    p("infiYATRA is a feature-rich, full-stack travel and tourism web application designed to transform the way modern travelers discover and plan their trips. The platform serves as a one-stop digital destination where users can browse curated travel packages from across India and the world, explore rich destination-specific pages, and view comprehensive day-by-day itineraries without needing to switch between multiple websites or applications."),
    blank(),
    p("The application is built with a component-based architecture using React 18 and TypeScript, ensuring modularity, type safety, and maintainability. The platform is organized into User and Admin modules, providing a seamless experience for both travelers and platform managers."),
    blank(),
    pageBreak(),

    // ╔═══════════════════════════════════════════════════════╗
    // ║  CHAPTER 2: PLAN OF WORK & MATERIALS AND TOOLS REQUIRED ║
    // ╚═══════════════════════════════════════════════════════╝
    chapterHeading("CHAPTER 2: PLAN OF WORK & MATERIALS AND TOOLS REQUIRED"),
    blank(),
    sectionHeading("2.1 PLAN OF WORK"),
    blank(),
    p("The project development was carried out in multiple phases over the academic semester. The phases included:"),
    bullet("Requirement Gathering and Analysis (Weeks 1-2)"),
    bullet("System Design and Architecture Planning (Weeks 3-4)"),
    bullet("Frontend Development - UI/UX and 3D Integration (Weeks 5-8)"),
    bullet("Backend Development - REST API and Data Layer (Weeks 9-10)"),
    bullet("Integration and Testing (Weeks 11-12)"),
    bullet("Documentation and Report Preparation (Weeks 13-14)"),
    blank(),
    sectionHeading("2.2 HARDWARE REQUIREMENTS"),
    blank(),
    tableCaption("2.1", "System Hardware Requirements"),
    new Table({
      width: { size: CW, type: WidthType.DXA }, columnWidths: [400, 3500, 5126],
      rows: [
        new TableRow({ children: [hCell("Sr.", 400), hCell("Component", 3500), hCell("Specification", 5126)] }),
        ...[
          ["1", "Processor", "Intel Core i5 8th Gen or higher / AMD Ryzen 5 or higher"],
          ["2", "RAM", "Minimum 8 GB (16 GB recommended for 3D development workflow)"],
          ["3", "Storage", "Minimum 256 GB SSD (for fast Vite build and dev server operations)"],
          ["4", "GPU", "Dedicated GPU recommended for Three.js / React Three Fiber 3D rendering"],
          ["5", "Display", "Minimum 1366 x 768 resolution for responsive breakpoint testing"],
          ["6", "Network", "Stable broadband internet (for npm package installation and asset CDN loading)"],
        ].map(([sr, comp, spec]) => new TableRow({ children: [dCell(sr, 400, true), dCell(comp, 3500), dCell(spec, 5126)] }))
      ]
    }),
    blank(),
    sectionHeading("2.3 SOFTWARE REQUIREMENTS"),
    blank(),
    tableCaption("2.2", "System Software Requirements"),
    new Table({
      width: { size: CW, type: WidthType.DXA }, columnWidths: [400, 3500, 5126],
      rows: [
        new TableRow({ children: [hCell("Sr.", 400), hCell("Software", 3500), hCell("Version / Details", 5126)] }),
        ...[
          ["1", "Operating System", "Windows 10 / 11 (64-bit) or macOS Monterey+"],
          ["2", "Node.js Runtime", "v18 LTS or higher (required for Vite and Express)"],
          ["3", "Package Manager", "npm v9+ (bundled with Node.js)"],
          ["4", "Code Editor / IDE", "Visual Studio Code (Latest Stable Version)"],
          ["5", "Build Tool", "Vite 5"],
          ["6", "Browser", "Google Chrome 120+, Mozilla Firefox 120+, Safari 16+, Edge 120+"],
        ].map(([sr, sw, ver]) => new TableRow({ children: [dCell(sr, 400, true), dCell(sw, 3500), dCell(ver, 5126)] }))
      ]
    }),
    blank(),
    sectionHeading("2.4 TECHNOLOGY USED"),
    blank(),
    p("The infiYATRA platform leverages a modern full-stack JavaScript/TypeScript ecosystem:"),
    bullet("React 18: Primary frontend framework for building reusable UI components."),
    bullet("TypeScript 5.6: Provides static type checking for improved code quality and maintainability."),
    bullet("Tailwind CSS 3.4: Utility-first CSS framework for rapid and responsive styling."),
    bullet("Framer Motion 11: Animation library for smooth transitions and interactions."),
    bullet("Three.js / React Three Fiber: For real-time 3D model rendering on the home page."),
    bullet("Node.js / Express.js: Backend runtime and web framework for the REST API."),
    blank(),
    pageBreak(),

    // ╔═══════════════════════════════════════════════╗
    // ║  CHAPTER 3: DESIGN AND IMPLEMENTATION STRATEGY ║
    // ╚═══════════════════════════════════════════════╝
    chapterHeading("CHAPTER 3: DESIGN AND IMPLEMENTATION STRATEGY"),
    blank(),
    sectionHeading("3.1 DATA FLOW DIAGRAM (DFD)"),
    blank(),
    p("The Data Flow Diagram (DFD) illustrates how data moves through the infiYATRA system, from user interactions to data persistence."),
    blank(),
    ...(imgs.dfd0 ? [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { line: LINE, before: 120, after: 60 },
        children: [new ImageRun({ data: imgs.dfd0, transformation: { width: 500, height: 250 }, type: "png" })]
      }),
    ] : []),
    figCaption("3.1", "Zero Level DFD – infiYATRA System"),
    blank(),
    sectionHeading("3.2 SYSTEM ARCHITECTURE DIAGRAM"),
    blank(),
    p("The system follows a decoupled three-tier architecture: Frontend (React/Vite), Backend API (Express), and Data Layer (JSON Store)."),
    blank(),
    ...(imgs.architecture ? [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { line: LINE, before: 120, after: 60 },
        children: [new ImageRun({ data: imgs.architecture, transformation: { width: 500, height: 350 }, type: "png" })]
      }),
    ] : []),
    figCaption("3.2", "System Architecture – Frontend, Backend, and Data Layer"),
    blank(),
    sectionHeading("3.3 USE CASE DIAGRAM"),
    blank(),
    ...(imgs.useCase ? [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { line: LINE, before: 120, after: 60 },
        children: [new ImageRun({ data: imgs.useCase, transformation: { width: 550, height: 300 }, type: "png" })]
      }),
    ] : []),
    figCaption("3.3", "Use Case Diagram – System Interactions"),
    blank(),
    sectionHeading("3.4 ACTIVITY DIAGRAM"),
    blank(),
    p("The activity diagram describes the workflow of a traveler discovering and enquiring about a trip."),
    blank(),
    ...(imgs.activity ? [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { line: LINE, before: 120, after: 60 },
        children: [new ImageRun({ data: imgs.activity, transformation: { width: 400, height: 450 }, type: "png" })]
      }),
    ] : []),
    figCaption("3.4", "Activity Diagram – Trip Discovery and Enquiry Flow"),
    blank(),
    sectionHeading("3.5 SEQUENCE DIAGRAM (ADMIN CRUD FLOW)"),
    blank(),
    p("This sequence diagram shows the interaction between the Administrator, Dashboard, API, and the JSON data store during a trip management operation."),
    blank(),
    ...(imgs.adminFlow ? [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { line: LINE, before: 120, after: 60 },
        children: [new ImageRun({ data: imgs.adminFlow, transformation: { width: 550, height: 400 }, type: "png" })]
      }),
    ] : []),
    figCaption("3.5", "Sequence Diagram – Admin CRUD Flow"),
    blank(),
    sectionHeading("3.6 CLASS DIAGRAM (DATA MODELS)"),
    blank(),
    p("The class diagram represents the core data structures and interfaces used across the infiYATRA application."),
    blank(),
    ...(imgs.classDiagram ? [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { line: LINE, before: 120, after: 60 },
        children: [new ImageRun({ data: imgs.classDiagram, transformation: { width: 550, height: 400 }, type: "png" })]
      }),
    ] : []),
    figCaption("3.6", "Class Diagram – Trip and Application State Models"),
    blank(),
    sectionHeading("3.7 COMPONENT STRUCTURE DIAGRAM"),
    blank(),
    ...(gitDiagramImg ? [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { line: LINE, before: 120, after: 60 },
        children: [new ImageRun({ data: gitDiagramImg, transformation: { width: 600, height: 400 }, type: "png" })]
      }),
    ] : [
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: LINE, before: 120, after: 60 },
        children: [new TextRun({ text: "[Fig. 3.7: Component Structure / Git Architecture Diagram]", font: TNR, size: 24, italics: true, color: "888888" })] })
    ]),
    figCaption("3.7", "Component Structure Diagram (Project Architecture)"),
    blank(),
    sectionHeading("3.8 ENTITY RELATIONSHIP (ER) DIAGRAM"),
    blank(),
    p("The ER diagram illustrates the logical structure of the database and the relationships between different entities like Trips, Itineraries, and Hero slides."),
    blank(),
    ...(imgs.erDiagram ? [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { line: LINE, before: 120, after: 60 },
        children: [new ImageRun({ data: imgs.erDiagram, transformation: { width: 550, height: 400 }, type: "png" })]
      }),
    ] : []),
    figCaption("3.8", "ER Diagram – Database Schema and Relationships"),
    blank(),
    pageBreak(),

    // ╔══════════════════════════════════════╗
    // ║  CHAPTER 4: IMPLEMENTATION           ║
    // ╚══════════════════════════════════════╝
    chapterHeading("CHAPTER 4: IMPLEMENTATION"),
    blank(),
    sectionHeading("4.1 ACTUAL IMPLEMENTATION LOGIC"),
    blank(),
    p("The implementation of infiYATRA focuses on a component-based architecture. Key logical components include:"),
    bullet("Frontend Component Logic: React hooks (useState, useEffect) for state management."),
    bullet("3D Rendering: Integration of React Three Fiber for the landing page centerpiece."),
    bullet("Real-time Filtering: Client-side filtering algorithm for instant search results."),
    blank(),
    sectionHeading("4.2 PROJECT RESULTS AND SNAPSHOTS"),
    blank(),
    p("This section presents the visual results of the project through snapshots of the key application pages."),
    blank(),
    figCaption("4.1", "Home Page – Hero Section with Interactive 3D Model"),
    blank(),
    figCaption("4.2", "Home Page – Featured Packages Section"),
    blank(),
    figCaption("4.3", "Discover Page – Multi-Filter Sidebar and Trip Card Grid"),
    blank(),
    figCaption("4.4", "Trip Details Page – Interactive Day-by-Day Itinerary View"),
    blank(),
    figCaption("4.5", "Admin Dashboard – Trip Listing and Management Table"),
    blank(),
    sectionHeading("4.3 TESTING AND VERIFICATION"),
    blank(),
    p("Comprehensive testing was conducted to ensure system stability and correctness."),
    blank(),
    tableCaption("4.1", "Functional Testing Results"),
    new Table({
      width: { size: CW, type: WidthType.DXA }, columnWidths: [400, 4200, 2926, 1500],
      rows: [
        new TableRow({ children: [hCell("Sr.", 400), hCell("Test Case Description", 4200), hCell("Expected Result", 2926), hCell("Status", 1500)] }),
        ...[
          ["1", "Home page hero section loads and rotates slides", "Slides rotate at 5s intervals with smooth fade", "Pass"],
          ["2", "3D GLB model loads on home page without layout shift", "Model renders within Suspense boundary correctly", "Pass"],
          ["3", "Navigation links route to correct pages", "All nav links navigate to correct routes", "Pass"],
          ["4", "Combined multi-filter (keyword + category + price)", "Intersection of all three filters displayed", "Pass"],
          ["5", "Admin – Create new trip via form", "New trip appears in list after POST /api/trips", "Pass"],
        ].map(([sr, desc, exp, status]) => new TableRow({ children: [
          dCell(sr, 400, true), dCell(desc, 4200), dCell(exp, 2926),
          new TableCell({ borders: allBorders, width: { size: 1500, type: WidthType.DXA }, margins: cm, shading: { fill: status === "Pass" ? "D5F5E3" : "FADBD8", type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: status, bold: true, font: TNR, size: 24, color: status === "Pass" ? "1E8449" : "C0392B" })] })] })
        ]}))
      ]
    }),
    blank(),
    pageBreak(),

    // ╔══════════════════════════════════════╗
    // ║  CHAPTER 5: CHALLENGES               ║
    // ╚══════════════════════════════════════╝
    chapterHeading("CHAPTER 5: CHALLENGES"),
    blank(),
    p("The development of infiYATRA presented several technical challenges:"),
    bullet("3D Asset Optimization: Ensuring the 3D model loads quickly without blocking the main thread."),
    bullet("Responsive Design: Adapting complex filters and data tables for mobile devices."),
    bullet("State Synchronization: Keeping the frontend state in sync with the backend JSON store."),
    blank(),
    pageBreak(),

    // ╔══════════════════════════════════════╗
    // ║  CHAPTER 6: SUMMARY                  ║
    // ╚══════════════════════════════════════╝
    chapterHeading("CHAPTER 6: SUMMARY"),
    blank(),
    p("infiYATRA is a modern travel platform that demonstrates the power of the React ecosystem. It provides a seamless discovery experience for travelers and a robust management tool for administrators. The project successfully integrates 3D graphics, fluid animations, and real-time data processing into a single cohesive application."),
    blank(),
    pageBreak(),

    // ╔══════════════════════════════════════╗
    // ║  CHAPTER 7: CONCLUSION               ║
    // ╚══════════════════════════════════════╝
    chapterHeading("CHAPTER 7: CONCLUSION"),
    blank(),
    p("In conclusion, infiYATRA stands as a technically sophisticated and commercially viable project. It achieves all its primary objectives of providing an immersive travel discovery experience. The use of modern technologies like React, TypeScript, and Three.js ensures that the platform is both performant and maintainable for future growth."),
    blank(),
    pageBreak(),

    // ╔══════════════════════════════════════╗
    // ║  BIBLIOGRAPHY / REFERENCES           ║
    // ╚══════════════════════════════════════╝
    chapterHeading("BIBLIOGRAPHY / REFERENCES"),
    blank(),
    p("The following references were consulted:"),
    bullet("React Documentation: https://react.dev/"),
    bullet("Vite Documentation: https://vitejs.dev/"),
    bullet("Tailwind CSS: https://tailwindcss.com/"),
    bullet("Three.js Journey: https://threejs-journey.com/"),
    blank(),
  ]
}
 
]  // end sections
}); // end Document
 
const buffer = await Packer.toBuffer(doc);
fs.writeFileSync(path.join(__dirname, 'infiYATRA_Final_Project_Report.docx'), buffer);
console.log('Done! Report generated.');
} // end build
 
build().catch(e => { console.error(e); process.exit(1); });
