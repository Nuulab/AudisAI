package auth

import (
	"fmt"
	"os"
	"path/filepath"

	"gopkg.in/yaml.v3"
)

// Config holds authentication tokens for remote services
type Config struct {
	GitHub *GitHubConfig `yaml:"github,omitempty"`
	GitLab *GitLabConfig `yaml:"gitlab,omitempty"`
}

// GitHubConfig holds GitHub authentication settings
type GitHubConfig struct {
	Token string `yaml:"token"`
}

// GitLabConfig holds GitLab authentication settings
type GitLabConfig struct {
	Token   string `yaml:"token"`
	BaseURL string `yaml:"base_url,omitempty"` // For self-hosted GitLab
}

// configPath returns the path to the config file
func configPath() (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(home, ".audisai", "config.yaml"), nil
}

// LoadConfig loads the config from disk
func LoadConfig() (*Config, error) {
	path, err := configPath()
	if err != nil {
		return nil, err
	}

	data, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			return &Config{}, nil
		}
		return nil, err
	}

	var config Config
	if err := yaml.Unmarshal(data, &config); err != nil {
		return nil, err
	}

	return &config, nil
}

// SaveConfig saves the config to disk
func SaveConfig(config *Config) error {
	path, err := configPath()
	if err != nil {
		return err
	}

	// Ensure directory exists
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, 0700); err != nil {
		return err
	}

	data, err := yaml.Marshal(config)
	if err != nil {
		return err
	}

	// Write with restricted permissions (owner only)
	return os.WriteFile(path, data, 0600)
}

// SetGitHubToken stores a GitHub token
func SetGitHubToken(token string) error {
	config, err := LoadConfig()
	if err != nil {
		return err
	}

	config.GitHub = &GitHubConfig{Token: token}
	return SaveConfig(config)
}

// SetGitLabToken stores a GitLab token
func SetGitLabToken(token, baseURL string) error {
	config, err := LoadConfig()
	if err != nil {
		return err
	}

	config.GitLab = &GitLabConfig{
		Token:   token,
		BaseURL: baseURL,
	}
	return SaveConfig(config)
}

// GetGitHubToken retrieves the stored GitHub token
func GetGitHubToken() (string, error) {
	config, err := LoadConfig()
	if err != nil {
		return "", err
	}

	if config.GitHub == nil || config.GitHub.Token == "" {
		return "", fmt.Errorf("no GitHub token configured. Run: audisai auth github --token <PAT>")
	}

	return config.GitHub.Token, nil
}

// GetGitLabToken retrieves the stored GitLab token and base URL
func GetGitLabToken() (token, baseURL string, err error) {
	config, err := LoadConfig()
	if err != nil {
		return "", "", err
	}

	if config.GitLab == nil || config.GitLab.Token == "" {
		return "", "", fmt.Errorf("no GitLab token configured. Run: audisai auth gitlab --token <PAT>")
	}

	return config.GitLab.Token, config.GitLab.BaseURL, nil
}

// GetAuthStatus returns a summary of authentication status
func GetAuthStatus() string {
	config, _ := LoadConfig()

	status := "Authentication Status:\n"

	if config.GitHub != nil && config.GitHub.Token != "" {
		status += "  ✅ GitHub: Configured\n"
	} else {
		status += "  ❌ GitHub: Not configured\n"
	}

	if config.GitLab != nil && config.GitLab.Token != "" {
		url := "gitlab.com"
		if config.GitLab.BaseURL != "" {
			url = config.GitLab.BaseURL
		}
		status += fmt.Sprintf("  ✅ GitLab: Configured (%s)\n", url)
	} else {
		status += "  ❌ GitLab: Not configured\n"
	}

	return status
}
