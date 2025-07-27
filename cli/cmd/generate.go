package cmd

import (
	"fmt"
	"github.com/spf13/cobra"
	"github.com/usbharu/openapi-static-document-generator/cli/internal/generator"
	"github.com/usbharu/openapi-static-document-generator/cli/internal/parser"
	"os"
	"path/filepath"
)

var inputDir string
var outputDir string

// generateCmd represents the generate command
var generateCmd = &cobra.Command{
	Use:   "generate",
	Short: "OpenAPIの仕様ファイルから静的なHTMLドキュメントを生成します。",
	Long: `指定されたディレクトリからOpenAPIの仕様ファイル（openapi.yaml/json）を再帰的に検索し、
解析結果を元にNext.jsサイトが参照する単一のJSONファイルを生成します。
その後、静的サイトのビルドを行います。`,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Printf("ドキュメント生成を開始します (入力: %s)\n", inputDir)

		// 1. OpenAPIファイルを解析
		docs, err := parser.ParseAPIDocs(inputDir)
		if err != nil {
			fmt.Fprintf(os.Stderr, "エラー: %v\n", err)
			os.Exit(1)
		}

		if len(docs) == 0 {
			fmt.Println("対象のOpenAPIファイルが見つかりませんでした。")
			return
		}
		fmt.Printf("%d個のAPIドキュメントを正常に解析しました。\n", len(docs))

		// 2. 解析したデータを元にJSONファイルを生成
		err = generator.GenerateJSON(docs, outputDir)
		if err != nil {
			fmt.Fprintf(os.Stderr, "エラー: %v\n", err)
			os.Exit(1)
		}

		fmt.Println("\n✅ ドキュメントの元となるJSONファイルの生成が完了しました。")
		fmt.Printf("出力先: %s\n", filepath.Join(outputDir, "data", "api-data.json"))
	},
}

func init() {
	rootCmd.AddCommand(generateCmd)

	generateCmd.Flags().StringVarP(&inputDir, "input", "i", "", "OpenAPIファイルが含まれるソースディレクトリ (必須)")
	generateCmd.MarkFlagRequired("input")

	generateCmd.Flags().StringVarP(&outputDir, "output", "o", "dist", "生成されたサイトの出力先ディレクトリ")

}
