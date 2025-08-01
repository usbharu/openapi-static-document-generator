package cmd

import (
	"github.com/spf13/cobra"
	diff2 "github.com/usbharu/openapi-static-document-generator/cli/internal/diff"
)

//var inputDir string

var diffCmd = &cobra.Command{
	Use:   "diff",
	Short: "Gen Diff",
	Long:  "Generate Diff",
	Run: func(cmd *cobra.Command, args []string) {

		diff2.GetAllDiff(inputDir)

		//loader := openapi3.NewLoader()
		//loader.IsExternalRefsAllowed = true
		//
		//spec1, err := load.NewSpecInfo(loader, load.NewSource(inputFile))
		//if err != nil {
		//	log.Fatalf("failed to load old spec: %v", err)
		//}
		//
		//spec2, err := load.NewSpecInfo(loader, load.NewSource(inputFile2))
		//if err != nil {
		//	log.Fatalf("failed to load new spec: %v", err)
		//}
		//
		//diff, err := diff2.GetDiff(spec1, spec2)
		//if err != nil {
		//	log.Fatalf("failed to get diff: %v", err)
		//}
		//os.WriteFile("test.json", diff, os.FileMode(0644))
	},
}

func init() {
	rootCmd.AddCommand(diffCmd)

	diffCmd.Flags().StringVarP(&inputDir, "input", "i", "", "Input File")
	generateCmd.MarkFlagRequired("input")
}
