import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarToggleProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function SidebarToggle({ isCollapsed, onToggle }: SidebarToggleProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-8"
      onClick={onToggle}
      aria-label={isCollapsed ? "サイドバーを開く" : "サイドバーを閉じる"}
    >
      {isCollapsed ? (
        <PanelLeftOpen className="size-5" />
      ) : (
        <PanelLeftClose className="size-5" />
      )}
    </Button>
  );
}
