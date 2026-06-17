package auth

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/navishabakery/backend/internal/config"
	"github.com/navishabakery/backend/internal/domain/admin"
	googlePkg "github.com/navishabakery/backend/internal/pkg/google"
	jwtPkg "github.com/navishabakery/backend/internal/pkg/jwt"
	"golang.org/x/oauth2"
)

// Service defines the contract for authentication operations
type Service interface {
	AdminLoginWithGoogle(ctx context.Context, idToken string) (*LoginResponse, error)
	AdminGetMe(ctx context.Context, adminID string) (*admin.AdminResponse, error)
	ValidateToken(ctx context.Context, tokenString string) (*jwtPkg.Claims, error)
	UserLoginWithGoogle(ctx context.Context, idToken string) (*LoginResponse, error)
	UserGetMe(ctx context.Context, userID string) (*admin.AdminResponse, error)
	GetOAuthConfig() *oauth2.Config
}

type service struct {
	adminRepo admin.Repository
	cfg       *config.Config
	oauthCfg  *oauth2.Config
}

func NewService(adminRepo admin.Repository, cfg *config.Config) Service {
	oauthCfg := googlePkg.NewOAuthConfig(googlePkg.Config{
		ClientID:    config.GetGoogleClientID(),
		Secret:      config.GetGoogleClientSecret(),
		RedirectURL: config.GetGoogleRedirectURL(),
	})

	return &service{
		adminRepo: adminRepo,
		cfg:       cfg,
		oauthCfg:  oauthCfg,
	}
}

func (s *service) GetOAuthConfig() *oauth2.Config {
	return s.oauthCfg
}

// AdminLoginWithGoogle receives a verified ID token and logs the admin in.
// The ID token comes from the Google OAuth callback after exchanging the auth code.
func (s *service) AdminLoginWithGoogle(ctx context.Context, idToken string) (*LoginResponse, error) {
	tokenInfo, err := googlePkg.VerifyIDToken(ctx, idToken)
	if err != nil {
		return nil, fmt.Errorf("google token verification failed: %w", err)
	}

	existingAdmin, err := s.adminRepo.FindByEmail(ctx, tokenInfo.Email)
	if err != nil {
		return nil, fmt.Errorf("failed to lookup admin: %w", err)
	}

	if existingAdmin == nil {
		return nil, fmt.Errorf("email %s is not registered as an admin", tokenInfo.Email)
	}

	if existingAdmin.GoogleID == nil || *existingAdmin.GoogleID != tokenInfo.Sub {
		if err := s.adminRepo.UpdateGoogleID(ctx, existingAdmin.ID, tokenInfo.Sub, tokenInfo.Picture); err != nil {
			log.Printf("Failed to update Google ID for admin %s: %v", existingAdmin.Email, err)
		}
	}

	jwtSecret := config.GetJWTSecret()
	token, expiresAt, err := jwtPkg.GenerateAdminToken(
		jwtSecret,
		existingAdmin.ID.String(),
		existingAdmin.Email,
		existingAdmin.Name,
		existingAdmin.Role,
		s.cfg.JWT.ExpiryHours,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	return &LoginResponse{
		Admin: AdminResponse{
			ID:        existingAdmin.ID.String(),
			Email:     existingAdmin.Email,
			Name:      existingAdmin.Name,
			AvatarURL: tokenInfo.Picture,
			Role:      existingAdmin.Role,
		},
		Token:     token,
		ExpiresAt: expiresAt.Format(time.RFC3339),
	}, nil
}

func (s *service) UserLoginWithGoogle(ctx context.Context, idToken string) (*LoginResponse, error) {
	return nil, fmt.Errorf("user authentication not yet implemented (Phase 2)")
}

func (s *service) ValidateToken(ctx context.Context, tokenString string) (*jwtPkg.Claims, error) {
	jwtSecret := config.GetJWTSecret()
	claims, err := jwtPkg.Validate(tokenString, jwtSecret)
	if err != nil {
		return nil, err
	}

	switch claims.Type {
	case "admin":
		adminID, err := uuid.Parse(claims.Sub)
		if err != nil {
			return nil, fmt.Errorf("invalid admin ID in token: %w", err)
		}
		existingAdmin, err := s.adminRepo.FindByID(ctx, adminID)
		if err != nil {
			return nil, fmt.Errorf("failed to lookup admin: %w", err)
		}
		if existingAdmin == nil {
			return nil, fmt.Errorf("admin account no longer exists or has been deactivated")
		}
	case "user":
		return nil, fmt.Errorf("user authentication not yet implemented (Phase 2)")
	default:
		return nil, fmt.Errorf("unknown token type: %s", claims.Type)
	}

	return claims, nil
}

func (s *service) AdminGetMe(ctx context.Context, adminID string) (*admin.AdminResponse, error) {
	id, err := uuid.Parse(adminID)
	if err != nil {
		return nil, fmt.Errorf("invalid admin ID: %w", err)
	}

	a, err := s.adminRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if a == nil {
		return nil, fmt.Errorf("admin not found")
	}

	resp := admin.ToResponse(a)
	return &resp, nil
}

func (s *service) UserGetMe(ctx context.Context, userID string) (*admin.AdminResponse, error) {
	return nil, fmt.Errorf("user authentication not yet implemented (Phase 2)")
}
