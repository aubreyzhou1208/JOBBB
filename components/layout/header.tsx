"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { usePathname } from "next/navigation";

import { navigation } from "@/components/layout/navigation";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-white/30 bg-glass-strong px-4 py-4 backdrop-blur-glass md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-mutedText">Career OS</p>
          <div>
            <h1 className="text-xl font-semibold">求职投递管理台</h1>
            <p className="text-sm text-mutedText">把岗位、投递进度和简历资料集中在一个清爽的工作台里。</p>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 xl:items-end">
          <nav className="flex flex-wrap gap-2">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  pathname === item.href ? "bg-primary text-white shadow-glass" : "bg-white/55 text-mutedText backdrop-blur-glass hover:bg-white/78 hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="relative w-full md:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input placeholder="全局搜索（预留）" className="pl-9" disabled />
          </div>
        </div>
      </div>
    </header>
  );
}
