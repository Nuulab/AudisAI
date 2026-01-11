package auth

import (
	"fmt"

	"github.com/xanzy/go-gitlab"
)

// ValidateGitLabToken checks if a GitLab token is valid
func ValidateGitLabToken(token, baseURL string) (string, error) {
	var client *gitlab.Client
	var err error

	if baseURL != "" {
		client, err = gitlab.NewClient(token, gitlab.WithBaseURL("https://"+baseURL+"/api/v4"))
	} else {
		client, err = gitlab.NewClient(token)
	}

	if err != nil {
		return "", fmt.Errorf("failed to create GitLab client: %w", err)
	}

	user, _, err := client.Users.CurrentUser()
	if err != nil {
		return "", fmt.Errorf("invalid GitLab token: %w", err)
	}

	return user.Username, nil
}

// ListGitLabProjects lists projects accessible with the token
func ListGitLabProjects(token, baseURL string, limit int) ([]*gitlab.Project, error) {
	var client *gitlab.Client
	var err error

	if baseURL != "" {
		client, err = gitlab.NewClient(token, gitlab.WithBaseURL("https://"+baseURL+"/api/v4"))
	} else {
		client, err = gitlab.NewClient(token)
	}

	if err != nil {
		return nil, fmt.Errorf("failed to create GitLab client: %w", err)
	}

	opts := &gitlab.ListProjectsOptions{
		Membership: gitlab.Ptr(true),
		ListOptions: gitlab.ListOptions{
			PerPage: limit,
		},
	}

	projects, _, err := client.Projects.ListProjects(opts)
	if err != nil {
		return nil, fmt.Errorf("failed to list projects: %w", err)
	}

	return projects, nil
}

// GetGitLabCloneURL constructs the authenticated clone URL
func GetGitLabCloneURL(host, owner, repo, token string) string {
	if host == "" {
		host = "gitlab.com"
	}
	return fmt.Sprintf("https://oauth2:%s@%s/%s/%s.git", token, host, owner, repo)
}
