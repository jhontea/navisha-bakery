package hash

import (
	"crypto/sha256"
	"encoding/hex"
	"strings"
)

// SHA256 generates a SHA-256 hash of the input string
func SHA256(input string) string {
	hash := sha256.Sum256([]byte(input))
	return hex.EncodeToString(hash[:])
}

// HashContact generates a hash for contact deduplication
// Combines email + phone + message (normalized)
func HashContact(email, phone, message string) string {
	normalized := strings.TrimSpace(strings.ToLower(email)) + "|" +
		strings.TrimSpace(strings.ToLower(phone)) + "|" +
		strings.TrimSpace(strings.ToLower(message))
	return SHA256(normalized)
}
