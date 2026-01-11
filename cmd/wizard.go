package cmd

import (
	"fmt"
	"os"
	"strings"

	"github.com/charmbracelet/huh"
	"github.com/spf13/cobra"
)

func runWizard(cmd *cobra.Command, args []string) {
	var (
		jurisdictions []string
		scanType      string
		location      string
		format        string
	)

	// Define the form
	form := huh.NewForm(
		huh.NewGroup(
			huh.NewNote().
				Title("AudisAI Wizard").
				Description("Welcome to the interactive compliance scanner."),

			huh.NewMultiSelect[string]().
				Title("Select Jurisdictions & Frameworks").
				Options(
					// Laws
					huh.NewOption("Texas (HB 149)", "tx").Selected(true),
					huh.NewOption("Colorado (SB 205)", "co"),
					huh.NewOption("Utah (SB 149)", "ut"),
					huh.NewOption("Tennessee (ELVIS Act)", "tn"),
					huh.NewOption("Illinois (HB 3773)", "il"),
					huh.NewOption("New York City (Local Law 144)", "nyc"),
					huh.NewOption("California (SB 243)", "ca"),
					huh.NewOption("EU AI Act", "eu"),
					// Frameworks
					huh.NewOption("NIST AI RMF", "nist-ai"),
					huh.NewOption("NIST CSF 2.0", "nist-csf"),
					huh.NewOption("ISO 27001", "iso27001"),
					huh.NewOption("CIS Controls", "cis"),
				).
				Value(&jurisdictions),
		),

		huh.NewGroup(
			huh.NewSelect[string]().
				Title("Where is the code?").
				Options(
					huh.NewOption("Local Directory", "local"),
					huh.NewOption("Remote Git Repository", "remote"),
				).
				Value(&scanType),

			huh.NewInput().
				Title("Path or URL").
				Description("Enter the file path or repository URL").
				Value(&location).
				Validate(func(s string) error {
					if strings.TrimSpace(s) == "" {
						return fmt.Errorf("path/url is required")
					}
					return nil
				}),
		),

		huh.NewGroup(
			huh.NewSelect[string]().
				Title("Output Format").
				Options(
					huh.NewOption("PDF Report", "pdf"),
					huh.NewOption("Markdown Report", "markdown"),
				).
				Value(&format),
		),
	)

	// Run the form
	err := form.Run()
	if err != nil {
		fmt.Println("Wizard cancelled.")
		os.Exit(0)
	}

	// Set global variables for scan command
	stateCodes = strings.Join(jurisdictions, ",")
	if scanType == "local" {
		targetPath = location
		repoURL = ""
	} else {
		repoURL = location
		targetPath = ""
	}
	outputFormat = format

	// reset output file to auto-generate
	outputFile = ""
	
	fmt.Println()
	fmt.Println("🚀 Starting scan...")
	fmt.Println()

	// Execute scan
	if err := runScan(cmd, args); err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
}
