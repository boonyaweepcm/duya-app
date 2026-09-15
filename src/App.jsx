import React, { useState, useEffect, useRef, useMemo } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Pill,
  CalendarDays,
  HelpCircle,
  RotateCcw,
  Upload,
  Camera,
  FileText,
  Image as ImageIcon,
  Plus,
  Trash2,
  Pencil,
  Check,
  ChevronLeft,
  ChevronRight,
  Printer,
  Download,
  QrCode,
  X,
  AlertTriangle,
  Info,
  Sun,
  Sunset,
  Moon,
  UtensilsCrossed,
  ShieldCheck,
  ClipboardList,
  AlarmClock,
  CalendarCheck,
  Stethoscope,
  Sparkles,
  ScanLine,
  VideoOff,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Static config                                                      */
/* ------------------------------------------------------------------ */

const MEALS = [
  {
    key: "breakfast",
    label: "มื้อเช้า",
    time: "07:00–09:00 น.",
    Icon: Sun,
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    icon: "text-amber-500",
  },
  {
    key: "lunch",
    label: "มื้อกลางวัน",
    time: "11:00–13:00 น.",
    Icon: UtensilsCrossed,
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    icon: "text-emerald-500",
  },
  {
    key: "dinner",
    label: "มื้อเย็น",
    time: "17:00–19:00 น.",
    Icon: Sunset,
    bg: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-700",
    icon: "text-violet-500",
  },
  {
    key: "bedtime",
    label: "ก่อนนอน",
    time: "20:00–22:00 น.",
    Icon: Moon,
    bg: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-700",
    icon: "text-sky-600",
  },
];

const FOOD_LABEL = {
  before: "ก่อนอาหาร",
  after: "หลังอาหาร",
  unspecified: "ยังไม่มีข้อมูล",
};

const TIMING_OPTIONS = [
  { key: "breakfast", label: "เช้า" },
  { key: "lunch", label: "กลางวัน" },
  { key: "dinner", label: "เย็น" },
  { key: "bedtime", label: "ก่อนนอน" },
];

const DEMO_MEDS = [
  {
    id: "m1",
    tradeName: "กลูโคฟาจ",
    genericName: "เมทฟอร์มิน",
    genericNameEn: "Metformin",
    dose: "500 มก.",
    qty: "1 เม็ด",
    frequency: "วันละ 2 ครั้ง",
    timing: ["breakfast", "dinner"],
    food: "after",
    timingDetail: "",
    purpose: "รักษาเบาหวาน",
    pill: { type: "tablet", color: "#FFFFFF", scored: true, known: true, imprint: "GPO MF 500" },
  },
  {
    id: "m2",
    tradeName: "",
    genericName: "แอมโลดิพีน",
    genericNameEn: "Amlodipine",
    dose: "5 มก.",
    qty: "1 เม็ด",
    frequency: "วันละ 1 ครั้ง",
    timing: ["breakfast"],
    food: "after",
    timingDetail: "",
    purpose: "รักษาความดันโลหิตสูง",
    pill: { type: "tablet", color: "#F2A6C6", scored: true, known: true, imprint: "A 10" },
  },
  {
    id: "m3",
    tradeName: "",
    genericName: "อะทอร์วาสแตติน",
    genericNameEn: "Atorvastatin",
    dose: "20 มก.",
    qty: "1 เม็ด",
    frequency: "วันละ 1 ครั้ง",
    timing: ["dinner"],
    food: "unspecified",
    timingDetail: "",
    purpose: "ลดไขมันในเลือด",
    pill: { type: "tablet", color: "#F5D477", scored: false, known: true, imprint: "20" },
  },
  {
    id: "m4",
    tradeName: "",
    genericName: "โอเมพราโซล",
    genericNameEn: "Omeprazole",
    dose: "20 มก.",
    qty: "1 แคปซูล",
    frequency: "วันละ 1 ครั้ง",
    timing: ["bedtime"],
    food: "before",
    timingDetail: "ตามคำสั่งแพทย์",
    purpose: "ลดกรดในกระเพาะอาหาร",
    pill: { type: "capsule", color: "#B49AD6", scored: false, known: true, imprint: "" },
  },
];

const BLANK_DRAFT = {
  tradeName: "",
  genericName: "",
  genericNameEn: "",
  dose: "",
  qty: "",
  frequency: "",
  timing: [],
  food: "unspecified",
  timingDetail: "",
  purpose: "",
  pill: { type: "tablet", color: "#D9D9D9", scored: false, known: false, imprint: "" },
};

function thaiDateToday() {
  const d = new Date();
  const months = [
    "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
    "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม",
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
}

const TIMING_KEYS = ["breakfast", "lunch", "dinner", "bedtime"];

const COLOR_NAME_TO_HEX = {
  white: "#FFFFFF", ขาว: "#FFFFFF",
  pink: "#F2A6C6", ชมพู: "#F2A6C6",
  yellow: "#F5D477", เหลือง: "#F5D477",
  purple: "#B49AD6", violet: "#B49AD6", ม่วง: "#B49AD6",
  blue: "#8FB8E8", ฟ้า: "#8FB8E8", น้ำเงิน: "#5B8DEF",
  orange: "#F5B26B", ส้ม: "#F5B26B",
  green: "#9AD1A0", เขียว: "#9AD1A0",
  red: "#E8888A", แดง: "#E8888A",
  brown: "#B98D6F", น้ำตาล: "#B98D6F",
  gray: "#CBD1D6", grey: "#CBD1D6", เทา: "#CBD1D6",
};

function colorNameToHex(name) {
  if (!name) return "#E5E7EB";
  const key = String(name).trim().toLowerCase();
  return COLOR_NAME_TO_HEX[key] || COLOR_NAME_TO_HEX[String(name).trim()] || "#E5E7EB";
}

/** Calls Claude via our own /api/claude serverless function (keeps the API key server-side). */
async function callClaude({ system, messages, tools }) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, messages, tools }),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

function extractText(data) {
  return (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}

function safeParseJson(text) {
  if (!text) return null;
  const cleaned = text.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    const match = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (match) {
      try {
        return JSON.parse(match[1]);
      } catch (e2) {
        return null;
      }
    }
    return null;
  }
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result.split(",")[1]);
    r.onerror = () => reject(new Error("อ่านไฟล์ไม่สำเร็จ"));
    r.readAsDataURL(file);
  });
}

/** Looks up generic name + typical pill appearance for a trade name, via Claude + web search. */
async function lookupGenericAndAppearance(tradeName) {
  const data = await callClaude({
    system:
      "คุณเป็นผู้ช่วยด้านข้อมูลยาสำหรับเภสัชกร ตอบเป็น JSON เท่านั้น ห้ามมีข้อความอื่นนอกจาก JSON ห้ามเดาหากไม่แน่ใจให้เว้นค่าว่าง",
    messages: [
      {
        role: "user",
        content: `ชื่อการค้าของยานี้คือ "${tradeName}" ช่วยค้นหาและระบุ: ชื่อสามัญภาษาไทย, ชื่อสามัญภาษาอังกฤษ, สรรพคุณสั้นๆ, และลักษณะเม็ดยาโดยทั่วไปที่พบบ่อยในไทย (รูปแบบ tablet หรือ capsule, สีโดยประมาณเป็นคำสีภาษาอังกฤษหนึ่งคำ, มีเส้นแบ่งครึ่งหรือไม่, ตัวอักษร/ตัวเลขที่ปั๊มบนเม็ดยาถ้าทราบ) ตอบเป็น JSON รูปแบบ {"genericName":"","genericNameEn":"","purpose":"","pill":{"type":"tablet|capsule","colorName":"","scored":true|false,"imprint":""}}`,
      },
    ],
    tools: [{ type: "web_search_20250305", name: "web_search" }],
  });
  return safeParseJson(extractText(data));
}

