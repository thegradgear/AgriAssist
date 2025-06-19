
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string | ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 md:mb-8">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="grid gap-1">
          <h1 className="text-3xl font-semibold leading-tight font-headline"> {/* H1: text-3xl, font-semibold, leading-tight */}
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground text-base leading-normal"> {/* Base body for description */}
              {description}
            </p>
          )}
        </div>
        {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
