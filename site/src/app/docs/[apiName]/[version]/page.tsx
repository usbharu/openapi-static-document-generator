import {EndpointCard} from "@/components/endpoint/endpoint-card";
import {SchemaViewer} from "@/components/schema-viewer";
import {getApiData, getApiSpec} from "@/lib/api-loader";
import {notFound} from "next/navigation";
import {Badge} from "@/components/ui/badge";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {encodeToBase64Url, getMethodBadgeColor} from "@/lib/utils";

// ... (generateStaticParams, getApiSpec functions are unchanged) ...

interface PageProps {
    params: Promise<{
        apiName: string;
        version: string;
    }>;
}

export async function generateStaticParams() {
    const {apis} = getApiData();
    const paths = apis.flatMap((api) =>
        api.versions.map((version) => ({
            apiName: api.name,
            version: version.version,
        }))
    );
    // console.log(paths);
    return paths;
}


export default async function ApiDocumentPage({params}: PageProps) {
    const p = await params;
    const spec = getApiSpec(p.apiName, p.version);

    if (!spec) {
        notFound();
    }

    return (
        <div className="space-y-12">
            {/* Overview Section */}
            <section id="overview">
                <h1 className="text-4xl font-bold tracking-tight text-foreground">
                    {spec.info.title}
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    {spec.info.description}
                </p>
                <Badge className={"text-lg font-bold text-white"}>{spec.info.version}</Badge>
            </section>


            {/* Endpoints Section */}
            <section id="endpoints" className="space-y-8">
                <h2 className="text-3xl font-bold tracking-tight">Endpoints</h2>
                <div className="space-y-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    Path
                                </TableHead>
                                <TableHead>
                                    Method
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                                spec.paths && Object.entries(spec.paths).map(([path, methods]) =>
                                    (
                                        <TableRow key={path}>
                                            <TableCell>
                                                <a href={`${p.version}/endpoints/${encodeToBase64Url(path.substring(1))}`} className={"text-lg font-semibold"}>{path}</a>
                                            </TableCell>
                                            <TableCell className={"flex gap-1"}>
                                                {
                                                    Object.entries(methods).sort(([aKey,a], [bKey,b]) =>  {
                                                        // 基準となる順序を配列で定義
                                                        const order = ['get', 'post', 'delete', 'put', 'patch'];

                                                        // 大文字・小文字を区別しないように小文字に変換
                                                        const lowerA = aKey.toLowerCase();
                                                        const lowerB = bKey.toLowerCase();

                                                        // 配列内でのインデックスの差を返す
                                                        return order.indexOf(lowerA) - order.indexOf(lowerB);
                                                    }).map(([value, operation]) => {
                                                        const encodedPath = encodeToBase64Url(path.substring(1));
                                                        return <a key={`${path}-${value}`}
                                                                href={`${p.version}/endpoints/${encodedPath}#endpoint-${value}-${encodedPath}`}><Badge

                                                                className={`text-lg text-white font-bold ${getMethodBadgeColor(value)}`}>{value.toUpperCase()}</Badge></a>;
                                                        }
                                                    )
                                                }
                                            </TableCell>
                                        </TableRow>


                                    )
                                )
                            }
                        </TableBody>
                    </Table>

                </div>
            </section>

            {/* Schemas Section */}
            <SchemaViewer schemas={spec.components?.schemas}/>
        </div>
    );
}
