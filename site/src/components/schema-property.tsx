import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { SchemaProperty as SchemaPropertyType } from "@/lib/types";
import { TypeHighlighter } from "./type-highlighter"; // インポート追加

// $refからスキーマ名を取得
const getSchemaName = (ref: string) => ref.split("/").pop() || "";

interface SchemaPropertyProps {
    name: string;
    schema: SchemaPropertyType;
    isRequired: boolean;
    nestingLevel?: number;
}

export function SchemaProperty({
                                   name,
                                   schema,
                                   isRequired,
                                   nestingLevel = 0,
                               }: SchemaPropertyProps) {
    const renderType = () => {
        // 1. $ref: 他スキーマへの参照
        if (schema.$ref) {
            const schemaName = getSchemaName(schema.$ref);
            return (
                <a
                    href={`#schema-${schemaName}`}
                    className="font-mono text-primary hover:underline"
                >
                    <TypeHighlighter>{schemaName}</TypeHighlighter>
                </a>
            );
        }

        // 2. allOf: スキーマの合成
        if (schema.allOf) {
            return (
                <div className="flex flex-wrap items-center gap-1.5">
                    <span>allOf: </span>
                    {schema.allOf.map((item, index) => (
                        <TypeHighlighter key={index}>{item.$ref ? getSchemaName(item.$ref) : item.type}</TypeHighlighter>
                    ))}
                </div>
            );
        }

        // 3. array: 配列
        if (schema.type === "array") {
            const itemType = schema.items?.$ref
                ? getSchemaName(schema.items.$ref)
                : schema.items?.type || "any";

            const displayType = schema.items?.$ref ? (
                <a href={`#schema-${itemType}`} className="font-mono text-primary hover:underline">
                    <TypeHighlighter>{itemType}</TypeHighlighter>
                </a>
            ) : (
                <TypeHighlighter>{itemType}</TypeHighlighter>
            );

            return <>array of {displayType}</>;
        }

        // 4. primitive: 基本型
        const typeString = schema.type + (schema.format ? ` (${schema.format})` : '');
        return <TypeHighlighter>{typeString}</TypeHighlighter>
    };

    const properties = schema.properties || schema.allOf?.find(s => s.properties)?.properties;

    return (
        <>
            <TableRow>
                <TableCell style={{ paddingLeft: `${1 + nestingLevel * 2}rem` }}>
                    <span className="font-mono">{name}</span>
                    {isRequired && <Badge variant="outline" className="ml-2">Required</Badge>}
                </TableCell>
                <TableCell>{renderType()}</TableCell>
                <TableCell>{schema.description}</TableCell>
            </TableRow>

            {/* 5. object: ネストされたオブジェクトの再帰的描画 */}
            {properties &&
                Object.entries(properties).map(([propName, propSchema]) => (
                    <SchemaProperty
                        key={propName}
                        name={propName}
                        schema={propSchema}
                        isRequired={!!schema.required?.includes(propName)}
                        nestingLevel={nestingLevel + 1}
                    />
                ))}
        </>
    );
}
