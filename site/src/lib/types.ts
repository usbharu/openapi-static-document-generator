
export interface SiteData {
    apis: API[];
}

export interface API {
    name: string;
    versions: Version[];
}

export interface Version {
    version: string;
    // spec は OpenAPI の仕様そのものなので、
    // 現時点では汎用的な any 型としておきます。
    spec: OpenAPISpec;
}

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
    in: 'query' | 'header' | 'path' | 'cookie';
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
    examples?: {   // Multiple examples
        [exampleName: string]: {
            summary?: string;
            description?: string;
            value?: any; // The actual example content
        }
    };
}

// // Schemaオブジェクト
// export interface Schema {
//     type?: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';
//     format?: string;
//     description?: string;
//     properties?: {
//         [propertyName: string]: Schema;
//     };
//     required?: string[];
//     items?: Schema; // for array type
//     $ref?: string; // スキーマ参照
// }

// componentsオブジェクト
export interface Components {
    schemas?: {
        [schemaName: string]: Schema;
    };
}


// --- ↓↓↓ ファイルの末尾にこれを追記 ↓↓↓ ---

export interface SchemaProperty {
    $ref?: string;
    type?: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';
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
