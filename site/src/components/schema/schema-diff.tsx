"use client";

import jsyaml from "js-yaml";
import DiffViewer, {
  DiffMethod,
  type ReactDiffViewerStylesOverride,
} from "react-diff-viewer-continued-react19";

export type SchemaDiffProps = {
  spec1: any;
  spec2: any;
  spec1Title?: string;
  spec2Title?: string;
};

export function SchemaDiff(props: SchemaDiffProps) {
  const old = jsyaml.dump(props.spec1, { sortKeys: true });
  const newV = jsyaml.dump(props.spec2, { sortKeys: true });
  const styles: ReactDiffViewerStylesOverride = {
    diffContainer: { width: "100%", minWidth: "100px" },
  };
  return (
    <div className={"diff-container max-w-full overflow-x-auto"}>
      <DiffViewer
        oldValue={old}
        newValue={newV}
        compareMethod={DiffMethod.LINES}
        styles={styles}
        leftTitle={props.spec1Title}
        rightTitle={props.spec2Title}
      />
    </div>
  );
}
