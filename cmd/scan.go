package cmd

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/pocketninja/audisai/pkg/engine"
	"github.com/pocketninja/audisai/pkg/models"
	"github.com/pocketninja/audisai/pkg/remote"
	"github.com/pocketninja/audisai/pkg/report"
	"github.com/spf13/cobra"
)

var (
	stateCodes      string
	targetPath      string
	outputFile      string
	repoURL         string
	outputFormat    string
	outputDir       string
	failOnViolation bool
	minSeverity     string
	baselineFile    string
	scanToken       string
)

var scanCmd = &cobra.Command{
	Use:   "scan",
	Short: "Scan a codebase for AI compliance violations",
	Long: `Scan a local directory or remote repository for violations of AI laws.

The scanner will analyze source files against loaded policy rules and generate
a compliance report in PDF (default) or Markdown format.

Examples:
  # Scan local directory
  audisai scan --state tx --path ./my-project

  # Scan remote GitHub repo
  audisai scan --state tx --repo github.com/myorg/myapp

  # Scan with Markdown output
  audisai scan -s tx -p ./src --format markdown -o report.md
  audisai scan -s tx -p ./src --output-dir ./reports`,
	RunE: runScan,
}

func init() {
	rootCmd.AddCommand(scanCmd)

	scanCmd.Flags().StringVarP(&stateCodes, "state", "s", "all", "Comma-separated state codes (e.g., 'tx,ca') or 'all'")
	scanCmd.Flags().StringVarP(&targetPath, "path", "p", "", "Path to the local directory to scan")
	scanCmd.Flags().StringVarP(&repoURL, "repo", "r", "", "Remote repository URL (e.g., github.com/owner/repo)")
	scanCmd.Flags().StringVarP(&outputFormat, "format", "f", "pdf", "Output format: pdf, markdown, json, sarif")
	scanCmd.Flags().StringVarP(&outputFile, "output", "o", "", "Output file name (auto-generates with timestamp if not specified)")
	scanCmd.Flags().StringVarP(&outputDir, "output-dir", "d", ".", "Directory to save the report")
	scanCmd.Flags().BoolVarP(&failOnViolation, "fail-on-violation", "", false, "Exit with code 1 if violations are found")
	scanCmd.Flags().StringVarP(&minSeverity, "min-severity", "", "low", "Minimum severity to report: low, medium, high, critical")
	scanCmd.Flags().StringVarP(&baselineFile, "baseline", "b", "", "Baseline file to compare against (only report new violations)")
	scanCmd.Flags().StringVar(&scanToken, "token", "", "OAuth token for cloning private repositories (overrides stored token)")
}

// parseStates splits a comma-separated string of state codes into a slice
func parseStates(input string) []string {
	if input == "" || strings.ToLower(input) == "all" {
		return []string{"all"}
	}

	parts := strings.Split(input, ",")
	states := make([]string, 0, len(parts))

	for _, p := range parts {
		trimmed := strings.TrimSpace(strings.ToLower(p))
		if trimmed != "" {
			states = append(states, trimmed)
		}
	}

	return states
}

