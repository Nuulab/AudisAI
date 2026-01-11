# AudisAI

**AI Compliance Static Analysis Tool**

AudisAI scans codebases for potential violations of AI-related laws and industry frameworks. It supports 12 policies covering US state laws, the EU AI Act, and major security/AI risk frameworks.

## Features

- 🔍 **Static Analysis** - Zero-AI pattern matching (no LLM required)
- 📋 **12 Policies** - TX, CO, UT, TN, IL, NYC, CA, EU, NIST AI RMF, NIST CSF, ISO 27001, CIS Controls
- 📄 **Multiple Formats** - PDF, Markdown, JSON, SARIF
- 🧙 **Interactive Wizard** - User-friendly TUI for non-programmers
- 🔄 **Watch Mode** - Continuous scanning during development
- 🔗 **CI/CD Ready** - `--fail-on-violation` exit codes
- 🚫 **Ignore File Support** - `.audisaiignore` for false positives

## Installation

```bash
# Clone and build
git clone https://github.com/nuulab/audisai.git
cd audisai
go build -o audisai main.go

# Or install directly
go install github.com/nuulab/audisai@latest
```

## Quick Start

```bash
# Interactive wizard
./audisai

# Scan with specific policies
./audisai scan --state tx,nist-ai --path ./my-project

# Generate PDF report
./audisai scan --state all --path ./src --format pdf -o report.pdf

# CI/CD mode (fails on violations)
./audisai scan --state tx --path ./src --fail-on-violation --min-severity high
```

## Supported Policies

### Laws & Regulations
| Code | Region | Law |
|:-----|:-------|:----|
| `tx` | Texas | HB 149 - Responsible AI Governance Act |
| `co` | Colorado | SB 205 - AI Discrimination |
| `ut` | Utah | SB 149 - AI Disclosure |
| `tn` | Tennessee | ELVIS Act - Voice/Likeness Protection |
| `il` | Illinois | HB 3773 - Employment AI |
| `nyc` | NYC | Local Law 144 - Hiring Bias Audits |
| `ca` | California | SB 243 - Bot Transparency |
| `eu` | EU | AI Act - Risk-Based Regulation |

### Industry Frameworks
| Code | Framework |
|:-----|:----------|
| `nist-ai` | NIST AI Risk Management Framework |
| `nist-csf` | NIST Cybersecurity Framework 2.0 |
| `iso27001` | ISO/IEC 27001:2022 |
| `cis` | CIS Critical Security Controls v8 |

## Commands

```bash
audisai              # Interactive wizard
audisai scan         # Scan codebase
audisai watch        # Continuous scanning
audisai init         # Create config files
audisai version      # Show version
audisai update-db    # Update word lists
audisai auth github  # Configure GitHub auth
audisai auth gitlab  # Configure GitLab auth
```

## Scan Options

```
--state, -s       Comma-separated policy codes or 'all'
--path, -p        Path to scan
--repo, -r        Remote repository URL
--format, -f      Output format: pdf, markdown, json, sarif
--output, -o      Output filename
--output-dir, -d  Output directory
--min-severity    Minimum severity: low, medium, high, critical
--baseline, -b    Baseline file for diff scanning
--fail-on-violation  Exit code 1 if violations found
```

## Configuration

### .audisaiignore
```gitignore
# Ignore directories
vendor/
node_modules/

# Ignore specific rule in file
TX-001: legacy_code.go
```

### audisai.yaml
```yaml
states: tx,co,nist-ai
format: pdf
min_severity: medium
fail_on_violation: true
```

## License

MIT License - See [LICENSE](LICENSE)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)
