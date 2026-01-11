package auth

import (
	"context"
	"fmt"

	"github.com/google/go-github/v57/github"
)

// ValidateGitHubToken checks if a GitHub token is valid
func ValidateGitHubToken(token string) (string, error) {
	client := github.NewClient(nil).WithAuthToken(token)

	user, _, err := client.Users.Get(context.Background(), "")
	if err != nil {
		return "", fmt.Errorf("invalid GitHub token: %w", err)
	}

	return user.GetLogin(), nil
}

// ListGitHubRepos lists repositories accessible with the token
func ListGitHubRepos(token string, limit int) ([]*github.Repository, error) {
	client := github.NewClient(nil).WithAuthToken(token)

	opts := &github.RepositoryListOptions{
		Visibility:  "all",
		Affiliation: "owner,collaborator,organization_member",
		ListOptions: github.ListOptions{PerPage: limit},
	}

	repos, _, err := client.Repositories.List(context.Background(), "", opts)
	if err != nil {
		return nil, fmt.Errorf("failed to list repositories: %w", err)
	}

	return repos, nil
}

// GetGitHubCloneURL constructs the authenticated clone URL
func GetGitHubCloneURL(owner, repo, token string) string {
	return fmt.Sprintf("https://%s@github.com/%s/%s.git", token, owner, repo)
}
