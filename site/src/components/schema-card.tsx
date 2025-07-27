import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {Schema} from "@/lib/types";
import {SchemaProperty} from "./schema-property";
import {Hash} from "lucide-react";

interface SchemaCardProps {
    name: string;
    schema: Schema;
}

export function SchemaCard({name, schema}: SchemaCardProps) {
    // スキーマへのページ内リンクのためのID
    const cardId = `schema-${name}`;
    const properties = schema.properties || schema.allOf?.find(s => s.properties)?.properties;

    return (
        <Card id={cardId}>
            <CardHeader>

                    <CardTitle className="font-mono text-2xl group">
                        <a className={""} href={`#${cardId}`}>
                        <Hash
                            className={"inline mr-2 text-secondary group-hover:text-primary"}/>
                        </a>
                        {name}

                    </CardTitle>
                {schema.description && (
                    <CardDescription className={"select-all"}>{schema.description}</CardDescription>
                )}
            </CardHeader>
            <CardContent>
                {properties ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-1/3">Property</TableHead>
                                <TableHead className="w-1/3">Type</TableHead>
                                <TableHead className="w-1/3">Description</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Object.entries(properties).map(
                                ([propName, propSchema]) => (
                                    <SchemaProperty
                                        key={propName}
                                        name={propName}
                                        schema={propSchema}
                                        isRequired={!!schema.required?.includes(propName)}
                                    />
                                )
                            )}
                        </TableBody>
                    </Table>
                ) : (
                    <p className="text-muted-foreground">This schema has no defined properties.</p>
                )}
            </CardContent>
        </Card>
    );
}
