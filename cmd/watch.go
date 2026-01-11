package cmd

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/fsnotify/fsnotify"
	"github.com/pocketninja/audisai/pkg/engine"
	"github.com/pocketninja/audisai/pkg/models"
	"github.com/pocketninja/audisai/pkg/report"
	"github.com/spf13/cobra"
)

var watchStates string
var watchPath string

var watchCmd = &cobra.Command{
	Use:   "watch",
	Short: "Watch a directory and re-scan on file changes",
	Long: `Continuously monitors a directory for file changes and automatically
re-scans when files are modified.

This is useful during development to get immediate feedback on compliance.

Press Ctrl+C to stop watching.

Example:
  audisai watch --state tx --path ./src`,
	RunE: runWatch,
}

func init() {
	rootCmd.AddCommand(watchCmd)
	watchCmd.Flags().StringVarP(&watchStates, "state", "s", "all", "Comma-separated state codes")
	watchCmd.Flags().StringVarP(&watchPath, "path", "p", ".", "Path to watch")
}

func runWatch(cmd *cobra.Command, args []string) error {
	// Validate path
	absPath, err := filepath.Abs(watchPath)
	if err != nil {
		return err
	}

	if _, err := os.Stat(absPath); os.IsNotExist(err) {
		return fmt.Errorf("path does not exist: %s", absPath)
	}

	// Load policies
	states := parseStates(watchStates)
	policies, err := loadPoliciesForStates(states)
	if err != nil {
		return err
	}

	fmt.Printf("👀 Watching: %s\n", absPath)
	fmt.Printf("   States: %v\n", states)
	fmt.Printf("   Press Ctrl+C to stop\n\n")

	// Initial scan
	runWatchScan(absPath, policies)

	// Set up watcher
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		return err
	}
	defer watcher.Close()

	// Add directories recursively
	err = filepath.Walk(absPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return nil // Skip errors
		}
		if info.IsDir() {
			// Skip hidden and common ignore dirs
			base := filepath.Base(path)
			if strings.HasPrefix(base, ".") || base == "node_modules" || base == "vendor" {
				return filepath.SkipDir
			}
			return watcher.Add(path)
		}
		return nil
	})
	if err != nil {
		return err
	}

	// Debounce timer
	var debounceTimer *time.Timer
	debounceDelay := 500 * time.Millisecond

	for {
		select {
		case event, ok := <-watcher.Events:
			if !ok {
				return nil
			}

			// Only react to writes
			if event.Op&fsnotify.Write == fsnotify.Write || event.Op&fsnotify.Create == fsnotify.Create {
				// Debounce rapid events
				if debounceTimer != nil {
					debounceTimer.Stop()
				}
				debounceTimer = time.AfterFunc(debounceDelay, func() {
					fmt.Printf("\n📝 Change detected: %s\n", filepath.Base(event.Name))
					runWatchScan(absPath, policies)
				})
			}

		case err, ok := <-watcher.Errors:
			if !ok {
				return nil
			}
			fmt.Fprintf(os.Stderr, "Watcher error: %v\n", err)
		}
	}
}

func runWatchScan(targetPath string, policies []*models.Policy) {
	orch := engine.NewOrchestrator(policies)
	results, filesScanned, err := orch.Scan(targetPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Scan error: %v\n", err)
		return
	}

	// Quick summary
	if len(results) == 0 {
		fmt.Printf("✅ %d files scanned, no violations\n", filesScanned)
	} else {
		fmt.Printf("⚠️  %d files scanned, %d violations\n", filesScanned, len(results))
		
		// Show top 5 violations
		limit := 5
		if len(results) < limit {
			limit = len(results)
		}
		for i := 0; i < limit; i++ {
			r := results[i]
			fmt.Printf("   [%s] %s:%d - %s\n", r.Severity, filepath.Base(r.FilePath), r.LineNumber, r.RuleID)
		}
		if len(results) > 5 {
			fmt.Printf("   ... and %d more\n", len(results)-5)
		}
	}

	// Suppress unused import warning
	_ = report.GenerateMarkdown
}
