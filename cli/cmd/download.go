package cmd

import (
	"fmt"
	"io/fs"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/go-git/go-git/v5"
	"github.com/spf13/cobra"
)

var (
	repoURL           string
	outputDirDownload string // generate.go の outputDir との競合を避けるため別名に
)

// downloadCmd represents the download command
var downloadCmd = &cobra.Command{
	Use:   "download",
	Short: "GitリポジトリからOpenAPI仕様ファイルをダウンロードし、整理します。",
	Long: `指定されたGitリポジトリをクローンし、リポジトリ内のOpenAPI仕様ファイルを検索します。
見つかったファイルは、API名とバージョンに基づいて 'outputDir/apiName/version/' の形式で保存されます。`,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Printf("Gitリポジトリのクローンを開始します: %s\n", repoURL)

		// 一時ディレクトリを作成
		tempDir, err := os.MkdirTemp("", "openapi-git-clone-")
		if err != nil {
			log.Fatalf("エラー: 一時ディレクトリの作成に失敗しました: %v", err)
		}
		// 処理の最後に一時ディレクトリをクリーンアップ
		defer os.RemoveAll(tempDir)

		// Gitリポジトリをクローン
		_, err = git.PlainClone(tempDir, false, &git.CloneOptions{
			URL:      repoURL,
			Progress: os.Stdout,
		})
		if err != nil {
			log.Fatalf("エラー: リポジトリのクローンに失敗しました: %v", err)
		}

		fmt.Println("\nリポジトリのクローンが完了しました。")
		fmt.Println("OpenAPIファイルの検索と整理を開始します。")

		// 出力ディレクトリを作成
		if err := os.MkdirAll(outputDirDownload, 0755); err != nil {
			log.Fatalf("エラー: 出力ディレクトリ '%s' の作成に失敗しました: %v", outputDirDownload, err)
		}

		// リポジトリ内のファイルを処理
		err = processRepositoryFiles(tempDir, outputDirDownload)
		if err != nil {
			log.Fatalf("エラー: リポジトリの処理中にエラーが発生しました: %v", err)
		}

		fmt.Println("\n✅ OpenAPIファイルのダウンロードと整理が完了しました。")
		fmt.Printf("出力先: %s\n", outputDirDownload)
	},
}

// processRepositoryFiles はリポジトリ内のファイルを探索し、OpenAPIファイルをコピーします。
func processRepositoryFiles(repoPath, outputPath string) error {
	loader := openapi3.NewLoader()
	return filepath.WalkDir(repoPath, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		// ディレクトリはスキップし、特定の拡張子のファイルのみを対象とする
		if d.IsDir() || !(strings.HasSuffix(d.Name(), ".yaml") || strings.HasSuffix(d.Name(), ".yml") || strings.HasSuffix(d.Name(), ".json")) {
			return nil
		}

		doc, err := loader.LoadFromFile(path)
		// OpenAPIの仕様ファイルとしてパースできないファイルは警告を出してスキップ
		if err != nil {
			fmt.Printf("警告: '%s' はOpenAPIファイルではない可能性があります。スキップします (%v)\n", d.Name(), err)
			return nil
		}

		// APIのタイトルとバージョンが定義されていないファイルはスキップ
		if doc.Info == nil || doc.Info.Title == "" || doc.Info.Version == "" {
			fmt.Printf("情報: '%s' にはAPI名またはバージョンが定義されていません。スキップします。\n", d.Name())
			return nil
		}

		// パスとして使用するためにAPI名とバージョンをサニタイズ
		apiName := sanitizeStringForPath(doc.Info.Title)
		apiVersion := sanitizeStringForPath(doc.Info.Version)
		originalFileName := d.Name()

		// 保存先のディレクトリパスを構築
		targetDir := filepath.Join(outputPath, "api", apiName, apiVersion)
		if err := os.MkdirAll(targetDir, 0755); err != nil {
			return fmt.Errorf("ディレクトリ '%s' の作成に失敗しました: %w", targetDir, err)
		}

		targetPath := filepath.Join(targetDir, originalFileName)

		// ファイルをコピー
		sourceFile, err := os.ReadFile(path)
		if err != nil {
			return fmt.Errorf("ファイル '%s' の読み込みに失敗しました: %w", path, err)
		}
		if err := os.WriteFile(targetPath, sourceFile, 0644); err != nil {
			return fmt.Errorf("ファイル '%s' への書き込みに失敗しました: %w", targetPath, err)
		}

		fmt.Printf("保存完了: %s (バージョン: %s) -> %s\n", doc.Info.Title, doc.Info.Version, targetPath)
		return nil
	})
}

// sanitizeStringForPath はファイルパスとして安全な文字列に変換します。
func sanitizeStringForPath(s string) string {
	// スペースをアンダースコアに置換
	sanitized := strings.ReplaceAll(s, " ", "_")
	// パス区切り文字やその他の不適切な文字をハイフンに置換
	sanitized = strings.ReplaceAll(sanitized, "/", "-")
	sanitized = strings.ReplaceAll(sanitized, "\\", "-")
	return sanitized
}

func init() {
	rootCmd.AddCommand(downloadCmd)

	downloadCmd.Flags().StringVarP(&repoURL, "repo-url", "u", "", "OpenAPI仕様ファイルを含むGitリポジトリのURL (必須)")
	downloadCmd.Flags().StringVarP(&outputDirDownload, "output", "o", "downloaded_apis", "ダウンロードしたファイルを保存するディレクトリ")
	downloadCmd.MarkFlagRequired("repo-url")
}
