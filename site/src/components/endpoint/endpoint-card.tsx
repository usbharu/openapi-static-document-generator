"use client";

import { EndpointExample } from "@/components/endpoint/endpoint-example";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { OpenAPISpec, Operation } from "@/lib/types";
import { EndpointDetails } from "./endpoint-details";
import { EndpointHeader } from "./endpoint-header";

interface EndpointCardProps {
    path: string;
    method: string;
    operation: Operation;
    spec: OpenAPISpec;
}

export function EndpointCard({
    path,
    method,
    operation,
    spec,
}: EndpointCardProps) {
    const responseCodes = operation.responses
        ? Object.keys(operation.responses)
        : [];

    return (
        <Card>
            <CardHeader>
                <EndpointHeader
                    method={method}
                    path={path}
                    summary={operation.summary}
                    tags={operation.tags}
                />
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* --- 左ペイン: 仕様詳細 --- */}
                    <EndpointDetails operation={operation} spec={spec} />

                    {/* --- 右ペイン: サンプル --- */}
                    <EndpointExample
                        responseCodes={responseCodes}
                        operation={operation}
                        schemas={spec.components?.schemas}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
