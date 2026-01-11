package engine

import (
	"path/filepath"

	"github.com/pocketninja/audisai/pkg/models"
	"github.com/pocketninja/audisai/pkg/scanners"
)

// Orchestrator coordinates the scanning process
type Orchestrator struct {
	policies []*models.Policy
}

// NewOrchestrator creates a new orchestrator with the given policies
func NewOrchestrator(policies []*models.Policy) *Orchestrator {
	return &Orchestrator{
		policies: policies,
	}
}

// Scan walks the target directory and runs all policy rules against each file
func (o *Orchestrator) Scan(targetPath string) ([]models.ScanResult, int, error) {
	// Load ignores
	ignoreList, err := scanners.LoadIgnoreFile(targetPath)
	if err != nil {
		// Log warning but continue if ignore file fails (except for permissions errors, which might be critical)
		// For now we just proceed as if no ignores exist if we invoke LoadIgnoreFile
	}

	// Walk the directory to get all files
	files, err := WalkDirectory(targetPath)
	if err != nil {
		return nil, 0, err
	}

	var allResults []models.ScanResult
	filesScanned := 0

	// For each file, run all rules from all policies
	for _, file := range files {
		// Get relative path for ignore checking
		// WalkDirectory returns ScanFile with path relative to targetPath if desired? 
		// Actually WalkDirectory returns "Path" which is absolute.
		// We need relative path to targetPath for ignore matching.
		relPath, _ := filepath.Rel(targetPath, file.Path)
		if ignoreList.IsIgnored(relPath, "") {
			continue
		}

		filesScanned++
		for _, policy := range o.policies {
			for _, rule := range policy.Rules {
				// Check specific rule ignore
				if ignoreList.IsIgnored(relPath, rule.ID) {
					continue
				}

				results := scanners.ScanFile(file.Path, file.Content, rule, policy)
				allResults = append(allResults, results...)
			}
		}
	}

	return allResults, filesScanned, nil
}
