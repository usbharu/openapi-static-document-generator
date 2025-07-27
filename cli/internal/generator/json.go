package generator

import (
	"encoding/json"
	"fmt"
	"github.com/usbharu/openapi-static-document-generator/cli/internal/parser"
	"gopkg.in/yaml.v3"
	"os"
	"path/filepath"
	"sort"
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
	Version string      `json:"version"`
	Spec    interface{} `json:"spec"` // OpenAPIの中身をそのまま格納
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

		version := Version{
			Version: doc.Version,
			Spec:    specData,
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
