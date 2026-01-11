package report

import (
	"encoding/json"
	"time"

	"github.com/pocketninja/audisai/pkg/models"
)

// JSONReport represents the structured JSON output
type JSONReport struct {
	Metadata   JSONMetadata    `json:"metadata"`
	Summary    JSONSummary     `json:"summary"`
	Violations []JSONViolation `json:"violations"`
}

// JSONMetadata contains scan metadata
type JSONMetadata struct {
	ToolName    string   `json:"tool_name"`
	Version     string   `json:"version"`
	ScanDate    string   `json:"scan_date"`
	ScanPath    string   `json:"scan_path"`
	States      []string `json:"states_checked"`
	FilesScanned int     `json:"files_scanned"`
}

// JSONSummary contains violation counts by severity
type JSONSummary struct {
	TotalViolations int            `json:"total_violations"`
	BySeverity      map[string]int `json:"by_severity"`
	ByPolicy        map[string]int `json:"by_policy"`
}

// JSONViolation represents a single violation
type JSONViolation struct {
	RuleID      string `json:"rule_id"`
	PolicyID    string `json:"policy_id"`
	PolicyName  string `json:"policy_name"`
	Severity    string `json:"severity"`
	FilePath    string `json:"file_path"`
	LineNumber  int    `json:"line_number,omitempty"`
	Message     string `json:"message"`
	Snippet     string `json:"snippet,omitempty"`
	Remediation string `json:"remediation"`
}

// GenerateJSON creates a JSON report from scan results
func GenerateJSON(results []models.ScanResult, filesScanned int, policies []*models.Policy, scanPath string, states []string) (string, error) {
	// Build severity counts
	sevCounts := map[string]int{"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}
	policyCounts := make(map[string]int)
	
	for _, r := range results {
		sevCounts[r.Severity]++
		policyCounts[r.PolicyID]++
	}

	// Build violations list
	violations := make([]JSONViolation, len(results))
	for i, r := range results {
		violations[i] = JSONViolation{
			RuleID:      r.RuleID,
			PolicyID:    r.PolicyID,
			PolicyName:  r.PolicyName,
			Severity:    r.Severity,
			FilePath:    r.FilePath,
			LineNumber:  r.LineNumber,
			Message:     r.Message,
			Snippet:     r.Snippet,
			Remediation: r.Remediation,
		}
	}

	report := JSONReport{
		Metadata: JSONMetadata{
			ToolName:     "AudisAI",
			Version:      "1.0.0",
			ScanDate:     time.Now().Format(time.RFC3339),
			ScanPath:     scanPath,
			States:       states,
			FilesScanned: filesScanned,
		},
		Summary: JSONSummary{
			TotalViolations: len(results),
			BySeverity:      sevCounts,
			ByPolicy:        policyCounts,
		},
		Violations: violations,
	}

	data, err := json.MarshalIndent(report, "", "  ")
	if err != nil {
		return "", err
	}

	return string(data), nil
}
