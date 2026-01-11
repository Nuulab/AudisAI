package remote

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing/transport/http"
	"github.com/pocketninja/audisai/pkg/auth"
)

// RepoInfo contains parsed repository information
type RepoInfo struct {
	Host     string // github.com or gitlab.com or custom
	Owner    string
	Repo     string
	Provider string // "github" or "gitlab"
}

// ParseRepoURL parses a repository URL into its components
func ParseRepoURL(url string) (*RepoInfo, error) {
	// Remove protocol prefix if present
	url = strings.TrimPrefix(url, "https://")
	url = strings.TrimPrefix(url, "http://")
	url = strings.TrimSuffix(url, ".git")

	// Match patterns like: github.com/owner/repo or gitlab.com/owner/repo
	re := regexp.MustCompile(`^([^/]+)/([^/]+)/([^/]+)$`)
	matches := re.FindStringSubmatch(url)

	if len(matches) != 4 {
		return nil, fmt.Errorf("invalid repo URL format. Expected: host/owner/repo (e.g., github.com/myorg/myapp)")
	}

	info := &RepoInfo{
		Host:  matches[1],
		Owner: matches[2],
		Repo:  matches[3],
	}

	// Determine provider
	if strings.Contains(info.Host, "github") {
		info.Provider = "github"
	} else if strings.Contains(info.Host, "gitlab") {
		info.Provider = "gitlab"
	} else {
		// Default to GitLab for self-hosted (more common for enterprise)
		info.Provider = "gitlab"
	}

	return info, nil
}

// CloneRepo clones a repository to a temporary directory
func CloneRepo(repoURL string) (string, func(), error) {
	info, err := ParseRepoURL(repoURL)
	if err != nil {
		return "", nil, err
	}

	// Get the appropriate token
	var cloneURL string
	var token string

	switch info.Provider {
	case "github":
		token, err = auth.GetGitHubToken()
		if err != nil {
			return "", nil, err
		}
		cloneURL = fmt.Sprintf("https://github.com/%s/%s.git", info.Owner, info.Repo)

	case "gitlab":
		var baseURL string
		token, baseURL, err = auth.GetGitLabToken()
		if err != nil {
			return "", nil, err
		}
		host := info.Host
		if baseURL != "" {
			host = baseURL
		}
		cloneURL = fmt.Sprintf("https://%s/%s/%s.git", host, info.Owner, info.Repo)
	}

	// Create temp directory
	tempDir, err := os.MkdirTemp("", "audisai-scan-*")
	if err != nil {
		return "", nil, fmt.Errorf("failed to create temp directory: %w", err)
	}

	cleanup := func() {
		os.RemoveAll(tempDir)
	}

	repoPath := filepath.Join(tempDir, info.Repo)

	fmt.Printf("📥 Cloning %s/%s...\n", info.Owner, info.Repo)

	// Clone with authentication
	_, err = git.PlainClone(repoPath, false, &git.CloneOptions{
		URL: cloneURL,
		Auth: &http.BasicAuth{
			Username: "x-access-token", // Can be anything for token auth
			Password: token,
		},
		Depth:    1, // Shallow clone for speed
		Progress: os.Stdout,
	})

	if err != nil {
		cleanup()
		return "", nil, fmt.Errorf("failed to clone repository: %w", err)
	}

	fmt.Printf("✅ Cloned to: %s\n", repoPath)
	return repoPath, cleanup, nil
}
