import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getApiData } from "@/lib/api-loader";

export default function Home() {
  const apiData = getApiData();

  return (
    <div className="space-y-4">
      <h1 className={"font-bold text-4xl"}>
        Open API Static Document Generator
      </h1>
      <hr />
      <div className={"space-y-4"}>
        <p>Open API Static Document Generatorへようこそ!</p>
        <p>
          OSDGでは複数のOpen
          API仕様書の複数のバージョンを横断して閲覧することができます。左のサイドバーからAPIの定義書とバージョンを選べますよ!
        </p>
      </div>
      <div className="flex flex-auto flex-wrap gap-4">
        {apiData.apis.map(value => {
          const latestVersion = value.versions.sort((a, b) => {
            return (
              new Date(b.info.date).getTime() - new Date(a.info.date).getTime()
            );
          })[0];
          return (
            <Card
              key={value.name}
              className="flex w-full flex-col sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.33%-1rem)]"
            >
              <CardHeader>
                <Link href={`/docs/${value.name}/${latestVersion.version}`}>
                  <h2 className="font-semibold text-2xl">{value.name}</h2>
                </Link>
              </CardHeader>
              <CardContent className="flex-grow">
                <p>{latestVersion.spec.info.description}</p>
                <p>
                  {value.versions.length}個のバージョン 最新:{" "}
                  {latestVersion.version}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
