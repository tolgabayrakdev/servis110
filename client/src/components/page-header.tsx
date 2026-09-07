import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <h1 className="display-title">{title}</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
      {action && <div className="page-heading-actions">{action}</div>}
    </div>
  );
}
