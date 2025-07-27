import {Badge} from "@/components/ui/badge";
import {Hash} from "lucide-react";
import {getMethodBadgeColor} from "@/lib/utils";

interface EndpointHeaderProps {
    method: string;
    path: string;
    summary?: string;
    tags?: string[];
}



export function EndpointHeader({method, path, summary, tags}: EndpointHeaderProps) {
    return (
        <div>

                <h2 className="flex items-center gap-2 text-2xl font-semibold group" id={`endpoint-${method}-${path}`}>
                    <a href={`#endpoint-${method}-${path}`}>
                    <Hash className={"inline text-secondary group-hover:text-primary"}
                          href={`#endpoint-${method}-${path}`}/>
                    </a>
                    <Badge
                        className={`text-lg text-white font-bold ${getMethodBadgeColor(
                            method
                        )}`}
                    >
                        {method.toUpperCase()}
                    </Badge>
                    <span className="font-mono">{path}</span>
                </h2>
            {summary && <p className="text-muted-foreground pt-2">{summary}</p>}
            {tags && tags.map((value, index) => <Badge key={index}>#{value}</Badge>)}
        </div>
    );
}
