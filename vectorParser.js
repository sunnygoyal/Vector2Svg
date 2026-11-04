/**
 * Android Vector Drawable to SVG Converter.
 * Pure standard JavaScript.
 */
import {
  getReferenceType,
  isReference,
  parseAndroidColor,
  resolveDefaultReferenceValue,
} from './colorUtils.js';

function getAttr(element, ...attrNames) {
  for (const name of attrNames) {
    const direct = element.getAttribute(name);
    if (direct !== null) return direct;

    const androidPrefixed = element.getAttribute(`android:${name}`);
    if (androidPrefixed !== null) return androidPrefixed;

    const aaptPrefixed = element.getAttribute(`aapt:${name}`);
    if (aaptPrefixed !== null) return aaptPrefixed;

    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      const local = attr.localName || attr.name.split(':').pop() || '';
      if (local.toLowerCase() === name.toLowerCase()) {
        return attr.value;
      }
    }
  }
  return null;
}

function parseDimension(val) {
  if (!val) return { num: 24, unit: '', raw: '24' };
  const trimmed = String(val).trim();
  const match = trimmed.match(/^([\d.]+)\s*([a-zA-Z%]*)$/);
  if (match) {
    return {
      num: parseFloat(match[1]) || 24,
      unit: match[2] || '',
      raw: trimmed,
    };
  }
  return { num: 24, unit: '', raw: trimmed };
}

function resolveValue(rawVal, attrName, elementDesc, ctx) {
  if (!rawVal) return '';
  const trimmed = String(rawVal).trim();

  if (isReference(trimmed)) {
    const refKey = trimmed;
    let refItem = ctx.referencesMap.get(refKey);

    if (!refItem) {
      const defaultVal = resolveDefaultReferenceValue(refKey, attrName);
      const isOverridden = ctx.overrides[refKey] !== undefined;
      const currentVal = isOverridden ? ctx.overrides[refKey] : defaultVal;

      refItem = {
        id: refKey,
        type: getReferenceType(refKey, attrName),
        occurrences: 0,
        usages: [],
        defaultResolvedValue: defaultVal,
        currentValue: currentVal,
        isOverridden,
        notes: `Auto-resolved with fallback: ${defaultVal}`,
      };
      ctx.referencesMap.set(refKey, refItem);
    }

    refItem.occurrences += 1;
    const usageStr = `${elementDesc} (${attrName})`;
    if (!refItem.usages.includes(usageStr)) {
      refItem.usages.push(usageStr);
    }

    return refItem.currentValue;
  }

  return trimmed;
}

function processGradient(gradientEl, ctx, elementDesc) {
  const gradType = getAttr(gradientEl, 'type') || 'linear';
  ctx.gradientCounter += 1;
  ctx.stats.gradientCount += 1;
  const gradId = `v2s_grad_${ctx.gradientCounter}`;

  const items = Array.from(gradientEl.getElementsByTagName('item'));
  let stopElements = [];

  if (items.length > 0) {
    stopElements = items.map((item) => {
      const offsetRaw = getAttr(item, 'offset') || '0';
      const colorRaw = getAttr(item, 'color') || '#ffffff';
      const resolvedColor = resolveValue(colorRaw, 'color', `${elementDesc} (gradient stop)`, ctx);
      const parsed = parseAndroidColor(resolvedColor);

      let offset = offsetRaw;
      if (!offset.endsWith('%') && !isNaN(Number(offset))) {
        offset = `${Math.min(100, Math.max(0, Number(offset) * 100))}%`;
      }

      const opacityAttr = parsed.alpha < 1 ? ` stop-opacity="${parsed.alpha}"` : '';
      return `<stop offset="${offset}" stop-color="${parsed.color}"${opacityAttr} />`;
    });
  } else {
    const startColorRaw = getAttr(gradientEl, 'startColor') || '#ffffff';
    const centerColorRaw = getAttr(gradientEl, 'centerColor');
    const endColorRaw = getAttr(gradientEl, 'endColor') || '#000000';

    const startColor = resolveValue(startColorRaw, 'startColor', `${elementDesc} (startColor)`, ctx);
    const endColor = resolveValue(endColorRaw, 'endColor', `${elementDesc} (endColor)`, ctx);
    const parsedStart = parseAndroidColor(startColor);
    const parsedEnd = parseAndroidColor(endColor);

    stopElements.push(
      `<stop offset="0%" stop-color="${parsedStart.color}"${
        parsedStart.alpha < 1 ? ` stop-opacity="${parsedStart.alpha}"` : ''
      } />`
    );

    if (centerColorRaw) {
      const centerColor = resolveValue(centerColorRaw, 'centerColor', `${elementDesc} (centerColor)`, ctx);
      const parsedCenter = parseAndroidColor(centerColor);
      stopElements.push(
        `<stop offset="50%" stop-color="${parsedCenter.color}"${
          parsedCenter.alpha < 1 ? ` stop-opacity="${parsedCenter.alpha}"` : ''
        } />`
      );
    }

    stopElements.push(
      `<stop offset="100%" stop-color="${parsedEnd.color}"${
        parsedEnd.alpha < 1 ? ` stop-opacity="${parsedEnd.alpha}"` : ''
      } />`
    );
  }

  if (gradType === 'radial') {
    const cx = getAttr(gradientEl, 'centerX') || '0';
    const cy = getAttr(gradientEl, 'centerY') || '0';
    const r = getAttr(gradientEl, 'gradientRadius') || '50';

    ctx.defs.push(
      `<radialGradient id="${gradId}" cx="${cx}" cy="${cy}" r="${r}" gradientUnits="userSpaceOnUse">\n      ${stopElements.join('\n      ')}\n    </radialGradient>`
    );
  } else {
    const x1 = getAttr(gradientEl, 'startX') || '0';
    const y1 = getAttr(gradientEl, 'startY') || '0';
    const x2 = getAttr(gradientEl, 'endX') || '0';
    const y2 = getAttr(gradientEl, 'endY') || '0';

    ctx.defs.push(
      `<linearGradient id="${gradId}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" gradientUnits="userSpaceOnUse">\n      ${stopElements.join('\n      ')}\n    </linearGradient>`
    );
  }

  return `url(#${gradId})`;
}

