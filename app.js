/**
 * Vector2SVG - Standard JavaScript Application
 * Runs directly in any modern browser using a simple HTTP server (Python, Nginx, Apache, Node, etc.)
 * Without requiring any build step or React runtime.
 */
import { SAMPLE_VECTORS } from './sampleVectors.js';
import { convertVectorToSvg } from './vectorParser.js';
import { normalizeHexForPicker, generateHashColor } from './colorUtils.js';

// SVG Icons (Lucide-inspired pure inline SVGs)
const ICONS = {
  fileCode: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/></svg>`,
  upload: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
  clipboard: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>`,
  check: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  trash: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`,
  copy: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`,
  download: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  zoomIn: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`,
  zoomOut: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`,
  reset: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`,
  grid: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>`,
  eye: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`,
  palette: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>`,
  code: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
  sun: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,
  moon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
  shuffle: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"/><path d="m18 2 4 4-4 4"/><path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2"/><path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8"/><path d="m18 14 4 4-4 4"/></svg>`,
  arrowUpRight: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>`,
  image: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`,
};

const COLOR_PRESETS = [
  '#2563eb', '#0d9488', '#10b981', '#f59e0b', '#ea580c', '#ef4444', '#8b5cf6', '#ec4899', '#0f172a', '#ffffff',
];

// App State
const state = {
  activeTab: 'workspace', // 'workspace' | 'specs'
  xmlInput: SAMPLE_VECTORS[0].xml,
  selectedSampleId: SAMPLE_VECTORS[0].id,
  overrides: {},
  options: {
    responsive: false,
    addXmlns: true,
    prettyPrint: true,
    strokeScaling: false,
  },
  // Preview Controls
  zoom: 1,
  pan: { x: 0, y: 0 },
  isPanning: false,
  startPan: { x: 0, y: 0 },
  bgMode: 'checker-light', // 'checker-light' | 'checker-dark' | 'white' | 'slate-dark' | 'black'
  showGrid: false,
  wireframeMode: false,
  // Code Output Controls
  codeTab: 'svg', // 'svg' | 'jsx' | 'datauri'
  codeTheme: 'dark', // 'dark' | 'light'
  // Filters
  refSearch: '',
  refFilterType: 'all', // 'all' | 'color' | 'other'
  // Transient feedback
  copiedInput: false,
  copiedOutput: false,
  copiedPreview: false,
  isDraggingFile: false,
};

// Cached conversion result
let conversionResult = null;

function runConversion() {
  conversionResult = convertVectorToSvg(state.xmlInput, state.overrides, state.options);
}

// Reactivity & Re-render
function render() {
  const root = document.getElementById('app') || document.getElementById('root');
  if (!root) return;

  runConversion();

  root.innerHTML = `
    <div class="app-container">
      ${renderHeader()}
      <main class="main-content">
        ${state.activeTab === 'specs' ? renderSpecsGuide() : renderWorkspace()}
      </main>
      ${renderFooter()}
    </div>
  `;

  attachEventListeners();
}

function renderHeader() {
  return `
    <header class="header-bar">
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <a href="#" id="nav-brand" class="brand-link">
          <img src="./favicon.svg" alt="Vector2SVG" class="app-brand-icon" width="28" height="28" />
          <span class="brand-title">Vector2SVG</span>
        </a>
        <span class="brand-badge">Android Vector to SVG</span>
      </div>

      <nav class="nav-links">
        <button type="button" id="tab-converter-btn" class="nav-link ${state.activeTab === 'workspace' ? 'active' : ''}">
          Converter
        </button>
        <button type="button" id="tab-specs-btn" class="nav-link ${state.activeTab === 'specs' ? 'active' : ''}">
          Android Vector Specs
        </button>
        <a href="https://developer.android.com/reference/android/graphics/drawable/VectorDrawable" target="_blank" rel="noreferrer" class="nav-link" style="display: flex; align-items: center; gap: 0.25rem;">
          Official Docs ${ICONS.arrowUpRight}
        </a>
      </nav>

      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <button type="button" id="reset-all-btn" class="btn btn-default" title="Reset to default sample">
          ${ICONS.reset}
          <span>Reset Sample</span>
        </button>
      </div>
    </header>
  `;
}

