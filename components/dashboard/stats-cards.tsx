import { BriefcaseBusiness, CheckCheck, CircleDashed, Trophy } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const statStyles = [
  { icon: BriefcaseBusiness, accent: "from-primary-soft via-white/35 to-white/10", iconTone: "bg-primary-soft text-primary" },
  { icon: CheckCheck, accent: "from-primary-soft via-mint-soft/45 to-white/10", iconTone: "bg-primary-soft text-primary" },
  { icon: CircleDashed, accent: "from-mint-soft via-white/30 to-primary-soft/20", iconTone: "bg-mint-soft text-mint-hover" },
  { icon: Trophy, accent: "from-mint-soft via-white/35 to-coral-soft/20", iconTone: "bg-mint-soft text-mint-hover" }
];

export function StatsCards({
  items
}: {
  items: { label: string; value: number; helper: string }[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => {
        const Icon = statStyles[index].icon;
        return (
          <Card key={item.label} className={`overflow-hidden bg-gradient-to-br ${statStyles[index].accent}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-mutedText">{item.label}</CardTitle>
              <div className={`rounded-2xl p-2 ${statStyles[index].iconTone}`}>
                <Icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{item.value}</div>
              <p className="mt-1 text-sm text-mutedText">{item.helper}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
