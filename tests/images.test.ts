import { describe, expect, it } from 'vitest';
import { MAX_IMAGE_BYTES, validateImageFile } from '@/utils/images';

describe('validateImageFile', () => {
  it('accepts images within the size limit', () => {
    expect(validateImageFile({ type: 'image/png', size: 1024 })).toBeNull();
    expect(validateImageFile({ type: 'image/jpeg', size: MAX_IMAGE_BYTES })).toBeNull();
  });

  it('rejects non-image files', () => {
    expect(validateImageFile({ type: 'text/plain', size: 10 })).toBe('not-image');
    expect(validateImageFile({ type: '', size: 10 })).toBe('not-image');
  });

  it('rejects oversized images', () => {
    expect(validateImageFile({ type: 'image/png', size: MAX_IMAGE_BYTES + 1 })).toBe(
      'too-large',
    );
  });
});
