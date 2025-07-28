import type { OpenAPISpec, Operation } from "@/lib/types";
import { EndpointCard } from "@/components/endpoint/endpoint-card";

type EndpointGroupProps = {
	groupName: string;
	endpoints: {
		path: string;
		method: string;
		operation: Operation;
		spec: OpenAPISpec;
	}[];
};

export function EndpointGroup({ groupName, endpoints }: EndpointGroupProps) {
	return (
		<div>
			<h2 className={"text-3xl font-bold tracking-tight ml-12"}>{groupName}</h2>
			<div className={"space-y-6"}>
				{endpoints.map((value, index) => (
					<EndpointCard
						key={index}
						path={value.path}
						method={value.method}
						operation={value.operation}
						spec={value.spec}
					/>
				))}
			</div>
		</div>
	);
}
