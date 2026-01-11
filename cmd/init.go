package cmd

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/spf13/cobra"
)

var initCmd = &cobra.Command{
	Use:   "init",
	Short: "Initialize AudisAI configuration in a project",
	Long: `Creates default configuration files in the current directory:
  • .audisaiignore - File/rule ignore patterns
  • audisai.yaml - Project configuration

This helps new users get started quickly with sensible defaults.`,
	RunE: runInit,
}

func init() {
	rootCmd.AddCommand(initCmd)
}

const defaultIgnoreContent = `# AudisAI Ignore File
# Patterns to exclude from scanning

# Common directories to ignore
vendor/
node_modules/
.git/
dist/
build/

# Test files (uncomment if desired)
# *_test.go
# test/

# Ignore specific rule in specific file
# TX-001: legacy_code.go
# EU-BAN-01: research_prototype.py
`

const defaultConfigContent = `# AudisAI Configuration
# Project-level settings for compliance scanning

# Default states to check (comma-separated)
# states: tx,co,eu

# Output format (pdf, markdown, json, sarif)
# format: pdf

# Minimum severity to report (low, medium, high, critical)
# min_severity: low

# Fail on violation (for CI/CD)
# fail_on_violation: false
`

func runInit(cmd *cobra.Command, args []string) error {
	cwd, err := os.Getwd()
	if err != nil {
		return err
	}

	// Create .audisaiignore
	ignorePath := filepath.Join(cwd, ".audisaiignore")
	if _, err := os.Stat(ignorePath); os.IsNotExist(err) {
		if err := os.WriteFile(ignorePath, []byte(defaultIgnoreContent), 0644); err != nil {
			return fmt.Errorf("failed to create .audisaiignore: %w", err)
		}
		fmt.Println("✅ Created .audisaiignore")
	} else {
		fmt.Println("⏭️  .audisaiignore already exists, skipping")
	}

	// Create audisai.yaml
	configPath := filepath.Join(cwd, "audisai.yaml")
	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		if err := os.WriteFile(configPath, []byte(defaultConfigContent), 0644); err != nil {
			return fmt.Errorf("failed to create audisai.yaml: %w", err)
		}
		fmt.Println("✅ Created audisai.yaml")
	} else {
		fmt.Println("⏭️  audisai.yaml already exists, skipping")
	}

	fmt.Println()
	fmt.Println("🎉 AudisAI initialized!")
	fmt.Println("   Edit .audisaiignore to exclude files from scanning.")
	fmt.Println("   Run 'audisai scan --state tx --path .' to start scanning.")
	return nil
}
