// Generic wrapper for trip page module sections. Shows section title
// and either the module content (children) or an empty state message.

import type { ReactNode } from 'react';

type Props = {
  title: string;
  emptyText: string;
  hasContent: boolean;
  children?: ReactNode;
};

export function ModuleSlot({ title, emptyText, hasContent, children }: Props) {
  return (
    <div className="module-slot">
      <h2 className="module-title">{title}</h2>
      {hasContent ? children : <p className="module-empty">{emptyText}</p>}
    </div>
  );
}
