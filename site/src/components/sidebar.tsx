"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { API } from "@/lib/types"; // ★ 型をインポート
import { cn } from "@/lib/utils";
import { SidebarToggle } from "./sidebar-toggle";

// import { getApiData } from "@/lib/api-loader"; // ← ★ 削除！

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  apis: API[]; // ★ propsの型定義を追加
}

export function Sidebar({ isCollapsed, onToggle, apis }: SidebarProps) {
  // ★ apisを受け取る
  // const { apis } = getApiData(); // ← ★ 削除！
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between border-b p-4",
          isCollapsed && "px-2",
        )}
      >
        {!isCollapsed && (
          <h1 className="font-bold text-lg tracking-tight">API Docs</h1>
        )}
        <SidebarToggle isCollapsed={isCollapsed} onToggle={onToggle} />
      </div>

      {/* Navigation */}
      <div
        className={cn(
          "flex-1 overflow-y-auto",
          isCollapsed && "overflow-visible",
        )}
      >
        {!isCollapsed && (
          <Accordion
            type="multiple"
            className="w-full px-4"
            defaultValue={apis.map(api => api.name)}
          >
            {apis.map(
              (
                api, // ★ propsのapisを使う
              ) => (
                <AccordionItem value={api.name} key={api.name}>
                  <AccordionTrigger className="font-semibold text-sm hover:no-underline">
                    {api.name}
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-1">
                      {api.versions.map(version => {
                        const href = `/docs/${api.name}/${version.version}`;
                        const isActive = pathname === href;
                        return (
                          <li key={version.version}>
                            <Link
                              href={href}
                              className={cn(
                                "block rounded-md px-3 py-1.5 text-sm transition-colors",
                                isActive
                                  ? "bg-primary text-primary-foreground"
                                  : "hover:bg-muted",
                              )}
                            >
                              {version.version}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ),
            )}
          </Accordion>
        )}
      </div>

      {/* Footer (optional) */}
      {!isCollapsed && (
        <div className="border-t p-4 text-muted-foreground text-xs">
          © 2025 Your Company
        </div>
      )}
    </div>
  );
}