/** Reads a medication label / prescription file (image or PDF) and extracts structured entries. */
async function extractMedsFromFile(file) {
  const base64 = await readFileAsBase64(file);
  const isPdf = file.type === "application/pdf";
  const mediaBlock = isPdf
    ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } }
    : { type: "image", source: { type: "base64", media_type: file.type || "image/jpeg", data: base64 } };
  const data = await callClaude({
    system:
      "คุณเป็นผู้ช่วยอ่านฉลากยา/ใบสั่งยา และแปลงเป็นข้อมูลโครงสร้าง ตอบเป็น JSON array เท่านั้น ห้ามมีข้อความอื่น ห้ามเดาข้อมูลที่ไม่มีในภาพ ถ้าไม่แน่ใจให้ใส่ค่าว่างหรือ null แทนการเดา",
    messages: [
      {
        role: "user",
        content: [
          mediaBlock,
          {
            type: "text",
            text: `อ่านฉลากยา/ใบสั่งยานี้ แล้วแปลงยาแต่ละตัวเป็น JSON array ตามรูปแบบนี้ (ห้ามเดาข้อมูลที่ไม่มีในภาพ ถ้าไม่ทราบให้เว้นว่าง):
[{"tradeName":"","genericName":"","genericNameEn":"","dose":"","qty":"","frequency":"","timing":["breakfast"|"lunch"|"dinner"|"bedtime"],"food":"before"|"after"|"unspecified","purpose":"","pill":{"type":"tablet"|"capsule","colorName":"","scored":true|false,"imprint":""}}]
คุณสามารถใช้ความรู้ทั่วไปเกี่ยวกับรูปลักษณ์ยาที่พบบ่อยในไทยเพื่อเติมข้อมูล pill ได้ แต่ห้ามเดาชื่อยา ขนาดยา หรือวิธีใช้ที่ไม่ปรากฏในภาพ`,
          },
        ],
      },
    ],
    tools: [{ type: "web_search_20250305", name: "web_search" }],
  });
  const json = safeParseJson(extractText(data));
  return Array.isArray(json) ? json : [];
}

