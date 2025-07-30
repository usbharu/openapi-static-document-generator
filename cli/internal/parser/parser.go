package parser

import (
	"encoding/json"
	"fmt"
	"github.com/getkin/kin-openapi/openapi3"
	"github.com/usbharu/openapi-static-document-generator/cli/internal/downloader"
	"io/fs"
	"os"
	"path/filepath"
	"strings"
)

type APIDocument struct {
	APIName string
	Version string
	Info    downloader.Info
	Doc     *openapi3.T
}

func ParseAPIDocs(rootDir string) ([]*APIDocument, error) {
	var documents []*APIDocument

	err := filepath.WalkDir(rootDir, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		if d.IsDir() {
			return nil
		}
		if strings.HasSuffix(path, "info.json") {
			return nil
		}

		fmt.Printf("Parsing %s\n", path)

		loader := openapi3.NewLoader()
		file, err := loader.LoadFromFile(path)
		if err != nil {
			return fmt.Errorf("error parsing %s: %w", path, err)
		}

		relPath, _ := filepath.Rel(rootDir, path)
		parts := strings.Split(filepath.Dir(relPath), string(filepath.Separator))
		if len(parts) < 2 {
			fmt.Printf("Skipping %s\n", path)
			return nil
		}
		apiName := parts[len(parts)-2]
		apiVerison := parts[len(parts)-1]

		infoPath := filepath.Join(filepath.Dir(path), "Info.json")
		info := downloader.Info{}

		readFile, err := os.ReadFile(infoPath)
		if err == nil {
			json.Unmarshal(readFile, &info)
		}

		documents = append(documents, &APIDocument{
			APIName: apiName,
			Version: apiVerison,
			Doc:     file,
			Info:    info,
		})

		return nil
	})
	if err != nil {
		return nil, fmt.Errorf("error parsing %s: %w", rootDir, err)
	}

	return documents, nil

}
