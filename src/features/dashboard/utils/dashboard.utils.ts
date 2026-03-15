// src/features/dashboard/utils/dashboard.utils.ts

export function calcUserChangePercent(
  total: number,
  newThisMonth: number,
): number | undefined {
  if (total <= newThisMonth) return undefined;
  return Math.round((newThisMonth / (total - newThisMonth)) * 100);
}

type AnyError = { response?: { status?: number }; message?: string; code?: string } | null;

export type ErrorType = 'forbidden' | 'unauthorized' | 'network' | 'server' | null;

export function getErrorType(...errors: (AnyError | undefined | null | unknown)[]): ErrorType {
  const error = errors.find(Boolean) as AnyError | undefined;
  if (!error) return null;
  if (error?.response?.status === 403) return 'forbidden';
  if (error?.response?.status === 401) return 'unauthorized';
  if (error?.message?.includes('Network') || error?.code === 'ERR_NETWORK') return 'network';
  return 'server';
}
