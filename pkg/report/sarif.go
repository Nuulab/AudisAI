package report

import (
	"encoding/json"
	"time"

	"github.com/pocketninja/audisai/pkg/models"
)

// SARIF 2.1.0 Schema (subset for GitHub Code Scanning)
// https://docs.oasis-open.org/sarif/sarif/v2.1.0/sarif-v2.1.0.html

type SARIFReport struct {
	Schema  string     `json:"$schema"`
	Version string     `json:"version"`
	Runs    []SARIFRun `json:"runs"`
}

type SARIFRun struct {
	Tool    SARIFTool     `json:"tool"`
	Results []SARIFResult `json:"results"`
}

type SARIFTool struct {
	Driver SARIFDriver `json:"driver"`
}

type SARIFDriver struct {
	Name            string      `json:"name"`
	Version         string      `json:"version"`
	InformationUri  string      `json:"informationUri"`
	Rules           []SARIFRule `json:"rules"`
}

type SARIFRule struct {
	ID               string          `json:"id"`
	Name             string          `json:"name"`
	ShortDescription SARIFMessage    `json:"shortDescription"`
	FullDescription  SARIFMessage    `json:"fullDescription,omitempty"`
	DefaultConfig    SARIFRuleConfig `json:"defaultConfiguration"`
	HelpUri          string          `json:"helpUri,omitempty"`
}

type SARIFRuleConfig struct {
	Level string `json:"level"`
}

type SARIFMessage struct {
	Text string `json:"text"`
}

type SARIFResult struct {
	RuleID    string          `json:"ruleId"`
	Level     string          `json:"level"`
	Message   SARIFMessage    `json:"message"`
	Locations []SARIFLocation `json:"locations"`
}

type SARIFLocation struct {
	PhysicalLocation SARIFPhysicalLocation `json:"physicalLocation"`
}

type SARIFPhysicalLocation struct {
	ArtifactLocation SARIFArtifactLocation `json:"artifactLocation"`
	Region           *SARIFRegion          `json:"region,omitempty"`
}

type SARIFArtifactLocation struct {
	URI string `json:"uri"`
}

type SARIFRegion struct {
	StartLine int `json:"startLine"`
}

func severityToSARIFLevel(severity string) string {
	switch severity {
	case "CRITICAL", "HIGH":
		return "error"
	case "MEDIUM":
		return "warning"
	default:
		return "note"
	}
}

// GenerateSARIF creates a SARIF 2.1.0 report for GitHub Code Scanning
func GenerateSARIF(results []models.ScanResult, policies []*models.Policy) (string, error) {
	// Build unique rules from policies
	ruleMap := make(map[string]SARIFRule)
	for _, policy := range policies {
		for _, rule := range policy.Rules {
			if _, exists := ruleMap[rule.ID]; !exists {
				ruleMap[rule.ID] = SARIFRule{
					ID:               rule.ID,
					Name:             rule.ID,
					ShortDescription: SARIFMessage{Text: rule.Description},
					DefaultConfig:    SARIFRuleConfig{Level: severityToSARIFLevel(rule.Severity)},
				}
			}
		}
	}

	rules := make([]SARIFRule, 0, len(ruleMap))
	for _, r := range ruleMap {
		rules = append(rules, r)
	}

	// Build results
	sarifResults := make([]SARIFResult, len(results))
	for i, r := range results {
		loc := SARIFLocation{
			PhysicalLocation: SARIFPhysicalLocation{
				ArtifactLocation: SARIFArtifactLocation{URI: r.FilePath},
			},
		}
		if r.LineNumber > 0 {
			loc.PhysicalLocation.Region = &SARIFRegion{StartLine: r.LineNumber}
		}

		sarifResults[i] = SARIFResult{
			RuleID:    r.RuleID,
			Level:     severityToSARIFLevel(r.Severity),
			Message:   SARIFMessage{Text: r.Message + "\n\nRemediation: " + r.Remediation},
			Locations: []SARIFLocation{loc},
		}
	}

	report := SARIFReport{
		Schema:  "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
		Version: "2.1.0",
		Runs: []SARIFRun{
			{
				Tool: SARIFTool{
					Driver: SARIFDriver{
						Name:           "AudisAI",
						Version:        "1.0.0",
						InformationUri: "https://github.com/pocketninja/audisai",
						Rules:          rules,
					},
				},
				Results: sarifResults,
			},
		},
	}

	// Add timestamp to prevent time import unused warning
	_ = time.Now()

	data, err := json.MarshalIndent(report, "", "  ")
	if err != nil {
		return "", err
	}

	return string(data), nil
}
