# Contributing to AudisAI

Thank you for your interest in contributing!

## How to Contribute

### Reporting Issues
- Use GitHub Issues
- Include reproduction steps
- Specify your Go version and OS

### Adding New Policies

1. Create a YAML file in `policies/`:
   - US States: `policies/us_XX/law_name.yaml`
   - International: `policies/region/law_name.yaml`
   - Frameworks: `policies/frameworks/framework_name.yaml`

2. Follow existing policy structure:
```yaml
name: "Law Name"
id: "UNIQUE-ID"
description: "Brief description"
rules:
  - id: "RULE-01"
    severity: "HIGH"  # CRITICAL, HIGH, MEDIUM, LOW
    description: "What this detects"
    scanner_type: "context_aware"  # or "regex", "file_existence"
    anchors: ["keyword1", "keyword2"]
    exceptions: ["false_positive"]
    reinforcers: ["confirming_context"]
    remediation: "How to fix this issue"
```

3. Add mapping in `cmd/scan.go` → `stateMap`
4. Add option in `cmd/wizard.go`

### Code Style
- Run `go fmt` before committing
- Run `go vet` for static analysis
- Add tests for new features

## Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `go test ./...`
5. Submit a PR with clear description
