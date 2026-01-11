package scanners

import (
	"bufio"
	"os"
	"path/filepath"
	"strings"

	"github.com/go-git/go-git/v5/plumbing/format/gitignore"
)

// IgnoreList tracks rules and files to ignore
type IgnoreList struct {
	globalIgnore gitignore.Matcher
	ruleIgnores  map[string]bool // "RuleID:FilePath" -> true
}

// LoadIgnoreFile loads .audisaiignore from the target directory
func LoadIgnoreFile(targetDir string) (*IgnoreList, error) {
	ignorePath := filepath.Join(targetDir, ".audisaiignore")
	
	// Create empty ignore list if file doesn't exist
	if _, err := os.Stat(ignorePath); os.IsNotExist(err) {
		return &IgnoreList{
			ruleIgnores: make(map[string]bool),
		}, nil
	}

	file, err := os.Open(ignorePath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	var patterns []gitignore.Pattern
	ruleIgnores := make(map[string]bool)

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		// Check for RuleID:FilePath format (e.g., "TX-001: legacy_code.go")
		if strings.Contains(line, ":") {
			parts := strings.SplitN(line, ":", 2)
			ruleID := strings.TrimSpace(parts[0])
			relPath := strings.TrimSpace(parts[1])
			
			// Normalize path
			relPath = filepath.Clean(relPath)
			key := fmtIgnoreKey(ruleID, relPath)
			ruleIgnores[key] = true
		} else {
			// Standard glob pattern for filtering files entirely
			patterns = append(patterns, gitignore.ParsePattern(line, nil))
		}
	}

	return &IgnoreList{
		globalIgnore: gitignore.NewMatcher(patterns),
		ruleIgnores:  ruleIgnores,
	}, nil
}

// IsIgnored checks if a file or specific rule violation should be ignored
func (il *IgnoreList) IsIgnored(relPath string, ruleID string) bool {
	if il == nil {
		return false
	}

	pathParts := strings.Split(relPath, string(filepath.Separator))
	
	// Check global file ignore patterns
	if il.globalIgnore != nil && il.globalIgnore.Match(pathParts, false) {
		return true
	}

	// Check specific rule ignores
	if ruleID != "" {
		key := fmtIgnoreKey(ruleID, relPath)
		if il.ruleIgnores[key] {
			return true
		}
	}

	return false
}

func fmtIgnoreKey(ruleID, path string) string {
	return ruleID + ":" + path
}
