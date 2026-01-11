package report

import (
	"fmt"
	"sort"
	"time"

	"github.com/jung-kurt/gofpdf"
	"github.com/pocketninja/audisai/pkg/models"
)

// Colors
var (
	colorPrimary   = []int{30, 58, 138}    // Deep blue
	colorCritical  = []int{185, 28, 28}    // Red
	colorHigh      = []int{234, 88, 12}    // Orange
	colorMedium    = []int{202, 138, 4}    // Amber
	colorLow       = []int{22, 163, 74}    // Green
	colorGray      = []int{107, 114, 128}  // Gray
	colorLightGray = []int{243, 244, 246}  // Light gray bg
	colorWhite     = []int{255, 255, 255}
	colorBlack     = []int{17, 24, 39}
)

func getSeverityColor(severity string) []int {
	switch severity {
	case "CRITICAL":
		return colorCritical
	case "HIGH":
		return colorHigh
	case "MEDIUM":
		return colorMedium
	case "LOW":
		return colorLow
	default:
		return colorGray
	}
}

// GeneratePDF creates a professional PDF compliance report
func GeneratePDF(results []models.ScanResult, filesScanned int, policies []*models.Policy, outputPath string) error {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.SetMargins(20, 20, 20)
	pdf.SetAutoPageBreak(true, 25)

	// Add first page
	pdf.AddPage()

	// === HEADER SECTION ===
	pdf.SetFillColor(colorPrimary[0], colorPrimary[1], colorPrimary[2])
	pdf.Rect(0, 0, 210, 45, "F")

	pdf.SetFont("Arial", "B", 28)
	pdf.SetTextColor(255, 255, 255)
	pdf.SetY(12)
	pdf.CellFormat(0, 12, "AudisAI", "", 1, "C", false, 0, "")

	pdf.SetFont("Arial", "", 12)
	pdf.CellFormat(0, 8, "AI Compliance Report", "", 1, "C", false, 0, "")

	pdf.SetFont("Arial", "", 9)
	pdf.SetTextColor(200, 210, 230)
	pdf.CellFormat(0, 6, time.Now().Format("January 2, 2006"), "", 1, "C", false, 0, "")

	pdf.SetY(55)

	// === SUMMARY CARDS ===
	pdf.SetTextColor(colorBlack[0], colorBlack[1], colorBlack[2])
	pdf.SetFont("Arial", "B", 14)
	pdf.CellFormat(0, 10, "Scan Summary", "", 1, "L", false, 0, "")
	pdf.Ln(2)

	// Draw summary boxes
	cardY := pdf.GetY()
	cardWidth := 40.0
	cardHeight := 25.0
	cardSpacing := 5.0
	startX := 20.0

	// Files Scanned card
	drawSummaryCard(pdf, startX, cardY, cardWidth, cardHeight, "Files Scanned", fmt.Sprintf("%d", filesScanned), colorPrimary)
	startX += cardWidth + cardSpacing

	// Violations card
	violationColor := colorLow
	if len(results) > 0 {
		violationColor = colorCritical
	}
	drawSummaryCard(pdf, startX, cardY, cardWidth, cardHeight, "Violations", fmt.Sprintf("%d", len(results)), violationColor)
	startX += cardWidth + cardSpacing

	// Policies card
	drawSummaryCard(pdf, startX, cardY, cardWidth, cardHeight, "Policies", fmt.Sprintf("%d", len(policies)), colorPrimary)
	startX += cardWidth + cardSpacing

	// Severity counts
	sevCounts := map[string]int{"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}
	for _, r := range results {
		sevCounts[r.Severity]++
	}

	// Critical count card
	drawSummaryCard(pdf, startX, cardY, cardWidth, cardHeight, "Critical", fmt.Sprintf("%d", sevCounts["CRITICAL"]), colorCritical)

	pdf.SetY(cardY + cardHeight + 15)

	// === NO VIOLATIONS MESSAGE ===
	if len(results) == 0 {
		pdf.SetFillColor(colorLow[0], colorLow[1], colorLow[2])
		pdf.Rect(20, pdf.GetY(), 170, 20, "F")
		pdf.SetFont("Arial", "B", 14)
		pdf.SetTextColor(255, 255, 255)
		pdf.SetY(pdf.GetY() + 5)
		pdf.CellFormat(0, 10, "No compliance violations detected!", "", 1, "C", false, 0, "")
		return pdf.OutputFileAndClose(outputPath)
	}

	// === VIOLATIONS TABLE ===
	pdf.SetTextColor(colorBlack[0], colorBlack[1], colorBlack[2])
	pdf.SetFont("Arial", "B", 14)
	pdf.CellFormat(0, 10, "Violations Detected", "", 1, "L", false, 0, "")
	pdf.Ln(3)

	// Group by policy
	resultsByPolicy := make(map[string][]models.ScanResult)
	for _, r := range results {
		resultsByPolicy[r.PolicyID] = append(resultsByPolicy[r.PolicyID], r)
	}

	policyKeys := make([]string, 0, len(resultsByPolicy))
	for k := range resultsByPolicy {
		policyKeys = append(policyKeys, k)
	}
	sort.Strings(policyKeys)

	for _, policyID := range policyKeys {
		policyResults := resultsByPolicy[policyID]
		if len(policyResults) == 0 {
			continue
		}

		// Policy name
		pdf.SetFont("Arial", "B", 11)
		pdf.SetTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2])
		pdf.CellFormat(0, 8, policyResults[0].PolicyName, "", 1, "L", false, 0, "")

		// Sort by severity
		sort.Slice(policyResults, func(i, j int) bool {
			return severityRank(policyResults[i].Severity) < severityRank(policyResults[j].Severity)
		})

		// Table header
		pdf.SetFont("Arial", "B", 9)
		pdf.SetFillColor(colorLightGray[0], colorLightGray[1], colorLightGray[2])
		pdf.SetTextColor(colorBlack[0], colorBlack[1], colorBlack[2])

		colWidths := []float64{25, 25, 55, 15, 50}

		pdf.CellFormat(colWidths[0], 8, "Severity", "1", 0, "C", true, 0, "")
		pdf.CellFormat(colWidths[1], 8, "Rule", "1", 0, "C", true, 0, "")
		pdf.CellFormat(colWidths[2], 8, "File", "1", 0, "C", true, 0, "")
		pdf.CellFormat(colWidths[3], 8, "Line", "1", 0, "C", true, 0, "")
		pdf.CellFormat(colWidths[4], 8, "Issue", "1", 1, "C", true, 0, "")

		// Table rows
		pdf.SetFont("Arial", "", 8)
		for _, r := range policyResults {
			// Check page break
			if pdf.GetY() > 250 {
				pdf.AddPage()
				pdf.SetY(20)
			}

			rowHeight := 7.0

			// Severity with colored background
			sevColor := getSeverityColor(r.Severity)
			pdf.SetFillColor(sevColor[0], sevColor[1], sevColor[2])
			pdf.SetTextColor(255, 255, 255)
			pdf.CellFormat(colWidths[0], rowHeight, r.Severity, "1", 0, "C", true, 0, "")

			// Reset colors
			pdf.SetFillColor(255, 255, 255)
			pdf.SetTextColor(colorBlack[0], colorBlack[1], colorBlack[2])

			pdf.CellFormat(colWidths[1], rowHeight, r.RuleID, "1", 0, "L", false, 0, "")

			filePath := truncateStr(r.FilePath, 35)
			pdf.CellFormat(colWidths[2], rowHeight, filePath, "1", 0, "L", false, 0, "")

			lineStr := "-"
			if r.LineNumber > 0 {
				lineStr = fmt.Sprintf("%d", r.LineNumber)
			}
			pdf.CellFormat(colWidths[3], rowHeight, lineStr, "1", 0, "C", false, 0, "")

			snippet := truncateStr(r.Snippet, 30)
			pdf.CellFormat(colWidths[4], rowHeight, snippet, "1", 1, "L", false, 0, "")
		}
		pdf.Ln(8)
	}

	// === REMEDIATION SECTION ===
	pdf.AddPage()

	pdf.SetFont("Arial", "B", 14)
	pdf.SetTextColor(colorBlack[0], colorBlack[1], colorBlack[2])
	pdf.CellFormat(0, 10, "Remediation Guidance", "", 1, "L", false, 0, "")
	pdf.Ln(5)

	// Unique rules
	remediationByRule := make(map[string]models.ScanResult)
	for _, r := range results {
		if _, exists := remediationByRule[r.RuleID]; !exists {
			remediationByRule[r.RuleID] = r
		}
	}

	ruleIDs := make([]string, 0, len(remediationByRule))
	for k := range remediationByRule {
		ruleIDs = append(ruleIDs, k)
	}
	sort.Strings(ruleIDs)

	for _, ruleID := range ruleIDs {
		r := remediationByRule[ruleID]

		// Rule header with severity badge
		sevColor := getSeverityColor(r.Severity)
		pdf.SetFillColor(sevColor[0], sevColor[1], sevColor[2])
		pdf.SetTextColor(255, 255, 255)
		pdf.SetFont("Arial", "B", 9)
		pdf.CellFormat(20, 7, r.RuleID, "", 0, "C", true, 0, "")

		pdf.SetTextColor(colorBlack[0], colorBlack[1], colorBlack[2])
		pdf.SetFont("Arial", "B", 10)
		pdf.CellFormat(0, 7, "  "+truncateStr(r.Message, 80), "", 1, "L", false, 0, "")

		pdf.Ln(2)

		// Remediation text
		pdf.SetFont("Arial", "", 9)
		pdf.SetTextColor(colorGray[0], colorGray[1], colorGray[2])
		pdf.MultiCell(0, 5, r.Remediation, "", "L", false)
		pdf.Ln(5)
	}

	// === AUDIT METHODOLOGY SECTION ===
	pdf.AddPage()

	pdf.SetFont("Arial", "B", 14)
	pdf.SetTextColor(colorBlack[0], colorBlack[1], colorBlack[2])
	pdf.CellFormat(0, 10, "Audit Methodology", "", 1, "L", false, 0, "")
	pdf.Ln(3)

	pdf.SetFont("Arial", "", 9)
	pdf.SetTextColor(colorGray[0], colorGray[1], colorGray[2])

	methodology := `This compliance audit was performed using AudisAI, a static analysis tool designed to identify potential violations of AI-related legislation. The audit methodology includes:

1. PATTERN MATCHING: Regular expression-based scanning for known violation patterns (e.g., biometric-related function calls, discrimination-indicative keywords).

2. CONTEXT-AWARE ANALYSIS: Advanced scanning that considers surrounding code context to reduce false positives. The scanner looks for "anchor" terms along with "reinforcers" while excluding technical exceptions.

3. POLICY ENFORCEMENT: Each jurisdiction's laws are encoded as declarative policy rules (YAML). Rules specify severity levels based on legal risk.

4. FILE EXISTENCE CHECKS: Verification of required documentation files mandated by certain regulations (e.g., Impact Assessments).

IMPORTANT: This tool performs static analysis only. It does not execute code, access runtime behavior, or capture real-time data. The findings represent potential concerns based on source code patterns and should be reviewed by qualified personnel before making compliance determinations.`

	pdf.MultiCell(0, 5, methodology, "", "L", false)
	pdf.Ln(10)

	// === SCAN METADATA ===
	pdf.SetFont("Arial", "B", 12)
	pdf.SetTextColor(colorBlack[0], colorBlack[1], colorBlack[2])
	pdf.CellFormat(0, 8, "Scan Metadata", "", 1, "L", false, 0, "")
	pdf.Ln(2)

	pdf.SetFont("Arial", "", 9)
	pdf.SetTextColor(colorGray[0], colorGray[1], colorGray[2])

	metadata := fmt.Sprintf(`Tool: AudisAI v1.0.0
Scan Date: %s
Files Scanned: %d
Policies Applied: %d
Total Violations: %d`,
		time.Now().Format("2006-01-02 15:04:05 MST"),
		filesScanned,
		len(policies),
		len(results))

	pdf.MultiCell(0, 5, metadata, "", "L", false)
	pdf.Ln(10)

	// === JURISDICTIONS CHECKED ===
	pdf.SetFont("Arial", "B", 12)
	pdf.SetTextColor(colorBlack[0], colorBlack[1], colorBlack[2])
	pdf.CellFormat(0, 8, "Jurisdictions Checked", "", 1, "L", false, 0, "")
	pdf.Ln(2)

	pdf.SetFont("Arial", "", 9)
	pdf.SetTextColor(colorGray[0], colorGray[1], colorGray[2])

	for _, policy := range policies {
		pdf.CellFormat(0, 5, "• "+policy.Name+" ("+policy.ID+")", "", 1, "L", false, 0, "")
	}
	pdf.Ln(10)

	// === LEGAL DISCLAIMER ===
	pdf.SetFont("Arial", "B", 12)
	pdf.SetTextColor(colorBlack[0], colorBlack[1], colorBlack[2])
	pdf.CellFormat(0, 8, "Legal Disclaimer", "", 1, "L", false, 0, "")
	pdf.Ln(2)

	pdf.SetFont("Arial", "I", 8)
	pdf.SetTextColor(colorGray[0], colorGray[1], colorGray[2])

	disclaimer := `This report is provided for informational purposes only and does not constitute legal advice. The findings in this report are based on automated static analysis of source code patterns and may contain false positives or miss actual violations. Organizations should consult with qualified legal counsel before making compliance determinations.

AudisAI is an open-source tool and makes no warranties, express or implied, regarding the accuracy, completeness, or fitness for a particular purpose of this report. The user assumes all responsibility for any actions taken based on the contents of this report.

This document contains confidential information about the scanned codebase. Distribution should be limited to authorized personnel only.`

	pdf.MultiCell(0, 4, disclaimer, "", "L", false)

	// === FOOTER ===
	pdf.SetY(-20)
	pdf.SetFont("Arial", "I", 8)
	pdf.SetTextColor(colorGray[0], colorGray[1], colorGray[2])
	pdf.CellFormat(0, 10, "Generated by AudisAI - AI Compliance Static Analysis Tool", "", 0, "C", false, 0, "")

	return pdf.OutputFileAndClose(outputPath)
}

// drawSummaryCard draws a summary statistic card
func drawSummaryCard(pdf *gofpdf.Fpdf, x, y, w, h float64, label, value string, color []int) {
	// Card background
	pdf.SetFillColor(colorLightGray[0], colorLightGray[1], colorLightGray[2])
	pdf.RoundedRect(x, y, w, h, 2, "1234", "F")

	// Value
	pdf.SetTextColor(color[0], color[1], color[2])
	pdf.SetFont("Arial", "B", 18)
	pdf.SetXY(x, y+3)
	pdf.CellFormat(w, 10, value, "", 0, "C", false, 0, "")

	// Label
	pdf.SetTextColor(colorGray[0], colorGray[1], colorGray[2])
	pdf.SetFont("Arial", "", 8)
	pdf.SetXY(x, y+14)
	pdf.CellFormat(w, 6, label, "", 0, "C", false, 0, "")
}

// truncateStr shortens a string with ellipsis
func truncateStr(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	return s[:maxLen-3] + "..."
}
