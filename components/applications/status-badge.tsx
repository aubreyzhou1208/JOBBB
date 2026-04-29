import { Badge } from "@/components/ui/badge";
import { ApplicationStatus } from "@/lib/types";
import { cn, getStatusLabel, getStatusTone } from "@/lib/utils";

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return <Badge className={cn("border-transparent", getStatusTone(status))}>{getStatusLabel(status)}</Badge>;
}
