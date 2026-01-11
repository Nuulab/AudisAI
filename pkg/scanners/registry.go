package scanners

import "github.com/pocketninja/audisai/pkg/models"

// ScanFile dispatches to the appropriate scanner based on the rule's ScannerType
func ScanFile(path string, content string, rule models.Rule, policy *models.Policy) []models.ScanResult {
	var results []models.ScanResult

	switch rule.ScannerType {
	case "regex":
		results = scanRegex(path, content, rule)
	case "context_aware":
		results = scanContext(path, content, rule)
	case "file_existence":
		results = scanFileExistence(path, rule)
	default:
		// Unknown scanner type, skip
		return nil
	}

	// Attach policy metadata to results
	for i := range results {
		results[i].PolicyID = policy.ID
		results[i].PolicyName = policy.Name
	}

	return results
}
