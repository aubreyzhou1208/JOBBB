import { BriefcaseBusiness, FileText, Home, Layers3, Settings } from "lucide-react";

export const navigation = [
  { href: "/", label: "总览", icon: Home },
  { href: "/applications", label: "投递记录", icon: Layers3 },
  { href: "/jobs", label: "岗位库", icon: BriefcaseBusiness },
  { href: "/resume", label: "简历资料", icon: FileText },
  { href: "/settings", label: "设置", icon: Settings }
];
