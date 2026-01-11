# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please report it privately:

- **Email**: security@nuulab.com
- **Do NOT** open a public GitHub issue

We will respond within 48 hours.

## Supported Versions

| Version | Supported |
|:--------|:----------|
| 1.x     | ✅         |
| < 1.0   | ❌         |

## Security Considerations

AudisAI performs **static analysis only**:
- Does not execute scanned code
- Does not send code to external services
- Authentication tokens stored in `~/.audisai/config.yaml`

For remote repository scanning, AudisAI:
- Uses authenticated HTTPS clones
- Temporary directories are deleted after scan
- No code is retained after analysis
