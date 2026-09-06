// ---------------------------------------------------------------------------
// Minimal DOM helper. Keeps component files readable without pulling in a
// templating library or framework.
// ---------------------------------------------------------------------------

/**
 * Create an element.
 * @param {string} tag - e.g. "div.class-name.other-class" or "button"
 * @param {object} [attrs] - attributes; `text`, `html`, `on` (event map) are special-cased
 * @param {Array} [children]
 */
export function el(tag, attrs = {}, children = []) {
  const [tagName, ...classes] = tag.split('.');
  const node = document.createElement(tagName || 'div');
  if (classes.length) node.className = classes.join(' ');

  for (const [key, value] of Object.entries(attrs || {})) {
    if (value == null || value === false) continue;
    if (key === 'text') {
      node.textContent = value;
    } else if (key === 'html') {
      node.innerHTML = value;
    } else if (key === 'on') {
      for (const [evt, handler] of Object.entries(value)) {
        node.addEventListener(evt, handler);
      }
    } else if (key === 'class') {
      node.className = node.className ? `${node.className} ${value}` : value;
    } else if (key in node && typeof node[key] !== 'function') {
      try {
        node[key] = value;
      } catch {
        node.setAttribute(key, value);
      }
    } else {
      node.setAttribute(key, value);
    }
  }

  for (const child of [].concat(children)) {
    if (child == null || child === false) continue;
    node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  }

  return node;
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

export function mount(root, node) {
  clear(root);
  root.appendChild(node);
}
