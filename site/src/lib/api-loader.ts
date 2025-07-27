import fs from 'fs';
import path from 'path';
import {OpenAPISpec, SiteData} from './types';

let cache: SiteData | undefined = undefined;

// api-data.json を読み込んでパースする関数
export const getApiData = (): SiteData => {
    if (cache) {
        return cache
    }
    // site/data/api-data.json のパスを解決
    const filePath = path.join(process.cwd(), 'data', 'api-data.json');

    try {
        const jsonText = fs.readFileSync(filePath, 'utf-8');
        const data: SiteData = JSON.parse(jsonText);
        cache = data
        return data;
    } catch (error) {
        console.error("api-data.json の読み込みに失敗しました。", error);
        // データが読み込めない場合は空の構造を返す
        return {apis: []};
    }
};

let apiSpecCache: ApiSpecMap | undefined = undefined

type ApiSpecMap = {
    [name: string]: {
        [version: string]: {
            spec: OpenAPISpec
            examples: {
                [schemaName: string]: {
                    description: string,
                    value: any
                }[]
            }
        }
    }
}

export function getApiSpec(apiName: string, version: string): OpenAPISpec | undefined {
    if (apiSpecCache) {
        return apiSpecCache[apiName][version].spec
    }
    const {apis} = getApiData();
    apiSpecCache = {}
    apis.forEach(name => {

        // @ts-ignore
        apiSpecCache[name.name] = {}
        name.versions.map(version => {
            // @ts-ignore
            return apiSpecCache[name.name][version.version] = {spec: version.spec, examples: version.schemaExamples};
        })

    });
    return apiSpecCache[apiName][version].spec
}

export function getApiExamples(apiName: string, version: string, schemaName: string): {
    description: string,
    value: any
}[] {
    if (!apiSpecCache) {
        getApiSpec(apiName, version)
    }
    return apiSpecCache[apiName][version].examples[schemaName]
}