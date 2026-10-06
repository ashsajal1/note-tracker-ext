/**
 * Fire-and-forget toast that lazy-loads sonner on first use.
 * Importing sonner statically pulls it into the initial popup chunk,
 * so every notification goes through here instead.
 */
export function notify(kind: 'success' | 'error', message: string): void {
  void import('sonner').then(({ toast }) => toast[kind](message));
}
