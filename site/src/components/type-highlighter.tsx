"use client";

import type React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface TypeHighlighterProps {
  children: React.ReactNode;
}

export function TypeHighlighter({ children }: TypeHighlighterProps) {
  // 文字列でない場合はそのまま返す
  if (typeof children !== "string") {
    return <>{children}</>;
  }

  return (
    <SyntaxHighlighter
      language="typescript"
      style={vscDarkPlus}
      customStyle={{
        // インライン表示に適したスタイル調整
        display: "inline",
        padding: "0.2em 0.4em",
        margin: 0,
        fontSize: "0.9em",
        borderRadius: "0.3rem",
        backgroundColor: "hsl(var(--muted))",
      }}
      // preタグではなくspanタグを使うことでインライン表示を実現
      PreTag="span"
    >
      {children}
    </SyntaxHighlighter>
  );
}
