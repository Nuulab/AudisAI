package database

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

// Database paths
const (
	ldnoobwURL = "https://raw.githubusercontent.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words/master/en"
	afinnURL   = "https://raw.githubusercontent.com/fnielsen/afinn/master/afinn/data/AFINN-en-165.txt"
)

// WordDatabase holds the loaded word lists
type WordDatabase struct {
	ToxicWords     map[string]bool  `json:"toxic_words"`
	SentimentWords map[string]int   `json:"sentiment_words"` // word -> score (-5 to +5)
	LastUpdated    string           `json:"last_updated"`
}

// databaseDir returns the path to the database directory
func databaseDir() (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(home, ".audisai", "db"), nil
}

// databasePath returns the path to the database file
func databasePath() (string, error) {
	dir, err := databaseDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(dir, "wordlist.json"), nil
}

// UpdateDatabase downloads and parses the open source word lists
func UpdateDatabase() error {
	dbDir, err := databaseDir()
	if err != nil {
		return err
	}

	if err := os.MkdirAll(dbDir, 0755); err != nil {
		return err
	}

	db := &WordDatabase{
		ToxicWords:     make(map[string]bool),
		SentimentWords: make(map[string]int),
	}

	// Download LDNOOBW (toxic/bad words)
	fmt.Println("📥 Downloading LDNOOBW word list...")
	toxicWords, err := downloadTextFile(ldnoobwURL)
	if err != nil {
		fmt.Printf("   ⚠️  Warning: Could not download LDNOOBW: %v\n", err)
	} else {
		for _, word := range strings.Split(toxicWords, "\n") {
			word = strings.TrimSpace(strings.ToLower(word))
			if word != "" && !strings.HasPrefix(word, "#") {
				db.ToxicWords[word] = true
			}
		}
		fmt.Printf("   ✅ Loaded %d toxic words\n", len(db.ToxicWords))
	}

	// Download AFINN (sentiment scores)
	fmt.Println("📥 Downloading AFINN sentiment database...")
	afinnData, err := downloadTextFile(afinnURL)
	if err != nil {
		fmt.Printf("   ⚠️  Warning: Could not download AFINN: %v\n", err)
	} else {
		for _, line := range strings.Split(afinnData, "\n") {
			parts := strings.Split(line, "\t")
			if len(parts) == 2 {
				word := strings.TrimSpace(strings.ToLower(parts[0]))
				var score int
				fmt.Sscanf(parts[1], "%d", &score)
				if word != "" {
					db.SentimentWords[word] = score
				}
			}
		}
		fmt.Printf("   ✅ Loaded %d sentiment words\n", len(db.SentimentWords))
	}

	// Add timestamp
	db.LastUpdated = fmt.Sprintf("%s", strings.Split(fmt.Sprintf("%v", os.Getenv("TZ")), " ")[0])

	// Save to file
	dbPath, err := databasePath()
	if err != nil {
		return err
	}

	data, err := json.MarshalIndent(db, "", "  ")
	if err != nil {
		return err
	}

	if err := os.WriteFile(dbPath, data, 0644); err != nil {
		return err
	}

	fmt.Printf("💾 Database saved to: %s\n", dbPath)
	return nil
}

// LoadDatabase loads the word database from disk
func LoadDatabase() (*WordDatabase, error) {
	dbPath, err := databasePath()
	if err != nil {
		return nil, err
	}

	data, err := os.ReadFile(dbPath)
	if err != nil {
		if os.IsNotExist(err) {
			// Return empty database if not exists
			return &WordDatabase{
				ToxicWords:     make(map[string]bool),
				SentimentWords: make(map[string]int),
			}, nil
		}
		return nil, err
	}

	var db WordDatabase
	if err := json.Unmarshal(data, &db); err != nil {
		return nil, err
	}

	return &db, nil
}

// IsToxic checks if a word is in the toxic list
func (db *WordDatabase) IsToxic(word string) bool {
	return db.ToxicWords[strings.ToLower(word)]
}

// GetSentiment returns the sentiment score for a word (-5 to +5, 0 if not found)
func (db *WordDatabase) GetSentiment(word string) int {
	return db.SentimentWords[strings.ToLower(word)]
}

// downloadTextFile downloads a text file from a URL
func downloadTextFile(url string) (string, error) {
	resp, err := http.Get(url)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return "", fmt.Errorf("HTTP %d: %s", resp.StatusCode, resp.Status)
	}

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	return string(data), nil
}

// GetStatus returns the database status
func GetStatus() string {
	db, err := LoadDatabase()
	if err != nil {
		return fmt.Sprintf("❌ Error loading database: %v", err)
	}

	if len(db.ToxicWords) == 0 && len(db.SentimentWords) == 0 {
		return "📭 Database empty. Run: audisai update-db"
	}

	return fmt.Sprintf("📊 Database Status:\n"+
		"   Toxic Words: %d\n"+
		"   Sentiment Words: %d",
		len(db.ToxicWords), len(db.SentimentWords))
}
