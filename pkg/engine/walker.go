package engine

import (
	"io/fs"
	"os"
	"path/filepath"
	"strings"
)

// supportedExtensions are file types we scan for compliance
var supportedExtensions = map[string]bool{
	".go":     true,
	".py":     true,
	".js":     true,
	".ts":     true,
	".jsx":    true,
	".tsx":    true,
	".java":   true,
	".kt":     true,
	".swift":  true,
	".rs":     true,
	".c":      true,
	".cpp":    true,
	".h":      true,
	".hpp":    true,
	".rb":     true,
	".php":    true,
	".cs":     true,
	".scala":  true,
	".r":      true,
	".jl":     true,
	".yaml":   true,
	".yml":    true,
	".json":   true,
	".toml":   true,
	".md":     true,
	".txt":    true,
	".sql":    true,
	".sh":     true,
	".bash":   true,
	".zsh":    true,
	".ps1":    true,
	".bat":    true,
	".cmd":    true,
}

// ignoredDirs are directories we skip during scanning
var ignoredDirs = map[string]bool{
	"node_modules":  true,
	"vendor":        true,
	".git":          true,
	".svn":          true,
	".hg":           true,
	"__pycache__":   true,
	".venv":         true,
	"venv":          true,
	"env":           true,
	".env":          true,
	"dist":          true,
	"build":         true,
	"target":        true,
	".idea":         true,
	".vscode":       true,
	".next":         true,
	".nuxt":         true,
	"coverage":      true,
	".cache":        true,
}

// FileInfo contains information about a file to scan
type FileInfo struct {
	Path    string
	Content string
}

// WalkDirectory recursively walks a directory and returns scannable files
func WalkDirectory(root string) ([]FileInfo, error) {
	var files []FileInfo

	err := filepath.WalkDir(root, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return nil // Skip files we can't access
		}

		// Skip ignored directories
		if d.IsDir() {
			if ignoredDirs[d.Name()] {
				return filepath.SkipDir
			}
			return nil
		}

		// Check if file extension is supported
		ext := strings.ToLower(filepath.Ext(path))
		if !supportedExtensions[ext] {
			return nil
		}

		// Skip large files (> 1MB)
		info, err := d.Info()
		if err != nil || info.Size() > 1*1024*1024 {
			return nil
		}

		// Read file content
		content, err := os.ReadFile(path)
		if err != nil {
			return nil
		}

		// Get relative path for cleaner output
		relPath, err := filepath.Rel(root, path)
		if err != nil {
			relPath = path
		}

		files = append(files, FileInfo{
			Path:    relPath,
			Content: string(content),
		})

		return nil
	})

	return files, err
}
