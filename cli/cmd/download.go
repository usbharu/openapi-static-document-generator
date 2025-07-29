package cmd

import (
	"fmt"
	"github.com/spf13/cobra"
	"github.com/usbharu/openapi-static-document-generator/cli/internal/downloader"
)

var (
	repoURL           string
	outputDirDownload string // generate.go の outputDir との競合を避けるため別名に
	maxVersions       int
)

// downloadCmd represents the download command
var downloadCmd = &cobra.Command{
	Use:   "download",
	Short: "Gitリポジトリから過去のOpenAPI仕様ファイルを指定件数分ダウンロードします。",
	Long: `指定されたGitリポジトリのコミット履歴を遡り、OpenAPI仕様ファイルを検索します。
見つかったファイルは、API名ごとに最新のバージョンから指定された件数分だけ 'outputDir/api/apiName/version/' の形式で保存されます。`,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Printf("Gitリポジトリのクローンを開始します: %s\n", repoURL)

		downloader.Download(repoURL, outputDirDownload, maxVersions)

		fmt.Println("\n✅ OpenAPIファイルのダウンロードと整理が完了しました。")
		fmt.Printf("出力先: %s\n", outputDirDownload)
	},
}

func init() {
	rootCmd.AddCommand(downloadCmd)

	downloadCmd.Flags().StringVarP(&repoURL, "repo-url", "u", "", "OpenAPI仕様ファイルを含むGitリポジトリのURL (必須)")
	downloadCmd.Flags().StringVarP(&outputDirDownload, "output", "o", "downloaded_apis", "ダウンロードしたファイルを保存するディレクトリ")
	downloadCmd.Flags().IntVarP(&maxVersions, "max-versions", "n", 5, "APIごとに収集する最大のバージョン数")
	downloadCmd.MarkFlagRequired("repo-url")
}
