package models

import (
	"os"

	"gopkg.in/yaml.v3"
)

// Policy represents a compliance law/regulation with its associated rules
type Policy struct {
	Name        string `yaml:"name"`
	ID          string `yaml:"id"`
	Description string `yaml:"description,omitempty"`
	Rules       []Rule `yaml:"rules"`
}

// Rule defines a specific compliance check within a policy
type Rule struct {
	// ID is the unique identifier for the rule (e.g., "TX-BIO-01")
	ID string `yaml:"id"`

	// Severity indicates the importance: CRITICAL, HIGH, MEDIUM, LOW
	Severity string `yaml:"severity"`

	// Description explains what this rule checks for
	Description string `yaml:"description"`

	// ScannerType determines which scanner to use: "regex", "context_aware", "file_existence"
	ScannerType string `yaml:"scanner_type"`

	// Patterns are regex patterns or file patterns to match (used by regex and file_existence scanners)
	Patterns []string `yaml:"patterns,omitempty"`

	// Anchors are trigger words/phrases that indicate potential violations (used by context_aware scanner)
	Anchors []string `yaml:"anchors,omitempty"`

	// Exceptions are whitelist words that indicate false positives when found in context
	Exceptions []string `yaml:"exceptions,omitempty"`

	// Reinforcers are words that MUST also be present to confirm a violation
	Reinforcers []string `yaml:"reinforcers,omitempty"`

	// Remediation provides guidance on how to fix the violation
	Remediation string `yaml:"remediation"`
}

// LoadPolicy reads and parses a YAML policy file
func LoadPolicy(filePath string) (*Policy, error) {
	data, err := os.ReadFile(filePath)
	if err != nil {
		return nil, err
	}

	var policy Policy
	if err := yaml.Unmarshal(data, &policy); err != nil {
		return nil, err
	}

	return &policy, nil
}
