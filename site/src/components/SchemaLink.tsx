import {Schema} from "@/lib/types";

type SchemaLinkProps = {
    schemaName: string,
    schema?: Schema
}

export function SchemaLink({schemaName,schema}: SchemaLinkProps) {
    return (
        <a href={`#schema-${schemaName}`} className={"font-mono hover:underline"} title={schema && schema.description}>{schemaName}</a>
    )
}