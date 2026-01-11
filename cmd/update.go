package cmd

import (
	"fmt"

	"github.com/pocketninja/audisai/pkg/database"
	"github.com/spf13/cobra"
)

var updateCmd = &cobra.Command{
	Use:   "update-db",
	Short: "Update the word list databases",
	Long: `Download and update the open source word list databases.

This command downloads:
  • LDNOOBW - List of toxic/harmful words (25+ languages)
  • AFINN - Sentiment word scores (-5 to +5)

These databases enhance scanning accuracy by providing:
  • Better detection of harmful content
  • Sentiment analysis for context awareness

The databases are stored in ~/.audisai/db/`,
	RunE: runUpdateDB,
}

var statusCmd = &cobra.Command{
	Use:   "db-status",
	Short: "Show database status",
	RunE:  runDBStatus,
}

func init() {
	rootCmd.AddCommand(updateCmd)
	rootCmd.AddCommand(statusCmd)
}

func runUpdateDB(cmd *cobra.Command, args []string) error {
	fmt.Println("🔄 Updating AudisAI word databases...")
	fmt.Println()

	if err := database.UpdateDatabase(); err != nil {
		return fmt.Errorf("update failed: %w", err)
	}

	fmt.Println()
	fmt.Println("✅ Database update complete!")
	return nil
}

func runDBStatus(cmd *cobra.Command, args []string) error {
	fmt.Println(database.GetStatus())
	return nil
}
