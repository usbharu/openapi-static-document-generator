import { notFound } from "next/navigation";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { SchemaCard } from "@/components/schema/schema-card";
import { Badge } from "@/components/ui/badge";
import { getApiData, getApiExamples, getApiSpec } from "@/lib/api-loader";

type SchemaPageProps = {
  params: Promise<{
    apiName: string;
    version: string;
    schema: string;
  }>;
};

export async function generateStaticParams() {
  //
  const { apis } = getApiData();
  const a = apis.flatMap(api => {
    return api.versions.flatMap(version => {
      if (version.spec.components?.schemas == null) {
        return [];
      }
      return Object.keys(version.spec.components?.schemas).map(path => ({
        apiName: api.name,
        version: version.version,
        schema: path,
      }));
    });
  });
  // console.log(a)
  return a;
}

export default async function SchemaPage({ params }: SchemaPageProps) {
  const p = await params;

  const apiSpec = getApiSpec(p.apiName, p.version);

  const schema = apiSpec?.components?.schemas?.[p.schema];

  const schemaExamples = getApiExamples(p.apiName, p.version, p.schema);

  if (!schema) {
    return notFound();
  }
  //todo デザイン
  return (
    <div className={""}>
      <h1 className={"flex items-center gap-4 font-bold text-4xl"}>
        <span>{p.schema}</span>
        <span>-</span>
        <span>{apiSpec?.info.title}</span>
        <Badge className={"font-bold text-4xl text-white"}>{p.version}</Badge>
      </h1>
      <SchemaCard schema={schema} name={p.schema} />
      {schemaExamples.map((value, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
        <div key={index} className={"m-4"}>
          <p>{value.description}</p>
          <SyntaxHighlighter language="json" style={vscDarkPlus} PreTag="div">
            {JSON.stringify(value.value, null, 2)}
          </SyntaxHighlighter>
        </div>
      ))}
    </div>
  );
}
