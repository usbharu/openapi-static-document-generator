import { Badge } from "@/components/ui/badge";
import { Hash } from "lucide-react";
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
				className="flex items-center gap-2 text-2xl font-semibold group"
				id={id}
			>
				<a href={`#${id}`}>
					<Hash
						className={"inline text-secondary group-hover:text-primary"}
						href={`#${id}`}
					/>
				</a>
				<Badge
					className={`text-lg text-white font-bold ${getMethodBadgeColor(
						method,
					)}`}
				>
					{method.toUpperCase()}
				</Badge>
				<span className="font-mono">{path}</span>
			</h2>
			{summary && <p className="text-muted-foreground pt-2">{summary}</p>}
			{tags?.map((value, index) => <Badge key={index}>#{value}</Badge>)}
		</div>
	);
}