function normalizeParsedMed(raw) {
  return {
    id: `m${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
    tradeName: raw.tradeName || "",
    genericName: raw.genericName || "",
    genericNameEn: raw.genericNameEn || "",
    dose: raw.dose || "",
    qty: raw.qty || "",
    frequency: raw.frequency || "",
    timing: Array.isArray(raw.timing) ? raw.timing.filter((t) => TIMING_KEYS.includes(t)) : [],
    food: ["before", "after"].includes(raw.food) ? raw.food : "unspecified",
    timingDetail: "",
    purpose: raw.purpose || "",
    pill: {
      type: raw.pill && raw.pill.type === "capsule" ? "capsule" : "tablet",
      color: colorNameToHex(raw.pill && raw.pill.colorName),
      scored: !!(raw.pill && raw.pill.scored),
      imprint: (raw.pill && raw.pill.imprint) || "",
      known: !!(raw.pill && raw.pill.colorName),
    },
  };
}

/** Renders a DOM node to a real, multi-page A4 jsPDF document. */
async function renderPdfDoc(node) {
  const canvas = await html2canvas(node, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;
  const imgData = canvas.toDataURL("image/jpeg", 0.95);

  pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }
  return pdf;
}

/** Generates the PDF and downloads it straight away. */
async function exportNodeToPdf(node, filename) {
  const pdf = await renderPdfDoc(node);
  pdf.save(filename);
}

/** Generates the PDF and opens it in a new tab, where the browser's own PDF viewer can print or save it. */
async function openNodeAsPdf(node) {
  const pdf = await renderPdfDoc(node);
  const blobUrl = pdf.output("bloburl");
  const win = window.open(blobUrl, "_blank");
  if (!win) throw new Error("popup blocked");
}

/** Primary / secondary display name — always surfaces the generic name, per brief. */
function medNames(med) {
  const primary = med.tradeName ? med.tradeName : med.genericName || "ยังไม่มีข้อมูล";
  const secondaryParts = [];
  if (med.tradeName) secondaryParts.push(med.genericName || "ยังไม่มีข้อมูล");
  if (med.genericNameEn) secondaryParts.push(med.genericNameEn);
  return { primary, secondary: secondaryParts.join(" · ") };
}

/* ------------------------------------------------------------------ */
/*  Small shared UI atoms                                              */
/* ------------------------------------------------------------------ */

function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 no-print">
      <div className="flex items-center gap-2 bg-slate-900 text-white text-sm md:text-base px-5 py-3 rounded-xl shadow-lg">
        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>{message}</span>
      </div>
    </div>
  );
}

function SafetyNotice({ compact }) {
  return (
    <div
      className={`avoid-break rounded-2xl border border-amber-200 bg-amber-50 text-amber-900 flex gap-3 items-start ${
        compact ? "p-3 md:p-4" : "p-4 md:p-5"
      }`}
    >
      <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 shrink-0 mt-0.5 text-amber-600" />
      <div className="space-y-1">
        <p className="font-semibold text-sm md:text-base">
          ข้อมูลในตารางสร้างจากคำสั่งยาและผ่านการตรวจสอบก่อนนำไปใช้
        </p>
        <p className="text-sm md:text-base text-amber-800">
          หากข้อมูลไม่ตรงกับฉลากยา กรุณาตรวจสอบกับแพทย์หรือเภสัชกร
        </p>
      </div>
    </div>
  );
}

function PillVisual({ pill, size = 44 }) {
  const uid = useRef(`p${Math.random().toString(36).slice(2, 9)}`).current;
  if (!pill || !pill.known) {
    return (
      <div
        className="rounded-full border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center shrink-0"
        style={{ width: size, height: size }}
        title="ยังไม่ทราบรูปลักษณ์ยาที่แน่นอน"
      >
        <Pill className="text-slate-400" style={{ width: size * 0.5, height: size * 0.5 }} />
      </div>
    );
  }
  if (pill.type === "capsule") {
    const w = size * 1.4;
    const h = size * 0.62;
    return (
      <svg width={w} height={h} viewBox="0 0 70 30" className="shrink-0">
        <defs>
          <clipPath id={`clip-${uid}`}>
            <rect x="1" y="1" width="34" height="28" rx="14" />
          </clipPath>
        </defs>
        <rect x="1" y="1" width="68" height="28" rx="14" fill={pill.color} stroke="#00000022" strokeWidth="1" />
        <rect x="1" y="1" width="34" height="28" fill="#ffffff66" clipPath={`url(#clip-${uid})`} />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className="shrink-0">
      <circle cx="20" cy="20" r="18" fill={pill.color} stroke="#00000022" strokeWidth="1.5" />
      {pill.scored && <line x1="7" y1="20" x2="33" y2="20" stroke="#00000030" strokeWidth="1.5" />}
      {pill.imprint && (
        <text
          x="20"
          y={pill.scored ? 16 : 23}
          textAnchor="middle"
          fontSize={pill.imprint.length > 4 ? "5.5" : "8"}
          fontWeight="700"
          fill="#00000055"
        >
          {pill.imprint}
        </text>
      )}
    </svg>
  );
}

function StepProgress({ step }) {
  const steps = [
    { n: 1, label: "ใส่ข้อมูลยา" },
    { n: 2, label: "ตรวจสอบ" },
    { n: 3, label: "ตารางการกินยา" },
  ];
  return (
    <div className="no-print flex items-center justify-center gap-2 md:gap-4 py-4 md:py-6">
      {steps.map((s, i) => {
        const active = s.n === step;
        const done = s.n < step;
        return (
          <React.Fragment key={s.n}>
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm md:text-base shrink-0 transition-colors ${
                  active
                    ? "bg-teal-700 text-white ring-4 ring-teal-100"
                    : done
                    ? "bg-teal-600 text-white"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {done ? <Check className="w-4 h-4 md:w-5 md:h-5" /> : s.n}
              </div>
              <span
                className={`text-sm md:text-base font-medium hidden sm:inline ${
                  active ? "text-teal-800" : done ? "text-slate-600" : "text-slate-400"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-px w-6 md:w-14 ${s.n < step ? "bg-teal-600" : "bg-slate-200"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function AppHeader({ onReset, onHelp }) {
  return (
    <header className="no-print sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-teal-700 flex items-center justify-center relative">
            <Pill className="w-5 h-5 md:w-6 md:h-6 text-white" />
            <CalendarDays className="w-3.5 h-3.5 text-teal-700 absolute -bottom-1 -right-1 bg-white rounded-full p-0.5" />
          </div>
          <div className="leading-tight">
            <p className="text-lg md:text-xl font-extrabold text-slate-900">ดูยา</p>
            <p className="text-[11px] md:text-xs text-slate-500 -mt-0.5">Do the Drug Plan for Ya</p>
          </div>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          <button
            onClick={onHelp}
            className="flex items-center gap-1.5 px-2.5 md:px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-sm font-medium"
          >
            <HelpCircle className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">ช่วยเหลือ</span>
          </button>
          <button
            onClick={onReset}
            title="เริ่มต้นใหม่"
            className="flex items-center gap-1.5 px-2.5 md:px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-sm font-medium"
          >
            <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">เริ่มใหม่</span>
          </button>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Medication form (used for add + inline edit)                       */
/* ------------------------------------------------------------------ */

function MedicationFormFields({ draft, setDraft }) {
  const [looking, setLooking] = useState(false);
  const [lookupMsg, setLookupMsg] = useState("");

  const toggleTiming = (key) => {
    setDraft((d) => ({
      ...d,
      timing: d.timing.includes(key) ? d.timing.filter((t) => t !== key) : [...d.timing, key],
    }));
  };

  const runLookup = async () => {
    if (!draft.tradeName.trim()) return;
    setLooking(true);
    setLookupMsg("");
    try {
      const result = await lookupGenericAndAppearance(draft.tradeName.trim());
      if (result) {
        setDraft((d) => ({
          ...d,
          genericName: result.genericName || d.genericName,
          genericNameEn: result.genericNameEn || d.genericNameEn,
          purpose: d.purpose || result.purpose || "",
          pill: result.pill
            ? {
                type: result.pill.type === "capsule" ? "capsule" : "tablet",
                color: colorNameToHex(result.pill.colorName),
                scored: !!result.pill.scored,
                imprint: result.pill.imprint || "",
                known: !!result.pill.colorName,
              }
            : d.pill,
        }));
        setLookupMsg("เติมชื่อสามัญและลักษณะเม็ดยาให้แล้ว — กรุณาตรวจสอบความถูกต้องอีกครั้ง");
      } else {
        setLookupMsg("ไม่พบข้อมูล กรุณากรอกชื่อสามัญด้วยตนเอง");
      }
    } catch (e) {
      setLookupMsg("ค้นหาไม่สำเร็จ ลองใหม่อีกครั้งหรือกรอกด้วยตนเอง");
    } finally {
      setLooking(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">ชื่อการค้า (ถ้ามี)</label>
        <div className="flex gap-2">
          <input
            value={draft.tradeName}
            onChange={(e) => setDraft((d) => ({ ...d, tradeName: e.target.value }))}
            placeholder="เช่น กลูโคฟาจ"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
          <button
            type="button"
            onClick={runLookup}
            disabled={!draft.tradeName.trim() || looking}
            title="ค้นหาชื่อสามัญและลักษณะเม็ดยาด้วย AI"
            className="shrink-0 px-3 rounded-xl border border-teal-600 text-teal-700 font-semibold text-sm flex items-center gap-1.5 hover:bg-teal-50 disabled:opacity-40 disabled:hover:bg-white"
          >
            <Sparkles className="w-4 h-4" />
            {looking ? "กำลังค้นหา..." : "ค้นหาด้วย AI"}
          </button>
        </div>
        {lookupMsg && <p className="mt-1.5 text-xs text-teal-700">{lookupMsg}</p>}
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">ชื่อสามัญ (ภาษาไทย) *</label>
        <input
          value={draft.genericName}
          onChange={(e) => setDraft((d) => ({ ...d, genericName: e.target.value }))}
          placeholder="เช่น เมทฟอร์มิน"
          className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">ชื่อสามัญ (English)</label>
        <input
          value={draft.genericNameEn}
          onChange={(e) => setDraft((d) => ({ ...d, genericNameEn: e.target.value }))}
          placeholder="e.g. Metformin"
          className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">ขนาดยา</label>
        <input
          value={draft.dose}
          onChange={(e) => setDraft((d) => ({ ...d, dose: e.target.value }))}
          placeholder="เช่น 500 มก."
          className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">จำนวนที่รับประทาน</label>
        <input
          value={draft.qty}
          onChange={(e) => setDraft((d) => ({ ...d, qty: e.target.value }))}
          placeholder="เช่น 1 เม็ด"
          className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">ความถี่</label>
        <input
          value={draft.frequency}
          onChange={(e) => setDraft((d) => ({ ...d, frequency: e.target.value }))}
          placeholder="เช่น วันละ 2 ครั้ง"
          className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        />
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-semibold text-slate-700 mb-1">สรรพคุณ / ใช้รักษาอะไร</label>
        <input
          value={draft.purpose}
          onChange={(e) => setDraft((d) => ({ ...d, purpose: e.target.value }))}
          placeholder="เช่น รักษาเบาหวาน"
          className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        />
      </div>

      <div className="md:col-span-2 rounded-xl border border-slate-200 p-3.5 bg-slate-50">
        <p className="text-sm font-semibold text-slate-700 mb-2">ลักษณะเม็ดยา (สำหรับแสดงรูปเม็ดยา)</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs text-slate-500 mb-1">รูปแบบ</label>
            <select
              value={draft.pill.type}
              onChange={(e) => setDraft((d) => ({ ...d, pill: { ...d.pill, type: e.target.value } }))}
              className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-sm bg-white"
            >
              <option value="tablet">เม็ด (tablet)</option>
              <option value="capsule">แคปซูล (capsule)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">สี</label>
            <input
              type="color"
              value={draft.pill.color}
              onChange={(e) =>
                setDraft((d) => ({ ...d, pill: { ...d.pill, color: e.target.value, known: true } }))
              }
              className="w-full h-9 rounded-lg border border-slate-300 cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">ตัวพิมพ์บนเม็ดยา</label>
            <input
              value={draft.pill.imprint}
              onChange={(e) => setDraft((d) => ({ ...d, pill: { ...d.pill, imprint: e.target.value } }))}
              placeholder="เช่น A 10"
              className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-sm"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600 pb-2">
            <input
              type="checkbox"
              checked={draft.pill.scored}
              onChange={(e) => setDraft((d) => ({ ...d, pill: { ...d.pill, scored: e.target.checked } }))}
              className="w-4 h-4 rounded border-slate-300 text-teal-700"
            />
            มีเส้นแบ่งครึ่ง
          </label>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          รูปเป็นภาพวาดจำลองตามข้อมูลที่ระบุหรือค้นด้วย AI ไม่ใช่ภาพถ่ายจริงของผลิตภัณฑ์
        </p>
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-semibold text-slate-700 mb-2">เวลา (เลือกได้มากกว่า 1 มื้อ)</label>
        <div className="flex flex-wrap gap-2">
          {TIMING_OPTIONS.map((t) => (
            <button
              type="button"
              key={t.key}
              onClick={() => toggleTiming(t.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                draft.timing.includes(t.key)
                  ? "bg-teal-700 text-white border-teal-700"
                  : "bg-white text-slate-600 border-slate-300 hover:border-teal-400"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-semibold text-slate-700 mb-2">ก่อน / หลังอาหาร</label>
        <div className="flex flex-wrap gap-2">
          {[
            { key: "before", label: "ก่อนอาหาร" },
            { key: "after", label: "หลังอาหาร" },
            { key: "unspecified", label: "ไม่ระบุ" },
          ].map((f) => (
            <button
              type="button"
              key={f.key}
              onClick={() => setDraft((d) => ({ ...d, food: f.key }))}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                draft.food === f.key
                  ? "bg-teal-700 text-white border-teal-700"
                  : "bg-white text-slate-600 border-slate-300 hover:border-teal-400"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          รายละเอียดเวลา (ถ้ามี เช่น "30 นาทีก่อนอาหาร")
        </label>
        <input
          value={draft.timingDetail}
          onChange={(e) => setDraft((d) => ({ ...d, timingDetail: e.target.value }))}
          placeholder="เว้นว่างไว้หากไม่ทราบ — ระบบจะไม่เดาให้"
          className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        />
      </div>
    </div>
  );
}

function MedicationCard({ med, onEdit, onDelete }) {
  const { primary, secondary } = medNames(med);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 flex gap-4 items-start shadow-sm hover:shadow-md transition-shadow">
      <PillVisual pill={med.pill} size={48} />
      <div className="flex-1 min-w-0">
        <p className="text-lg md:text-xl font-bold text-slate-900 truncate">
          {primary} {med.dose}
        </p>
        {secondary && <p className="text-sm text-slate-500">{secondary} {med.dose}</p>}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm md:text-base text-slate-600">
          <span>{med.qty || "ยังไม่มีข้อมูล"}</span>
          <span>{med.frequency || "ยังไม่มีข้อมูล"}</span>
          <span>{FOOD_LABEL[med.food]}</span>
        </div>
        {med.purpose && (
          <p className="mt-2 text-sm md:text-base text-teal-800 bg-teal-50 inline-block px-2.5 py-1 rounded-lg">
            สรรพคุณ: {med.purpose}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5 shrink-0">
        <button
          onClick={() => onEdit(med)}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-teal-700"
          aria-label="แก้ไขยา"
        >
          <Pencil className="w-4 h-4 md:w-5 md:h-5" />
        </button>
        <button
          onClick={() => onDelete(med.id)}
          className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600"
          aria-label="ลบยา"
        >
          <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  STEP 1 — Enter medication information                              */
/* ------------------------------------------------------------------ */

function ParsedCandidateCard({ raw, onAdd, onDiscard }) {
  const preview = normalizeParsedMed(raw);
  const { primary, secondary } = medNames(preview);
  return (
    <div className="rounded-2xl border border-teal-200 bg-teal-50/40 p-4 flex gap-3 items-start">
      <PillVisual pill={preview.pill} size={44} />
      <div className="flex-1 min-w-0">
        <p className="text-lg font-bold text-slate-900">
          {primary} {preview.dose}
        </p>
        {secondary && <p className="text-sm text-slate-500">{secondary}</p>}
        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
          <span>{preview.qty || "ยังไม่มีข้อมูล"}</span>
          <span>{preview.frequency || "ยังไม่มีข้อมูล"}</span>
          <span>{FOOD_LABEL[preview.food]}</span>
        </div>
        {preview.purpose && <p className="mt-1 text-sm text-teal-800">สรรพคุณ: {preview.purpose}</p>}
      </div>
      <div className="flex flex-col gap-1.5 shrink-0">
        <button
          onClick={() => onAdd(preview)}
          className="px-3 py-1.5 rounded-lg bg-teal-700 text-white text-sm font-semibold flex items-center gap-1 hover:bg-teal-800"
        >
          <Plus className="w-3.5 h-3.5" /> เพิ่ม
        </button>
        <button onClick={onDiscard} className="px-3 py-1.5 rounded-lg text-slate-400 text-sm hover:bg-slate-100">
          ไม่เพิ่ม
        </button>
      </div>
    </div>
  );
}

function Step1({ medications, setMedications, onNext, notify }) {
  const [tab, setTab] = useState("manual");
  const [editingId, setEditingId] = useState(null); // 'new' | id | null
  const [draft, setDraft] = useState(BLANK_DRAFT);
  const [fileName, setFileName] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");
  const [parsedMeds, setParsedMeds] = useState([]);
  const fileInputRef = useRef(null);

  // camera state
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraUnavailable, setCameraUnavailable] = useState(false);

  const startAdd = () => {
    setDraft(BLANK_DRAFT);
    setEditingId("new");
  };
  const startEdit = (med) => {
    setDraft({ ...med });
    setEditingId(med.id);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setDraft(BLANK_DRAFT);
  };
  const saveDraft = () => {
    if (!draft.genericName.trim() && !draft.tradeName.trim()) return;
    if (editingId === "new") {
      setMedications((meds) => [...meds, { ...draft, id: `m${Date.now()}` }]);
      notify("เพิ่มยาเรียบร้อยแล้ว");
    } else {
      setMedications((meds) => meds.map((m) => (m.id === editingId ? { ...draft, id: editingId } : m)));
      notify("บันทึกการแก้ไขแล้ว");
    }
    cancelEdit();
  };
  const deleteMed = (id) => {
    setMedications((meds) => meds.filter((m) => m.id !== id));
    if (editingId === id) cancelEdit();
  };

  const handleFile = (f) => {
    if (!f) return;
    setFileName(f.name);
    setPendingFile(f);
    setParsedMeds([]);
    setAnalyzeError("");
  };

  const runAnalyze = async (fileOverride) => {
    const file = fileOverride || pendingFile;
    if (!file) return;
    setAnalyzing(true);
    setAnalyzeError("");
    try {
      const rawList = await extractMedsFromFile(file);
      if (rawList.length === 0) {
        setAnalyzeError("อ่านฉลากยาไม่สำเร็จ หรือไม่พบรายการยาในภาพ กรุณาลองถ่ายภาพให้ชัดขึ้น หรือกรอกด้วยตนเอง");
      } else {
        setParsedMeds(rawList);
        notify("วิเคราะห์ฉลากยาเสร็จแล้ว กรุณาตรวจสอบก่อนเพิ่ม");
      }
    } catch (e) {
      setAnalyzeError("เชื่อมต่อ AI ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง หรือกรอกข้อมูลด้วยตนเอง");
    } finally {
      setAnalyzing(false);
    }
  };

  const addAllParsed = () => {
    const normalized = parsedMeds.map(normalizeParsedMed);
    setMedications((meds) => [...meds, ...normalized]);
    setParsedMeds([]);
    notify(`เพิ่มยา ${normalized.length} รายการจากผลวิเคราะห์แล้ว`);
  };

  // --- camera handling (best-effort; falls back to file picker if unavailable) ---
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraOn(false);
  };

  const startCamera = async () => {
    setCameraUnavailable(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      setCameraOn(true);
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (e) {
      setCameraUnavailable(true);
      setCameraOn(false);
    }
  };

  useEffect(() => stopCamera, []); // cleanup on unmount

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "ภาพถ่ายฉลากยา.jpg", { type: "image/jpeg" });
      stopCamera();
      setFileName(file.name);
      setPendingFile(file);
      setParsedMeds([]);
      runAnalyze(file);
    }, "image/jpeg", 0.92);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-0 pb-32">
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">ใส่ข้อมูลยาของคุณ</h1>
      <p className="mt-1 text-slate-500 text-sm md:text-base">
        กรอกข้อมูลยา หรืออัปโหลดรูปฉลากยา / ใบสั่งยา
      </p>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 bg-slate-100 rounded-xl p-1 w-full sm:w-fit">
        {[
          { key: "manual", label: "กรอกข้อมูลยา" },
          { key: "upload", label: "อัปโหลดไฟล์ / ถ่ายรูป" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm md:text-base font-semibold transition-colors ${
              tab === t.key ? "bg-white text-teal-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "manual" && (
        <div className="mt-6 space-y-4">
          {medications.length === 0 && editingId !== "new" && (
            <div className="text-center py-10 rounded-2xl border border-dashed border-slate-300 text-slate-400">
              ยังไม่มีรายการยา — เริ่มเพิ่มยาตัวแรกของคุณ
            </div>
          )}

          {medications.map((med) =>
            editingId === med.id ? (
              <div key={med.id} className="rounded-2xl border-2 border-teal-600 bg-teal-50/40 p-4 md:p-5">
                <MedicationFormFields draft={draft} setDraft={setDraft} />
                <div className="mt-4 flex gap-2 justify-end">
                  <button onClick={cancelEdit} className="px-4 py-2 rounded-xl text-slate-600 font-medium hover:bg-slate-100">
                    ยกเลิก
                  </button>
                  <button onClick={saveDraft} className="px-5 py-2 rounded-xl bg-teal-700 text-white font-semibold hover:bg-teal-800">
                    บันทึก
                  </button>
                </div>
              </div>
            ) : (
              <MedicationCard key={med.id} med={med} onEdit={startEdit} onDelete={deleteMed} />
            )
          )}

          {editingId === "new" && (
            <div className="rounded-2xl border-2 border-teal-600 bg-teal-50/40 p-4 md:p-5">
              <MedicationFormFields draft={draft} setDraft={setDraft} />
              <div className="mt-4 flex gap-2 justify-end">
                <button onClick={cancelEdit} className="px-4 py-2 rounded-xl text-slate-600 font-medium hover:bg-slate-100">
                  ยกเลิก
                </button>
                <button onClick={saveDraft} className="px-5 py-2 rounded-xl bg-teal-700 text-white font-semibold hover:bg-teal-800">
                  บันทึก
                </button>
              </div>
            </div>
          )}

          {editingId !== "new" && (
            <button
              onClick={startAdd}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed border-teal-300 text-teal-700 font-semibold hover:bg-teal-50"
            >
              <Plus className="w-5 h-5" /> เพิ่มยา
            </button>
          )}
        </div>
      )}

      {tab === "upload" && (
        <div className="mt-6">
          {cameraOn ? (
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-black relative">
              <video ref={videoRef} autoPlay playsInline muted className="w-full max-h-[420px] object-contain bg-black" />
              <div className="absolute bottom-0 inset-x-0 p-4 flex justify-center gap-3 bg-gradient-to-t from-black/60 to-transparent">
                <button
                  onClick={capturePhoto}
                  className="px-5 py-2.5 rounded-xl bg-white text-slate-900 font-semibold flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" /> ถ่ายรูป
                </button>
                <button onClick={stopCamera} className="px-4 py-2.5 rounded-xl bg-black/40 text-white font-medium">
                  ยกเลิก
                </button>
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.heic,.webp"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFile(e.dataTransfer.files?.[0]);
                }}
                className="cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 hover:border-teal-400 hover:bg-teal-50/30 transition-colors py-12 flex flex-col items-center justify-center text-center px-6"
              >
                <Upload className="w-9 h-9 text-teal-600 mb-3" />
                <p className="font-semibold text-slate-700">ลากไฟล์มาวางที่นี่</p>
                <p className="text-slate-400 my-1 text-sm">หรือ</p>
                <span className="px-4 py-2 rounded-xl bg-teal-700 text-white font-medium text-sm">เลือกไฟล์จากเครื่อง</span>
                <p className="mt-4 text-xs text-slate-500">รองรับ PDF, JPG, PNG และ HEIC</p>
              </div>

              <div className="rounded-2xl border-2 border-dashed border-slate-300 py-12 flex flex-col items-center justify-center text-center px-6">
                <Camera className="w-9 h-9 text-teal-600 mb-3" />
                <p className="font-semibold text-slate-700 mb-4">ถ่ายรูปฉลากยาหรือใบสั่งยา</p>
                <button
                  onClick={startCamera}
                  className="px-5 py-2.5 rounded-xl bg-teal-700 text-white font-semibold flex items-center gap-2 hover:bg-teal-800"
                >
                  <Camera className="w-4 h-4" /> เปิดกล้อง
                </button>
                {cameraUnavailable && (
                  <p className="mt-3 text-xs text-amber-700 flex items-center gap-1.5">
                    <VideoOff className="w-3.5 h-3.5" /> ไม่สามารถเข้าถึงกล้องได้ ลองอัปโหลดไฟล์แทน
                  </p>
                )}
              </div>
            </div>
          )}

          {fileName && !cameraOn && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 p-3 bg-slate-50">
              {pendingFile && pendingFile.type === "application/pdf" ? (
                <FileText className="w-5 h-5 text-teal-700 shrink-0" />
              ) : (
                <ImageIcon className="w-5 h-5 text-teal-700 shrink-0" />
              )}
              <span className="text-sm text-slate-700 truncate flex-1">{fileName}</span>
              {!analyzing && parsedMeds.length === 0 && (
                <button
                  onClick={() => runAnalyze()}
                  className="shrink-0 px-3.5 py-1.5 rounded-lg bg-teal-700 text-white text-sm font-semibold flex items-center gap-1.5 hover:bg-teal-800"
                >
                  <ScanLine className="w-4 h-4" /> วิเคราะห์ด้วย AI
                </button>
              )}
              {analyzing && <span className="text-sm text-slate-500">กำลังวิเคราะห์...</span>}
            </div>
          )}
          {analyzeError && <p className="mt-3 text-sm text-red-600">{analyzeError}</p>}

          {parsedMeds.length > 0 && (
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-800">พบยา {parsedMeds.length} รายการ — ตรวจสอบก่อนเพิ่ม</p>
                <button onClick={addAllParsed} className="text-sm font-semibold text-teal-700 hover:underline">
                  เพิ่มทั้งหมด
                </button>
              </div>
              {parsedMeds.map((raw, i) => (
                <ParsedCandidateCard
                  key={i}
                  raw={raw}
                  onAdd={(preview) => {
                    setMedications((meds) => [...meds, preview]);
                    setParsedMeds((list) => list.filter((_, idx) => idx !== i));
                    notify("เพิ่มยาจากผลวิเคราะห์แล้ว");
                  }}
                  onDiscard={() => setParsedMeds((list) => list.filter((_, idx) => idx !== i))}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t border-slate-200 no-print">
        <div className="max-w-3xl mx-auto px-4 md:px-0 py-3.5 flex flex-col sm:flex-row items-center gap-2 sm:justify-between">
          <p className="text-xs md:text-sm text-slate-500 text-center sm:text-left">
            ข้อมูลยาจะถูกนำไปตรวจสอบก่อนสร้างตารางสรุป
          </p>
          <button
            onClick={onNext}
            disabled={medications.length === 0}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-700 text-white font-semibold flex items-center justify-center gap-2 hover:bg-teal-800 disabled:bg-slate-200 disabled:text-slate-400 transition-colors"
          >
            ไปยังขั้นตอนถัดไป <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  STEP 2 — Verify medication information                             */
/* ------------------------------------------------------------------ */

function Step2({ medications, patient, setPatient, onBack, onNext }) {
  const [checked, setChecked] = useState(false);

  const checklist = [
    "ชื่อยาและขนาดยา",
    "จำนวนยาที่รับประทาน",
    "ความถี่และเวลา",
    "ก่อน / หลังอาหาร",
    "สรรพคุณ",
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-0 pb-32">
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">ตรวจสอบข้อมูลยา</h1>
      <p className="mt-1 text-slate-500 text-sm md:text-base">
        กรุณาตรวจสอบความถูกต้องของข้อมูลก่อนสร้างตารางสรุป
      </p>

      <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 flex gap-3 items-start">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-900 text-sm md:text-base">
            AI ช่วยจัดข้อมูล แต่คุณต้องตรวจสอบก่อน
          </p>
          <p className="text-sm text-amber-800 mt-0.5">
            กรุณาตรวจสอบชื่อยา ขนาดยา จำนวนครั้ง เวลา และก่อน/หลังอาหาร
          </p>
        </div>
      </div>

      {/* Patient info */}
      <div className="mt-6 rounded-2xl border border-slate-200 p-4 md:p-5 grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">ชื่อ-สกุล (ไม่บังคับ)</label>
          <input
            value={patient.name}
            onChange={(e) => setPatient((p) => ({ ...p, name: e.target.value }))}
            placeholder="คุณสมชาย ใจดี"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">HN (ไม่บังคับ)</label>
          <input
            value={patient.hn}
            onChange={(e) => setPatient((p) => ({ ...p, hn: e.target.value }))}
            placeholder="เช่น 6812345"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">วันที่จัดทำ</label>
          <input
            value={patient.date}
            readOnly
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-base text-slate-600"
          />
        </div>
      </div>

      {/* Medication summary */}
      <h2 className="mt-8 mb-3 text-lg md:text-xl font-bold text-slate-900">รายการยา</h2>
      <div className="space-y-3">
        {medications.map((med) => {
          const { primary, secondary } = medNames(med);
          return (
            <div key={med.id} className="rounded-2xl border border-slate-200 p-4 flex gap-4 items-start">
              <PillVisual pill={med.pill} size={44} />
              <div className="min-w-0">
                <p className="text-lg font-bold text-slate-900">
                  {primary} {med.dose}
                </p>
                {secondary && <p className="text-sm text-slate-500">{secondary} {med.dose}</p>}
                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                  <span>{med.qty || "ยังไม่มีข้อมูล"}</span>
                  <span>{med.frequency || "ยังไม่มีข้อมูล"}</span>
                  <span>{FOOD_LABEL[med.food]}</span>
                </div>
                {med.purpose && <p className="mt-1.5 text-sm text-teal-800">สรรพคุณ: {med.purpose}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Checklist */}
      <div className="mt-8 rounded-2xl border border-slate-200 p-4 md:p-5">
        <p className="font-semibold text-slate-800 mb-3">รายการตรวจสอบ</p>
        <ul className="space-y-2 mb-4">
          {checklist.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm md:text-base text-slate-700">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" /> {item}
            </li>
          ))}
        </ul>
        <label className="flex items-center gap-3 pt-3 border-t border-slate-100 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="w-5 h-5 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
          />
          <span className="text-sm md:text-base font-medium text-slate-800">
            ตรวจสอบข้อมูลแล้วว่าถูกต้อง
          </span>
        </label>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t border-slate-200 no-print">
        <div className="max-w-3xl mx-auto px-4 md:px-0 py-3.5 flex flex-col-reverse sm:flex-row items-center gap-2 sm:justify-between">
          <button
            onClick={onBack}
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-slate-600 font-semibold flex items-center justify-center gap-2 hover:bg-slate-100"
          >
            <ChevronLeft className="w-4 h-4" /> กลับไปแก้ไข
          </button>
          <button
            onClick={onNext}
            disabled={!checked}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-700 text-white font-semibold flex items-center justify-center gap-2 hover:bg-teal-800 disabled:bg-slate-200 disabled:text-slate-400 transition-colors"
          >
            สร้างตารางสรุปยา <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  STEP 3 — Visual medication summary (hero page)                     */
/* ------------------------------------------------------------------ */

function FoodTimingBadge({ med, tone }) {
  if (med.food === "unspecified") {
    return <span className="text-slate-300 text-xl font-bold">–</span>;
  }
  const isBefore = med.food === "before";
  return (
    <div className="flex flex-col items-center text-center gap-0.5">
      {isBefore ? <Sun className={`w-5 h-5 ${tone}`} /> : <UtensilsCrossed className={`w-5 h-5 ${tone}`} />}
      <span className="font-bold text-slate-800 text-sm md:text-base leading-tight">{FOOD_LABEL[med.food]}</span>
      {med.timingDetail && <span className="text-xs text-slate-400 leading-tight">{med.timingDetail}</span>}
    </div>
  );
}

/* Builds the flat row list (with rowSpan bookkeeping) for the merged table */
function buildScheduleRows(grouped) {
  const rows = [];
  MEALS.forEach((meal) => {
    const meds = grouped[meal.key];
    if (meds.length === 0) {
      rows.push({ meal, med: null, first: true, span: 1, lastOfGroup: true });
    } else {
      meds.forEach((med, idx) =>
        rows.push({
          meal,
          med,
          first: idx === 0,
          span: idx === 0 ? meds.length : 0,
          lastOfGroup: idx === meds.length - 1,
        })
      );
    }
  });
  return rows;
}

function ScheduleTable({ grouped }) {
  const rows = useMemo(() => buildScheduleRows(grouped), [grouped]);
  return (
    <div className="hidden sm:block rounded-2xl border border-slate-200 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-teal-800 text-white text-base md:text-lg">
            <th className="py-3 px-4 font-bold">มื้อ / เวลา</th>
            <th className="py-3 px-4 font-bold">ก่อน-หลังอาหาร</th>
            <th className="py-3 px-4 font-bold">ชื่อยา (ขนาดยา)</th>
            <th className="py-3 px-4 font-bold">สรรพคุณ / ใช้เพื่อ</th>
            <th className="py-3 px-4 font-bold">รูปยา</th>
            <th className="py-3 px-4 font-bold">จำนวน</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const { meal, med, first, span, lastOfGroup } = row;
            const { Icon } = meal;
            const rowBorder = lastOfGroup ? "border-b-4 border-white" : "border-b border-white/60";
            return (
              <tr key={med ? med.id : `${meal.key}-empty`} className={`${meal.bg} ${rowBorder} avoid-break`}>
                {first && (
                  <td rowSpan={span} className={`align-middle py-4 px-4 border-r-2 ${meal.border}`}>
                    <div className="flex flex-col items-center text-center gap-1 w-24">
                      <Icon className={`w-7 h-7 ${meal.icon}`} />
                      <span className={`font-extrabold text-base md:text-lg ${meal.text}`}>{meal.label}</span>
                      <span className="text-xs text-slate-500">{meal.time}</span>
                    </div>
                  </td>
                )}
                {med === null ? (
                  <td colSpan={5} className="py-5 px-4 text-slate-400 italic text-sm md:text-base">
                    ไม่มีรายการยา
                  </td>
                ) : (
                  <>
                    <td className="py-3.5 px-4 align-middle">
                      <FoodTimingBadge med={med} tone={meal.icon} />
                    </td>
                    <td className="py-3.5 px-4 align-middle">
                      {(() => {
                        const { primary, secondary } = medNames(med);
                        return (
                          <>
                            <p className={`text-lg md:text-xl font-extrabold ${meal.text}`}>{primary}</p>
                            <p className="text-sm text-slate-500">
                              {secondary ? `${secondary} ` : ""}
                              {med.dose}
                            </p>
                          </>
                        );
                      })()}
                    </td>
                    <td className="py-3.5 px-4 align-middle text-sm md:text-base text-slate-700">
                      {med.purpose || "ยังไม่มีข้อมูล"}
                    </td>
                    <td className="py-3.5 px-4 align-middle">
                      <div className="flex justify-center">
                        <PillVisual pill={med.pill} size={52} />
                      </div>
                    </td>
                    <td className="py-3.5 px-4 align-middle text-base md:text-lg font-bold text-slate-800">
                      {med.qty || "ยังไม่มีข้อมูล"}
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ScheduleMobile({ grouped }) {
  return (
    <div className="sm:hidden space-y-5">
      {MEALS.map((meal) => {
        const { Icon } = meal;
        const meds = grouped[meal.key];
        return (
          <section key={meal.key} className={`avoid-break rounded-2xl border ${meal.border} overflow-hidden`}>
            <div className={`${meal.bg} px-4 py-3 flex items-center gap-2 border-b ${meal.border}`}>
              <Icon className={`w-6 h-6 ${meal.icon}`} />
              <span className={`font-extrabold text-lg ${meal.text}`}>{meal.label}</span>
              <span className="text-xs text-slate-500 ml-auto">{meal.time}</span>
            </div>
            {meds.length === 0 ? (
              <p className="px-4 py-4 text-slate-400 italic text-sm">ไม่มีรายการยา</p>
            ) : (
              <div className="divide-y divide-slate-100 bg-white">
                {meds.map((med) => {
                  const { primary, secondary } = medNames(med);
                  return (
                  <div key={med.id} className="p-4 flex gap-3">
                    <PillVisual pill={med.pill} size={48} />
                    <div className="min-w-0 flex-1">
                      <p className={`text-lg font-extrabold ${meal.text}`}>{primary}</p>
                      <p className="text-sm text-slate-500">
                        {secondary} {med.dose}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="font-bold text-slate-800">{med.qty || "ยังไม่มีข้อมูล"}</span>
                        <span className="flex items-center gap-1 text-sm font-semibold text-slate-700">
                          {med.food === "unspecified" ? (
                            "–"
                          ) : (
                            <>
                              {med.food === "before" ? (
                                <Sun className={`w-4 h-4 ${meal.icon}`} />
                              ) : (
                                <UtensilsCrossed className={`w-4 h-4 ${meal.icon}`} />
                              )}
                              {FOOD_LABEL[med.food]}
                              {med.timingDetail ? ` · ${med.timingDetail}` : ""}
                            </>
                          )}
                        </span>
                      </div>
                      {med.purpose && <p className="mt-1.5 text-sm text-slate-600">สรรพคุณ: {med.purpose}</p>}
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function QRCodeModal({ onClose, url }) {
  // deterministic pseudo-random 8x8 grid purely for visual/demo purposes
  const cells = useMemo(() => {
    let seed = 0;
    for (const ch of url) seed = (seed * 31 + ch.charCodeAt(0)) % 100000;
    const rnd = () => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed / 2147483648;
    };
    return Array.from({ length: 64 }, () => rnd() > 0.52);
  }, [url]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4 no-print" onClick={onClose}>
      <div
        className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end">
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="font-bold text-slate-900 mb-4">สแกนเพื่อเปิดตารางการกินยาบนโทรศัพท์</p>
        <div className="mx-auto w-48 h-48 grid grid-cols-8 grid-rows-8 gap-0.5 bg-white border border-slate-200 rounded-xl p-3">
          {cells.map((on, i) => (
            <div key={i} className={on ? "bg-slate-900 rounded-[1px]" : "bg-white"} />
          ))}
        </div>
        <p className="mt-4 text-sm text-slate-500 break-all">{url}</p>
        <p className="mt-1 text-xs text-slate-400">ตัวอย่างสาธิต — ยังไม่เชื่อมต่อระบบจริง</p>
      </div>
    </div>
  );
}

function Step3({ medications, patient, onBack, notify }) {
  const [showQR, setShowQR] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [printing, setPrinting] = useState(false);
  const printRef = useRef(null);

  const grouped = useMemo(() => {
    const map = {};
    MEALS.forEach((m) => (map[m.key] = []));
    medications.forEach((med) => {
      med.timing.forEach((t) => {
        if (map[t]) map[t].push(med);
      });
    });
    return map;
  }, [medications]);

  const safeFileName = () => {
    const base = (patient.name || "ตารางยา").replace(/[^\u0E00-\u0E7Fa-zA-Z0-9 ]/g, "").trim() || "ตารางยา";
    return `${base}-ตารางการกินยา.pdf`;
  };

  const handlePrint = async () => {
    if (!printRef.current || printing) return;
    setPrinting(true);
    try {
      await openNodeAsPdf(printRef.current);
    } catch (e) {
      notify("ใช้หน้าต่างพิมพ์ของเบราว์เซอร์แทน — เลือก \"บันทึกเป็น PDF\" ที่ปลายทาง");
      window.print();
    } finally {
      setPrinting(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!printRef.current || generatingPdf) return;
    setGeneratingPdf(true);
    try {
      await exportNodeToPdf(printRef.current, safeFileName());
      notify("ดาวน์โหลด PDF สำเร็จ");
    } catch (e) {
      notify("สร้างไฟล์ PDF อัตโนมัติไม่สำเร็จ — เปิดหน้าต่างพิมพ์ให้แทน เลือก \"บันทึกเป็น PDF\" ที่ปลายทาง");
      window.print();
    } finally {
      setGeneratingPdf(false);
    }
  };

  const notes = [
    "รับประทานยาตามเวลาอย่างสม่ำเสมอ เพื่อให้ยาออกฤทธิ์ได้ดี",
    "ไม่หยุดยาเอง หากมีอาการผิดปกติให้ปรึกษาแพทย์หรือเภสัชกร",
    "หากลืมรับประทานยา ให้รับประทานทันทีที่นึกได้ แต่ถ้าใกล้เวลามื้อถัดไป ให้ข้ามมื้อที่ลืมและรับประทานมื้อต่อไปตามปกติ",
    "เก็บยาให้พ้นแสง ความชื้น และพ้นมือเด็ก",
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-0 pb-24">
      <div className="print-area" ref={printRef}>
        {/* Header card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-2">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
              <ClipboardList className="w-7 h-7 md:w-8 md:h-8 text-teal-700" />
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-extrabold text-slate-900 leading-tight">
                ตารางสรุปการรับประทานยา
              </h1>
              <p className="text-sm md:text-base text-slate-500 mt-0.5">
                โปรดรับประทานยาตามเวลาอย่างสม่ำเสมอ
              </p>
            </div>
          </div>
          <div className="md:ml-auto md:border-l md:border-slate-200 md:pl-6 space-y-1.5 text-sm md:text-base">
            <p className="text-slate-700">
              <span className="text-slate-400">ชื่อ-สกุล</span> {patient.name || "ยังไม่มีข้อมูล"}
            </p>
            <p className="text-slate-700">
              <span className="text-slate-400">HN</span> {patient.hn || "ยังไม่มีข้อมูล"}
            </p>
            <p className="text-slate-700">
              <span className="text-slate-400">วันที่จัดทำ</span> {patient.date}
            </p>
          </div>
        </div>

        <p className="text-xs md:text-sm text-slate-400 mb-5 px-1">
          ข้อมูลในตารางสร้างจากคำสั่งยาและผ่านการตรวจสอบก่อนนำไปใช้
        </p>

        <ScheduleTable grouped={grouped} />
        <ScheduleMobile grouped={grouped} />

        {/* Footer notes */}
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="avoid-break rounded-2xl border border-slate-200 p-4 md:p-5">
            <p className="font-bold text-slate-800 mb-2">หมายเหตุ</p>
            <ul className="space-y-1.5 text-sm text-slate-600 list-disc list-inside">
              {notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
          <div className="avoid-break rounded-2xl border border-teal-100 bg-teal-50/60 p-4 md:p-5">
            <p className="font-bold text-teal-800 mb-3 text-center">ทานยาสม่ำเสมอ ดีต่อสุขภาพ</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="flex flex-col items-center gap-1">
                <AlarmClock className="w-6 h-6 text-teal-700" />
                <span className="text-xs text-slate-600 leading-tight">ทานให้ตรงเวลาทุกวัน</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <CalendarCheck className="w-6 h-6 text-teal-700" />
                <span className="text-xs text-slate-600 leading-tight">ไม่หยุดยาเอง</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Stethoscope className="w-6 h-6 text-teal-700" />
                <span className="text-xs text-slate-600 leading-tight">พบแพทย์ตามนัด</span>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-5 text-center text-sm text-slate-500">
          หากมีข้อสงสัยเกี่ยวกับการใช้ยา โปรดสอบถามแพทย์หรือเภสัชกร
        </p>
      </div>

      {/* Action bar */}
      <div className="no-print mt-8 flex flex-wrap gap-3">
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl text-slate-600 font-semibold flex items-center gap-2 hover:bg-slate-100 border border-slate-200"
        >
          <ChevronLeft className="w-4 h-4" /> กลับไปตรวจสอบ
        </button>
        <button
          onClick={handlePrint}
          disabled={printing}
          className="px-5 py-2.5 rounded-xl bg-teal-700 text-white font-semibold flex items-center gap-2 hover:bg-teal-800 disabled:opacity-50"
        >
          <Printer className="w-4 h-4" /> {printing ? "กำลังสร้าง PDF..." : "พิมพ์"}
        </button>
        <button
          onClick={handleDownloadPdf}
          disabled={generatingPdf}
          className="px-5 py-2.5 rounded-xl border border-teal-700 text-teal-700 font-semibold flex items-center gap-2 hover:bg-teal-50 disabled:opacity-50"
        >
          <Download className="w-4 h-4" /> {generatingPdf ? "กำลังสร้าง PDF..." : "ดาวน์โหลด PDF"}
        </button>
        <button
          onClick={() => setShowQR(true)}
          className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold flex items-center gap-2 hover:bg-slate-50"
        >
          <QrCode className="w-4 h-4" /> QR Code
        </button>
      </div>

      {showQR && <QRCodeModal onClose={() => setShowQR(false)} url="https://duya.app/medication-summary/demo-001" />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Root app                                                            */
/* ------------------------------------------------------------------ */

export default function App() {
  const [step, setStep] = useState(1);
  const [medications, setMedications] = useState(DEMO_MEDS);
  const [patient, setPatient] = useState({ name: "คุณสมชาย ใจดี", hn: "", date: thaiDateToday() });
  const [toastMsg, setToastMsg] = useState(null);

  const notify = (msg) => setToastMsg(msg);

  useEffect(() => {
    if (!toastMsg) return;
    const t = setTimeout(() => setToastMsg(null), 2600);
    return () => clearTimeout(t);
  }, [toastMsg]);

  const reset = () => {
    setStep(1);
    setMedications(DEMO_MEDS);
    setPatient({ name: "คุณสมชาย ใจดี", hn: "", date: thaiDateToday() });
  };

  return (
    <div className="min-h-screen font-thai text-slate-900" style={{ backgroundColor: "#FAF9F6" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bai+Jamjuree:wght@400;500;600;700&display=swap');
        .font-thai { font-family: 'Bai Jamjuree', 'Noto Sans Thai', system-ui, sans-serif; }
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print-area { padding: 0 !important; }
          .avoid-break { break-inside: avoid; page-break-inside: avoid; }
          @page { size: A4; margin: 14mm; }
        }
      `}</style>

      <AppHeader
        onReset={reset}
        onHelp={() => notify("ดูยาช่วยจัดข้อมูลยาให้อ่านง่ายขึ้น แต่ไม่ได้วินิจฉัยหรือสั่งยา")}
      />

      <StepProgress step={step} />

      <main className="pt-2 pb-16">
        {step === 1 && (
          <Step1
            medications={medications}
            setMedications={setMedications}
            onNext={() => setStep(2)}
            notify={notify}
          />
        )}
        {step === 2 && (
          <Step2
            medications={medications}
            patient={patient}
            setPatient={setPatient}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <Step3 medications={medications} patient={patient} onBack={() => setStep(2)} notify={notify} />
        )}
      </main>

      <Toast message={toastMsg} />
    </div>
  );
}
