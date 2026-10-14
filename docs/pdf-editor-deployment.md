# PDF editor deployment requirements

PDF editor projects use the filesystem configured by `PDF_EDITOR_STORAGE_ROOT`.
In production this variable is required; startup fails closed when it is absent.

### Distributed Locking & Multi-Instance Clusters
For multi-instance serverless deployments, Kubernetes pods, or container clusters:
- **Redis Lock Provider**: When `REDIS_URL` is set or Redis is available, the PDF editor automatically uses `RedisPDFLockProvider` with atomic NX/PX token acquisition and Lua script deletion for project CAS updates and export transactions.
- **Local Fallback**: In single-host deployments or when Redis is offline, it smoothly falls back to `LocalFilePDFLockProvider` with PID/hostname recovery.
- **Shared Storage**: Point `PDF_EDITOR_STORAGE_ROOT` to a shared persistent volume mount (EFS, NFS, or shared Ceph mount) across pods, or use the S3 sync pipeline for assets.
- **Revision CAS**: Stale mutations are rejected with HTTP 409 `PDFProjectConflictError` to guarantee sequential consistency across instances.

