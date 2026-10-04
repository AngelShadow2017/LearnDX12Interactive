import { describe, expect, it } from 'vitest';
import { pageHref, routeFromLocation } from './routes';

describe('single-entry page routes', () => {
  it('creates query URLs without emitting one HTML file per chapter', () => {
    expect(pageHref('index.html')).toBe('./');
    expect(pageHref('intro.html')).toBe('./?page=intro');
    expect(pageHref('ch05.html')).toBe('./?page=ch05');
  });

  it('keeps a section anchor when linking across pages', () => {
    expect(pageHref('ch22.html', '#s224')).toBe('./?page=ch22#s224');
  });

  it('resolves query routes and keeps old direct paths readable', () => {
    expect(routeFromLocation('/', '?page=ch23')).toBe('ch23.html');
    expect(routeFromLocation('/', '?page=appendix')).toBe('appendix.html');
    expect(routeFromLocation('/ch01.html', '')).toBe('ch01.html');
  });

  it('falls back to the homepage for unknown routes', () => {
    expect(routeFromLocation('/', '?page=unknown')).toBe('index.html');
    expect(routeFromLocation('/', '')).toBe('index.html');
  });
});
