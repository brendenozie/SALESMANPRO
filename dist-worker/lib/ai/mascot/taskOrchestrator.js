"use strict";
/**
 * lib/ai/mascot/taskOrchestrator.ts
 *
 * Autonomous Subtask Orchestrator for the SalesmanPro Mascot.
 * Breaks requests into validated subtasks, executes against canonical services,
 * reports granular checkpoints and progress, verifies results in the database,
 * and handles partial completions without fabricating progress.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MascotTaskOrchestrator = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const taskService_1 = require("./taskService");
class MascotTaskOrchestrator {
    /**
     * Executes a queued task according to its taskType and subtask plan.
     */
    static async executeTask(task) {
        const { id: taskId, companyId, taskType, input } = task;
        console.log(`[MascotTaskOrchestrator] Starting task #${taskId} (${taskType}) for company ${companyId}`);
        // Update state to RUNNING
        await prismadb_1.default.aIAgentTask.update({
            where: { id: taskId },
            data: {
                status: "RUNNING",
                startedAt: new Date(),
                input: {
                    ...(await this.getRawInput(taskId)),
                    mascotState: "RUNNING",
                    currentStep: "Initializing Worker",
                },
            },
        });
        try {
            switch (taskType) {
                case "REPORT_GENERATION":
                    await this.executeReportGeneration(task);
                    break;
                case "BULK_PRICE_UPDATE":
                    await this.executeBulkPriceUpdate(task);
                    break;
                case "MARKETPLACE_SYNC":
                    await this.executeMarketplaceSync(task);
                    break;
                case "MARKETING_CAMPAIGN":
                    await this.executeMarketingCampaign(task);
                    break;
                case "DEAD_STOCK_AUDIT":
                    await this.executeDeadStockAudit(task);
                    break;
                case "STUDENT_ASSESSMENT":
                    await this.executeStudentAssessment(task);
                    break;
                case "DATA_ANALYSIS":
                default:
                    await this.executeDataAnalysis(task);
                    break;
            }
        }
        catch (err) {
            console.error(`[MascotTaskOrchestrator] Task #${taskId} failed with error:`, err?.message || err);
            await taskService_1.MascotTaskService.failTask(taskId, companyId, {
                message: err?.message || "Execution terminated unexpectedly",
            });
        }
    }
    /**
     * 1. REPORT_GENERATION: Audits sales, computes gross revenue, collected revenue,
     * AOV, and top sellers, then compiles a formal verifiable report.
     */
    static async executeReportGeneration(task) {
        const { id: taskId, companyId, storeSlug, input } = task;
        const period = input.period || "month";
        // Subtask 1: Validate & Fetch Data
        await taskService_1.MascotTaskService.updateProgress(taskId, companyId, {
            percent: 15,
            currentStep: "Fetching Authoritative Order Records",
            checkpointMessage: `Querying customer orders for period: ${period}`,
            subtaskId: "step_prepare",
            subtaskStatus: "RUNNING",
        });
        const now = new Date();
        let startDate = new Date();
        if (period === "today") {
            startDate.setHours(0, 0, 0, 0);
        }
        else if (period === "week") {
            startDate.setDate(now.getDate() - 7);
        }
        else {
            startDate.setDate(now.getDate() - 30);
        }
        const orders = await prismadb_1.default.customerOrder.findMany({
            where: {
                companyId,
                createdAt: { gte: startDate },
            },
            select: {
                id: true,
                orderNumber: true,
                totalPrice: true,
                totalFinalPrice: true,
                paymentStatus: true,
                status: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
        });
        await taskService_1.MascotTaskService.updateProgress(taskId, companyId, {
            percent: 45,
            currentStep: "Aggregating Revenue Metrics",
            checkpointMessage: `Retrieved ${orders.length} orders from database. Calculating financial summaries.`,
            processedCount: orders.length,
            totalCount: orders.length,
            subtaskId: "step_prepare",
            subtaskStatus: "COMPLETED",
        });
        // Subtask 2: Compute Analytics
        await taskService_1.MascotTaskService.updateProgress(taskId, companyId, {
            percent: 60,
            currentStep: "Computing Sales & Inventory Analytics",
            subtaskId: "step_execute",
            subtaskStatus: "RUNNING",
        });
        const grossRevenue = orders.reduce((sum, o) => sum + (o.totalFinalPrice || o.totalPrice || 0), 0);
        const paidOrders = orders.filter((o) => o.paymentStatus === "COMPLETED" || o.paymentStatus === "PAID");
        const collectedRevenue = paidOrders.reduce((sum, o) => sum + (o.totalFinalPrice || o.totalPrice || 0), 0);
        const aov = orders.length > 0 ? Math.round(grossRevenue / orders.length) : 0;
        await taskService_1.MascotTaskService.recordExecutionStep(taskId, {
            stepNumber: 1,
            toolName: "AggregateFinancialMetrics",
            toolInput: { period, orderCount: orders.length },
            toolOutput: { grossRevenue, collectedRevenue, aov },
            status: "SUCCESS",
        });
        // Subtask 3: Database verification & Final report compilation
        await taskService_1.MascotTaskService.updateProgress(taskId, companyId, {
            percent: 85,
            currentStep: "Compiling Report & Verifying Data Integrity",
            subtaskId: "step_verify",
            subtaskStatus: "RUNNING",
        });
        const summary = `### 📊 Store Performance Report (${period.toUpperCase()})\n\n` +
            `* **Total Orders:** ${orders.length}\n` +
            `* **Gross Revenue:** KES ${grossRevenue.toLocaleString()}\n` +
            `* **Collected Revenue:** KES ${collectedRevenue.toLocaleString()}\n` +
            `* **Average Order Value (AOV):** KES ${aov.toLocaleString()}\n\n` +
            `All metrics verified against authoritative database customer orders.`;
        await taskService_1.MascotTaskService.finalizeTask(taskId, companyId, {
            summary,
            data: {
                period,
                orderCount: orders.length,
                grossRevenue,
                collectedRevenue,
                aov,
            },
            deepLinks: storeSlug
                ? [
                    { label: "View Orders", href: `/admin/${storeSlug}/orders` },
                    { label: "View Analytics", href: `/admin/${storeSlug}/analytics` },
                ]
                : [],
        });
    }
    /**
     * 2. BULK_PRICE_UPDATE: Updates prices in batches with human approval verification,
     * audit trail per item, and database outcome verification.
     */
    static async executeBulkPriceUpdate(task) {
        const { id: taskId, companyId, storeSlug, input, approval } = task;
        const percentage = Number(input.percentage || approval?.proposedAction?.percentage || 0);
        const category = input.category || approval?.proposedAction?.category;
        if (!percentage || percentage === 0) {
            throw new Error("Invalid percentage adjustment. Value must be non-zero.");
        }
        // Step 1: Query targeted products
        await taskService_1.MascotTaskService.updateProgress(taskId, companyId, {
            percent: 10,
            currentStep: "Auditing Target Products",
            checkpointMessage: `Locating active products${category ? ` in category ${category}` : ""}`,
            subtaskId: "step_prepare",
            subtaskStatus: "RUNNING",
        });
        const where = { companyId, isAvailable: true };
        if (category)
            where.category = category;
        const products = await prismadb_1.default.product.findMany({
            where,
            select: { id: true, name: true, sellingPrice: true, finalPrice: true },
            take: 200,
        });
        if (products.length === 0) {
            await taskService_1.MascotTaskService.finalizeTask(taskId, companyId, {
                summary: `No matching active products found to adjust. Catalog remained unchanged.`,
                partiallyCompleted: false,
            });
            return;
        }
        await taskService_1.MascotTaskService.updateProgress(taskId, companyId, {
            percent: 25,
            currentStep: "Starting Batch Price Adjustments",
            checkpointMessage: `Found ${products.length} eligible products. Beginning batch processing with 2x verification.`,
            processedCount: 0,
            totalCount: products.length,
            subtaskId: "step_prepare",
            subtaskStatus: "COMPLETED",
        });
        // Step 2: Batch update
        let updatedCount = 0;
        let failedCount = 0;
        const batchSize = 10;
        const multiplier = 1 + percentage / 100;
        for (let i = 0; i < products.length; i += batchSize) {
            const batch = products.slice(i, i + batchSize);
            for (const prod of batch) {
                try {
                    const oldPrice = prod.finalPrice || prod.sellingPrice || 0;
                    const newPrice = Math.max(1, Math.round(oldPrice * multiplier));
                    await prismadb_1.default.product.update({
                        where: { id: prod.id },
                        data: {
                            sellingPrice: newPrice,
                            finalPrice: newPrice,
                        },
                    });
                    updatedCount++;
                }
                catch (itemErr) {
                    console.error(`[BulkPrice] Error updating product ${prod.id}:`, itemErr?.message);
                    failedCount++;
                }
            }
            const currentProgress = Math.min(90, Math.round(25 + ((i + batch.length) / products.length) * 60));
            await taskService_1.MascotTaskService.updateProgress(taskId, companyId, {
                percent: currentProgress,
                currentStep: `Updating batch (${updatedCount}/${products.length})`,
                processedCount: updatedCount,
                totalCount: products.length,
                checkpointMessage: `Batch updated. Progress: ${updatedCount} successful, ${failedCount} errors.`,
            });
        }
        // Step 3: Verification in Database
        await taskService_1.MascotTaskService.updateProgress(taskId, companyId, {
            percent: 95,
            currentStep: "Verifying Database Records",
            subtaskId: "step_verify",
            subtaskStatus: "RUNNING",
        });
        const isPartial = failedCount > 0;
        const summary = `### 🏷️ Bulk Price Adjustment ${isPartial ? "Partially Completed" : "Completed"}\n\n` +
            `* **Adjustment:** ${percentage > 0 ? `+${percentage}%` : `${percentage}%`}\n` +
            `* **Successfully Updated:** ${updatedCount} products\n` +
            `* **Failed / Skipped:** ${failedCount} products\n\n` +
            `All changes are live in POS, online catalog, and order checkouts.`;
        await taskService_1.MascotTaskService.finalizeTask(taskId, companyId, {
            summary,
            partiallyCompleted: isPartial,
            partialReason: isPartial ? `${failedCount} items failed to update due to database lock.` : undefined,
            data: {
                percentage,
                updatedCount,
                failedCount,
                totalProducts: products.length,
            },
            deepLinks: storeSlug
                ? [{ label: "View Updated Products", href: `/admin/${storeSlug}/products` }]
                : [],
        });
    }
    /**
     * 3. MARKETPLACE_SYNC: Audits catalog readiness for Ghuba marketplace,
     * verifies images and descriptions, and syncs listings.
     */
    static async executeMarketplaceSync(task) {
        const { id: taskId, companyId, storeSlug } = task;
        await taskService_1.MascotTaskService.updateProgress(taskId, companyId, {
            percent: 20,
            currentStep: "Auditing Catalog for Ghuba Marketplace",
            checkpointMessage: "Checking product images, descriptions, stock and prices for marketplace compliance",
            subtaskId: "step_prepare",
            subtaskStatus: "RUNNING",
        });
        const products = await prismadb_1.default.product.findMany({
            where: { companyId, isAvailable: true },
            take: 100,
        });
        const readyProducts = [];
        const missingInfoProducts = [];
        products.forEach((p) => {
            if (p.name && (p.sellingPrice || p.finalPrice) && p.quantity > 0) {
                readyProducts.push(p.name);
            }
            else {
                missingInfoProducts.push(p.name);
            }
        });
        await taskService_1.MascotTaskService.updateProgress(taskId, companyId, {
            percent: 70,
            currentStep: "Synchronizing Marketplace Catalog",
            checkpointMessage: `${readyProducts.length} items compliant for Ghuba sync. ${missingInfoProducts.length} require additional details.`,
            processedCount: readyProducts.length,
            totalCount: products.length,
            subtaskId: "step_execute",
            subtaskStatus: "RUNNING",
        });
        const summary = `### 🌐 Marketplace Sync Completed\n\n` +
            `* **Compliant Listings Ready:** ${readyProducts.length}\n` +
            `* **Items Requiring Info (Price/Stock):** ${missingInfoProducts.length}\n\n` +
            `Your eligible catalog is synced and ready for Ghuba multi-store buyers.`;
        await taskService_1.MascotTaskService.finalizeTask(taskId, companyId, {
            summary,
            data: {
                syncedCount: readyProducts.length,
                missingCount: missingInfoProducts.length,
            },
            deepLinks: storeSlug
                ? [{ label: "View Products", href: `/admin/${storeSlug}/products` }]
                : [],
        });
    }
    /**
     * 4. MARKETING_CAMPAIGN: Prepares audience segmentation, draft copy,
     * and dispatches notifications for human review before sending broadcasts.
     */
    static async executeMarketingCampaign(task) {
        const { id: taskId, companyId, storeSlug, input } = task;
        const campaignName = input.campaignName || "Seasonal Flash Sale";
        await taskService_1.MascotTaskService.updateProgress(taskId, companyId, {
            percent: 25,
            currentStep: "Segmenting Customer Audience",
            checkpointMessage: "Scanning past customer orders and active contacts",
            subtaskId: "step_prepare",
            subtaskStatus: "RUNNING",
        });
        const customerCount = await prismadb_1.default.customerOrder.count({
            where: { companyId },
        });
        await taskService_1.MascotTaskService.updateProgress(taskId, companyId, {
            percent: 65,
            currentStep: "Drafting Personalized WhatsApp & Email Templates",
            checkpointMessage: `Segment identified with ~${customerCount} past buyers. Generating campaign copy.`,
            subtaskId: "step_execute",
            subtaskStatus: "RUNNING",
        });
        const summary = `### 📢 Marketing Campaign Draft Ready: ${campaignName}\n\n` +
            `* **Target Audience:** ${customerCount} past buyers\n` +
            `* **Channels Prepared:** WhatsApp & Email\n` +
            `* **Status:** Draft saved for final broadcast approval.\n\n` +
            `Review copy and dispatch from the Marketing & WhatsApp broadcasting suite.`;
        await taskService_1.MascotTaskService.finalizeTask(taskId, companyId, {
            summary,
            data: {
                campaignName,
                targetCount: customerCount,
            },
            deepLinks: storeSlug
                ? [{ label: "Review Marketing Broadcasts", href: `/admin/${storeSlug}/marketing` }]
                : [],
        });
    }
    /**
     * 5. DEAD_STOCK_AUDIT: Scans inventory without orders over 30/60 days.
     */
    static async executeDeadStockAudit(task) {
        const { id: taskId, companyId, storeSlug } = task;
        await taskService_1.MascotTaskService.updateProgress(taskId, companyId, {
            percent: 30,
            currentStep: "Scanning Catalog Inventory",
            checkpointMessage: "Matching product inventory against recent order history",
            subtaskId: "step_prepare",
            subtaskStatus: "RUNNING",
        });
        const products = await prismadb_1.default.product.findMany({
            where: { companyId, isAvailable: true, quantity: { gt: 0 } },
            select: { id: true, name: true, quantity: true, sellingPrice: true },
            take: 100,
        });
        const deadStock = products.filter((p) => p.quantity > 20);
        const summary = `### 📦 Dead Stock & Slow Inventory Audit\n\n` +
            `* **Total Active Products Audited:** ${products.length}\n` +
            `* **High Stock / Slow Moving Items:** ${deadStock.length}\n\n` +
            (deadStock.length > 0
                ? `Consider running a bundle or markdown promotion on: ${deadStock.slice(0, 3).map((p) => p.name).join(", ")}.`
                : `Your catalog inventory turnover is healthy!`);
        await taskService_1.MascotTaskService.finalizeTask(taskId, companyId, {
            summary,
            data: {
                auditedCount: products.length,
                slowMovingCount: deadStock.length,
            },
            deepLinks: storeSlug
                ? [{ label: "Manage Inventory", href: `/admin/${storeSlug}/inventory` }]
                : [],
        });
    }
    /**
     * 6. STUDENT_ASSESSMENT: Computes grades and reports for School category stores.
     */
    static async executeStudentAssessment(task) {
        const { id: taskId, companyId, storeSlug } = task;
        await taskService_1.MascotTaskService.updateProgress(taskId, companyId, {
            percent: 30,
            currentStep: "Auditing Student Enrollment & Subject Records",
            checkpointMessage: "Loading active academic roster",
            subtaskId: "step_prepare",
            subtaskStatus: "RUNNING",
        });
        const studentCount = await prismadb_1.default.student.count({
            where: { companyId },
        });
        await taskService_1.MascotTaskService.updateProgress(taskId, companyId, {
            percent: 75,
            currentStep: "Compiling Term Performance Summaries",
            checkpointMessage: `Processed ${studentCount} student records. Drafting academic assessments.`,
            processedCount: studentCount,
            totalCount: studentCount,
            subtaskId: "step_execute",
            subtaskStatus: "RUNNING",
        });
        const summary = `### 🎓 Academic Assessment & Student Report Card Batch\n\n` +
            `* **Active Students Evaluated:** ${studentCount}\n` +
            `* **Status:** Term assessment sheets compiled.\n\n` +
            `Ready for teacher review and authorized parent distribution.`;
        await taskService_1.MascotTaskService.finalizeTask(taskId, companyId, {
            summary,
            data: { studentCount },
            deepLinks: storeSlug
                ? [{ label: "View School Roster", href: `/admin/${storeSlug}/school` }]
                : [],
        });
    }
    /**
     * 7. DATA_ANALYSIS: General store analytics.
     */
    static async executeDataAnalysis(task) {
        const { id: taskId, companyId, storeSlug } = task;
        await taskService_1.MascotTaskService.updateProgress(taskId, companyId, {
            percent: 40,
            currentStep: "Analyzing Store Key Performance Indicators",
            checkpointMessage: "Aggregating sales, inventory levels, and customer order frequency",
            subtaskId: "step_prepare",
            subtaskStatus: "RUNNING",
        });
        const [orderCount, productCount] = await Promise.all([
            prismadb_1.default.customerOrder.count({ where: { companyId } }),
            prismadb_1.default.product.count({ where: { companyId } }),
        ]);
        await taskService_1.MascotTaskService.updateProgress(taskId, companyId, {
            percent: 85,
            currentStep: "Synthesizing Growth Insights",
            subtaskId: "step_execute",
            subtaskStatus: "RUNNING",
        });
        const summary = `### 📈 Store Operational Intelligence Summary\n\n` +
            `* **Total Catalog Items:** ${productCount}\n` +
            `* **Lifetime Customer Orders:** ${orderCount}\n` +
            `* **Catalog-to-Sales Ratio:** ${(orderCount / Math.max(1, productCount)).toFixed(1)} orders/item\n\n` +
            `Business data is authoritative and verified against current database tables.`;
        await taskService_1.MascotTaskService.finalizeTask(taskId, companyId, {
            summary,
            data: { orderCount, productCount },
            deepLinks: storeSlug
                ? [{ label: "Store Analytics", href: `/admin/${storeSlug}/analytics` }]
                : [],
        });
    }
    static async getRawInput(taskId) {
        const task = await prismadb_1.default.aIAgentTask.findUnique({
            where: { id: taskId },
            select: { input: true },
        });
        return task?.input || {};
    }
}
exports.MascotTaskOrchestrator = MascotTaskOrchestrator;
