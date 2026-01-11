package models

// ScanResult represents a single compliance violation found during scanning
type ScanResult struct {
	// FilePath is the relative path to the file containing the violation
	FilePath string

	// LineNumber is the 1-indexed line where the violation was found
	LineNumber int

	// RuleID is the identifier of the rule that was violated
	RuleID string

	// Severity is the importance level (CRITICAL, HIGH, MEDIUM, LOW)
	Severity string

	// Message describes the specific violation
	Message string

	// Snippet is the actual code/text that triggered the violation
	Snippet string

	// Remediation is the suggested fix from the rule
	Remediation string

	// PolicyID is the identifier of the parent policy
	PolicyID string

	// PolicyName is the name of the parent policy
	PolicyName string
}
