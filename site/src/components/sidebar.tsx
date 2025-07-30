"use client";

import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { API } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SidebarApi } from "./sidebar/sidebar-api";
import { SidebarToggle } from "./sidebar-toggle";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  apis: API[];
}

export function Sidebar({ isCollapsed, onToggle, apis }: SidebarProps) {
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
          <Link href={"/"}>
            <h1 className="font-bold text-lg tracking-tight">API Docs</h1>
          </Link>
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
                    <SidebarApi api={api}></SidebarApi>
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
