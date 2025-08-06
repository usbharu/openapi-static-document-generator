import {getApiData, getApiDiff, getApiSpec, getApiVersions} from "@/lib/api-loader";
import {Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {SchemaDiff} from "@/components/schema/schema-diff";
import {Operation} from "@/lib/types";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {encodeToBase64Url} from "@/lib/utils";
import {DiffVersionSelect} from "@/components/diff-version-select";


export async function generateStaticParams(): Promise<
  { apiName: string; newVersion: string; oldVersion: string }[]
> {
  const {apis} = getApiData();
  return apis.flatMap(api =>
    api.versions.flatMap(newA =>
      api.versions.map(old => ({
        apiName: api.name,
        newVersion: newA.version,
        oldVersion: old.version,
      })),
    ),
  );
}

interface ComparePageProps {
  params: Promise<{
    apiName: string;
    newVersion: string;
    oldVersion: string;
  }>;
}

const getSpecByPath = (apiName: string, version: string, path: string, operation: "get" | "post" | "delete" | "put" | "patch" | string): Operation | undefined => {
  const apiSpec = getApiSpec(apiName, version);

  switch (operation.toLowerCase()) {
    case "get":
      return apiSpec?.paths?.[path]?.get;
    case "post":
      return apiSpec?.paths?.[path]?.post;
    case "delete":
      return apiSpec?.paths?.[path]?.delete;
    case "patch":
      return apiSpec?.paths?.[path]?.patch;
    case "put":
      return apiSpec?.paths?.[path]?.put;
    default:
      return undefined;
  }
}

const getComponents = (apiName: string, version: string) => {
  const apiSpec = getApiSpec(apiName, version);
  return apiSpec?.components;
}

export default async function ComparePage({params}: ComparePageProps) {
  const p = await params;

  const changes = getApiDiff(p.apiName, p.newVersion, p.oldVersion);

  const otherVersions = getApiVersions(p.apiName).filter(value => value !== p.newVersion)

  return (
    <div>
      <h1 className={"font-bold text-4xl"}>
        {p.apiName}の{p.newVersion}と{p.oldVersion}の比較
      </h1>
      <p>{changes.length}件の変更</p>
      <p>
        <Button variant="link" asChild>
          <Link href={`/docs/${p.apiName}/${p.newVersion}`}>{p.newVersion}を見る</Link>
        </Button>
        <Button variant="link" asChild>
          <Link href={`/docs/${p.apiName}/${p.oldVersion}`}>{p.oldVersion}を見る</Link>
        </Button>
        <Button variant="link" asChild>
          <Link href={`/compare/${p.apiName}/${p.oldVersion}/${p.newVersion}`}>左右を入れ替える</Link>
        </Button>
        <span className={"inline-block"}><DiffVersionSelect apiName={p.apiName} newVersion={p.newVersion} otherVersions={otherVersions}/></span>
      </p>
      {changes.map((value, index) => {
        let oldValue: any | undefined;
        let newValue: any | undefined;
        if (value.section === "paths") {
          oldValue = getSpecByPath(p.apiName, p.oldVersion, value.path, value.operation)
          newValue = getSpecByPath(p.apiName, p.newVersion, value.path, value.operation)
        } else if (value.section === "components") {
          oldValue = getComponents(p.apiName, p.oldVersion)
          newValue = getComponents(p.apiName, p.newVersion)
        }


        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          <Card key={index}>
            <CardHeader>
              <CardTitle>{value.text}</CardTitle>
              <CardAction>
                <Button variant="link" asChild>
                  <Link
                    href={`/docs/${p.apiName}/${p.oldVersion}/endpoints/${encodeToBase64Url(value.path.substring(1))}`}>{p.oldVersion}</Link>
                </Button>
                <Button variant="link" asChild>
                  <Link
                    href={`/docs/${p.apiName}/${p.newVersion}/endpoints/${encodeToBase64Url(value.path.substring(1))}`}>{p.newVersion}</Link>
                </Button>
              </CardAction>
              <CardDescription>Section: {value.section}<br/>{value.operation ? (
                <span>{value.operation}: {value.path}</span>) : null}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SchemaDiff spec1Title={p.oldVersion} spec2Title={p.newVersion} spec1={oldValue}
                          spec2={newValue}></SchemaDiff>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
