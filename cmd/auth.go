package cmd

import (
	"fmt"

	"github.com/pocketninja/audisai/pkg/auth"
	"github.com/spf13/cobra"
)

var (
	authToken   string
	gitlabURL   string
)

var authCmd = &cobra.Command{
	Use:   "auth",
	Short: "Manage authentication for remote repositories",
	Long: `Configure authentication tokens for GitHub and GitLab.

These tokens are stored securely in ~/.audisai/config.yaml and used
when scanning remote repositories.

Examples:
  audisai auth github --token ghp_xxxxxxxxxxxx
  audisai auth gitlab --token glpat-xxxx --url gitlab.mycompany.com
  audisai auth status`,
}

var authGitHubCmd = &cobra.Command{
	Use:   "github",
	Short: "Configure GitHub authentication",
	Long: `Store a GitHub Personal Access Token (PAT) for accessing private repositories.

To create a token:
  1. Go to GitHub → Settings → Developer settings → Personal access tokens
  2. Generate a new token with 'repo' scope
  3. Run: audisai auth github --token <your-token>`,
	RunE: runAuthGitHub,
}

var authGitLabCmd = &cobra.Command{
	Use:   "gitlab",
	Short: "Configure GitLab authentication",
	Long: `Store a GitLab Personal Access Token for accessing private projects.

For self-hosted GitLab instances, use the --url flag.

Examples:
  audisai auth gitlab --token glpat-xxxx
  audisai auth gitlab --token glpat-xxxx --url gitlab.mycompany.com`,
	RunE: runAuthGitLab,
}

var authStatusCmd = &cobra.Command{
	Use:   "status",
	Short: "Show authentication status",
	RunE: runAuthStatus,
}

func init() {
	rootCmd.AddCommand(authCmd)
	authCmd.AddCommand(authGitHubCmd)
	authCmd.AddCommand(authGitLabCmd)
	authCmd.AddCommand(authStatusCmd)

	authGitHubCmd.Flags().StringVarP(&authToken, "token", "t", "", "GitHub Personal Access Token")
	authGitHubCmd.MarkFlagRequired("token")

	authGitLabCmd.Flags().StringVarP(&authToken, "token", "t", "", "GitLab Personal Access Token")
	authGitLabCmd.Flags().StringVarP(&gitlabURL, "url", "u", "", "GitLab instance URL (for self-hosted)")
	authGitLabCmd.MarkFlagRequired("token")
}

func runAuthGitHub(cmd *cobra.Command, args []string) error {
	fmt.Println("🔐 Validating GitHub token...")

	username, err := auth.ValidateGitHubToken(authToken)
	if err != nil {
		return fmt.Errorf("authentication failed: %w", err)
	}

	if err := auth.SetGitHubToken(authToken); err != nil {
		return fmt.Errorf("failed to save token: %w", err)
	}

	fmt.Printf("✅ GitHub authenticated as: %s\n", username)
	fmt.Println("   Token saved to ~/.audisai/config.yaml")
	return nil
}

func runAuthGitLab(cmd *cobra.Command, args []string) error {
	instance := "gitlab.com"
	if gitlabURL != "" {
		instance = gitlabURL
	}

	fmt.Printf("🔐 Validating GitLab token for %s...\n", instance)

	username, err := auth.ValidateGitLabToken(authToken, gitlabURL)
	if err != nil {
		return fmt.Errorf("authentication failed: %w", err)
	}

	if err := auth.SetGitLabToken(authToken, gitlabURL); err != nil {
		return fmt.Errorf("failed to save token: %w", err)
	}

	fmt.Printf("✅ GitLab authenticated as: %s\n", username)
	fmt.Println("   Token saved to ~/.audisai/config.yaml")
	return nil
}

func runAuthStatus(cmd *cobra.Command, args []string) error {
	fmt.Println(auth.GetAuthStatus())
	return nil
}
