import {getApiData, getApiSpec} from "@/lib/api-loader";
import {notFound} from "next/navigation";
import {Badge} from "@/components/ui/badge";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {getMethodBadgeColor} from "@/lib/utils";
import {EndpointGroup} from "@/components/endpoint/EndpointGroup";

export async function generateStaticParams() {
    //
    const {apis} = getApiData();
    const a = apis.flatMap((api) => {
        return api.versions.flatMap((version) => {
            if (version.spec.paths == null) {
                return [{apiName: api.name, version: version.version, path: "u"}]
            }
            return Object.keys(version.spec.paths).map((path) => (
                {
                    apiName: api.name,
                    version: version.version,
                    path: path.substring(1)
                }
            ));
        });
    });
    return a
}

type PathApiDocumentPageProps = {
    params: Promise<{
        apiName: string, version: string, path: string
    }>

}

export default async function PathApiDocument({params}: PathApiDocumentPageProps) {
    const p = await params;
    const pathString = "/" + decodeURIComponent(p.path)
    const spec = getApiSpec(p.apiName, p.version);
    const path = spec?.paths[pathString]
    console.log(path)
    if (!spec) {
        notFound()
    }

    const endpoints = []
    if (path?.get) {
        endpoints.push({
            path: pathString,
            method: "get",
            operation: path.get,
            spec: spec
        })
    }
    if (path?.post) {
        endpoints.push({
            path: pathString,
            method: "post",
            operation: path.post,
            spec: spec
        })
    }
    if (path?.delete) {
        endpoints.push({
            path: pathString,
            method: "delete",
            operation: path.delete,
            spec: spec
        })
    }
    if (path?.put) {
        endpoints.push({
            path: pathString,
            method: "put",
            operation: path.put,
            spec: spec
        })
    }
    if (path?.patch) {
        endpoints.push({
            path: pathString,
            method: "patch",
            operation: path.patch,
            spec: spec
        })
    }
    return (
        <div className={"space-y-12"}>
            <section id="overview">
                <h1 className="flex items-center gap-4 text-4xl font-bold">
                    <span>{pathString}</span>
                    <span>-</span>
                    <span>{spec.info.title}</span>
                    <Badge className={"text-4xl text-white font-bold"}>
                        {p.version}
                    </Badge>
                </h1>

                {/*Todo GETなどのメソッドのリンクにしたバッジを横に並べる あとsummaryを全メソッド分並べる */}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Method</TableHead>
                            <TableHead>Description</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {path?.get && (<TableRow>

                            <TableCell>
                                <a href={`#endpint-get-${pathString}`}>
                                    <Badge
                                        className={`text-lg text-white font-bold ${getMethodBadgeColor("get")}`}>GET</Badge>
                                </a>
                            </TableCell>
                            <TableCell>
                                <a href={`#endpint-get-${pathString}`}>
                                    {path.get.summary ?? "Description Not Found"}
                                </a>
                            </TableCell>

                        </TableRow>)}
                        {path?.post && (<TableRow>
                            <TableCell>
                                <a href={`#endpint-post-${pathString}`}>
                                    <Badge
                                        className={`text-lg text-white font-bold ${getMethodBadgeColor("post")}`}>POST</Badge>
                                </a>
                            </TableCell>
                            <TableCell>
                                <a href={`#endpint-post-${pathString}`}>
                                    {path.post.summary ?? "Description Not Found"}
                                </a>
                            </TableCell>
                        </TableRow>)}
                        {path?.delete && (<TableRow>
                            <TableCell>
                                <a href={`#endpint-delete-${pathString}`}>
                                    <Badge
                                        className={`text-lg text-white font-bold ${getMethodBadgeColor("delete")}`}>DELETE</Badge>
                                </a>
                            </TableCell>
                            <TableCell>
                                <a href={`#endpint-delete-${pathString}`}>
                                    {path.delete.summary ?? "Description Not Found"}
                                </a>
                            </TableCell>
                        </TableRow>)}
                        {path?.put && (<TableRow>
                            <TableCell>
                                <a href={`#endpint-put-${pathString}`}>
                                    <Badge
                                        className={`text-lg text-white font-bold ${getMethodBadgeColor("put")}`}>PUT</Badge>
                                </a>
                            </TableCell>
                            <TableCell>
                                <a href={`#endpint-put-${pathString}`}>
                                    {path.put.summary ?? "Description Not Found"}
                                </a>
                            </TableCell>
                        </TableRow>)}
                        {path?.patch && (<TableRow>
                            <TableCell>
                                <a href={`#endpint-patch-${pathString}`}>
                                    <Badge
                                        className={`text-lg text-white font-bold ${getMethodBadgeColor("patch")}`}>PATCH</Badge>
                                </a>
                            </TableCell>
                            <TableCell>
                                <a href={`#endpint-patch-${pathString}`}>
                                    {path.patch.summary ?? "Description Not Found"}
                                </a>
                            </TableCell>
                        </TableRow>)}
                    </TableBody>
                </Table>
            </section>
            <section id={"endpoints"} className={"space-y-8"}>
                <EndpointGroup groupName={pathString} endpoints={endpoints}></EndpointGroup>
            </section>
        </div>
    )
}