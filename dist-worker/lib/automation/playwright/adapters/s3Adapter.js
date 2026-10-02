"use strict";
/**
 * lib/automation/playwright/adapters/s3Adapter.ts
 *
 * Playwright Supervised Onboarding & Functional Healthcheck Adapter for S3-Compatible Storage.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Adapter = exports.S3Adapter = void 0;
const secretRedaction_1 = require("../secretRedaction");
const client_s3_1 = require("@aws-sdk/client-s3");
class S3Adapter {
    metadata = {
        providerId: 'storage-aws-s3',
        serviceName: 'S3-Compatible Object Storage & CDN',
        category: 'STORAGE_CDN',
        portalUrl: 'https://console.aws.amazon.com/iam/',
        docUrl: 'https://docs.aws.amazon.com/s3/',
        accountType: 'AWS / Wasabi / Cloudflare R2 Account',
        prerequisites: [
            {
                title: 'Dedicated Media Bucket',
                description: 'Target S3 bucket created with appropriate CORS rules.',
            },
            {
                title: 'Least-Privilege IAM User',
                description: 'IAM user restricted to s3:PutObject, s3:GetObject, s3:DeleteObject, s3:ListBucket.',
            },
        ],
        fields: [
            {
                key: 'accessKeyId',
                label: 'Access Key ID',
                description: 'IAM or Wasabi Access Key starting with AKIA... or similar',
                envVar: 'AWS_ACCESS_KEY_ID',
                isSecret: false,
                required: true,
                placeholder: 'AKIA...',
            },
            {
                key: 'secretAccessKey',
                label: 'Secret Access Key',
                description: '40-character secret key',
                envVar: 'AWS_SECRET_ACCESS_KEY',
                isSecret: true,
                required: true,
                placeholder: 'your_secret_access_key',
            },
            {
                key: 'region',
                label: 'S3 Region',
                description: 'Region of target bucket (e.g. us-east-1)',
                envVar: 'AWS_REGION',
                isSecret: false,
                required: true,
                placeholder: 'us-east-1',
            },
            {
                key: 'bucketName',
                label: 'S3 Bucket Name',
                description: 'Name of the object storage bucket',
                envVar: 'AWS_BUCKET_NAME',
                isSecret: false,
                required: true,
                placeholder: 'salesmanpro-media',
            },
        ],
        requiredScopes: ['s3:PutObject', 's3:GetObject', 's3:DeleteObject', 's3:ListBucket'],
    };
    getOnboardingSteps() {
        return [
            {
                stepNumber: 1,
                title: 'Navigate to IAM Console',
                description: 'Open AWS/Wasabi IAM User Management.',
                actionRequired: 'AGENT_AUTOMATED',
            },
            {
                stepNumber: 2,
                title: 'Account Authentication & MFA',
                description: 'Root or Administrator signs in with multi-factor authentication.',
                actionRequired: 'USER_INTERACTIVE',
            },
            {
                stepNumber: 3,
                title: 'Generate Access Key',
                description: 'Create Programmatic Access Key pair for SalesmanPro service user.',
                actionRequired: 'USER_SUPERVISED',
                fieldsToExtract: ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'],
            },
        ];
    }
    async verifyCredentials(credentials) {
        const accessKeyId = credentials.AWS_ACCESS_KEY_ID ||
            credentials.AACCESS_KEY_ID ||
            process.env.AWS_ACCESS_KEY_ID ||
            process.env.AACCESS_KEY_ID;
        const secretAccessKey = credentials.AWS_SECRET_ACCESS_KEY ||
            credentials.ASECRET_ACCESS_KEY ||
            process.env.AWS_SECRET_ACCESS_KEY ||
            process.env.ASECRET_ACCESS_KEY;
        const region = credentials.AWS_REGION ||
            credentials.AREGION ||
            process.env.AWS_REGION ||
            process.env.AREGION ||
            'us-east-1';
        const bucket = credentials.AWS_BUCKET_NAME ||
            credentials.AS3_BUCKET_NAME ||
            credentials.S3_BUCKET_NAME ||
            process.env.AWS_BUCKET_NAME ||
            process.env.AS3_BUCKET_NAME ||
            process.env.S3_BUCKET_NAME;
        if (!accessKeyId || !secretAccessKey || !bucket) {
            return {
                providerId: this.metadata.providerId,
                success: false,
                testedAt: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'development',
                credentialStatus: 'INVALID',
                message: 'AWS Access Key, Secret Key, or Bucket Name is missing.',
            };
        }
        try {
            (0, secretRedaction_1.safeLog)('Testing S3 Storage connectivity (HeadBucket & harmless verification probe)...');
            const s3 = new client_s3_1.S3Client({
                region,
                credentials: {
                    accessKeyId,
                    secretAccessKey,
                },
            });
            // 1. Verify bucket existence and permission
            await s3.send(new client_s3_1.HeadBucketCommand({ Bucket: bucket }));
            // 2. Perform safe write/delete verification probe
            const testKey = `_system_probe_${Date.now()}.txt`;
            await s3.send(new client_s3_1.PutObjectCommand({
                Bucket: bucket,
                Key: testKey,
                Body: 'SalesmanPro verification probe',
                ContentType: 'text/plain',
            }));
            await s3.send(new client_s3_1.DeleteObjectCommand({
                Bucket: bucket,
                Key: testKey,
            }));
            return {
                providerId: this.metadata.providerId,
                success: true,
                testedAt: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'development',
                credentialStatus: 'VALID',
                message: `S3 Object Storage verified. Read/Write/Delete permissions confirmed on bucket '${bucket}' in region '${region}'.`,
                accountDetails: {
                    accountName: `S3 Bucket [${bucket}]`,
                    permissions: ['HeadBucket', 'PutObject', 'DeleteObject'],
                },
            };
        }
        catch (err) {
            return {
                providerId: this.metadata.providerId,
                success: false,
                testedAt: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'development',
                credentialStatus: err?.$metadata?.httpStatusCode === 403 ? 'PERMISSION_DENIED' : 'INVALID',
                message: `S3 Storage check failed: ${err.message || 'Unknown S3 error'}`,
                error: (0, secretRedaction_1.formatSafeError)(err),
            };
        }
    }
}
exports.S3Adapter = S3Adapter;
exports.s3Adapter = new S3Adapter();
