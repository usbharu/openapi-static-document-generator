import { EndpointCard } from "@/components/endpoint/endpoint-card";
import type { OpenAPISpec, Operation } from "@/lib/types";

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
            <h2 className={"ml-12 font-bold text-3xl tracking-tight"}>
                {groupName}
            </h2>
            <div className={"space-y-6"}>
                {endpoints.map(value => (
                    <EndpointCard
                        key={`${value.path}-${value.method}`}
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
