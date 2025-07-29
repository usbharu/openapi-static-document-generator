import { Hash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { encodeToBase64Url, getMethodBadgeColor } from "@/lib/utils";

interface EndpointHeaderProps {
    method: string;
    path: string;
    summary?: string;
    tags?: string[];
}

export function EndpointHeader({
    method,
    path,
    summary,
    tags,
}: EndpointHeaderProps) {
    const id = `endpoint-${method}-${encodeToBase64Url(path.substring(1))}`;
    return (
        <div>
            <h2
                className="group flex items-center gap-2 font-semibold text-2xl"
                id={id}
            >
                <a href={`#${id}`}>
                    <Hash
                        className={
                            "inline text-secondary group-hover:text-primary"
                        }
                        href={`#${id}`}
                    />
                </a>
                <Badge
                    className={`font-bold text-lg text-white ${getMethodBadgeColor(
                        method,
                    )}`}
                >
                    {method.toUpperCase()}
                </Badge>
                <span className="font-mono">{path}</span>
            </h2>
            {summary && <p className="pt-2 text-muted-foreground">{summary}</p>}
            {tags?.map(value => (
                <Badge key={value}>#{value}</Badge>
            ))}
        </div>
    );
}
