import {Operation, Schema} from "@/lib/types";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {ResponseViewer} from "@/components/response-viewer";
import {getSchemaName} from "@/lib/utils";

type EndpointExampleProps = {
    responseCodes: string[],
    operation: Operation,
    schemas?: { [schemaName: string]: Schema },
}

export function EndpointExample({responseCodes, operation, schemas}: EndpointExampleProps) {



    return (
        <div>
            {responseCodes.length > 0 ? (
                <Tabs defaultValue={responseCodes[0]} className="w-full">
                    <TabsList>
                        {responseCodes.map((code) => (
                            <TabsTrigger key={code} value={code}>
                                Response {code}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {responseCodes.map((code) => {
                        const response = operation.responses[code];
                        const mediaType = response?.content?.["application/json"];
                        const schemaName = getSchemaName(mediaType?.schema?.$ref)
                        const schema = schemas?.[schemaName];
                        return (
                            <TabsContent key={code} value={code}>
                                <p className="mb-2">{response.description}</p>
                                {mediaType ? (
                                    <ResponseViewer mediaType={mediaType} schema={schema}/>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        No example available.
                                    </p>
                                )}
                            </TabsContent>
                        );
                    })}
                </Tabs>
            ) : (
                <p>No response examples available.</p>
            )}
        </div>
    )
}