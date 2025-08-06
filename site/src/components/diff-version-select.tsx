"use client";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {useRouter} from "next/navigation";

type DiffVersionSelectProps = {
  apiName: string;
  newVersion: string;
  otherVersions: string[];
}

export function DiffVersionSelect(props: DiffVersionSelectProps) {

  const router = useRouter();

  const handleVersionSelect = (url) => {
    if (url){
      router.push(url);
    }
  }

return (
  <Select onValueChange={handleVersionSelect}>
    <SelectTrigger>
      <SelectValue placeholder={`選択して${props.newVersion}と比較`}/>
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        {props.otherVersions.map(version => (
          <SelectItem key={version}
                      value={`/compare/${props.apiName}/${props.newVersion}/${version}`}>{version}</SelectItem>
        ))}
      </SelectGroup>
    </SelectContent>

  </Select>
)
}