"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { API } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type SidebarApiProps = {
  api: API;
};

export function SidebarApi({ api }: SidebarApiProps) {
  const pathname = usePathname();

  const [selectedVersion, setSelectedVersion] = useState(
    api.versions[0].version,
  );

  return (
    <ul>
      <li>
        <Select value={selectedVersion} onValueChange={setSelectedVersion}>
          <SelectTrigger>
            <SelectValue placeholder="Version"></SelectValue>
          </SelectTrigger>
          <SelectContent>
            {api.versions
              .sort((a, b) => {
                return (
                  new Date(b.info.date).getTime() -
                  new Date(a.info.date).getTime()
                );
              })
              .map(version => {
                const href = `/docs/${api.name}/${version.version}`;
                const isActive = pathname === href;
                return (
                  // <ul key={version.version}>
                  <SelectItem
                    key={version.version}
                    value={version.version}
                    defaultChecked={isActive}
                    className={"w-max"}
                  >
                    {version.version}
                  </SelectItem>
                  // </ul>
                );
              })}
          </SelectContent>
        </Select>
      </li>
      <li>
        <Link
          href={`/docs/${api.name}/${selectedVersion}`}
          className={
            "block rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-muted focus:bg-primary focus:text-primary-foreground"
          }
        >
          Summary
        </Link>
      </li>
      <li>
        <Link
          href={`/compare/${api.name}/${selectedVersion}/${api.versions.at(-1)?.version}`}
          className={
            "block rounded-md px-3 py-3 text-sm transition-colors hover:bg-muted focus:bg-primary focus:text-primary-foreground"
          }
        >
          Compare
        </Link>
      </li>
    </ul>
  );
}