// loadPoliciesForStates maps state codes to their YAML policy file paths
func loadPoliciesForStates(states []string) ([]*models.Policy, error) {
	// Get the executable directory to find policies
	execPath, err := os.Executable()
	if err != nil {
		execPath = "."
	}
	baseDir := filepath.Dir(execPath)

	// Also check current working directory
	cwd, _ := os.Getwd()

	// State code to policy file mapping
	stateMap := map[string][]string{
		// US States
		"tx":  {"policies/us_tx/hb149.yaml"},
		"co":  {"policies/us_co/sb205.yaml"},
		"ut":  {"policies/us_ut/sb149.yaml"},
		"tn":  {"policies/us_tn/elvis.yaml"},
		"il":  {"policies/us_il/hb3773.yaml"},
		"nyc": {"policies/us_nyc/ll144.yaml"},
		"ca":  {"policies/us_ca/sb243.yaml"},
		// International
		"eu": {"policies/eu/ai_act.yaml"},
		// Frameworks
		"nist-ai":  {"policies/frameworks/nist_ai_rmf.yaml"},
		"nist-csf": {"policies/frameworks/nist_csf.yaml"},
		"iso27001": {"policies/frameworks/iso27001.yaml"},
		"cis":      {"policies/frameworks/cis_controls.yaml"},
	}

	var policies []*models.Policy
	loadedPaths := make(map[string]bool)

	// Determine which states to load
	statesToLoad := states
	if len(states) == 1 && states[0] == "all" {
		statesToLoad = make([]string, 0, len(stateMap))
		for code := range stateMap {
			statesToLoad = append(statesToLoad, code)
		}
	}

	for _, state := range statesToLoad {
		paths, ok := stateMap[state]
		if !ok {
			fmt.Fprintf(os.Stderr, "Warning: Unknown state code '%s', skipping\n", state)
			continue
		}

		for _, relPath := range paths {
			if loadedPaths[relPath] {
				continue
			}

			// Try multiple base directories
			var policyPath string
			for _, base := range []string{cwd, baseDir, "."} {
				candidate := filepath.Join(base, relPath)
				if _, err := os.Stat(candidate); err == nil {
					policyPath = candidate
					break
				}
			}

			if policyPath == "" {
				return nil, fmt.Errorf("policy file not found: %s", relPath)
			}

			policy, err := models.LoadPolicy(policyPath)
			if err != nil {
				return nil, fmt.Errorf("failed to load policy %s: %w", relPath, err)
			}

			policies = append(policies, policy)
			loadedPaths[relPath] = true
		}
	}

	if len(policies) == 0 {
		return nil, fmt.Errorf("no policies loaded for states: %v", states)
	}

	return policies, nil
}

