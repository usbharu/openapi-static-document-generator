package downloader

import (
	"encoding/json"
	"fmt"
	"github.com/getkin/kin-openapi/openapi3"
	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing/object"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// processCommitHistory はリポジトリのコミット履歴を遡り、OpenAPIファイルを収集します。
func processCommitHistory(repo *git.Repository, outputPath string, maxVersions int) error {
	// 収集したバージョンを記録するためのマップ
	// キー: API名(Title), 値: バージョン文字列のスライス
	collectedVersions := make(map[string][]string)

	// コミットのイテレータを取得
	commitIter, err := repo.Log(&git.LogOptions{All: true})
	if err != nil {
		return fmt.Errorf("コミット履歴の取得に失敗しました: %w", err)
	}

	loader := openapi3.NewLoader()

	// コミットを一つずつ処理
	return commitIter.ForEach(func(c *object.Commit) error {
		tree, err := c.Tree()
		if err != nil {
			return fmt.Errorf("コミット '%s' のツリー取得に失敗しました: %w", c.Hash, err)
		}

		// ファイルツリーをウォーク
		return tree.Files().ForEach(func(f *object.File) error {
			// OpenAPIファイルか拡張子で判定
			if !(strings.HasSuffix(f.Name, ".yaml") || strings.HasSuffix(f.Name, ".yml") || strings.HasSuffix(f.Name, ".json")) {
				return nil
			}

			// ファイル内容を読み込む
			content, err := f.Contents()
			if err != nil {
				return fmt.Errorf("ファイル '%s' の内容取得に失敗しました: %w", f.Name, err)
			}
			contentBytes := []byte(content)

			// OpenAPI仕様をパース
			doc, err := loader.LoadFromData(contentBytes)
			if err != nil {
				// OpenAPIとしてパースできないファイルはスキップ
				return nil
			}

			// API名とバージョンがなければスキップ
			if doc.Info == nil || doc.Info.Title == "" || doc.Info.Version == "" {
				return nil
			}

			apiName := sanitizeStringForPath(doc.Info.Title)
			apiVersion := doc.Info.Version

			// このAPIの収集済みバージョン数をチェック
			if len(collectedVersions[apiName]) >= maxVersions {
				return nil // 収集上限に達したらこのAPIはスキップ
			}

			// このバージョンが既に収集済みかチェック
			for _, v := range collectedVersions[apiName] {
				if v == apiVersion {
					return nil // 既に収集済みのバージョンならスキップ
				}
			}

			// 新しいバージョンなので収集リストに追加
			collectedVersions[apiName] = append(collectedVersions[apiName], apiVersion)

			// 保存先ディレクトリを構築
			sanitizedVersion := sanitizeStringForPath(apiVersion)
			targetDir := filepath.Join(outputPath, apiName, sanitizedVersion)
			if err := os.MkdirAll(targetDir, 0755); err != nil {
				return fmt.Errorf("ディレクトリ '%s' の作成に失敗しました: %w", targetDir, err)
			}

			// ファイル名からパス部分を除去
			originalFileName := filepath.Base(f.Name)
			targetPath := filepath.Join(targetDir, originalFileName)
			infoPath := filepath.Join(targetDir, "info.json")

			// ファイルを書き込み
			if err := os.WriteFile(targetPath, contentBytes, 0644); err != nil {
				return fmt.Errorf("ファイル '%s' への書き込みに失敗しました: %w", targetPath, err)
			}

			infoBytes, err := json.Marshal(Info{
				Date: c.Committer.When,
			})
			if err != nil {
				return err
			}

			err = os.WriteFile(infoPath, infoBytes, 0644)
			if err != nil {
				log.Println("infoファイルの書き込みに失敗")
			}

			fmt.Printf("✔ 保存完了: %s (バージョン: %s) [コミット: %s]\n", doc.Info.Title, apiVersion, c.Hash.String()[:7])

			return nil
		})
	})
}

// sanitizeStringForPath はファイルパスとして安全な文字列に変換します。
func sanitizeStringForPath(s string) string {
	sanitized := strings.ReplaceAll(s, " ", "_")
	// パス区切り文字やその他の不適切な文字をハイフンに置換
	r := strings.NewReplacer("/", "-", "\\", "-", ":", "-", "*", "-", "?", "-", "\"", "-", "<", "-", ">", "-", "|", "-")
	return r.Replace(sanitized)
}

func Download(repoURL string, outputDirDownload string, maxVersions int) {
	// 一時ディレクトリを作成
	tempDir, err := os.MkdirTemp("", "openapi-git-clone-")
	if err != nil {
		log.Fatalf("エラー: 一時ディレクトリの作成に失敗しました: %v", err)
	}
	defer os.RemoveAll(tempDir) // 処理の最後に一時ディレクトリをクリーンアップ

	// Gitリポジトリをクローン
	repo, err := git.PlainClone(tempDir, false, &git.CloneOptions{
		URL:      repoURL,
		Progress: os.Stdout,
	})
	if err != nil {
		log.Fatalf("エラー: リポジトリのクローンに失敗しました: %v", err)
	}

	fmt.Println("\nリポジトリのクローンが完了しました。")
	fmt.Println("コミット履歴を遡り、OpenAPIファイルのバージョンを収集します。")

	// 出力ディレクトリを作成
	if err := os.MkdirAll(outputDirDownload, 0755); err != nil {
		log.Fatalf("エラー: 出力ディレクトリ '%s' の作成に失敗しました: %v", outputDirDownload, err)
	}

	// コミット履歴を処理
	err = processCommitHistory(repo, outputDirDownload, maxVersions)
	if err != nil {
		log.Fatalf("エラー: コミット履歴の処理中にエラーが発生しました: %v", err)
	}
}

type Info struct {
	Date time.Time `json:"date"`
}

type Diffs = map[string]Diff

type Diff = []Change

type Change struct {
	Id          string `json:"id"`
	Level       int    `json:"level"`
	Operation   string `json:"operation"`
	OperationId string `json:"operationId"`
	Path        string `json:"path"`
	Section     string `json:"section"`
	Source      string `json:"source"`
	Text        string `json:"text"`
}
