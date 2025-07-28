"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Sidebar } from "./sidebar";
import type { API } from "@/lib/types"; // ★ 型をインポート

interface AppShellProps {
	children: React.ReactNode;
	apis: API[]; // ★ propsの型定義を追加
}

export function AppShell({ children, apis }: AppShellProps) {
	// ★ apisを受け取る
	const [isCollapsed, setIsCollapsed] = useState(true);

	useEffect(() => {
		const storedState = localStorage.getItem("sidebar-collapsed");
		if (storedState !== null) {
			setIsCollapsed(JSON.parse(storedState));
		}
	}, []);

	const toggleSidebar = () => {
		const newState = !isCollapsed;
		setIsCollapsed(newState);
		localStorage.setItem("sidebar-collapsed", JSON.stringify(newState));
	};

	return (
		<div className="relative flex h-screen overflow-hidden">
			<aside
				className={cn(
					"h-full bg-card border-r transition-all duration-300 ease-in-out",
					isCollapsed ? "w-12" : "w-64",
				)}
			>
				{/* ★ Sidebarにデータを渡す */}
				<Sidebar
					apis={apis}
					isCollapsed={isCollapsed}
					onToggle={toggleSidebar}
				/>
			</aside>
			<main className="flex-1 overflow-y-auto p-8">{children}</main>
		</div>
	);
}
