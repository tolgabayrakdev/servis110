import { CalendarDays, Gauge, Trash2 } from "lucide-react";
import type { ServiceRecord } from "@/types/api-types";
import { formatDate, formatMileage } from "@/lib/formatters";
import { EmptyState } from "./data-state";
import { Button } from "./ui/button";

export function ServiceHistory({
  records,
  onRemove,
}: {
  records: ServiceRecord[];
  onRemove?: (record: ServiceRecord) => void;
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
      {records.map((record, index) => (
        <article key={record.id} className="record-sheet first:pt-0">
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
                {onRemove && (
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
              {(record.operations.length > 0 ||
                record.replacedParts.length > 0) && (
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  {[
                    { label: "Yapılan işlemler", items: record.operations },
                    {
                      label: "Değiştirilen parçalar",
                      items: record.replacedParts,
                    },
                  ]
                    .filter((group) => group.items.length)
                    .map((group) => (
                      <div key={group.label}>
                        <h4 className="eyebrow mb-2">{group.label}</h4>
                        <ul className="space-y-1.5">
                          {group.items.map((item, i) => (
                            <li
                              key={i}
                              className="flex gap-2 text-sm leading-6 text-secondary-foreground"
                            >
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
              {(record.nextServiceDate ||
                record.nextServiceMileage != null) && (
                <div className="mt-5 flex flex-wrap items-center gap-3 rounded-md bg-muted/70 px-4 py-3 text-xs">
                  <span className="font-medium">Planlanan bakım</span>
                  {record.nextServiceDate && (
                    <span className="text-muted-foreground">
                      {formatDate(record.nextServiceDate)}
                    </span>
                  )}
                  {record.nextServiceMileage != null && (
                    <span className="text-muted-foreground">
                      {formatMileage(record.nextServiceMileage)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
