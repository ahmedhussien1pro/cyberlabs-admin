// src/features/courses/index.ts
// ═══════════════════════════════════════════════════════════════════
// Feature public barrel — import everything from here, not from sub-paths.
// ═══════════════════════════════════════════════════════════════════

// types first (defines all types including CourseColor)
export * from './types';

// constants (values only — no type re-exports to avoid collision)
export * from './constants';

// services
export * from './services';

// components
export * from './components';
