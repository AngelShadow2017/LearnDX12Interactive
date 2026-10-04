import { describe, expect, it } from 'vitest';
import { figureAssetHref } from './figurePath';

describe('figure asset URLs', () => {
  it('keeps bundled images relative to the deployed app directory', () => {
    expect(figureAssetHref('images/Fig1-1.jpg')).toBe('./images/Fig1-1.jpg');
    expect(figureAssetHref('./images/Fig1-1.jpg')).toBe('./images/Fig1-1.jpg');
  });

  it('converts root-relative local image paths to app-relative paths', () => {
    expect(figureAssetHref('/images/Fig1-1.jpg')).toBe('./images/Fig1-1.jpg');
  });

  it('resolves figures inside a nested static deployment directory', () => {
    const page = new URL('https://example.com/manual/preview/?page=ch05');
    expect(new URL(figureAssetHref('images/Fig1-1.jpg'), page).pathname)
      .toBe('/manual/preview/images/Fig1-1.jpg');
  });

  it('preserves explicit remote URLs', () => {
    expect(figureAssetHref('https://example.com/figure.jpg')).toBe('https://example.com/figure.jpg');
    expect(figureAssetHref('//cdn.example.com/figure.jpg')).toBe('//cdn.example.com/figure.jpg');
  });
});
