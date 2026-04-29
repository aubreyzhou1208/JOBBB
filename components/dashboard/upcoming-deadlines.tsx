import { CalendarClock, ExternalLink } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { JobPosting } from "@/lib/types";
import { formatDate, getDaysUntil } from "@/lib/utils";

export function UpcomingDeadlines({ jobs }: { jobs: JobPosting[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>近期截止岗位</CardTitle>
        <CardDescription>优先处理最接近截止时间的岗位，避免错过窗口期。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {jobs.map((job) => (
          <div key={job.id} className="flex flex-col gap-3 rounded-3xl border border-white/40 bg-white/45 p-4 backdrop-blur-glass md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-medium">{job.companyName}</p>
              <p className="text-sm text-mutedText">{job.title}</p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="inline-flex items-center gap-2 text-coral-hover">
                <CalendarClock className="h-4 w-4" />
                还剩 {getDaysUntil(job.deadlineAt)} 天
              </div>
              <span className="text-mutedText">{formatDate(job.deadlineAt)}</span>
              <a className="inline-flex items-center gap-1 text-primary hover:text-primary-hover hover:underline" href={job.applyUrl} target="_blank">
                打开 <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
