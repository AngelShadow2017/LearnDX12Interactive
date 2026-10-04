import { chapterByRoute } from './catalog';
import { referencePages } from './pages';

const referenceRoutes = new Set(Object.values(referencePages).map((page) => page.route));

/** Build an in-app URL that works with a single static index.html entry. */
export function pageHref(route: string, sectionId?: string): string {
  const fileName = route.split('/').at(-1) ?? route;
  const page = fileName.replace(/\.html$/i, '');
  const query = page && page !== 'index' ? `?page=${encodeURIComponent(page)}` : '';
  const section = sectionId?.replace(/^#/, '');
  return `./${query}${section ? `#${encodeURIComponent(section)}` : ''}`;
}

/** Resolve a logical page from a query URL, retaining old direct paths when served. */
export function routeFromLocation(pathname: string, search: string): string {
  const requestedPage = new URLSearchParams(search).get('page');
  const pathPage = pathname.split('/').filter(Boolean).at(-1);
  const requestedRoute = requestedPage
    ? (requestedPage.endsWith('.html') ? requestedPage : `${requestedPage}.html`)
    : (pathPage || 'index.html');

  if (requestedRoute === 'index.html' || chapterByRoute.has(requestedRoute) || referenceRoutes.has(requestedRoute)) {
    return requestedRoute;
  }
  return 'index.html';
}
