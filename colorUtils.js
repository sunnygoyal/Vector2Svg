/**
 * Utilities for parsing Android color formats, handling ARGB vs RGBA,
 * resolving references, and generating deterministic fallbacks.
 * Pure standard JavaScript.
 */

export const KNOWN_ANDROID_COLORS = {
  '@android:color/transparent': 'transparent',
  '@android:color/black': '#000000',
  '@android:color/white': '#ffffff',
  '@android:color/darker_gray': '#aaaaaa',
  '@android:color/holo_blue_light': '#33b5e5',
  '@android:color/holo_blue_dark': '#0099cc',
  '@android:color/holo_green_light': '#99cc00',
  '@android:color/holo_green_dark': '#669900',
  '@android:color/holo_red_light': '#ff4444',
  '@android:color/holo_red_dark': '#cc0000',
  '@android:color/holo_orange_light': '#ffbb33',
  '@android:color/holo_orange_dark': '#ff8800',
  '@android:color/holo_purple': '#aa66cc',
  // Common theme attributes
  '?attr/colorControlNormal': '#595959',
  '?android:attr/colorControlNormal': '#595959',
  '?attr/colorControlActivated': '#03a9f4',
  '?android:attr/colorControlActivated': '#03a9f4',
  '?attr/colorPrimary': '#2563eb',
  '?android:attr/colorPrimary': '#2563eb',
  '?attr/colorPrimaryDark': '#1d4ed8',
  '?android:attr/colorPrimaryDark': '#1d4ed8',
  '?attr/colorSecondary': '#7c3aed',
  '?android:attr/colorSecondary': '#7c3aed',
  '?attr/colorAccent': '#ec4899',
  '?android:attr/colorAccent': '#ec4899',
  '?attr/textColorPrimary': '#1e293b',
  '?android:attr/textColorPrimary': '#1e293b',
  '?attr/textColorSecondary': '#64748b',
  '?android:attr/textColorSecondary': '#64748b',
  '?attr/colorSurface': '#ffffff',
  '?android:attr/colorSurface': '#ffffff',
  '?attr/colorOnSurface': '#0f172a',
  '?android:attr/colorOnSurface': '#0f172a',
  '?attr/colorBackground': '#f8fafc',
  '?android:attr/colorBackground': '#f8fafc',
};

export function isReference(val) {
  if (!val) return false;
  const trimmed = String(val).trim();
  return trimmed.startsWith('@') || trimmed.startsWith('?');
}

export function getReferenceType(key, attrName = '') {
  const lower = String(key).toLowerCase();
  const attr = String(attrName).toLowerCase();

  if (lower.includes('@color/') || lower.includes(':color/') || lower.includes('color') || attr.includes('color') || attr.includes('tint')) {
    return 'color';
  }
  if (lower.includes('@dimen/') || lower.includes(':dimen/') || attr.includes('width') || attr.includes('height') || attr.includes('radius') || attr.includes('pivot')) {
    return 'dimension';
  }
  if (attr.includes('alpha') || attr.includes('opacity')) {
    return 'alpha';
  }
  return 'color';
}

export function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function generateHashColor(str) {
  let hash = 0;
  const s = String(str);
  for (let i = 0; i < s.length; i++) {
    hash = s.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  const hue = Math.abs(hash % 360);
  return hslToHex(hue, 70, 48);
}

export function resolveDefaultReferenceValue(ref, attrName = '') {
  const trimmed = String(ref).trim();

  if (KNOWN_ANDROID_COLORS[trimmed]) {
    return KNOWN_ANDROID_COLORS[trimmed];
  }

  const type = getReferenceType(trimmed, attrName);

  if (type === 'dimension') {
    const match = trimmed.match(/\d+/);
    if (match) return match[0];
    if (attrName.toLowerCase().includes('stroke')) return '2';
    return '24';
  }

  if (type === 'alpha') {
    return '1.0';
  }

  const lower = trimmed.toLowerCase();
  if (lower.includes('transparent')) return 'transparent';
  if (lower.includes('white')) return '#ffffff';
  if (lower.includes('black')) return '#000000';
  if (lower.includes('primary')) return '#2563eb';
  if (lower.includes('secondary')) return '#7c3aed';
  if (lower.includes('accent')) return '#ec4899';
  if (lower.includes('red') || lower.includes('danger') || lower.includes('error')) return '#ef4444';
  if (lower.includes('green') || lower.includes('success')) return '#10b981';
  if (lower.includes('blue') || lower.includes('info')) return '#3b82f6';
  if (lower.includes('teal')) return '#0d9488';
  if (lower.includes('cyan') || lower.includes('sky')) return '#0284c7';
  if (lower.includes('purple')) return '#9333ea';
  if (lower.includes('yellow') || lower.includes('warning') || lower.includes('amber')) return '#f59e0b';
  if (lower.includes('orange')) return '#ea580c';
  if (lower.includes('grey') || lower.includes('gray')) return '#64748b';
  if (lower.includes('dark')) return '#1e293b';
  if (lower.includes('light')) return '#f1f5f9';

  return generateHashColor(trimmed);
}

export function parseAndroidColor(colorStr) {
  if (!colorStr) return { color: 'none', alpha: 1 };
  const trimmed = String(colorStr).trim();

  if (trimmed === 'none' || trimmed === '@android:color/transparent' || trimmed === 'transparent') {
    return { color: 'none', alpha: 0 };
  }

  if (trimmed.startsWith('#')) {
    const raw = trimmed.slice(1);
    if (raw.length === 3) {
      const r = raw[0] + raw[0];
      const g = raw[1] + raw[1];
      const b = raw[2] + raw[2];
      return { color: `#${r}${g}${b}`.toLowerCase(), alpha: 1 };
    }
    if (raw.length === 4) {
      const aVal = parseInt(raw[0] + raw[0], 16) / 255;
      const r = raw[1] + raw[1];
      const g = raw[2] + raw[2];
      const b = raw[3] + raw[3];
      return { color: `#${r}${g}${b}`.toLowerCase(), alpha: Number(aVal.toFixed(3)) };
    }
    if (raw.length === 6) {
      return { color: `#${raw}`.toLowerCase(), alpha: 1 };
    }
    if (raw.length === 8) {
      const aVal = parseInt(raw.slice(0, 2), 16) / 255;
      const rgb = raw.slice(2);
      return { color: `#${rgb}`.toLowerCase(), alpha: Number(aVal.toFixed(3)) };
    }
  }

  return { color: trimmed, alpha: 1 };
}

export function normalizeHexForPicker(color) {
  if (!color) return '#2563eb';
  let clean = String(color).trim().toLowerCase();
  if (clean === 'transparent' || clean === 'none') return '#ffffff';
  if (clean.startsWith('#')) {
    clean = clean.slice(1);
    if (clean.length === 3) {
      return '#' + clean.split('').map((c) => c + c).join('');
    }
    if (clean.length === 4) {
      const rgb = clean.slice(1);
      return '#' + rgb.split('').map((c) => c + c).join('');
    }
    if (clean.length === 8) {
      return '#' + clean.slice(2);
    }
    if (clean.length === 6) {
      return '#' + clean;
    }
  }
  return '#2563eb';
}
