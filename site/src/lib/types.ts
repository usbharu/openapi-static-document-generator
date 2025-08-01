export interface SiteData {
  apis: API[];
}

export interface API {
  name: string;
  versions: Version[];
}

export interface Version {
  version: string;
  spec: OpenAPISpec;
  info: GitInfo;
  diff: Diff;
  schemaExamples: { [path: string]: any };
}

type GitInfo = {
  date: string;
};

/**
 * このファイルは、OpenAPIの仕様をTypeScriptの型として定義します。
 * 仕様のすべてを網羅するのではなく、このプロジェクトで利用する部分のみを定義しています。
 */

// OpenAPIの仕様全体
export interface OpenAPISpec {
  openapi: string;
  info: Info;
  paths: Paths;
  components?: Components;
}

// infoオブジェクト
export interface Info {
  title: string;
  description?: string;
  version: string;
}

// pathsオブジェクト
export interface Paths {
  [path: string]: PathItem;
}

export interface PathItem {
  get?: Operation;
  post?: Operation;
  put?: Operation;
  delete?: Operation;
  patch?: Operation;
  // 他のHTTPメソッドもここに追加可能
}

// Operationオブジェクト: 個々のエンドポイント定義
export interface Operation {
  summary?: string;
  description?: string;
  operationId?: string;
  parameters?: Parameter[];
  requestBody?: RequestBody;
  responses: {
    [statusCode: string]: Response;
  };
  tags: string[];
}

// Parameterオブジェクト
export interface Parameter {
  name: string;
  in: "query" | "header" | "path" | "cookie";
  description?: string;
  required?: boolean;
  schema?: Schema;
}

// RequestBodyオブジェクト
export interface RequestBody {
  description?: string;
  required?: boolean;
  content: {
    [mediaType: string]: MediaType;
  };
}

// Responseオブジェクト
export interface Response {
  description: string;
  content?: {
    [mediaType: string]: MediaType;
  };
}

// MediaTypeオブジェクト
export interface MediaType {
  schema?: Schema;
  example?: any; // A single example
  examples?: {
    // Multiple examples
    [exampleName: string]: {
      summary?: string;
      description?: string;
      value?: any; // The actual example content
    };
  };
}

// componentsオブジェクト
export interface Components {
  schemas?: {
    [schemaName: string]: Schema;
  };
}

export interface SchemaProperty {
  $ref?: string;
  type?: "string" | "number" | "integer" | "boolean" | "array" | "object";
  description?: string;
  format?: string;
  items?: SchemaProperty;
  properties?: {
    [key: string]: SchemaProperty;
  };
  required?: string[];
  allOf?: SchemaProperty[];
  example?: any;
  enum?: (string | number)[];
}

export interface Schema extends SchemaProperty {
  // Schemaは基本的にSchemaPropertyと同じだが、トップレベルの定義として使用
}

type Diff = { [Version: string]: Change[] };

type Change = {
  id: string;
  level: number;
  operation: string;
  operationId: string;
  path: string;
  section: string;
  source: string;
  text: string;
};
