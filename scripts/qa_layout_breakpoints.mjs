/**
 * Kiểm tra logic breakpoint đa thiết bị.
 * Chạy: node scripts/qa_layout_breakpoints.mjs
 */

const BREAKPOINTS = { xs: 420, sm: 768, md: 860, lg: 960, xl: 1024, xxl: 1280 };

const layoutMode = (width) => {
  const mode = width >= BREAKPOINTS.xxl ? 'desktop'
    : width >= BREAKPOINTS.xl ? 'laptop'
      : width >= BREAKPOINTS.sm ? 'tablet'
        : 'phone';
  return {
    mode,
    dungSidebarTrai: width >= BREAKPOINTS.md,
    dungBoCucDoc: width < BREAKPOINTS.lg,
  };
};

const cases = [
  { w: 390, mode: 'phone', sidebar: false, doc: true },
  { w: 768, mode: 'tablet', sidebar: false, doc: true },
  { w: 900, mode: 'tablet', sidebar: true, doc: true },
  { w: 1024, mode: 'laptop', sidebar: true, doc: false },
  { w: 1440, mode: 'desktop', sidebar: true, doc: false },
];

for (const c of cases) {
  const r = layoutMode(c.w);
  if (r.mode !== c.mode || r.dungSidebarTrai !== c.sidebar || r.dungBoCucDoc !== c.doc) {
    throw new Error(`width ${c.w}: got ${JSON.stringify(r)}, expected mode=${c.mode}`);
  }
}

console.log(JSON.stringify({ ok: true, cases: cases.length }, null, 2));