function processPath(pathEl, ctx, options, indent) {
  ctx.stats.pathCount += 1;
  const name = getAttr(pathEl, 'name');
  const pathDesc = name ? `Path <${name}>` : `Path #${ctx.stats.pathCount}`;

  const pathDataRaw = getAttr(pathEl, 'pathData');
  if (!pathDataRaw) {
    ctx.diagnostics.push({
      level: 'warning',
      message: `${pathDesc} has no android:pathData and was skipped.`,
    });
    return '';
  }

  let fillColorValue = null;
  let strokeColorValue = null;

  for (let i = 0; i < pathEl.children.length; i++) {
    const child = pathEl.children[i];
    const childLocal = child.localName || child.tagName.split(':').pop() || '';
    if (childLocal === 'attr') {
      const attrName = getAttr(child, 'name') || '';
      const gradEl = child.querySelector('gradient');
      if (gradEl) {
        if (attrName.includes('fillColor') || attrName === 'android:fillColor') {
          fillColorValue = processGradient(gradEl, ctx, pathDesc);
        } else if (attrName.includes('strokeColor') || attrName === 'android:strokeColor') {
          strokeColorValue = processGradient(gradEl, ctx, pathDesc);
        }
      }
    } else if (childLocal === 'gradient') {
      fillColorValue = processGradient(child, ctx, pathDesc);
    }
  }

  if (!fillColorValue) {
    const rawFill = getAttr(pathEl, 'fillColor');
    if (rawFill) {
      fillColorValue = resolveValue(rawFill, 'fillColor', pathDesc, ctx);
    }
  }

  if (!strokeColorValue) {
    const rawStroke = getAttr(pathEl, 'strokeColor');
    if (rawStroke) {
      strokeColorValue = resolveValue(rawStroke, 'strokeColor', pathDesc, ctx);
    }
  }

  const attrs = [];

  if (name) {
    attrs.push(`id="${name}"`);
  }

  let parsedFillAlpha = 1;
  if (fillColorValue) {
    if (fillColorValue.startsWith('url(')) {
      attrs.push(`fill="${fillColorValue}"`);
    } else {
      const parsedFill = parseAndroidColor(fillColorValue);
      attrs.push(`fill="${parsedFill.color}"`);
      parsedFillAlpha = parsedFill.alpha;
    }
  } else {
    attrs.push(`fill="none"`);
  }

  const rawFillAlpha = getAttr(pathEl, 'fillAlpha');
  if (rawFillAlpha !== null) {
    const alphaVal = parseFloat(resolveValue(rawFillAlpha, 'fillAlpha', pathDesc, ctx));
    if (!isNaN(alphaVal)) {
      const finalAlpha = Number((alphaVal * parsedFillAlpha).toFixed(3));
      if (finalAlpha < 1) attrs.push(`fill-opacity="${finalAlpha}"`);
    }
  } else if (parsedFillAlpha < 1) {
    attrs.push(`fill-opacity="${parsedFillAlpha}"`);
  }

  let parsedStrokeAlpha = 1;
  if (strokeColorValue) {
    if (strokeColorValue.startsWith('url(')) {
      attrs.push(`stroke="${strokeColorValue}"`);
    } else {
      const parsedStroke = parseAndroidColor(strokeColorValue);
      attrs.push(`stroke="${parsedStroke.color}"`);
      parsedStrokeAlpha = parsedStroke.alpha;
    }

    const rawStrokeWidth = getAttr(pathEl, 'strokeWidth') || '1';
    const strokeWidthResolved = resolveValue(rawStrokeWidth, 'strokeWidth', pathDesc, ctx);
    const strokeWidthNum = parseDimension(strokeWidthResolved).num;
    attrs.push(`stroke-width="${strokeWidthNum}"`);

    const strokeCap = getAttr(pathEl, 'strokeLineCap');
    if (strokeCap) {
      attrs.push(`stroke-linecap="${strokeCap}"`);
    }

    const strokeJoin = getAttr(pathEl, 'strokeLineJoin');
    if (strokeJoin) {
      attrs.push(`stroke-linejoin="${strokeJoin}"`);
    }

    const strokeMiter = getAttr(pathEl, 'strokeMiterLimit');
    if (strokeMiter) {
      attrs.push(`stroke-miterlimit="${strokeMiter}"`);
    }

    const rawStrokeAlpha = getAttr(pathEl, 'strokeAlpha');
    if (rawStrokeAlpha !== null) {
      const alphaVal = parseFloat(resolveValue(rawStrokeAlpha, 'strokeAlpha', pathDesc, ctx));
      if (!isNaN(alphaVal)) {
        const finalAlpha = Number((alphaVal * parsedStrokeAlpha).toFixed(3));
        if (finalAlpha < 1) attrs.push(`stroke-opacity="${finalAlpha}"`);
      }
    } else if (parsedStrokeAlpha < 1) {
      attrs.push(`stroke-opacity="${parsedStrokeAlpha}"`);
    }

    if (options.strokeScaling) {
      attrs.push(`vector-effect="non-scaling-stroke"`);
    }
  }

  const fillType = getAttr(pathEl, 'fillType');
  if (fillType) {
    if (fillType.toLowerCase() === 'evenodd') {
      attrs.push(`fill-rule="evenodd"`);
    } else if (fillType.toLowerCase() === 'nonzero') {
      attrs.push(`fill-rule="nonzero"`);
    }
  }

  const cleanPathData = pathDataRaw
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  attrs.push(`d="${cleanPathData}"`);

  return `${indent}<path ${attrs.join(' ')} />`;
}

