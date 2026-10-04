/** Keep local figure URLs relative to the deployed app directory. */
export function figureAssetHref(src: string): string {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(src)) return src;
  return `./${src.replace(/^(?:\.\/|\/)+/, '')}`;
}
