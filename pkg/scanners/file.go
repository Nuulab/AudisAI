package scanners

import (
	"os"
	"path/filepath"

	"github.com/pocketninja/audisai/pkg/models"
)

// scanFileExistence checks if required files exist in the directory
// Returns a violation if the file is MISSING
func scanFileExistence(basePath string, rule models.Rule) []models.ScanResult {
	var results []models.ScanResult

	// Get the directory containing the scanned file
	dir := filepath.Dir(basePath)

	for _, pattern := range rule.Patterns {
		// Check if file matching pattern exists
		matches, err := filepath.Glob(filepath.Join(dir, pattern))
		if err != nil || len(matches) == 0 {
			// Also check project root (walk up to find common markers)
			projectRoot := findProjectRoot(dir)
			if projectRoot != "" {
				rootMatches, _ := filepath.Glob(filepath.Join(projectRoot, pattern))
				if len(rootMatches) > 0 {
					continue // Found in project root
				}
			}

			// File is missing - this is a violation
			results = append(results, models.ScanResult{
				FilePath:    basePath,
				LineNumber:  0, // Not applicable for file existence checks
				RuleID:      rule.ID,
				Severity:    rule.Severity,
				Message:     rule.Description + " (Missing: " + pattern + ")",
				Snippet:     "Required file not found: " + pattern,
				Remediation: rule.Remediation,
			})
		}
	}

	return results
}

// findProjectRoot walks up the directory tree to find common project markers
func findProjectRoot(dir string) string {
	markers := []string{
		"go.mod",
		"package.json",
		"Cargo.toml",
		"pyproject.toml",
		"setup.py",
		".git",
	}

	current := dir
	for {
		for _, marker := range markers {
			if _, err := os.Stat(filepath.Join(current, marker)); err == nil {
				return current
			}
		}

		parent := filepath.Dir(current)
		if parent == current {
			break // Reached filesystem root
		}
		current = parent
	}

	return ""
}
