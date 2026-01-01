
import { SiteIdentity } from '../types.ts';

/**
 * Updates the browser's identity protocol: Title and Favicon.
 * Includes a cache-buster for favicons to ensure immediate visual sync.
 */
export const updateBrowserIdentity = (identity: SiteIdentity) => {
  if (!identity) return;

  // 1. Update Document Title
  const fullTitle = identity.title + (identity.tagline ? ` - ${identity.tagline}` : '');
  if (document.title !== fullTitle) {
    document.title = fullTitle;
  }

  // 2. Update Browser Favicon
  if (identity.favicon_url) {
    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }

    // Add a cache-buster query param to force the browser to reload the image
    const cacheBuster = `v=${new Date().getTime()}`;
    const newHref = identity.favicon_url.includes('?') 
      ? `${identity.favicon_url}&${cacheBuster}` 
      : `${identity.favicon_url}?${cacheBuster}`;

    if (link.href !== newHref) {
      link.href = newHref;
    }
  }
};
