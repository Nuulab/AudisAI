package cmd

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "audisai",
	Short: "AudisAI - AI Compliance Static Analysis Tool",
	Long: `AudisAI is a static analysis tool for AI compliance that scans codebases 
for violations of state laws governing artificial intelligence.

Currently supported jurisdictions:
  • Texas HB 149 (Responsible AI Governance Act)

Examples:
  audisai scan --state tx --path ./my-project
  audisai scan --state all --path ./src -o report.md`,
	// Version: "1.0.0", // Configured via version command
	Run: func(cmd *cobra.Command, args []string) {
		runWizard(cmd, args)
	},
}

// Execute runs the root command
func Execute() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

func init() {
	rootCmd.CompletionOptions.DisableDefaultCmd = true
}
