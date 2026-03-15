import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => cleanup());

// ── Suppress known Radix UI / accessibility warnings in test output ────────
const SUPPRESSED = [
  'Missing `Description` or `aria-describedby',
  'Missing `Title` or `aria-labelledby',
  'Warning: An update to',
];
const _consoleError = console.error.bind(console);
console.error = (...args: any[]) => {
  const msg = typeof args[0] === 'string' ? args[0] : '';
  if (SUPPRESSED.some((s) => msg.includes(s))) return;
  _consoleError(...args);
};
const _consoleWarn = console.warn.bind(console);
console.warn = (...args: any[]) => {
  const msg = typeof args[0] === 'string' ? args[0] : '';
  if (SUPPRESSED.some((s) => msg.includes(s))) return;
  _consoleWarn(...args);
};

// ── Radix UI pointer / scroll APIs not in jsdom ────────────────────────
if (typeof window !== 'undefined') {
  window.PointerEvent = window.PointerEvent ??
    class PointerEvent extends MouseEvent {
      constructor(type: string, params?: PointerEventInit) { super(type, params); }
    } as typeof PointerEvent;

  if (!HTMLElement.prototype.hasPointerCapture)   HTMLElement.prototype.hasPointerCapture   = () => false;
  if (!HTMLElement.prototype.setPointerCapture)   HTMLElement.prototype.setPointerCapture   = () => {};
  if (!HTMLElement.prototype.releasePointerCapture) HTMLElement.prototype.releasePointerCapture = () => {};
  if (!HTMLElement.prototype.scrollIntoView)      HTMLElement.prototype.scrollIntoView      = vi.fn();
}
