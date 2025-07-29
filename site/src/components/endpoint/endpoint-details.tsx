import { SchemaLink } from "@/components/SchemaLink"; // インポート追加
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { OpenAPISpec, Operation } from "@/lib/types";
import { getSchemaName } from "@/lib/utils";
import { SchemaProperty } from "../schema-property";

interface EndpointDetailsProps {
    operation: Operation;
    spec: OpenAPISpec; // specプロパティを追加
}

export function EndpointDetails({ operation, spec }: EndpointDetailsProps) {
    const allSchemas = spec.components?.schemas || {};

    // Request Body関連の情報を抽出
    const requestBody = operation.requestBody;
    const requestBodySchemaRef =
        requestBody?.content?.["application/json"]?.schema?.$ref;
    const requestBodySchemaName = getSchemaName(requestBodySchemaRef);
    const requestBodySchemaDef = requestBodySchemaName
        ? allSchemas[requestBodySchemaName]
        : undefined;
    const requestBodyProperties =
        requestBodySchemaDef?.properties ||
        requestBodySchemaDef?.allOf?.find(s => s.properties)?.properties;

    return (
        <div className="space-y-8">
            {operation.description && <p>{operation.description}</p>}

            {operation.parameters && operation.parameters.length > 0 && (
                <div>
                    <h3 className="mb-2 font-semibold text-lg">Parameters</h3>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>In</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Required</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {operation.parameters.map(param => (
                                <TableRow key={`${param.name}-${param.in}`}>
                                    <TableCell className="font-mono">
                                        {param.name}
                                    </TableCell>
                                    <TableCell>{param.in}</TableCell>
                                    <TableCell>{param.description}</TableCell>
                                    <TableCell>
                                        {param.required ? "Yes" : "No"}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {requestBody && (
                <div>
                    <h3 className="mb-2 font-semibold text-lg">Request Body</h3>
                    {requestBody.description && (
                        <p className="mb-2 text-muted-foreground">
                            {requestBody.description}
                        </p>
                    )}
                    <div className="rounded-md border p-4">
                        <div className="flex items-center justify-between">
                            <p className="font-mono font-semibold text-sm">
                                application/json
                            </p>
                            {requestBody.required && (
                                <Badge variant="outline">Required</Badge>
                            )}
                        </div>
                        {requestBodyProperties ? (
                            <div className="p-4">
                                <h4 className="mb-2 font-semibold">
                                    Schema:{" "}
                                    <SchemaLink
                                        schemaName={requestBodySchemaName}
                                        schema={requestBodySchemaDef}
                                    />
                                </h4>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Property</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Description</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {Object.entries(
                                            requestBodyProperties,
                                        ).map(([propName, propSchema]) => (
                                            <SchemaProperty
                                                key={propName}
                                                name={propName}
                                                schema={propSchema}
                                                isRequired={
                                                    !!requestBodySchemaDef?.required?.includes(
                                                        propName,
                                                    )
                                                }
                                            />
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : requestBodySchemaRef ? (
                            <div className="p-4 text-sm">
                                Schema:{" "}
                                <SchemaLink
                                    schemaName={requestBodySchemaName}
                                    schema={requestBodySchemaDef}
                                />
                            </div>
                        ) : null}
                    </div>
                </div>
            )}

            <div>
                <h3 className="mb-2 font-semibold text-lg">Responses</h3>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Schema</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Object.entries(operation.responses).map(
                            ([statusCode, response]) => {
                                const responseSchemaRef =
                                    response.content?.["application/json"]
                                        ?.schema?.$ref;
                                const schemaName =
                                    getSchemaName(responseSchemaRef);
                                const schemaDef = schemaName
                                    ? allSchemas[schemaName]
                                    : null;
                                const properties =
                                    schemaDef?.properties ||
                                    schemaDef?.allOf?.find(s => s.properties)
                                        ?.properties;

                                return (
                                    <TableRow key={statusCode}>
                                        <TableCell className="bg-muted/50 p-4">
                                            <span className="font-bold text-lg">
                                                {statusCode}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="mt-1 text-muted-foreground text-sm">
                                                {response.description}
                                            </span>
                                        </TableCell>
                                        {properties ? (
                                            <TableCell className="p-4">
                                                <SchemaLink
                                                    schemaName={schemaName}
                                                    schema={schemaDef}
                                                />
                                            </TableCell>
                                        ) : (
                                            <TableCell>
                                                <p>Schema Not found</p>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                );
                            },
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