function processGroup(groupEl, ctx, options, indent) {
  ctx.stats.groupCount += 1;
  const name = getAttr(groupEl, 'name');
  const groupDesc = name ? `Group <${name}>` : `Group #${ctx.stats.groupCount}`;

  const pxStr = getAttr(groupEl, 'pivotX');
  const pyStr = getAttr(groupEl, 'pivotY');
  const rotStr = getAttr(groupEl, 'rotation');
  const sxStr = getAttr(groupEl, 'scaleX');
  const syStr = getAttr(groupEl, 'scaleY');
  const txStr = getAttr(groupEl, 'translateX');
  const tyStr = getAttr(groupEl, 'translateY');

  const px = pxStr ? parseFloat(resolveValue(pxStr, 'pivotX', groupDesc, ctx)) || 0 : 0;
  const py = pyStr ? parseFloat(resolveValue(pyStr, 'pivotY', groupDesc, ctx)) || 0 : 0;
  const rot = rotStr ? parseFloat(resolveValue(rotStr, 'rotation', groupDesc, ctx)) || 0 : 0;
  const sx = sxStr ? parseFloat(resolveValue(sxStr, 'scaleX', groupDesc, ctx)) : 1;
  const sy = syStr ? parseFloat(resolveValue(syStr, 'scaleY', groupDesc, ctx)) : 1;
  const tx = txStr ? parseFloat(resolveValue(txStr, 'translateX', groupDesc, ctx)) || 0 : 0;
  const ty = tyStr ? parseFloat(resolveValue(tyStr, 'translateY', groupDesc, ctx)) || 0 : 0;

  const transformParts = [];
  if (tx !== 0 || ty !== 0) {
    transformParts.push(`translate(${tx} ${ty})`);
  }

  const hasPivot = px !== 0 || py !== 0;
  const hasRot = rot !== 0;
  const hasScale = sx !== 1 || sy !== 1;

  if (hasPivot) {
    if (hasRot) {
      transformParts.push(`rotate(${rot} ${px} ${py})`);
    }
    if (hasScale) {
      transformParts.push(`translate(${px} ${py}) scale(${sx} ${sy}) translate(${-px} ${-py})`);
    }
  } else {
    if (hasRot) {
      transformParts.push(`rotate(${rot})`);
    }
    if (hasScale) {
      transformParts.push(`scale(${sx} ${sy})`);
    }
  }

  const attrs = [];
  if (name) attrs.push(`id="${name}"`);
  if (transformParts.length > 0) {
    attrs.push(`transform="${transformParts.join(' ')}"`);
  }

  const childMarkup = processNodes(Array.from(groupEl.children), ctx, options, `${indent}  `);

  if (!childMarkup.trim() && attrs.length === 0) {
    return '';
  }

  return `${indent}<g ${attrs.join(' ')}>\n${childMarkup}\n${indent}</g>`;
}

