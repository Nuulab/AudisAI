package scanners

import (
	"regexp"
	"strings"

	"github.com/pocketninja/audisai/pkg/models"
)

// scanRegex performs simple pattern matching against file content
func scanRegex(path string, content string, rule models.Rule) []models.ScanResult {
	var results []models.ScanResult

	// Compile all patterns
	var patterns []*regexp.Regexp
	for _, p := range rule.Patterns {
		// Escape special regex chars if pattern is a literal string
		// For now, treat patterns as literal strings (case-insensitive)
		re, err := regexp.Compile(`(?i)` + regexp.QuoteMeta(p))
		if err != nil {
			continue
		}
		patterns = append(patterns, re)
	}

	// Scan line by line
	lines := strings.Split(content, "\n")
	for lineNum, line := range lines {
		for _, re := range patterns {
			if matches := re.FindStringIndex(line); matches != nil {
				// Get a snippet around the match
				snippet := strings.TrimSpace(line)
				if len(snippet) > 100 {
					snippet = snippet[:100] + "..."
				}

				results = append(results, models.ScanResult{
					FilePath:    path,
					LineNumber:  lineNum + 1, // 1-indexed
					RuleID:      rule.ID,
					Severity:    rule.Severity,
					Message:     rule.Description,
					Snippet:     snippet,
					Remediation: rule.Remediation,
				})

				// Only report once per line per pattern
				break
			}
		}
	}

	return results
}
