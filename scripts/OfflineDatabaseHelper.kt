package site.salesmanpro.android.data.local

import android.content.ContentValues
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper

/**
 * Native Android SQLite persistence engine (WAL mode) for SalesmanPro Offline-First POS.
 * Guarantees that outbox operations and print jobs survive WebView cache eviction,
 * process termination, power loss, and OS restarts.
 */
class OfflineDatabaseHelper(context: Context) :
    SQLiteOpenHelper(context, DATABASE_NAME, null, DATABASE_VERSION) {

    init {
        setWriteAheadLoggingEnabled(true)
    }

    override fun onCreate(db: SQLiteDatabase) {
        db.execSQL(
            """
            CREATE TABLE IF NOT EXISTS offline_outbox (
                id TEXT PRIMARY KEY,
                company_id TEXT NOT NULL,
                entity_type TEXT NOT NULL,
                status TEXT NOT NULL,
                payload_json TEXT NOT NULL,
                updated_at INTEGER NOT NULL
            )
            """.trimIndent()
        )
        db.execSQL("CREATE INDEX IF NOT EXISTS idx_outbox_company_status ON offline_outbox(company_id, status)")

        db.execSQL(
            """
            CREATE TABLE IF NOT EXISTS print_jobs (
                job_id TEXT PRIMARY KEY,
                company_id TEXT NOT NULL,
                status TEXT NOT NULL,
                payload_json TEXT NOT NULL,
                reprint_count INTEGER NOT NULL DEFAULT 0,
                error_message TEXT,
                updated_at INTEGER NOT NULL
            )
            """.trimIndent()
        )
        db.execSQL("CREATE INDEX IF NOT EXISTS idx_print_jobs_status ON print_jobs(status, updated_at)")
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        onCreate(db)
    }

    fun upsertOutboxRecord(
        id: String,
        companyId: String,
        entityType: String,
        status: String,
        payloadJson: String
    ) {
        val db = writableDatabase
        val values = ContentValues().apply {
            put("id", id)
            put("company_id", companyId)
            put("entity_type", entityType)
            put("status", status)
            put("payload_json", payloadJson)
            put("updated_at", System.currentTimeMillis())
        }
        db.insertWithOnConflict("offline_outbox", null, values, SQLiteDatabase.CONFLICT_REPLACE)
    }

    fun updateOutboxStatus(id: String, status: String, payloadJson: String?) {
        val db = writableDatabase
        val values = ContentValues().apply {
            put("status", status)
            if (!payloadJson.isNullOrEmpty()) {
                put("payload_json", payloadJson)
            }
            put("updated_at", System.currentTimeMillis())
        }
        db.update("offline_outbox", values, "id = ?", arrayOf(id))
    }

    fun getPendingOutboxRecords(companyId: String? = null): List<String> {
        val db = readableDatabase
        val results = mutableListOf<String>()
        val selection = if (!companyId.isNullOrEmpty()) {
            "company_id = ? AND status != 'SYNCED'"
        } else {
            "status != 'SYNCED'"
        }
        val args = if (!companyId.isNullOrEmpty()) arrayOf(companyId) else null

        db.query(
            "offline_outbox",
            arrayOf("payload_json"),
            selection,
            args,
            null,
            null,
            "updated_at ASC"
        ).use { cursor ->
            while (cursor.moveToNext()) {
                results.add(cursor.getString(0))
            }
        }
        return results
    }

    fun upsertPrintJob(
        jobId: String,
        companyId: String,
        status: String,
        payloadJson: String,
        reprintCount: Int = 0,
        errorMessage: String? = null
    ) {
        val db = writableDatabase
        val values = ContentValues().apply {
            put("job_id", jobId)
            put("company_id", companyId)
            put("status", status)
            put("payload_json", payloadJson)
            put("reprint_count", reprintCount)
            put("error_message", errorMessage)
            put("updated_at", System.currentTimeMillis())
        }
        db.insertWithOnConflict("print_jobs", null, values, SQLiteDatabase.CONFLICT_REPLACE)
    }

    fun getPrintJobJson(jobId: String): String? {
        val db = readableDatabase
        db.query(
            "print_jobs",
            arrayOf("payload_json"),
            "job_id = ?",
            arrayOf(jobId),
            null,
            null,
            null
        ).use { cursor ->
            if (cursor.moveToFirst()) {
                return cursor.getString(0)
            }
        }
        return null
    }

    companion object {
        private const val DATABASE_NAME = "salesmanpro_offline_pos.db"
        private const val DATABASE_VERSION = 1
    }
}