function processNodes(children, ctx, options, indent) {
  const result = [];
  let currentClipId = null;
  let clippedBuffer = [];

  const flushClipBuffer = () => {
    if (currentClipId && clippedBuffer.length > 0) {
      result.push(
        `${indent}<g clip-path="url(#${currentClipId})">\n${clippedBuffer.join(
          '\n'
        )}\n${indent}</g>`
      );
      clippedBuffer = [];
      currentClipId = null;
    } else if (clippedBuffer.length > 0) {
      result.push(...clippedBuffer);
      clippedBuffer = [];
    }
  };

  for (const child of children) {
    const local = child.localName || child.tagName.split(':').pop() || '';

    if (local === 'clip-path') {
      flushClipBuffer();
      ctx.clipCounter += 1;
      ctx.stats.clipPathCount += 1;
      const clipId = `v2s_clip_${ctx.clipCounter}`;
      const pathData = getAttr(child, 'pathData');
      if (pathData) {
        ctx.defs.push(
          `<clipPath id="${clipId}">\n      <path d="${pathData.trim()}" />\n    </clipPath>`
        );
        currentClipId = clipId;
      }
    } else if (local === 'path') {
      const renderedPath = processPath(child, ctx, options, indent);
      if (renderedPath) {
        if (currentClipId) {
          clippedBuffer.push(renderedPath);
        } else {
          result.push(renderedPath);
        }
      }
    } else if (local === 'group') {
      const renderedGroup = processGroup(child, ctx, options, indent);
      if (renderedGroup) {
        if (currentClipId) {
          clippedBuffer.push(renderedGroup);
        } else {
          result.push(renderedGroup);
        }
      }
    }
  }

  flushClipBuffer();
  return result.join('\n');
}

