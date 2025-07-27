import { Schema } from "@/lib/types";
import { SchemaCard } from "./schema-card";

interface SchemaViewerProps {
    schemas?: {
        [key: string]: Schema;
    };
}

export function SchemaViewer({ schemas }: SchemaViewerProps) {
    if (!schemas) {
        return null;
    }

    return (
        <section id="schemas" className="space-y-8">
            <h2 className="text-3xl font-bold tracking-tight">Schemas</h2>
            <div className="space-y-6">
                {Object.entries(schemas).map(([name, schema]) => (
                    <SchemaCard key={name} name={name} schema={schema} />
                ))}
            </div>
        </section>
    );
}
