// Smart-link image primitive per lexicon §5.4.
//
// "The image IS the link" — a 16:9 cover image at full bleed, with a small
// pill in the top-right showing the source domain and an external-link
// arrow. Tapping anywhere on the image opens the source URL in a new tab.
// Used by itinerary cards (lodging, activities, restaurants) and any
// other surface that needs the smart-link pattern.
//
// Renders as a chassis primitive: 3px stroke, 22px radius, 6px hard
// shadow. Falls back to a gradient placeholder if no image URL is provided.

import Image from 'next/image';

type Props = {
  href: string;
  imageUrl: string | null;
  title: string;
  /** Optional handwritten meta line below the title (e.g. cost, time). */
  meta?: string;
  /** Optional flag pill in the top-left of the image (e.g. "the spot"). */
  flag?: string;
};

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function SmartLinkCard({ href, imageUrl, title, meta, flag }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="house"
      aria-label={`${title} (opens in new tab)`}
      style={{ display: 'block', textDecoration: 'none' }}
    >
      <div className="house-img" style={{ position: 'relative' }}>
        {flag && <div className="house-flag">{flag}</div>}
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 420px) 100vw, 420px"
            style={{ objectFit: 'cover' }}
            unoptimized
          />
        )}
        <div className="smartlink-source">{domainOf(href)} ↗</div>
      </div>
      <div className="house-body">
        <div className="house-title">{title}</div>
        {meta && <div className="house-meta">{meta}</div>}
      </div>
    </a>
  );
}
