package scanners

import (
	"regexp"
	"strings"

	"github.com/pocketninja/audisai/pkg/models"
)

// contextWindow defines how many words around the anchor to examine
const contextWindow = 5

// scanContext performs context-aware scanning with anchors, exceptions, and reinforcers
func scanContext(path string, content string, rule models.Rule) []models.ScanResult {
	var results []models.ScanResult

	// Pre-compile anchor patterns (case-insensitive)
	anchorPatterns := make([]*regexp.Regexp, 0, len(rule.Anchors))
	for _, anchor := range rule.Anchors {
		re, err := regexp.Compile(`(?i)\b` + regexp.QuoteMeta(anchor) + `\b`)
		if err != nil {
			continue
		}
		anchorPatterns = append(anchorPatterns, re)
	}

	// Prepare exception and reinforcer word lists (lowercase for comparison)
	exceptions := make(map[string]bool)
	for _, e := range rule.Exceptions {
		exceptions[strings.ToLower(e)] = true
	}

	reinforcers := make(map[string]bool)
	for _, r := range rule.Reinforcers {
		reinforcers[strings.ToLower(r)] = true
	}

	// Scan line by line
	lines := strings.Split(content, "\n")
	for lineNum, line := range lines {
		for _, anchorRe := range anchorPatterns {
			if loc := anchorRe.FindStringIndex(line); loc != nil {
				// Found an anchor - extract context window
				words := extractWords(line)
				anchorWord := strings.ToLower(line[loc[0]:loc[1]])
				anchorIdx := findWordIndex(words, anchorWord)

				if anchorIdx == -1 {
					continue
				}

				// Get surrounding words
				startIdx := max(0, anchorIdx-contextWindow)
				endIdx := min(len(words), anchorIdx+contextWindow+1)
				contextWords := words[startIdx:endIdx]

				// Check for exceptions (false positive indicators)
				hasException := false
				for _, word := range contextWords {
					if exceptions[strings.ToLower(word)] {
						hasException = true
						break
					}
				}

				if hasException {
					// This is likely a false positive, skip
					continue
				}

				// Check for reinforcers if required
				if len(reinforcers) > 0 {
					hasReinforcer := false
					for _, word := range contextWords {
						if reinforcers[strings.ToLower(word)] {
							hasReinforcer = true
							break
						}
					}

					if !hasReinforcer {
						// No reinforcer found, not a violation
						continue
					}
				}

				// This is a valid violation
				snippet := strings.TrimSpace(line)
				if len(snippet) > 100 {
					snippet = snippet[:100] + "..."
				}

				results = append(results, models.ScanResult{
					FilePath:    path,
					LineNumber:  lineNum + 1,
					RuleID:      rule.ID,
					Severity:    rule.Severity,
					Message:     rule.Description,
					Snippet:     snippet,
					Remediation: rule.Remediation,
				})

				// Only report once per anchor per line
				break
			}
		}
	}

	return results
}

// extractWords splits a line into words, handling common separators
func extractWords(line string) []string {
	// Replace common separators with spaces
	replacer := strings.NewReplacer(
		"_", " ",
		"-", " ",
		".", " ",
		",", " ",
		";", " ",
		":", " ",
		"(", " ",
		")", " ",
		"[", " ",
		"]", " ",
		"{", " ",
		"}", " ",
		"\"", " ",
		"'", " ",
		"=", " ",
		"+", " ",
		"*", " ",
		"/", " ",
		"<", " ",
		">", " ",
	)

	normalized := replacer.Replace(line)
	return strings.Fields(normalized)
}

// findWordIndex finds the index of a word in a slice (case-insensitive)
func findWordIndex(words []string, target string) int {
	target = strings.ToLower(target)
	for i, w := range words {
		if strings.ToLower(w) == target {
			return i
		}
	}
	return -1
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