function renderDiagnostics() {
  if (!conversionResult.diagnostics || conversionResult.diagnostics.length === 0) {
    return '';
  }
  return `
    <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.5rem;">
      ${conversionResult.diagnostics.map((diag) => `
        <div class="diag-banner ${diag.level === 'error' ? 'diag-error' : diag.level === 'warning' ? 'diag-warning' : 'diag-info'}">
          <span>${escapeHtml(diag.message)}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function renderWorkspace() {
  const lineCount = state.xmlInput ? state.xmlInput.split('\n').length : 0;
  const byteCount = new Blob([state.xmlInput || '']).size;

  return `
    ${renderDiagnostics()}
    
    <!-- Split Workspace -->
    <div class="split-workspace">
      <!-- Left: XML Editor -->
      <div class="card-panel" id="xml-editor-panel" style="position: relative; min-height: 460px; ${state.isDraggingFile ? 'border-color: #2563eb; background-color: #eff6ff;' : ''}">
        
        <div class="panel-header">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            ${ICONS.fileCode}
            <span style="font-size: 0.75rem; font-weight: 600; color: #1e293b;">Android Vector XML</span>
            <span style="color: #cbd5e1;">·</span>
            <span class="font-mono tabular-nums" style="font-size: 11px; color: #64748b;">
              ${lineCount} lines · ${(byteCount / 1024).toFixed(1)} KB
            </span>
          </div>

          <div style="display: flex; align-items: center; gap: 0.375rem;">
            <input type="file" id="file-upload-input" accept=".xml,.txt,.svg" style="display: none;" />
            <button type="button" id="upload-btn" class="btn btn-default" title="Upload XML from computer">
              ${ICONS.upload}
              <span>Upload</span>
            </button>
            <button type="button" id="paste-btn" class="btn btn-default" title="Paste from clipboard">
              ${ICONS.clipboard}
              <span>Paste</span>
            </button>
            <button type="button" id="copy-input-btn" class="btn btn-default" title="Copy XML code">
              ${state.copiedInput ? ICONS.check : ICONS.clipboard}
              <span>${state.copiedInput ? 'Copied' : 'Copy'}</span>
            </button>
            <button type="button" id="clear-input-btn" class="btn btn-danger-ghost" title="Clear input">
              ${ICONS.trash}
              <span>Clear</span>
            </button>
          </div>
        </div>

        <!-- Preset sample pills -->
        <div style="padding: 0.5rem 1rem; background-color: #f8fafc; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; gap: 0.5rem; overflow-x: auto;">
          <span style="font-size: 11px; font-weight: 500; color: #64748b; white-space: nowrap;">Load Sample:</span>
          <div style="display: flex; align-items: center; gap: 0.375rem; flex-wrap: nowrap;">
            ${SAMPLE_VECTORS.map((sample) => `
              <button
                type="button"
                data-sample-id="${sample.id}"
                class="sample-btn btn ${state.selectedSampleId === sample.id ? 'btn-primary' : 'btn-outline'}"
                style="padding: 0.25rem 0.5rem; font-size: 11px;"
              >
                ${escapeHtml(sample.title)}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Drag Over Overlay -->
        ${state.isDraggingFile ? `
          <div style="position: absolute; inset: 0; z-index: 20; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: rgba(239, 246, 255, 0.95); border: 2px dashed #2563eb; border-radius: 0.75rem;">
            <div style="color: #2563eb; margin-bottom: 0.5rem;">${ICONS.upload}</div>
            <p style="font-size: 0.875rem; font-weight: 600; color: #1e3a8a;">Drop your Android Vector XML file here</p>
            <p style="font-size: 0.75rem; color: #2563eb; margin-top: 0.25rem;">Supports .xml files and raw vector snippets</p>
          </div>
        ` : ''}

        <!-- Textarea input -->
        <textarea
          id="xml-textarea"
          class="code-input"
          placeholder="Paste your Android Vector Drawable XML here...&#10;&#10;Example:&#10;&lt;vector xmlns:android=&quot;http://schemas.android.com/apk/res/android&quot;&#10;    android:width=&quot;24dp&quot;&#10;    android:height=&quot;24dp&quot;&#10;    android:viewportWidth=&quot;24&quot;&#10;    android:viewportHeight=&quot;24&quot;&gt;&#10;    &lt;path&#10;        android:fillColor=&quot;@color/primary&quot;&#10;        android:pathData=&quot;M12,2 L2,22 L22,22 Z&quot; /&gt;&#10;&lt;/vector&gt;"
          spellcheck="false"
        >${escapeHtml(state.xmlInput)}</textarea>

        <div class="panel-footer">
          <span>Drag & drop any .xml file directly into this box</span>
          <span class="font-mono">UTF-8 / XML 1.0</span>
        </div>
      </div>

      <!-- Right: SVG Live Preview -->
      <div class="card-panel" style="min-height: 460px;">
        <div class="panel-header" style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-size: 0.75rem; font-weight: 600; color: #1e293b;">SVG Live Preview</span>
            <span style="color: #cbd5e1;">·</span>
            <span class="font-mono tabular-nums" style="font-size: 11px; color: #64748b;">
              ${conversionResult.stats.width} × ${conversionResult.stats.height} (viewBox: ${conversionResult.stats.viewportWidth}×${conversionResult.stats.viewportHeight})
            </span>
          </div>

          <!-- Preview Controls -->
          <div style="display: flex; align-items: center; gap: 0.25rem;">
            <div style="display: flex; align-items: center; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.375rem; padding: 2px;">
              <button type="button" id="preview-zoom-out" class="btn btn-default" style="padding: 3px 6px;" title="Zoom Out">${ICONS.zoomOut}</button>
              <span class="font-mono tabular-nums" style="font-size: 11px; padding: 0 6px; min-width: 40px; text-align: center; color: #475569;">
                ${Math.round(state.zoom * 100)}%
              </span>
              <button type="button" id="preview-zoom-in" class="btn btn-default" style="padding: 3px 6px;" title="Zoom In">${ICONS.zoomIn}</button>
              <button type="button" id="preview-zoom-reset" class="btn btn-default" style="padding: 3px 6px; border-left: 1px solid #e2e8f0;" title="Reset Zoom">${ICONS.reset}</button>
            </div>

            <button type="button" id="preview-grid-toggle" class="btn ${state.showGrid ? 'btn-primary' : 'btn-outline'}" style="padding: 5px 7px;" title="Toggle coordinate grid">
              ${ICONS.grid}
            </button>

            <button type="button" id="preview-wireframe-toggle" class="btn ${state.wireframeMode ? 'btn-primary' : 'btn-outline'}" style="padding: 5px 7px;" title="Wireframe outline inspector">
              ${ICONS.eye}
            </button>

            <!-- Background selector -->
            <div style="display: flex; align-items: center; gap: 3px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.375rem; padding: 3px;">
              <button type="button" data-bg="checker-light" class="bg-btn checkerboard-pattern" style="width: 18px; height: 18px; border-radius: 3px; border: ${state.bgMode === 'checker-light' ? '2px solid #2563eb' : '1px solid #cbd5e1'};" title="Light Checkerboard"></button>
              <button type="button" data-bg="checker-dark" class="bg-btn checkerboard-pattern-dark" style="width: 18px; height: 18px; border-radius: 3px; border: ${state.bgMode === 'checker-dark' ? '2px solid #2563eb' : '1px solid #cbd5e1'};" title="Dark Checkerboard"></button>
              <button type="button" data-bg="white" class="bg-btn bg-white-solid" style="width: 18px; height: 18px; border-radius: 3px; border: ${state.bgMode === 'white' ? '2px solid #2563eb' : '1px solid #cbd5e1'};" title="White"></button>
              <button type="button" data-bg="slate-dark" class="bg-btn bg-slate-solid" style="width: 18px; height: 18px; border-radius: 3px; border: ${state.bgMode === 'slate-dark' ? '2px solid #2563eb' : '1px solid #cbd5e1'};" title="Dark Slate"></button>
              <button type="button" data-bg="black" class="bg-btn bg-black-solid" style="width: 18px; height: 18px; border-radius: 3px; border: ${state.bgMode === 'black' ? '2px solid #2563eb' : '1px solid #cbd5e1'};" title="Black"></button>
            </div>
          </div>
        </div>

        <!-- Canvas Area -->
        <div id="svg-canvas-container" class="${getBgClass(state.bgMode)}" style="position: relative; flex: 1; min-height: 340px; display: flex; align-items: center; justify-content: center; overflow: hidden; user-select: none; cursor: grab;">
          ${state.showGrid ? `
            <div style="position: absolute; inset: 0; pointer-events: none; opacity: 0.2; background-image: linear-gradient(to right, #64748b 1px, transparent 1px), linear-gradient(to bottom, #64748b 1px, transparent 1px); background-size: 24px 24px;"></div>
            <div style="position: absolute; inset: 0; pointer-events: none; display: flex; align-items: center; justify-content: center;">
              <div style="width: 100%; height: 1px; background-color: rgba(37, 99, 235, 0.3);"></div>
              <div style="position: absolute; height: 100%; width: 1px; background-color: rgba(37, 99, 235, 0.3);"></div>
            </div>
          ` : ''}

          ${conversionResult.error ? `
            <div style="padding: 1.5rem; text-align: center; max-width: 24rem;">
              <div style="width: 2.5rem; height: 2.5rem; margin: 0 auto 0.75rem; border-radius: 9999px; background: #fff1f2; border: 1px solid #fecdd3; display: flex; align-items: center; justify-content: center; color: #e11d48; font-weight: 700;">!</div>
              <p style="font-size: 0.875rem; font-weight: 600; color: #881337; margin-bottom: 0.25rem;">Could not render SVG</p>
              <p class="font-mono" style="font-size: 0.75rem; color: #e11d48; word-break: break-all;">${escapeHtml(conversionResult.error)}</p>
            </div>
          ` : conversionResult.svgString ? `
            <div id="svg-stage" style="transform: translate(${state.pan.x}px, ${state.pan.y}px) scale(${state.zoom}); transform-origin: center center; display: flex; align-items: center; justify-content: center; transition: transform 75ms ease-out;">
              ${getRenderedSvg(conversionResult.svgString, state.wireframeMode)}
            </div>
          ` : `
            <div style="color: #94a3b8; font-size: 0.75rem;">No SVG rendered yet</div>
          `}

          <!-- Quick Actions Overlay -->
          ${conversionResult.svgString && !conversionResult.error ? `
            <div style="position: absolute; bottom: 0.75rem; right: 0.75rem; display: flex; align-items: center; gap: 0.375rem; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(4px); border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 0.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <button type="button" id="preview-quick-copy" class="btn btn-default" style="padding: 4px 8px;" title="Copy SVG">
                ${state.copiedPreview ? ICONS.check : ICONS.copy}
                <span>${state.copiedPreview ? 'Copied' : 'Copy'}</span>
              </button>
              <button type="button" id="preview-quick-download" class="btn btn-primary" style="padding: 4px 8px;" title="Download SVG">
                ${ICONS.download}
                <span>Download</span>
              </button>
            </div>
          ` : ''}
        </div>

        <div class="panel-footer">
          <span>Click & drag to pan · Ctrl/Cmd + scroll to zoom</span>
          ${state.wireframeMode ? `<span style="color: #2563eb; font-weight: 500;">Wireframe Mode Active</span>` : `<span>Scalable Vector Graphics</span>`}
        </div>
      </div>
    </div>

    <!-- Reference & Color Overrides Panel -->
    ${renderReferenceManager()}

    <!-- Exported Code & Formats Section -->
    ${renderCodeOutput()}
  `;
}

function getBgClass(mode) {
  if (mode === 'checker-dark') return 'checkerboard-pattern-dark';
  if (mode === 'white') return 'bg-white-solid';
  if (mode === 'slate-dark') return 'bg-slate-solid';
  if (mode === 'black') return 'bg-black-solid';
  return 'checkerboard-pattern';
}

function getRenderedSvg(svgStr, isWireframe) {
  if (!isWireframe) return svgStr;
  const wireframeStyle = `<style>
    * { stroke: #2563eb !important; stroke-width: 1px !important; stroke-opacity: 0.85 !important; fill-opacity: 0.2 !important; }
  </style>`;
  return svgStr.replace(/<svg([^>]*)>/, `<svg$1>${wireframeStyle}`);
}

function renderReferenceManager() {
  const references = conversionResult.references || [];
  const overriddenCount = references.filter((r) => state.overrides[r.id] !== undefined).length;

  const filtered = references.filter((ref) => {
    const matchesSearch =
      ref.id.toLowerCase().includes(state.refSearch.toLowerCase()) ||
      ref.usages.some((u) => u.toLowerCase().includes(state.refSearch.toLowerCase()));
    if (!matchesSearch) return false;

    if (state.refFilterType === 'color') return ref.type === 'color';
    if (state.refFilterType === 'other') return ref.type !== 'color';
    return true;
  });

  return `
    <div class="card-panel">
      <!-- Header -->
      <div class="panel-header" style="padding: 1rem 1.25rem;">
        <div style="display: flex; align-items: center; gap: 0.625rem;">
          <div style="padding: 0.375rem; border-radius: 0.5rem; background-color: #eff6ff; color: #2563eb;">
            ${ICONS.palette}
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <h3 style="font-size: 0.875rem; font-weight: 600; color: #0f172a;">Reference & Color Overrides</h3>
              <span style="font-size: 0.75rem; color: #64748b; font-weight: 500;">
                (${references.length} found · ${overriddenCount} customized)
              </span>
            </div>
            <p style="font-size: 0.75rem; color: #64748b; margin-top: 0.125rem;">
              Unresolved Android references automatically receive smart defaults. You can override any color or dimension below.
            </p>
          </div>
        </div>

        <!-- Presets -->
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <div style="display: flex; align-items: center; gap: 0.25rem; background: #f1f5f9; padding: 0.25rem; border-radius: 0.5rem;">
            <button type="button" class="preset-theme-btn btn btn-outline" data-preset="material-blue" style="font-size: 11px;">Material Blue</button>
            <button type="button" class="preset-theme-btn btn btn-outline" data-preset="emerald" style="font-size: 11px;">Emerald</button>
            <button type="button" class="preset-theme-btn btn btn-outline" data-preset="monochrome" style="font-size: 11px;">Dark Slate</button>
            <button type="button" class="preset-theme-btn btn btn-outline" data-preset="randomize" style="font-size: 11px; display: flex; align-items: center; gap: 3px;">
              ${ICONS.shuffle}
              <span>Randomize</span>
            </button>
          </div>

          ${overriddenCount > 0 ? `
            <button type="button" id="reset-all-overrides-btn" class="btn btn-outline" style="color: #e11d48; border-color: #fecdd3;" title="Reset all custom overrides">
              ${ICONS.reset}
              <span>Reset All</span>
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Filters Strip -->
      <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 0.625rem 1.25rem; background: #f8fafc; border-bottom: 1px solid #f1f5f9;">
        <div style="position: relative; flex: 1; max-width: 18rem;">
          <input
            type="text"
            id="ref-search-input"
            value="${escapeHtml(state.refSearch)}"
            placeholder="Search reference name..."
            style="width: 100%; padding: 0.375rem 0.625rem; font-size: 0.75rem; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 0.375rem; outline: none;"
          />
        </div>

        <div style="display: flex; align-items: center; gap: 0.25rem; background: #ffffff; border: 1px solid #e2e8f0; padding: 2px; border-radius: 0.5rem;">
          <button type="button" class="filter-type-btn btn ${state.refFilterType === 'all' ? 'btn-primary' : 'btn-default'}" data-filter="all" style="font-size: 11px;">
            All (${references.length})
          </button>
          <button type="button" class="filter-type-btn btn ${state.refFilterType === 'color' ? 'btn-primary' : 'btn-default'}" data-filter="color" style="font-size: 11px;">
            Colors (${references.filter((r) => r.type === 'color').length})
          </button>
          <button type="button" class="filter-type-btn btn ${state.refFilterType === 'other' ? 'btn-primary' : 'btn-default'}" data-filter="other" style="font-size: 11px;">
            Dimensions & Other (${references.filter((r) => r.type !== 'color').length})
          </button>
        </div>
      </div>

      <!-- References List -->
      <div style="max-height: 380px; overflow-y: auto;">
        ${filtered.length === 0 ? `
          <div style="padding: 2.5rem 1rem; text-align: center; color: #94a3b8; font-size: 0.75rem;">
            ${references.length === 0 ? 'No unresolved references in this vector. All attributes use concrete values.' : 'No references match your search filter.'}
          </div>
        ` : filtered.map((ref) => {
          const isOverridden = state.overrides[ref.id] !== undefined;
          const activeVal = isOverridden ? state.overrides[ref.id] : ref.defaultResolvedValue;

          return `
            <div class="ref-row ${isOverridden ? 'is-overridden' : ''}">
              <div style="flex: 1; min-width: 0;">
                <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                  <span class="font-mono" style="font-size: 11.5px; font-weight: 600; color: #0f172a; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; border: 1px solid #e2e8f0;">
                    ${escapeHtml(ref.id)}
                  </span>
                  <span style="font-size: 11px; color: #64748b;">
                    Used ${ref.occurrences}× in: ${escapeHtml(ref.usages.slice(0, 2).join(', '))}${ref.usages.length > 2 ? ` +${ref.usages.length - 2} more` : ''}
                  </span>
                  ${isOverridden ? `
                    <span style="font-size: 11px; font-weight: 500; color: #2563eb; background: #eff6ff; padding: 2px 6px; border-radius: 4px; border: 1px solid #bfdbfe;">
                      Custom Override
                    </span>
                  ` : `
                    <span style="font-size: 11px; font-weight: 500; color: #047857; background: #ecfdf5; padding: 2px 6px; border-radius: 4px; border: 1px solid #a7f3d0;">
                      Smart Default
                    </span>
                  `}
                </div>
                <div style="font-size: 11px; color: #64748b; margin-top: 0.25rem;">
                  Default fallback: <span class="font-mono" style="font-weight: 500; color: #334155;">${escapeHtml(ref.defaultResolvedValue)}</span>
                </div>
              </div>

              <!-- Controls -->
              <div style="display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0;">
                ${ref.type === 'color' ? `
                  <div style="display: flex; align-items: center; gap: 0.375rem;">
                    <!-- Native Color picker swatch -->
                    <label style="position: relative; width: 32px; height: 32px; border-radius: 6px; border: 1px solid #cbd5e1; cursor: pointer; overflow: hidden; background-color: ${activeVal}; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 2px rgba(0,0,0,0.05);" title="Open color picker">
                      <input
                        type="color"
                        data-ref-id="${escapeHtml(ref.id)}"
                        class="color-picker-input"
                        value="${normalizeHexForPicker(activeVal)}"
                        style="position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%;"
                      />
                    </label>

                    <!-- Hex input -->
                    <input
                      type="text"
                      data-ref-id="${escapeHtml(ref.id)}"
                      class="color-hex-input font-mono"
                      value="${escapeHtml(activeVal)}"
                      placeholder="#RRGGBB"
                      style="width: 7rem; padding: 0.375rem 0.5rem; font-size: 11.5px; font-weight: 500; color: #0f172a; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; outline: none;"
                    />

                    <!-- Quick palette dots -->
                    <div style="display: flex; align-items: center; gap: 3px;">
                      ${COLOR_PRESETS.slice(0, 5).map((color) => `
                        <button
                          type="button"
                          class="preset-dot"
                          data-ref-id="${escapeHtml(ref.id)}"
                          data-color="${color}"
                          style="width: 14px; height: 14px; border-radius: 9999px; border: 1px solid #cbd5e1; background-color: ${color};"
                          title="Set to ${color}"
                        ></button>
                      `).join('')}
                    </div>

                    ${isOverridden ? `
                      <button
                        type="button"
                        data-ref-id="${escapeHtml(ref.id)}"
                        class="reset-single-ref btn btn-default"
                        style="padding: 4px;"
                        title="Reset this reference to default fallback"
                      >
                        ${ICONS.reset}
                      </button>
                    ` : ''}
                  </div>
                ` : `
                  <!-- Dimension input -->
                  <div style="display: flex; align-items: center; gap: 0.375rem;">
                    <input
                      type="text"
                      data-ref-id="${escapeHtml(ref.id)}"
                      class="dimen-input font-mono"
                      value="${escapeHtml(activeVal)}"
                      placeholder="e.g. 24"
                      style="width: 5rem; padding: 0.375rem 0.5rem; font-size: 11.5px; color: #0f172a; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; outline: none;"
                    />
                    ${isOverridden ? `
                      <button
                        type="button"
                        data-ref-id="${escapeHtml(ref.id)}"
                        class="reset-single-ref btn btn-default"
                        style="padding: 4px;"
                        title="Reset to default fallback"
                      >
                        ${ICONS.reset}
                      </button>
                    ` : ''}
                  </div>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="panel-footer">
        <span>Any override instantly updates the SVG preview and exported code</span>
        <span class="font-mono" style="font-size: 10px;">ARGB / Hex / Named Colors</span>
      </div>
    </div>
  `;
}

function renderCodeOutput() {
  const stats = conversionResult.stats;
  const svg = conversionResult.svgString;

  let displayCode = svg;
  if (state.codeTab === 'jsx') {
    displayCode = generateJsx(svg);
  } else if (state.codeTab === 'datauri') {
    displayCode = generateDataUri(svg);
  }

  return `
    <div class="card-panel">
      <!-- Header -->
      <div class="panel-header">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          ${ICONS.code}
          <span style="font-size: 0.75rem; font-weight: 600; color: #1e293b;">Exported Code & Formats</span>
          <span style="color: #cbd5e1;">·</span>
          <span class="font-mono tabular-nums" style="font-size: 11px; color: #64748b;">
            ${(stats.svgBytes / 1024).toFixed(1)} KB SVG
          </span>
        </div>

        <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 0.375rem;">
          <!-- Format tabs -->
          <div style="display: flex; align-items: center; gap: 0.25rem; background: #f1f5f9; padding: 2px; border-radius: 0.375rem;">
            <button type="button" class="code-tab-btn btn ${state.codeTab === 'svg' ? 'btn-primary' : 'btn-default'}" data-tab="svg" style="font-size: 11px;">SVG Code</button>
            <button type="button" class="code-tab-btn btn ${state.codeTab === 'jsx' ? 'btn-primary' : 'btn-default'}" data-tab="jsx" style="font-size: 11px;">React (JSX)</button>
            <button type="button" class="code-tab-btn btn ${state.codeTab === 'datauri' ? 'btn-primary' : 'btn-default'}" data-tab="datauri" style="font-size: 11px;">Data URI</button>
          </div>

          <!-- Code theme toggle -->
          <button type="button" id="code-theme-toggle" class="btn btn-default" style="font-size: 11px;" title="Switch code block theme">
            ${state.codeTheme === 'dark' ? ICONS.sun : ICONS.moon}
            <span>${state.codeTheme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>

          <!-- Copy -->
          <button type="button" id="copy-code-btn" class="btn btn-default" style="font-size: 11px;">
            ${state.copiedOutput ? ICONS.check : ICONS.copy}
            <span>${state.copiedOutput ? 'Copied!' : 'Copy'}</span>
          </button>

          <!-- Download SVG -->
          <button type="button" id="download-svg-btn" class="btn btn-primary" style="font-size: 11px;">
            ${ICONS.download}
            <span>Download .svg</span>
          </button>

          <!-- Download PNG -->
          <button type="button" id="download-png-btn" class="btn btn-outline" style="font-size: 11px;" title="Download 4x High-Res PNG">
            ${ICONS.image}
            <span>PNG (4x)</span>
          </button>
        </div>
      </div>

      <!-- Options -->
      <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 0.5rem 1.25rem; background: #f8fafc; border-bottom: 1px solid #f1f5f9; font-size: 0.75rem;">
        <span style="color: #64748b;">Output Options:</span>
        <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 1rem;">
          <label style="display: flex; align-items: center; gap: 0.375rem; color: #334155; cursor: pointer;">
            <input type="checkbox" id="opt-responsive" ${state.options.responsive ? 'checked' : ''} />
            <span>Responsive (viewBox only)</span>
          </label>
          <label style="display: flex; align-items: center; gap: 0.375rem; color: #334155; cursor: pointer;">
            <input type="checkbox" id="opt-stroke" ${state.options.strokeScaling ? 'checked' : ''} />
            <span>Non-scaling Stroke</span>
          </label>
          <label style="display: flex; align-items: center; gap: 0.375rem; color: #334155; cursor: pointer;">
            <input type="checkbox" id="opt-xmlns" ${state.options.addXmlns ? 'checked' : ''} />
            <span>Include xmlns</span>
          </label>
        </div>
      </div>

      <!-- Code Textarea with High Contrast -->
      <textarea
        readonly
        class="${state.codeTheme === 'dark' ? 'code-output-dark' : 'code-output-light'}"
        spellcheck="false"
      >${escapeHtml(displayCode)}</textarea>

      <div class="panel-footer">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span>${stats.pathCount} Paths</span>
          <span>·</span>
          <span>${stats.groupCount} Groups</span>
          <span>·</span>
          <span>${stats.gradientCount} Gradients</span>
          <span>·</span>
          <span>${stats.clipPathCount} Clip Paths</span>
        </div>
        <span class="font-mono" style="font-size: 11px;">Ready for Figma, Illustrator, and Web</span>
      </div>
    </div>
  `;
}

function renderSpecsGuide() {
  return `
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
      <div class="card-panel" style="padding: 1.5rem;">
        <h2 style="font-size: 1.25rem; font-weight: 700; color: #0f172a; margin-bottom: 0.5rem;">
          Android Vector Drawable to SVG Reference Guide
        </h2>
        <p style="font-size: 0.875rem; color: #475569; line-height: 1.6; max-width: 48rem;">
          Android Vector Drawables (<code class="font-mono" style="font-size: 12px; color: #2563eb; background: #eff6ff; padding: 2px 4px; border-radius: 4px;">&lt;vector&gt;</code>) allow vector graphics to scale across multiple screen densities on Android devices. While structurally similar to SVG, Android uses distinct XML attributes, coordinate transforms, and a runtime resource resolution system (<code class="font-mono" style="font-size: 12px; color: #2563eb; background: #eff6ff; padding: 2px 4px; border-radius: 4px;">@color/</code>, <code class="font-mono" style="font-size: 12px; color: #2563eb; background: #eff6ff; padding: 2px 4px; border-radius: 4px;">?attr/</code>).
        </p>
      </div>

      <div class="card-panel">
        <div style="padding: 1rem 1.5rem; background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
          <h3 style="font-size: 0.875rem; font-weight: 600; color: #0f172a;">
            Android Vector Attribute vs. SVG Equivalent
          </h3>
        </div>
        <div style="overflow-x: auto;">
          <table style="width: 100%; text-align: left; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="border-bottom: 1px solid #e2e8f0; background: #f1f5f9; font-weight: 600; color: #334155;">
                <th style="padding: 0.75rem 1rem;">Android XML Feature</th>
                <th style="padding: 0.75rem 1rem;">Android Syntax</th>
                <th style="padding: 0.75rem 1rem;">SVG Equivalent</th>
                <th style="padding: 0.75rem 1rem;">Converter Auto-Handling</th>
              </tr>
            </thead>
            <tbody style="color: #1e293b;">
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 0.75rem 1rem; font-weight: 500;">Canvas Dimensions</td>
                <td class="font-mono" style="padding: 0.75rem 1rem; color: #2563eb;">android:width="24dp"</td>
                <td class="font-mono" style="padding: 0.75rem 1rem; color: #059669;">width="24"</td>
                <td style="padding: 0.75rem 1rem; color: #475569;">Strips dp/px units; maintains viewport ratio</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 0.75rem 1rem; font-weight: 500;">Coordinate Bounds</td>
                <td class="font-mono" style="padding: 0.75rem 1rem; color: #2563eb;">android:viewportWidth="24"</td>
                <td class="font-mono" style="padding: 0.75rem 1rem; color: #059669;">viewBox="0 0 24 24"</td>
                <td style="padding: 0.75rem 1rem; color: #475569;">Maps directly to standard SVG viewBox</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 0.75rem 1rem; font-weight: 500;">ARGB Color Hex</td>
                <td class="font-mono" style="padding: 0.75rem 1rem; color: #2563eb;">#801E88E5 (Alpha first)</td>
                <td class="font-mono" style="padding: 0.75rem 1rem; color: #059669;">fill="#1e88e5" fill-opacity="0.5"</td>
                <td style="padding: 0.75rem 1rem; color: #475569;">Decodes 8-digit ARGB into RGB + opacity for universal SVG tool compatibility</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 0.75rem 1rem; font-weight: 500;">Theme Color Reference</td>
                <td class="font-mono" style="padding: 0.75rem 1rem; color: #2563eb;">@color/primary or ?attr/colorControlNormal</td>
                <td class="font-mono" style="padding: 0.75rem 1rem; color: #059669;">fill="#2563eb"</td>
                <td style="padding: 0.75rem 1rem; color: #475569;">Picks smart default fallback & provides interactive color picker override</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 0.75rem 1rem; font-weight: 500;">Group Pivot & Scale</td>
                <td class="font-mono" style="padding: 0.75rem 1rem; color: #2563eb;">android:pivotX="12" android:scaleX="1.2"</td>
                <td class="font-mono" style="padding: 0.75rem 1rem; color: #059669;">transform="translate(12 12) scale(1.2) translate(-12 -12)"</td>
                <td style="padding: 0.75rem 1rem; color: #475569;">Computes origin-relative SVG transform sequence</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 0.75rem 1rem; font-weight: 500;">Clip Path Masking</td>
                <td class="font-mono" style="padding: 0.75rem 1rem; color: #2563eb;">&lt;clip-path android:pathData="..." /&gt;</td>
                <td class="font-mono" style="padding: 0.75rem 1rem; color: #059669;">&lt;clipPath id="..."&gt; + &lt;g clip-path="..."&gt;</td>
                <td style="padding: 0.75rem 1rem; color: #475569;">Generates SVG &lt;defs&gt; and groups masked sibling nodes</td>
              </tr>
              <tr>
                <td style="padding: 0.75rem 1rem; font-weight: 500;">Gradient Shaders</td>
                <td class="font-mono" style="padding: 0.75rem 1rem; color: #2563eb;">&lt;aapt:attr name="android:fillColor"&gt;</td>
                <td class="font-mono" style="padding: 0.75rem 1rem; color: #059669;">&lt;linearGradient&gt; or &lt;radialGradient&gt;</td>
                <td style="padding: 0.75rem 1rem; color: #475569;">Translates stops, start/end coordinates, and opacity</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function renderFooter() {
  return `
    <footer class="app-footer">
      <div class="footer-inner">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-weight: 600; color: #334155;">Vector2SVG</span>
          <span>·</span>
          <span>Android Vector Drawable to SVG converter with reference override engine</span>
        </div>
        <div class="font-mono" style="font-size: 11px; color: #94a3b8;">
          100% Client-Side Conversion · No Server Uploads
        </div>
      </div>
    </footer>
  `;
}

// Event Listeners Binding
function attachEventListeners() {
  // Navigation Tabs
  document.getElementById('nav-brand')?.addEventListener('click', (e) => {
    e.preventDefault();
    state.activeTab = 'workspace';
    render();
  });
  document.getElementById('tab-converter-btn')?.addEventListener('click', () => {
    state.activeTab = 'workspace';
    render();
  });
  document.getElementById('tab-specs-btn')?.addEventListener('click', () => {
    state.activeTab = 'specs';
    render();
  });
  document.getElementById('reset-all-btn')?.addEventListener('click', () => {
    state.xmlInput = SAMPLE_VECTORS[0].xml;
    state.selectedSampleId = SAMPLE_VECTORS[0].id;
    state.overrides = {};
    render();
  });

  if (state.activeTab === 'specs') return;

  // XML Editor input
  const textarea = document.getElementById('xml-textarea');
  if (textarea) {
    textarea.addEventListener('input', (e) => {
      state.xmlInput = e.target.value;
      state.selectedSampleId = '';
      runConversion();
      // Only selectively update preview, ref manager, and code output to avoid losing cursor focus in textarea
      updatePreviewAndOutputOnly();
    });
  }

  // Sample buttons
  document.querySelectorAll('.sample-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const sampleId = e.currentTarget.getAttribute('data-sample-id');
      const sample = SAMPLE_VECTORS.find((s) => s.id === sampleId);
      if (sample) {
        state.xmlInput = sample.xml;
        state.selectedSampleId = sample.id;
        state.overrides = {};
        render();
      }
    });
  });

  // Drag and drop XML
  const editorPanel = document.getElementById('xml-editor-panel');
  if (editorPanel) {
    editorPanel.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!state.isDraggingFile) {
        state.isDraggingFile = true;
        render();
      }
    });
    editorPanel.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (state.isDraggingFile) {
        state.isDraggingFile = false;
        render();
      }
    });
    editorPanel.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      state.isDraggingFile = false;
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            state.xmlInput = String(event.target.result);
            state.selectedSampleId = '';
            render();
          }
        };
        reader.readAsText(file);
      }
    });
  }

  // File Upload button
  const fileInput = document.getElementById('file-upload-input');
  document.getElementById('upload-btn')?.addEventListener('click', () => {
    fileInput?.click();
  });
  fileInput?.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          state.xmlInput = String(event.target.result);
          state.selectedSampleId = '';
          render();
        }
      };
      reader.readAsText(file);
    }
  });

  // Paste button
  document.getElementById('paste-btn')?.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        state.xmlInput = text;
        state.selectedSampleId = '';
        render();
      }
    } catch {
      // clipboard access not permitted
    }
  });

  // Copy input button
  document.getElementById('copy-input-btn')?.addEventListener('click', () => {
    navigator.clipboard.writeText(state.xmlInput);
    state.copiedInput = true;
    render();
    setTimeout(() => {
      state.copiedInput = false;
      render();
    }, 2000);
  });

  // Clear input button
  document.getElementById('clear-input-btn')?.addEventListener('click', () => {
    state.xmlInput = '';
    state.selectedSampleId = '';
    render();
  });

  // Preview zoom & pan
  document.getElementById('preview-zoom-in')?.addEventListener('click', () => {
    state.zoom = Math.min(state.zoom * 1.35, 15);
    updatePreviewStageTransform();
  });
  document.getElementById('preview-zoom-out')?.addEventListener('click', () => {
    state.zoom = Math.max(state.zoom / 1.35, 0.2);
    updatePreviewStageTransform();
  });
  document.getElementById('preview-zoom-reset')?.addEventListener('click', () => {
    state.zoom = 1;
    state.pan = { x: 0, y: 0 };
    updatePreviewStageTransform();
  });

  document.getElementById('preview-grid-toggle')?.addEventListener('click', () => {
    state.showGrid = !state.showGrid;
    render();
  });

  document.getElementById('preview-wireframe-toggle')?.addEventListener('click', () => {
    state.wireframeMode = !state.wireframeMode;
    render();
  });

  // Background modes
  document.querySelectorAll('.bg-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const bg = e.currentTarget.getAttribute('data-bg');
      if (bg) {
        state.bgMode = bg;
        render();
      }
    });
  });

  // Pan interaction on preview canvas
  const canvasContainer = document.getElementById('svg-canvas-container');
  if (canvasContainer) {
    canvasContainer.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      state.isPanning = true;
      state.startPan = { x: e.clientX - state.pan.x, y: e.clientY - state.pan.y };
      canvasContainer.style.cursor = 'grabbing';
    });
    window.addEventListener('mousemove', (e) => {
      if (!state.isPanning) return;
      state.pan = { x: e.clientX - state.startPan.x, y: e.clientY - state.startPan.y };
      updatePreviewStageTransform();
    });
    window.addEventListener('mouseup', () => {
      if (state.isPanning) {
        state.isPanning = false;
        if (canvasContainer) canvasContainer.style.cursor = 'grab';
      }
    });
    canvasContainer.addEventListener('wheel', (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 1.15 : 0.85;
        state.zoom = Math.max(0.2, Math.min(15, state.zoom * delta));
        updatePreviewStageTransform();
      }
    });
  }

  // Quick Copy & Download in preview
  document.getElementById('preview-quick-copy')?.addEventListener('click', () => {
    navigator.clipboard.writeText(conversionResult.svgString);
    state.copiedPreview = true;
    render();
    setTimeout(() => {
      state.copiedPreview = false;
      render();
    }, 2000);
  });
  document.getElementById('preview-quick-download')?.addEventListener('click', downloadSvgFile);

  // Reference Manager Presets
  document.querySelectorAll('.preset-theme-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const preset = e.currentTarget.getAttribute('data-preset');
      applyThemePreset(preset);
    });
  });

  document.getElementById('reset-all-overrides-btn')?.addEventListener('click', () => {
    state.overrides = {};
    render();
  });

  // Reference Search input
  const searchInput = document.getElementById('ref-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.refSearch = e.target.value;
      render();
      // restore focus
      const newSearch = document.getElementById('ref-search-input');
      if (newSearch) {
        newSearch.focus();
        newSearch.setSelectionRange(state.refSearch.length, state.refSearch.length);
      }
    });
  }

  // Reference filter buttons
  document.querySelectorAll('.filter-type-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const filter = e.currentTarget.getAttribute('data-filter');
      if (filter) {
        state.refFilterType = filter;
        render();
      }
    });
  });

  // Reference Color pickers
  document.querySelectorAll('.color-picker-input').forEach((input) => {
    input.addEventListener('input', (e) => {
      const refId = e.currentTarget.getAttribute('data-ref-id');
      const val = e.target.value;
      if (refId) {
        state.overrides[refId] = val;
        render();
      }
    });
  });

  // Reference Color Hex text inputs
  document.querySelectorAll('.color-hex-input').forEach((input) => {
    input.addEventListener('change', (e) => {
      const refId = e.currentTarget.getAttribute('data-ref-id');
      const val = e.target.value;
      if (refId) {
        state.overrides[refId] = val;
        render();
      }
    });
  });

  // Quick palette dots
  document.querySelectorAll('.preset-dot').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const refId = e.currentTarget.getAttribute('data-ref-id');
      const color = e.currentTarget.getAttribute('data-color');
      if (refId && color) {
        state.overrides[refId] = color;
        render();
      }
    });
  });

  // Dimension inputs
  document.querySelectorAll('.dimen-input').forEach((input) => {
    input.addEventListener('change', (e) => {
      const refId = e.currentTarget.getAttribute('data-ref-id');
      const val = e.target.value;
      if (refId) {
        state.overrides[refId] = val;
        render();
      }
    });
  });

  // Reset single reference
  document.querySelectorAll('.reset-single-ref').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const refId = e.currentTarget.getAttribute('data-ref-id');
      if (refId) {
        delete state.overrides[refId];
        render();
      }
    });
  });

  // Exported Code Tabs
  document.querySelectorAll('.code-tab-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const tab = e.currentTarget.getAttribute('data-tab');
      if (tab) {
        state.codeTab = tab;
        render();
      }
    });
  });

  // Code Theme toggle
  document.getElementById('code-theme-toggle')?.addEventListener('click', () => {
    state.codeTheme = state.codeTheme === 'dark' ? 'light' : 'dark';
    render();
  });

  // Copy Code
  document.getElementById('copy-code-btn')?.addEventListener('click', () => {
    let textToCopy = conversionResult.svgString;
    if (state.codeTab === 'jsx') textToCopy = generateJsx(conversionResult.svgString);
    if (state.codeTab === 'datauri') textToCopy = generateDataUri(conversionResult.svgString);

    navigator.clipboard.writeText(textToCopy);
    state.copiedOutput = true;
    render();
    setTimeout(() => {
      state.copiedOutput = false;
      render();
    }, 2000);
  });

  // Download SVG
  document.getElementById('download-svg-btn')?.addEventListener('click', downloadSvgFile);

  // Download PNG (4x rasterization)
  document.getElementById('download-png-btn')?.addEventListener('click', () => {
    downloadPngFile(4);
  });

  // Output options checkboxes
  document.getElementById('opt-responsive')?.addEventListener('change', (e) => {
    state.options.responsive = e.target.checked;
    render();
  });
  document.getElementById('opt-stroke')?.addEventListener('change', (e) => {
    state.options.strokeScaling = e.target.checked;
    render();
  });
  document.getElementById('opt-xmlns')?.addEventListener('change', (e) => {
    state.options.addXmlns = e.target.checked;
    render();
  });
}

function updatePreviewStageTransform() {
  const stage = document.getElementById('svg-stage');
  if (stage) {
    stage.style.transform = `translate(${state.pan.x}px, ${state.pan.y}px) scale(${state.zoom})`;
  }
}

function updatePreviewAndOutputOnly() {
  render();
  const textarea = document.getElementById('xml-textarea');
  if (textarea) {
    textarea.focus();
    const len = textarea.value.length;
    textarea.setSelectionRange(len, len);
  }
}

function applyThemePreset(preset) {
  const colorRefs = (conversionResult.references || []).filter((r) => r.type === 'color');
  if (preset === 'material-blue') {
    const palette = ['#2563eb', '#1d4ed8', '#60a5fa', '#93c5fd', '#1e40af'];
    colorRefs.forEach((ref, idx) => {
      state.overrides[ref.id] = palette[idx % palette.length];
    });
  } else if (preset === 'emerald') {
    const palette = ['#059669', '#10b981', '#34d399', '#065f46', '#6ee7b7'];
    colorRefs.forEach((ref, idx) => {
      state.overrides[ref.id] = palette[idx % palette.length];
    });
  } else if (preset === 'monochrome') {
    const palette = ['#0f172a', '#334155', '#64748b', '#94a3b8', '#1e293b'];
    colorRefs.forEach((ref, idx) => {
      state.overrides[ref.id] = palette[idx % palette.length];
    });
  } else if (preset === 'randomize') {
    colorRefs.forEach((ref) => {
      state.overrides[ref.id] = generateHashColor(ref.id + Math.random().toString());
    });
  }
  render();
}

function downloadSvgFile() {
  if (!conversionResult.svgString) return;
  const blob = new Blob([conversionResult.svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${state.selectedSampleId || 'android_vector'}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadPngFile(scale = 4) {
  if (!conversionResult.svgString) return;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = parseFloat(conversionResult.stats.width) || conversionResult.stats.viewportWidth || 24;
  const height = parseFloat(conversionResult.stats.height) || conversionResult.stats.viewportHeight || 24;

  canvas.width = width * scale;
  canvas.height = height * scale;

  const img = new Image();
  const svgBlob = new Blob([conversionResult.svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);

    const pngUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = pngUrl;
    a.download = `${state.selectedSampleId || 'android_vector'}@${scale}x.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  img.src = url;
}

function generateJsx(svgString) {
  if (!svgString) return '';
  let jsx = svgString
    .replace(/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/g, '')
    .replace(/xmlns:android="[^"]*"/g, '')
    .replace(/fill-rule=/g, 'fillRule=')
    .replace(/clip-path=/g, 'clipPath=')
    .replace(/clip-rule=/g, 'clipRule=')
    .replace(/stroke-width=/g, 'strokeWidth=')
    .replace(/stroke-linecap=/g, 'strokeLinecap=')
    .replace(/stroke-linejoin=/g, 'strokeLinejoin=')
    .replace(/stroke-miterlimit=/g, 'strokeMiterlimit=')
    .replace(/stroke-opacity=/g, 'strokeOpacity=')
    .replace(/fill-opacity=/g, 'fillOpacity=')
    .replace(/stop-color=/g, 'stopColor=')
    .replace(/stop-opacity=/g, 'stopOpacity=')
    .replace(/gradientUnits=/g, 'gradientUnits=')
    .replace(/vector-effect=/g, 'vectorEffect=');

  return `export default function VectorIcon(props) {\n  return (\n    ${jsx.replace('<svg', '<svg {...props}')}\n  );\n}`;
}

function generateDataUri(svgString) {
  if (!svgString) return '';
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', () => {
  render();
});
