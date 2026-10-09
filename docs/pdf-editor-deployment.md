# PDF editor deployment requirements

PDF editor projects use the filesystem configured by `PDF_EDITOR_STORAGE_ROOT`.
In production this variable is required; startup fails closed when it is absent.

The revision check and lock file provide compare-and-swap behavior only when all
application processes can read and atomically create files in the same shared
filesystem. The lock records its process ID and host so a crashed local owner
can be recovered, while a lock held by a live process is never expired by age.

This storage implementation is not a distributed object-store or database
transaction. Do not deploy it with isolated serverless filesystems or multiple
hosts unless `PDF_EDITOR_STORAGE_ROOT` points to a filesystem with shared,
atomic file creation and rename semantics. A shared database/object-storage
backend is still required for deployments that cannot provide that contract.
