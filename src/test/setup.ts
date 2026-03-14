import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => cleanup());

// Radix UI Select / Popover use PointerEvent APIs not available in jsdom
if (typeof window !== 'undefined') {
  window.PointerEvent = window.PointerEvent ??
    class PointerEvent extends MouseEvent {
      constructor(type: string, params?: PointerEventInit) {
        super(type, params);
      }
    } as typeof PointerEvent;

  // hasPointerCapture / setPointerCapture / releasePointerCapture
  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = () => false;
  }
  if (!HTMLElement.prototype.setPointerCapture) {
    HTMLElement.prototype.setPointerCapture = () => {};
  }
  if (!HTMLElement.prototype.releasePointerCapture) {
    HTMLElement.prototype.releasePointerCapture = () => {};
  }

  // scrollIntoView not implemented in jsdom
  if (!HTMLElement.prototype.scrollIntoView) {
    HTMLElement.prototype.scrollIntoView = vi.fn();
  }
}
