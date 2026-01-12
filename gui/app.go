package main

import (
	"bufio"
	"context"
	"fmt"
	"os/exec"
	"sync"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx       context.Context
	output    []string
	outputMux sync.Mutex
	scanning  bool
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{
		output: make([]string, 0),
	}
}

// startup is called when the app starts
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// ScanOptions contains all options for a scan
type ScanOptions struct {
	Source          string   `json:"source"`
	SourceType      string   `json:"sourceType"`
	States          []string `json:"states"`
	Format          string   `json:"format"`
	OutputDir       string   `json:"outputDir"`
	MinSeverity     string   `json:"minSeverity"`
	FailOnViolation bool     `json:"failOnViolation"`
	Token           string   `json:"token"`
}

// SelectFolder opens native folder picker
func (a *App) SelectFolder() string {
	path, err := runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select folder to scan",
	})
	if err != nil {
		return ""
	}
	return path
}

// GetAuthStatus returns authentication status
func (a *App) GetAuthStatus() string {
	cmd := exec.Command("audisai", "auth", "status")
	output, err := cmd.CombinedOutput()
	if err != nil {
		return "Authentication status unavailable"
	}
	return string(output)
}

// StartScan starts a scan with given options
func (a *App) StartScan(opts ScanOptions) error {
	if a.scanning {
		return fmt.Errorf("scan already in progress")
	}

	a.outputMux.Lock()
	a.output = make([]string, 0)
	a.scanning = true
	a.outputMux.Unlock()

	args := []string{"scan"}

	if opts.SourceType == "folder" {
		args = append(args, "--path", opts.Source)
	} else {
		args = append(args, "--repo", opts.Source)
	}

	if len(opts.States) > 0 {
		stateStr := ""
		for i, s := range opts.States {
			if i > 0 {
				stateStr += ","
			}
			stateStr += s
		}
		args = append(args, "--state", stateStr)
	}

	if opts.Format != "" {
		args = append(args, "--format", opts.Format)
	}

	if opts.OutputDir != "" {
		args = append(args, "--output-dir", opts.OutputDir)
	}

	if opts.MinSeverity != "" {
		args = append(args, "--min-severity", opts.MinSeverity)
	}

	if opts.FailOnViolation {
		args = append(args, "--fail-on-violation")
	}

	if opts.Token != "" {
		args = append(args, "--token", opts.Token)
	}

	go a.runScanCommand(args)
	return nil
}

func (a *App) runScanCommand(args []string) {
	cmd := exec.Command("audisai", args...)

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		a.appendOutput(fmt.Sprintf("Error: %v", err))
		a.scanning = false
		return
	}

	stderr, err := cmd.StderrPipe()
	if err != nil {
		a.appendOutput(fmt.Sprintf("Error: %v", err))
		a.scanning = false
		return
	}

	if err := cmd.Start(); err != nil {
		a.appendOutput(fmt.Sprintf("Error starting scan: %v", err))
		a.scanning = false
		return
	}

	go func() {
		scanner := bufio.NewScanner(stdout)
		for scanner.Scan() {
			a.appendOutput(scanner.Text())
		}
	}()

	go func() {
		scanner := bufio.NewScanner(stderr)
		for scanner.Scan() {
			a.appendOutput(scanner.Text())
		}
	}()

	err = cmd.Wait()
	if err != nil {
		a.appendOutput(fmt.Sprintf("Scan completed with error: %v", err))
	} else {
		a.appendOutput("✅ Scan completed successfully")
	}

	a.outputMux.Lock()
	a.scanning = false
	a.outputMux.Unlock()

	runtime.EventsEmit(a.ctx, "scan:complete")
}

func (a *App) appendOutput(line string) {
	a.outputMux.Lock()
	a.output = append(a.output, line)
	a.outputMux.Unlock()
	runtime.EventsEmit(a.ctx, "scan:output", line)
}

func (a *App) GetOutput() []string {
	a.outputMux.Lock()
	defer a.outputMux.Unlock()
	return a.output
}

func (a *App) IsScanning() bool {
	a.outputMux.Lock()
	defer a.outputMux.Unlock()
	return a.scanning
}

func (a *App) ClearOutput() {
	a.outputMux.Lock()
	a.output = make([]string, 0)
	a.outputMux.Unlock()
}

func (a *App) GetAvailableStates() []map[string]string {
	return []map[string]string{
		{"code": "tx", "name": "Texas HB 149"},
		{"code": "co", "name": "Colorado SB 205"},
		{"code": "ut", "name": "Utah SB 149"},
		{"code": "tn", "name": "Tennessee ELVIS Act"},
		{"code": "il", "name": "Illinois HB 3773"},
		{"code": "nyc", "name": "NYC LL 144"},
		{"code": "ca", "name": "California SB 243"},
		{"code": "eu", "name": "EU AI Act"},
		{"code": "nist-ai", "name": "NIST AI RMF"},
		{"code": "nist-csf", "name": "NIST CSF"},
		{"code": "iso27001", "name": "ISO 27001"},
		{"code": "cis", "name": "CIS Controls"},
	}
}
