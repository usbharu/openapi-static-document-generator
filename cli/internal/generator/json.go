package generator

import (
	"encoding/json"
	"fmt"
	"github.com/getkin/kin-openapi/openapi3"
	"github.com/usbharu/openapi-static-document-generator/cli/internal/downloader"
	"github.com/usbharu/openapi-static-document-generator/cli/internal/parser"
	"gopkg.in/yaml.v3"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

// --- 新しいデータ構造の定義 ---

type SiteData struct {
	APIs []API `json:"apis"`
}

type API struct {
	Name     string    `json:"name"`
	Versions []Version `json:"versions"`
}

type Version struct {
	Version        string               `json:"version"`
	Info           downloader.Info      `json:"info"`
	Spec           interface{}          `json:"spec"` // OpenAPIの中身をそのまま格納
	SchemaExamples map[string][]Example `json:"schemaExamples"`
}

type Example struct {
	Description string      `json:"description"`
	Value       interface{} `json:"value"`
	Key         string      `json:"key"`
}

// GenerateJSON は解析済みのドキュメントを受け取り、単一のJSONファイルとして出力します。
func GenerateJSON(docs []*parser.APIDocument, outputDir string) error {
	siteData, err := aggregateDocs(docs)
	if err != nil {
		return fmt.Errorf("ドキュメントの集約に失敗しました: %w", err)
	}

	jsonData, err := json.MarshalIndent(siteData, "", "  ")
	if err != nil {
		return fmt.Errorf("JSONへのマーシャリングに失敗しました: %w", err)
	}

	dataDir := filepath.Join(outputDir, "data")
	if err := os.MkdirAll(dataDir, 0755); err != nil {
		return fmt.Errorf("dataディレクトリの作成に失敗しました: %w", err)
	}

	outputPath := filepath.Join(dataDir, "api-data.json")
	fmt.Printf("JSONファイルを生成中: %s\n", outputPath)

	return os.WriteFile(outputPath, jsonData, 0644)
}

// aggregateDocs はパース結果をフロントエンド向けのデータ構造に集約します。
func aggregateDocs(docs []*parser.APIDocument) (*SiteData, error) {
	apiMap := make(map[string][]Version)

	for _, doc := range docs {
		// kin-openapiが解析したオブジェクトを一度JSONに変換し、
		// それを再度 interface{} にデコードすることで、扱いやすいマップ形式に変換する
		var specData interface{}
		jsonBytes, err := json.Marshal(doc.Doc)
		if err != nil {
			return nil, fmt.Errorf("API仕様の再マーシャリングに失敗 (%s, %s): %w", doc.APIName, doc.Version, err)
		}
		if err := yaml.Unmarshal(jsonBytes, &specData); err != nil {
			return nil, fmt.Errorf("API仕様のデコードに失敗 (%s, %s): %w", doc.APIName, doc.Version, err)
		}

		allExamples := extractSchemaData(doc.Doc)

		version := Version{
			Version:        doc.Version,
			Spec:           specData,
			Info:           doc.Info,
			SchemaExamples: allExamples,
		}
		apiMap[doc.APIName] = append(apiMap[doc.APIName], version)
	}

	var siteApis []API
	for apiName, versions := range apiMap {
		sort.Slice(versions, func(i, j int) bool { return versions[i].Version < versions[j].Version })
		siteApis = append(siteApis, API{
			Name:     apiName,
			Versions: versions,
		})
	}
	sort.Slice(siteApis, func(i, j int) bool { return siteApis[i].Name < siteApis[j].Name })

	return &SiteData{APIs: siteApis}, nil
}

// schemaDataCollector はスキーマ名に基づいてExampleとDescriptionを収集します。
type schemaDataCollector struct {
	// 同じスキーマに複数のdescriptionが見つかる場合があるため、値はスライスにする

	examples map[string][]Example
}

// newSchemaDataCollector は新しいコレクターを初期化します。
func newSchemaDataCollector() *schemaDataCollector {
	return &schemaDataCollector{

		examples: make(map[string][]Example),
	}
}

// addExamples はExample/Examplesを追加します。
func (c *schemaDataCollector) addExamples(schemaName string, schemaKey string, example Example, examples map[string]*openapi3.ExampleRef) {
	if schemaName == "" {
		return
	}
	var collected []Example
	if example.Value != nil {
		collected = append(collected, example)
	}
	for _, exRef := range examples {
		if exRef != nil && exRef.Value != nil && exRef.Value.Value != nil {
			collected = append(collected, Example{
				Description: exRef.Value.Description,
				Value:       exRef.Value.Value,
				Key:         schemaKey,
			})
		}
	}
	if len(collected) > 0 {
		c.examples[schemaName] = append(c.examples[schemaName], collected...)
	}
}

// getSchemaNameFromRef は $ref 文字列からスキーマ名を抽出します (例: "#/components/schemas/User" -> "User")
func getSchemaNameFromRef(ref string) string {
	if !strings.HasPrefix(ref, "#/components/schemas/") {
		return ""
	}
	return strings.TrimPrefix(ref, "#/components/schemas/")
}

// extractSchemaData は仕様書全体を探索し、スキーマ名に紐づくデータを収集します。
func extractSchemaData(doc *openapi3.T) map[string][]Example {
	collector := newSchemaDataCollector()

	// 1. Components内のスキーマ定義そのものからdescriptionを収集
	if doc.Components != nil && doc.Components.Schemas != nil {
		for name, schemaRef := range doc.Components.Schemas {
			if schemaRef != nil && schemaRef.Value != nil {
				collector.addExamples(name, "",
					Example{
						Description: schemaRef.Value.Description,
						Value:       schemaRef.Value.Example,
						Key:         fmt.Sprintf("components.schemas.%s", name),
					}, nil)
			}
		}
	}

	// 2. Paths内を探索して、スキーマが「使われている場所」の情報を収集
	if doc.Paths != nil {
		for path, pathItem := range doc.Paths.Map() {
			if pathItem == nil {
				continue
			}

			operations := map[string]*openapi3.Operation{
				"GET": pathItem.Get, "POST": pathItem.Post, "PUT": pathItem.Put,
				"DELETE": pathItem.Delete, "PATCH": pathItem.Patch,
			}

			for operation, op := range operations {
				if op == nil {
					continue
				}

				// Parameters
				for parameter, paramRef := range op.Parameters {
					if paramRef == nil || paramRef.Value == nil {
						continue
					}
					if paramRef.Value.Schema != nil {
						schemaName := getSchemaNameFromRef(paramRef.Value.Schema.Ref)
						key := fmt.Sprintf("components.paths.%s.%s.parameters.%d.%s", path, operation, parameter, schemaName)
						collector.addExamples(schemaName, key, Example{
							Description: paramRef.Value.Description,
							Value:       paramRef.Value.Example,
							Key:         key,
						}, paramRef.Value.Examples)
					}
				}

				// RequestBody
				if op.RequestBody != nil && op.RequestBody.Value != nil {
					//collector.addDescriptionToContent(op.RequestBody.Value.Content, op.RequestBody.Value.Description)
					key := fmt.Sprintf("components.paths.%s.%s.requestBody", path, operation)
					collector.addExampleToContent(key, op.RequestBody.Value.Content)
				}

				// Responses
				if op.Responses != nil {
					for code, respRef := range op.Responses.Map() {
						if respRef != nil && respRef.Value != nil {
							//collector.addDescriptionToContent(respRef.Value.Content, respRef.Value.Description)
							key := fmt.Sprintf("components.paths.%s.%s.response.%s", path, operation, code)
							collector.addExampleToContent(key, respRef.Value.Content)
						}
					}
				}
			}
		}
	}

	return collector.examples
}

// addDescriptionToContent はContentオブジェクト内のスキーマに説明を追加します。
func (c *schemaDataCollector) addDescriptionToContent(content openapi3.Content) {
	if content == nil {
		return
	}
	for _, mediaType := range content {
		if mediaType != nil && mediaType.Schema != nil {
			_ = getSchemaNameFromRef(mediaType.Schema.Ref)
			//c.addDescription(schemaName, description)
		}
	}
}

// addExampleToContent はContentオブジェクト内のスキーマにExampleを追加します。
func (c *schemaDataCollector) addExampleToContent(key string, content openapi3.Content) {
	if content == nil {
		return
	}
	for mimeType, mediaType := range content {
		if mediaType != nil && mediaType.Schema != nil {
			schemaName := getSchemaNameFromRef(mediaType.Schema.Ref)
			key := fmt.Sprintf("%s.%s.%s", key, mimeType, schemaName)
			c.addExamples(schemaName, key, Example{
				Description: mimeType,
				Value:       mediaType.Example,
				Key:         key,
			}, mediaType.Examples)
		}
	}
}
