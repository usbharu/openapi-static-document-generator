"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { SchemaLink } from "@/components/schema/schema-link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MediaType, Schema } from "@/lib/types";
import { getSchemaName } from "@/lib/utils";

interface ResponseViewerProps {
  mediaType: MediaType;
  schema?: Schema;
}

export function ResponseViewer({ mediaType, schema }: ResponseViewerProps) {
  const requestBodySchemaRef = mediaType.schema?.$ref;
  const exampleSchema = getSchemaName(requestBodySchemaRef);
  const exampleNames = mediaType.examples
    ? Object.keys(mediaType.examples)
    : [];
  const [selectedExample, setSelectedExample] = useState(exampleNames[0]);
  // 1. 単一の `example` があれば、それを表示して終了
  if (mediaType.example) {
    return (
      <>
        {requestBodySchemaRef ? (
          <div className="p-4 text-sm">
            Schema: <SchemaLink schemaName={exampleSchema} schema={schema} />
          </div>
        ) : null}
        <SyntaxHighlighter language="json" style={vscDarkPlus} PreTag="div">
          {JSON.stringify(mediaType.example, null, 2)}
        </SyntaxHighlighter>
      </>
    );
  }

  // 2. 複数の `examples` がある場合の処理
  if (mediaType.examples) {
    if (!exampleNames.length) {
      return (
        <p className="text-muted-foreground text-sm">No example available.</p>
      );
    }

    const currentExample = mediaType.examples[selectedExample];

    return (
      <div className="space-y-2">
        <Select value={selectedExample} onValueChange={setSelectedExample}>
          <SelectTrigger>
            <SelectValue placeholder="Select an example" />
          </SelectTrigger>
          <SelectContent>
            {exampleNames.map(name => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {currentExample.summary && (
          <p className="text-muted-foreground text-sm">
            {currentExample.summary}
          </p>
        )}
        {requestBodySchemaRef ? (
          <div className="p-4 text-sm">
            Schema: <SchemaLink schemaName={exampleSchema} schema={schema} />
          </div>
        ) : null}
        <SyntaxHighlighter language="json" style={vscDarkPlus} PreTag="div">
          {JSON.stringify(currentExample.value, null, 2)}
        </SyntaxHighlighter>
      </div>
    );
  }

  return <p className="text-muted-foreground text-sm">No example available.</p>;
}
