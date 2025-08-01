import { getApiData, getApiDiff } from "@/lib/api-loader";

export async function generateStaticParams(): Promise<
  { apiName: string; newVersion: string; oldVersion: string }[]
> {
  const { apis } = getApiData();
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

export default async function ComparePage({ params }: ComparePageProps) {
  const p = await params;

  const changes = getApiDiff(p.apiName, p.newVersion, p.oldVersion);

  return (
    <div>
      <h1 className={"font-bold text-4xl"}>
        {p.apiName}の{p.newVersion}と{p.oldVersion}を比較します
      </h1>
      {changes.map((value, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
        <p key={index}>{value.text}</p>
      ))}
    </div>
  );
}