func runScan(cmd *cobra.Command, args []string) error {
	// Validate inputs
	if targetPath == "" && repoURL == "" {
		return fmt.Errorf("either --path or --repo is required")
	}
	if targetPath != "" && repoURL != "" {
		return fmt.Errorf("cannot specify both --path and --repo")
	}

	// Determine output file with timestamp
	if outputFile == "" {
		timestamp := time.Now().Format("2006-01-02_15-04-05")
		if outputFormat == "markdown" {
			outputFile = fmt.Sprintf("AudisAI_Report_%s.md", timestamp)
		} else {
			outputFile = fmt.Sprintf("AudisAI_Report_%s.pdf", timestamp)
		}
	}

	// Combine with output directory
	if outputDir != "." && outputDir != "" {
		// Ensure directory exists
		if err := os.MkdirAll(outputDir, 0755); err != nil {
			return fmt.Errorf("failed to create output directory: %w", err)
		}
		outputFile = filepath.Join(outputDir, outputFile)
	}

	// Parse state codes
	states := parseStates(stateCodes)
	fmt.Printf("🔍 AudisAI Compliance Scanner\n")
	fmt.Printf("   States: %v\n", states)
	fmt.Printf("   Format: %s\n", outputFormat)
	fmt.Printf("   Output: %s\n\n", outputFile)

	// Handle remote repo
	scanPath := targetPath
	var cleanup func()

	if repoURL != "" {
		fmt.Printf("📦 Remote Repository: %s\n\n", repoURL)
		var err error
		scanPath, cleanup, err = remote.CloneRepo(repoURL, scanToken)
		if err != nil {
			return fmt.Errorf("failed to clone repository: %w", err)
		}
		defer cleanup()
	} else {
		fmt.Printf("📂 Local Path: %s\n\n", targetPath)
	}

	// Load policies
	policies, err := loadPoliciesForStates(states)
	if err != nil {
		return fmt.Errorf("failed to load policies: %w", err)
	}
	fmt.Printf("📋 Loaded %d policy file(s)\n", len(policies))

	// Create orchestrator and run scan
	orch := engine.NewOrchestrator(policies)
	results, filesScanned, err := orch.Scan(scanPath)
	if err != nil {
		return fmt.Errorf("scan failed: %w", err)
	}

	// Filter by severity
	results = filterBySeverity(results, minSeverity)

	// Filter by baseline (if provided)
	if baselineFile != "" {
		results, err = filterByBaseline(results, baselineFile)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Warning: Could not load baseline: %v\n", err)
		}
	}

	fmt.Printf("📁 Scanned %d file(s)\n", filesScanned)
	fmt.Printf("⚠️  Found %d violation(s)\n\n", len(results))

	// Generate report based on format
	switch strings.ToLower(outputFormat) {
	case "markdown", "md":
		reportContent := report.GenerateMarkdown(results, filesScanned, policies)
		if outputFile == "-" {
			fmt.Println(reportContent)
		} else {
			if err := os.WriteFile(outputFile, []byte(reportContent), 0644); err != nil {
				return fmt.Errorf("failed to write report: %w", err)
			}
		}

	case "pdf":
		if err := report.GeneratePDF(results, filesScanned, policies, outputFile); err != nil {
			return fmt.Errorf("failed to generate PDF: %w", err)
		}

	case "json":
		jsonContent, err := report.GenerateJSON(results, filesScanned, policies, scanPath, states)
		if err != nil {
			return fmt.Errorf("failed to generate JSON: %w", err)
		}
		if outputFile == "-" {
			fmt.Println(jsonContent)
		} else {
			if err := os.WriteFile(outputFile, []byte(jsonContent), 0644); err != nil {
				return fmt.Errorf("failed to write JSON: %w", err)
			}
		}

	case "sarif":
		sarifContent, err := report.GenerateSARIF(results, policies)
		if err != nil {
			return fmt.Errorf("failed to generate SARIF: %w", err)
		}
		if outputFile == "-" {
			fmt.Println(sarifContent)
		} else {
			if err := os.WriteFile(outputFile, []byte(sarifContent), 0644); err != nil {
				return fmt.Errorf("failed to write SARIF: %w", err)
			}
		}

	default:
		return fmt.Errorf("unsupported format: %s (use pdf, markdown, json, or sarif)", outputFormat)
	}

	fmt.Printf("✅ Report written to: %s\n", outputFile)

	if failOnViolation && len(results) > 0 {
		fmt.Printf("\n❌ Scan failed: %d violations found\n", len(results))
		os.Exit(1)
	}

	return nil
}

// severityRank returns numeric rank for sorting (lower = more severe)
func severityRank(sev string) int {
	switch sev {
	case "CRITICAL":
		return 0
	case "HIGH":
		return 1
	case "MEDIUM":
		return 2
	case "LOW":
		return 3
	default:
		return 4
	}
}

// filterBySeverity removes violations below the minimum severity threshold
func filterBySeverity(results []models.ScanResult, minSev string) []models.ScanResult {
	minRank := severityRank(strings.ToUpper(minSev))
	filtered := make([]models.ScanResult, 0, len(results))
	for _, r := range results {
		if severityRank(r.Severity) <= minRank {
			filtered = append(filtered, r)
		}
	}
	return filtered
}

// filterByBaseline removes violations that exist in the baseline file
func filterByBaseline(results []models.ScanResult, baselinePath string) ([]models.ScanResult, error) {
	data, err := os.ReadFile(baselinePath)
	if err != nil {
		return results, err
	}

	var baseline report.JSONReport
	if err := json.Unmarshal(data, &baseline); err != nil {
		return results, err
	}

	// Create lookup set
	known := make(map[string]bool)
	for _, v := range baseline.Violations {
		key := fmt.Sprintf("%s:%s:%d", v.RuleID, v.FilePath, v.LineNumber)
		known[key] = true
	}

	// Filter out known violations
	filtered := make([]models.ScanResult, 0, len(results))
	for _, r := range results {
		key := fmt.Sprintf("%s:%s:%d", r.RuleID, r.FilePath, r.LineNumber)
		if !known[key] {
			filtered = append(filtered, r)
		}
	}

	return filtered, nil
}