export function convertVectorToSvg(
  xmlInput,
  overrides = {},
  options = {
    responsive: false,
    addXmlns: true,
    prettyPrint: true,
    strokeScaling: false,
  }
) {
  const stats = {
    pathCount: 0,
    groupCount: 0,
    gradientCount: 0,
    clipPathCount: 0,
    originalBytes: new Blob([xmlInput || '']).size,
    svgBytes: 0,
    viewportWidth: 24,
    viewportHeight: 24,
    width: '24',
    height: '24',
    resolvedReferencesCount: 0,
  };

  const diagnostics = [];
  const referencesMap = new Map();

  if (!xmlInput || !xmlInput.trim()) {
    return {
      success: false,
      svgString: '',
      diagnostics: [{ level: 'info', message: 'Enter or paste an Android Vector Drawable XML to begin.' }],
      stats,
      references: [],
      error: 'Empty XML input',
    };
  }

  let cleanedXml = xmlInput.trim();

  if (!cleanedXml.includes('<vector') && cleanedXml.includes('<path')) {
    cleanedXml = `<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="24dp" android:height="24dp" android:viewportWidth="24" android:viewportHeight="24">\n${cleanedXml}\n</vector>`;
    diagnostics.push({
      level: 'info',
      message: 'Auto-wrapped path snippet into standard 24x24 Android <vector> tag.',
    });
  }

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(cleanedXml, 'text/xml');

  const parseError = xmlDoc.getElementsByTagName('parsererror');
  if (parseError.length > 0) {
    const errorText = parseError[0].textContent || 'Invalid XML syntax';
    diagnostics.push({
      level: 'error',
      message: `XML Parsing Error: ${errorText}`,
    });
    return {
      success: false,
      svgString: '',
      diagnostics,
      stats,
      references: [],
      error: errorText,
    };
  }

  let vectorEl = null;
  const vectors = xmlDoc.getElementsByTagName('vector');
  if (vectors.length > 0) {
    vectorEl = vectors[0];
  } else {
    const root = xmlDoc.documentElement;
    const rootName = root.localName || root.tagName.split(':').pop() || '';
    if (rootName === 'vector') {
      vectorEl = root;
    }
  }

  if (!vectorEl) {
    diagnostics.push({
      level: 'error',
      message: 'No <vector> root element found in provided XML.',
    });
    return {
      success: false,
      svgString: '',
      diagnostics,
      stats,
      references: [],
      error: 'No <vector> tag found',
    };
  }

  const ctx = {
    referencesMap,
    overrides,
    diagnostics,
    defs: [],
    gradientCounter: 0,
    clipCounter: 0,
    stats: {
      pathCount: 0,
      groupCount: 0,
      gradientCount: 0,
      clipPathCount: 0,
    },
  };

  const rawWidth = getAttr(vectorEl, 'width');
  const rawHeight = getAttr(vectorEl, 'height');
  const rawVpWidth = getAttr(vectorEl, 'viewportWidth');
  const rawVpHeight = getAttr(vectorEl, 'viewportHeight');
  const rawAlpha = getAttr(vectorEl, 'alpha');
  const rawTint = getAttr(vectorEl, 'tint');

  const widthResolved = resolveValue(rawWidth || '24dp', 'width', 'Vector Root', ctx);
  const heightResolved = resolveValue(rawHeight || '24dp', 'height', 'Vector Root', ctx);
  const vpWidthResolved = resolveValue(rawVpWidth || '24', 'viewportWidth', 'Vector Root', ctx);
  const vpHeightResolved = resolveValue(rawVpHeight || '24', 'viewportHeight', 'Vector Root', ctx);

  const vpW = parseFloat(vpWidthResolved) || 24;
  const vpH = parseFloat(vpHeightResolved) || 24;
  const widthParsed = parseDimension(widthResolved).num || vpW;
  const heightParsed = parseDimension(heightResolved).num || vpH;

  stats.viewportWidth = vpW;
  stats.viewportHeight = vpH;
  stats.width = String(widthParsed);
  stats.height = String(heightParsed);

  const children = Array.from(vectorEl.children);
  const bodyContent = processNodes(children, ctx, options, '  ');

  let tintAttr = '';
  if (rawTint) {
    const tintResolved = resolveValue(rawTint, 'tint', 'Vector Root (tint)', ctx);
    const parsedTint = parseAndroidColor(tintResolved);
    if (parsedTint.color !== 'none') {
      tintAttr = ` color="${parsedTint.color}"`;
    }
  }

  const rootAttrs = [];
  if (options.addXmlns) {
    rootAttrs.push(`xmlns="http://www.w3.org/2000/svg"`);
  }
  if (!options.responsive) {
    rootAttrs.push(`width="${widthParsed}"`);
    rootAttrs.push(`height="${heightParsed}"`);
  }
  rootAttrs.push(`viewBox="0 0 ${vpW} ${vpH}"`);

  if (rawAlpha) {
    const alphaResolved = resolveValue(rawAlpha, 'alpha', 'Vector Root', ctx);
    const alphaNum = parseFloat(alphaResolved);
    if (!isNaN(alphaNum) && alphaNum < 1) {
      rootAttrs.push(`opacity="${alphaNum}"`);
    }
  }

  if (tintAttr) {
    rootAttrs.push(tintAttr.trim());
  }

  let defsSection = '';
  if (ctx.defs.length > 0) {
    defsSection = `  <defs>\n    ${ctx.defs.join('\n    ')}\n  </defs>\n`;
  }

  const svgOutput = `<svg ${rootAttrs.join(' ')}>\n${defsSection}${bodyContent}\n</svg>`;

  stats.pathCount = ctx.stats.pathCount;
  stats.groupCount = ctx.stats.groupCount;
  stats.gradientCount = ctx.stats.gradientCount;
  stats.clipPathCount = ctx.stats.clipPathCount;
  stats.resolvedReferencesCount = referencesMap.size;
  stats.svgBytes = new Blob([svgOutput]).size;

  const referencesList = Array.from(referencesMap.values());

  return {
    success: true,
    svgString: svgOutput,
    diagnostics,
    stats,
    references: referencesList,
  };
}
