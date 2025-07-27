"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { API } from "@/lib/types"; // ★ 型をインポート
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarToggle } from "./sidebar-toggle";
// import { getApiData } from "@/lib/api-loader"; // ← ★ 削除！

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
    apis: API[]; // ★ propsの型定義を追加
}

export function Sidebar({ isCollapsed, onToggle, apis }: SidebarProps) { // ★ apisを受け取る
                                                                         // const { apis } = getApiData(); // ← ★ 削除！
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className={cn(
                "flex items-center justify-between p-4 border-b",
                isCollapsed && "px-2"
            )}>
                {!isCollapsed && (
                    <h1 className="text-lg font-bold tracking-tight">API Docs</h1>
                )}
                <SidebarToggle isCollapsed={isCollapsed} onToggle={onToggle} />
            </div>

            {/* Navigation */}
            <div className={cn(
                "flex-1 overflow-y-auto",
                isCollapsed && "overflow-visible"
            )}>
                {!isCollapsed && (
                    <Accordion
                        type="multiple"
                        className="w-full px-4"
                        defaultValue={apis.map(api => api.name)}
                    >
                        {apis.map((api) => ( // ★ propsのapisを使う
                            <AccordionItem value={api.name} key={api.name}>
                                <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                                    {api.name}
                                </AccordionTrigger>
                                <AccordionContent>
                                    <ul className="space-y-1">
                                        {api.versions.map((version) => {
                                            const href = `/docs/${api.name}/${version.version}`;
                                            const isActive = pathname === href;
                                            return (
                                                <li key={version.version}>
                                                    <Link
                                                        href={href}
                                                        className={cn(
                                                            "block px-3 py-1.5 text-sm rounded-md transition-colors",
                                                            isActive
                                                                ? "bg-primary text-primary-foreground"
                                                                : "hover:bg-muted"
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
                        ))}
                    </Accordion>
                )}
            </div>

            {/* Footer (optional) */}
            {!isCollapsed && (
                <div className="p-4 border-t text-xs text-muted-foreground">
                    © 2025 Your Company
                </div>
            )}
        </div>
    );
}
