import type { Schema } from "@/lib/types";

type SchemaLinkProps = {
  schemaName: string;
  schema?: Schema;
};

export function SchemaLink({ schemaName, schema }: SchemaLinkProps) {
  return (
    <a
      href={`../schemas/${schemaName}`}
      className={"font-mono hover:underline"}
      title={schema?.description}
    >
      {schemaName}
    </a>
  );
}
