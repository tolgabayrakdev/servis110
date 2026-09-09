import { CalendarDays, ChevronDown, Gauge, Trash2 } from "lucide-react";
import type { ServiceRecord } from "@/types/api-types";
import { formatDate, formatMileage } from "@/lib/formatters";
import { EmptyState } from "./data-state";
import { Button } from "./ui/button";

export function ServiceHistory({
  records,
  onRemove,
  collapsible = false,
}: {
  records: ServiceRecord[];
  onRemove?: (record: ServiceRecord) => void;
  collapsible?: boolean;
}) {
  if (!records.length)
    return (
      <EmptyState
        title="Henüz bir işlem kaydedilmedi."
        description="Bu araca ait servis kayıtları eklendiğinde burada görünecek."
      />
    );
  return (
    <div>
      {records.map((record, index) => {
        const header = (
          <div className="flex items-start gap-4">
            <span className="hidden w-7 shrink-0 pt-1 font-mono text-xs text-muted-foreground sm:block">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-medium tracking-tight">
                    {record.serviceType}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-4 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="size-3.5" />
                      {formatDate(record.serviceDate)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Gauge className="size-3.5" />
                      {formatMileage(record.mileage)}
                    </span>
                  </div>
                </div>
                {onRemove && !collapsible && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Servis kaydını sil"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => onRemove(record)}
                  >
                    <Trash2 />
                  </Button>
                )}
              </div>
            </div>
          </div>
        );

        const details = (
          <div className={collapsible ? "ml-0 pt-5 sm:ml-11" : "ml-0 sm:ml-11"}>
            {(record.operations.length > 0 || record.replacedParts.length > 0) && (
              <div className="grid gap-5 sm:grid-cols-2">
                {[
                  { label: "Yapılan işlemler", items: record.operations },
                  { label: "Değiştirilen parçalar", items: record.replacedParts },
                ]
                  .filter((group) => group.items.length)
                  .map((group) => (
                    <div key={group.label}>
                      <h4 className="eyebrow mb-2">{group.label}</h4>
                      <ul className="space-y-1.5">
                        {group.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex gap-2 text-sm leading-6 text-secondary-foreground">
                            <span className="text-muted-foreground">—</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
              </div>
            )}
            {record.description && (
              <p className="mt-5 border-l-2 border-border pl-4 text-sm leading-6 text-muted-foreground">
                {record.description}
              </p>
            )}
            {collapsible && onRemove && (
              <div className="mt-5 flex justify-end border-t border-border pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => onRemove(record)}
                >
                  <Trash2 />
                  Servis kaydını sil
                </Button>
              </div>
            )}
          </div>
        );

        if (collapsible) {
          return (
            <details key={record.id} className="group record-sheet first:pt-0">
              <summary className="flex cursor-pointer list-none items-center gap-3 rounded-md outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring/40 [&::-webkit-details-marker]:hidden">
                <div className="min-w-0 flex-1">{header}</div>
                <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                  <span className="hidden sm:inline">
                    Detayı aç
                  </span>
                  <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
                </div>
              </summary>
              {details}
            </details>
          );
        }

        return (
          <article key={record.id} className="record-sheet first:pt-0">
            {header}
            {details}
          </article>
        );
      })}
    </div>
  );
}
