import { notFound } from "next/navigation";
import { EndpointGroup } from "@/components/endpoint/endpoint-group";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getApiData, getApiSpec } from "@/lib/api-loader";
import {
  decodeFromBase64Url,
  encodeToBase64Url,
  getMethodBadgeColor,
} from "@/lib/utils";

export async function generateStaticParams() {
  const { apis } = getApiData();
  return apis.flatMap(api => {
    return api.versions.flatMap(version => {
      if (version.spec.paths == null) {
        return [];
      }
      return Object.keys(version.spec.paths).map(path => ({
        apiName: api.name,
        version: version.version,
        path: encodeToBase64Url(path.substring(1)),
      }));
    });
  });
}

type PathApiDocumentPageProps = {
  params: Promise<{
    apiName: string;
    version: string;
    path: string;
  }>;
};

export default async function PathApiDocument({
  params,
}: PathApiDocumentPageProps) {
  const p = await params;
  const pathString = `/${decodeFromBase64Url(p.path)}`;
  const spec = getApiSpec(p.apiName, p.version);
  const path = spec?.paths[pathString];

  if (!spec) {
    notFound();
  }

  const endpoints = [];
  if (path?.get) {
    endpoints.push({
      path: pathString,
      method: "get",
      operation: path.get,
      spec: spec,
    });
  }
  if (path?.post) {
    endpoints.push({
      path: pathString,
      method: "post",
      operation: path.post,
      spec: spec,
    });
  }
  if (path?.delete) {
    endpoints.push({
      path: pathString,
      method: "delete",
      operation: path.delete,
      spec: spec,
    });
  }
  if (path?.put) {
    endpoints.push({
      path: pathString,
      method: "put",
      operation: path.put,
      spec: spec,
    });
  }
  if (path?.patch) {
    endpoints.push({
      path: pathString,
      method: "patch",
      operation: path.patch,
      spec: spec,
    });
  }
  return (
    <div className={"space-y-12"}>
      <section id="overview">
        <h1 className="flex items-center gap-4 font-bold text-4xl">
          <span>{pathString}</span>
          <span>-</span>
          <span>{spec.info.title}</span>
          <Badge className={"font-bold text-4xl text-white"}>{p.version}</Badge>
        </h1>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Method</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {path?.get && (
              <TableRow>
                <TableCell>
                  <a href={`#endpint-get-${pathString}`}>
                    <Badge
                      className={`font-bold text-lg text-white ${getMethodBadgeColor("get")}`}
                    >
                      GET
                    </Badge>
                  </a>
                </TableCell>
                <TableCell>
                  <a href={`#endpint-get-${pathString}`}>
                    {path.get.summary ?? "Description Not Found"}
                  </a>
                </TableCell>
              </TableRow>
            )}
            {path?.post && (
              <TableRow>
                <TableCell>
                  <a href={`#endpint-post-${pathString}`}>
                    <Badge
                      className={`font-bold text-lg text-white ${getMethodBadgeColor("post")}`}
                    >
                      POST
                    </Badge>
                  </a>
                </TableCell>
                <TableCell>
                  <a href={`#endpint-post-${pathString}`}>
                    {path.post.summary ?? "Description Not Found"}
                  </a>
                </TableCell>
              </TableRow>
            )}
            {path?.delete && (
              <TableRow>
                <TableCell>
                  <a href={`#endpint-delete-${pathString}`}>
                    <Badge
                      className={`font-bold text-lg text-white ${getMethodBadgeColor("delete")}`}
                    >
                      DELETE
                    </Badge>
                  </a>
                </TableCell>
                <TableCell>
                  <a href={`#endpint-delete-${pathString}`}>
                    {path.delete.summary ?? "Description Not Found"}
                  </a>
                </TableCell>
              </TableRow>
            )}
            {path?.put && (
              <TableRow>
                <TableCell>
                  <a href={`#endpint-put-${pathString}`}>
                    <Badge
                      className={`font-bold text-lg text-white ${getMethodBadgeColor("put")}`}
                    >
                      PUT
                    </Badge>
                  </a>
                </TableCell>
                <TableCell>
                  <a href={`#endpint-put-${pathString}`}>
                    {path.put.summary ?? "Description Not Found"}
                  </a>
                </TableCell>
              </TableRow>
            )}
            {path?.patch && (
              <TableRow>
                <TableCell>
                  <a href={`#endpint-patch-${pathString}`}>
                    <Badge
                      className={`font-bold text-lg text-white ${getMethodBadgeColor("patch")}`}
                    >
                      PATCH
                    </Badge>
                  </a>
                </TableCell>
                <TableCell>
                  <a href={`#endpint-patch-${pathString}`}>
                    {path.patch.summary ?? "Description Not Found"}
                  </a>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>
      <section id={"endpoints"} className={"space-y-8"}>
        <EndpointGroup
          groupName={pathString}
          endpoints={endpoints}
        ></EndpointGroup>
      </section>
    </div>
  );
}
