package image

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
)

// R2Config holds Cloudflare R2 configuration
type R2Config struct {
	AccountID       string
	AccessKeyID     string
	SecretAccessKey string
	BucketName      string
	PublicURL       string
}

// R2Service handles file uploads to Cloudflare R2
type R2Service struct {
	client *s3.Client
	cfg    R2Config
}

// NewR2Service creates a new R2 service
func NewR2Service(cfg R2Config) (*R2Service, error) {
	r2Resolver := aws.EndpointResolverWithOptionsFunc(func(service, region string, options ...interface{}) (aws.Endpoint, error) {
		return aws.Endpoint{
			URL: fmt.Sprintf("https://%s.r2.cloudflarestorage.com", cfg.AccountID),
		}, nil
	})

	awsCfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithEndpointResolverWithOptions(r2Resolver),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
			cfg.AccessKeyID,
			cfg.SecretAccessKey,
			"",
		)),
		config.WithRegion("auto"),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to load AWS config: %w", err)
	}

	client := s3.NewFromConfig(awsCfg, func(o *s3.Options) {
		o.UsePathStyle = true
	})

	return &R2Service{
		client: client,
		cfg:    cfg,
	}, nil
}

// UploadResult contains the result of an upload
type UploadResult struct {
	PublicURL string
	ObjectKey string
}

// UploadFile uploads a file to R2 with the given path
// path should be like "menus/{uuid}/{filename}"
func (s *R2Service) UploadFile(ctx context.Context, path string, file multipart.File, size int64) (*UploadResult, error) {
	// Read file content
	buffer, err := io.ReadAll(file)
	if err != nil {
		return nil, fmt.Errorf("failed to read file: %w", err)
	}

	// Detect content type
	contentType := http.DetectContentType(buffer)

	// Upload to R2
	_, err = s.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(s.cfg.BucketName),
		Key:         aws.String(path),
		Body:        bytes.NewReader(buffer),
		ContentType: aws.String(contentType),
		ACL:         types.ObjectCannedACLPublicRead,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to upload to R2: %w", err)
	}

	publicURL := fmt.Sprintf("%s/%s", strings.TrimSuffix(s.cfg.PublicURL, "/"), path)

	return &UploadResult{
		PublicURL: publicURL,
		ObjectKey: path,
	}, nil
}

// DeleteFile deletes a file from R2 by its object key
func (s *R2Service) DeleteFile(ctx context.Context, objectKey string) error {
	_, err := s.client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(s.cfg.BucketName),
		Key:    aws.String(objectKey),
	})
	if err != nil {
		return fmt.Errorf("failed to delete from R2: %w", err)
	}
	return nil
}

// ValidateFile checks if the file is valid (type and size)
func ValidateFile(fileHeader *multipart.FileHeader, maxSize int64, allowedTypes []string) error {
	// Check file size
	if fileHeader.Size > maxSize {
		return fmt.Errorf("file size %d exceeds maximum allowed size %d", fileHeader.Size, maxSize)
	}

	// Open file to check magic bytes
	file, err := fileHeader.Open()
	if err != nil {
		return fmt.Errorf("failed to open file: %w", err)
	}
	defer file.Close()

	// Read first 512 bytes to detect content type
	buffer := make([]byte, 512)
	_, err = file.Read(buffer)
	if err != nil && err != io.EOF {
		return fmt.Errorf("failed to read file: %w", err)
	}

	// Detect content type
	contentType := http.DetectContentType(buffer)

	// Check if content type is allowed
	allowed := false
	for _, t := range allowedTypes {
		if strings.HasPrefix(contentType, t) {
			allowed = true
			break
		}
	}
	if !allowed {
		return fmt.Errorf("file type %s is not allowed", contentType)
	}

	return nil
}

// GenerateObjectKey generates a unique object key for menu images
// Format: menus/{uuid}/{timestamp}-{sanitized-filename}
func GenerateObjectKey(menuID string, filename string) string {
	ext := filepath.Ext(filename)
	base := strings.TrimSuffix(filename, ext)
	sanitized := strings.ReplaceAll(base, " ", "-")
	sanitized = strings.ToLower(sanitized)
	timestamp := time.Now().Unix()
	return fmt.Sprintf("menus/%s/%d-%s%s", menuID, timestamp, sanitized, ext)
}
