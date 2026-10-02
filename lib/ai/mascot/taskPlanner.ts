/**
 * lib/ai/mascot/taskPlanner.ts
 *
 * Natural Language Task Planner & Intent Parser for SalesmanPro AI Mascot.
 * Maps user queries into authorized business actions, prevents hallucinated APIs,
 * isolates tenant scope, and generates structured execution plans.
 */

import { MascotContext, MascotCapability, MascotActionCard } from "./types";
import { MascotCapabilityRegistry } from "./capabilityRegistry";

export interface ParsedMascotIntent {
  intent: string;
  capabilityId: string;
  capability: MascotCapability;
  entities: Record<string, any>;
  actionType: "READ" | "PREPARE" | "EXECUTE";
  requiresApproval: boolean;
  creditCost: number;
  explanation: string;
  actionCard?: MascotActionCard;
}

export class MascotTaskPlanner {
  /**
   * Parses natural language query within the active user and tenant context.
   */
  public static async planTask(
    userPrompt: string,
    context: MascotContext,
    authorizedCaps: MascotCapability[],
  ): Promise<ParsedMascotIntent> {
    const promptLower = (userPrompt || "").trim().toLowerCase();

    // 1. Module Availability Guard:
    // If user asks for features that do not belong to their category (e.g. school asking for Ghuba)
    if (promptLower.includes("ghuba") || promptLower.includes("marketplace")) {
      const isMarketplacePermitted = authorizedCaps.some((c) => c.module === "marketplace");
      if (!isMarketplacePermitted) {
        throw new Error(
          `Marketplace integration is not enabled for '${context.storeCategory}'. Your current business profile does not support this module.`,
        );
      }
    }

    if (promptLower.includes("grade") || promptLower.includes("student") || promptLower.includes("exam")) {
      const isEducationPermitted = authorizedCaps.some((c) => c.module === "education");
      if (!isEducationPermitted) {
        throw new Error(
          `Academic and student records are only available for School & Educational institutions. Your store category is '${context.storeCategory}'.`,
        );
      }
    }

    // 2. Intent matching logic across registered capabilities
    // --- INTENT A: Check Inventory / Low Stock ---
    if (
      promptLower.includes("low stock") ||
      promptLower.includes("low in stock") ||
      /low\s+(?:in\s+)?stock/.test(promptLower) ||
      promptLower.includes("restock") ||
      promptLower.includes("stock level") ||
      promptLower.includes("out of stock") ||
      (promptLower.includes("inventory") && (promptLower.includes("what") || promptLower.includes("show") || promptLower.includes("check")))
    ) {
      const cap = this.findAuthorizedCap(authorizedCaps, "inventory:check_stock_levels");
      return {
        intent: "check_stock_levels",
        capabilityId: cap.id,
        capability: cap,
        entities: { threshold: 5 },
        actionType: "READ",
        requiresApproval: false,
        creditCost: cap.creditCost,
        explanation: "Audit store inventory to find items below reorder threshold or out of stock.",
      };
    }

    // --- INTENT B: Business Performance / Sales Report ---
    if (
      promptLower.includes("perform") ||
      promptLower.includes("performance") ||
      promptLower.includes("sales report") ||
      promptLower.includes("how much did we sell") ||
      promptLower.includes("revenue") ||
      promptLower.includes("profit")
    ) {
      const cap = this.findAuthorizedCap(authorizedCaps, "finance:view_business_report");
      const isMonth = promptLower.includes("month");
      const isWeek = promptLower.includes("week");
      const isToday = promptLower.includes("today");
      const period = isMonth ? "month" : isWeek ? "week" : isToday ? "today" : "month";

      return {
        intent: "view_business_report",
        capabilityId: cap.id,
        capability: cap,
        entities: { period },
        actionType: "READ",
        requiresApproval: false,
        creditCost: cap.creditCost,
        explanation: `Analyze authoritative sales revenue, gross margin, and volume trends for this ${period}.`,
      };
    }

    // --- INTENT C: Today's Orders / Order Status ---
    if (
      promptLower.includes("order") &&
      (promptLower.includes("today") || promptLower.includes("pending") || promptLower.includes("delayed") || promptLower.includes("show") || promptLower.includes("status"))
    ) {
      const cap = this.findAuthorizedCap(authorizedCaps, "orders:view_orders");
      return {
        intent: "view_orders",
        capabilityId: cap.id,
        capability: cap,
        entities: { status: promptLower.includes("pending") ? "PENDING" : "ALL" },
        actionType: "READ",
        requiresApproval: false,
        creditCost: cap.creditCost,
        explanation: "Inspect recent customer orders, fulfillment statuses, and dispatch progress.",
      };
    }

    // --- INTENT D: Bulk Price Adjustment (Strict Approval Required) ---
    if (
      (promptLower.includes("increase") || promptLower.includes("decrease") || promptLower.includes("discount") || promptLower.includes("change price")) &&
      (promptLower.includes("%") || promptLower.includes("percent"))
    ) {
      const cap = this.findAuthorizedCap(authorizedCaps, "pricing:bulk_price_adjustment");
      const pctMatch = promptLower.match(/(\d+(\.\d+)?)\s*%/);
      const percentage = pctMatch ? parseFloat(pctMatch[1]) : 5;
      const isIncrease = !promptLower.includes("decrease") && !promptLower.includes("discount");

      // Extract target category or products
      let categoryTarget = "all";
      const catMatch = promptLower.match(/(?:in|for)\s+(?:the\s+)?([a-z\s]+?)\s+(?:category|products)/i);
      if (catMatch && catMatch[1]) {
        categoryTarget = catMatch[1].trim();
      }

      const actionCard: MascotActionCard = {
        id: `card_${Date.now()}`,
        capabilityId: cap.id,
        title: `Bulk Price Adjustment: ${isIncrease ? "+" : "-"}${percentage}%`,
        description: `Apply a ${percentage}% ${isIncrease ? "increase" : "discount"} across ${categoryTarget} products.`,
        riskLevel: "FINANCIAL",
        requiresApproval: true,
        status: "pending_approval",
        payload: {
          percentage: isIncrease ? percentage : -percentage,
          categoryTarget,
        },
      };

      return {
        intent: "bulk_price_adjustment",
        capabilityId: cap.id,
        capability: cap,
        entities: { percentage, isIncrease, categoryTarget },
        actionType: "EXECUTE",
        requiresApproval: true,
        creditCost: cap.creditCost,
        explanation: `Calculate financial impact and prepare a ${percentage}% price change ticket requiring authorization.`,
        actionCard,
      };
    }

    // --- INTENT E: Create Product ---
    if (
      (promptLower.includes("add") || promptLower.includes("create") || promptLower.includes("new")) &&
      promptLower.includes("product")
    ) {
      const cap = this.findAuthorizedCap(authorizedCaps, "products:create_product");
      
      // Extract product name and price
      let productName = "New Product";
      let price = 0;

      const nameMatch = userPrompt.match(/(?:called|named|product)\s+([A-Za-z0-9\s\-]+?)(?:\s+for|\s+at|\s+costing|$)/i);
      if (nameMatch && nameMatch[1]) {
        productName = nameMatch[1].trim();
      }

      const priceMatch = userPrompt.match(/(?:for|at|kes|ksh|\$)\s*([\d,]+(?:\.\d+)?)/i);
      if (priceMatch && priceMatch[1]) {
        price = parseFloat(priceMatch[1].replace(/,/g, ""));
      }

      const actionCard: MascotActionCard = {
        id: `card_${Date.now()}`,
        capabilityId: cap.id,
        title: `Create Product: ${productName}`,
        description: `Add '${productName}' to store catalog at KES ${price.toLocaleString()}.`,
        riskLevel: "SAFE_WRITE",
        requiresApproval: false,
        status: "draft",
        payload: {
          name: productName,
          sellingPrice: price,
          quantity: 10,
        },
      };

      return {
        intent: "create_product",
        capabilityId: cap.id,
        capability: cap,
        entities: { productName, price },
        actionType: "EXECUTE",
        requiresApproval: false,
        creditCost: cap.creditCost,
        explanation: `Prepare product record '${productName}' for creation in store catalog.`,
        actionCard,
      };
    }

    // --- INTENT F: Adjust Stock Quantity ---
    if (
      (promptLower.includes("add") || promptLower.includes("increase") || promptLower.includes("restock")) &&
      (promptLower.includes("unit") || promptLower.includes("pieces") || promptLower.includes("items"))
    ) {
      const cap = this.findAuthorizedCap(authorizedCaps, "inventory:adjust_stock_quantity");
      const qtyMatch = userPrompt.match(/(\d+)\s*(?:units|pieces|items)/i);
      const quantity = qtyMatch ? parseInt(qtyMatch[1], 10) : 10;

      let itemQuery = "";
      const itemMatch = userPrompt.match(/(?:units|pieces|items)\s+of\s+([A-Za-z0-9\s\-]+)/i);
      if (itemMatch && itemMatch[1]) {
        itemQuery = itemMatch[1].trim();
      }

      const actionCard: MascotActionCard = {
        id: `card_${Date.now()}`,
        capabilityId: cap.id,
        title: `Restock Inventory: +${quantity} units`,
        description: `Increase on-hand stock for '${itemQuery || "selected item"}' by ${quantity} units.`,
        riskLevel: "SAFE_WRITE",
        requiresApproval: false,
        status: "draft",
        payload: {
          itemQuery,
          quantity,
        },
      };

      return {
        intent: "adjust_stock_quantity",
        capabilityId: cap.id,
        capability: cap,
        entities: { quantity, itemQuery },
        actionType: "EXECUTE",
        requiresApproval: false,
        creditCost: cap.creditCost,
        explanation: `Add ${quantity} units of stock to store inventory.`,
        actionCard,
      };
    }

    // --- INTENT G: Prepare Customer Invoice ---
    if (promptLower.includes("invoice") && (promptLower.includes("prepare") || promptLower.includes("create") || promptLower.includes("draft"))) {
      const cap = this.findAuthorizedCap(authorizedCaps, "finance:prepare_invoice");
      let customerName = "Customer";
      const custMatch = userPrompt.match(/for\s+([A-Za-z\s]+?)(?:\s+for|\s+with|$)/i);
      if (custMatch && custMatch[1]) {
        customerName = custMatch[1].trim();
      }

      return {
        intent: "prepare_invoice",
        capabilityId: cap.id,
        capability: cap,
        entities: { customerName },
        actionType: "PREPARE",
        requiresApproval: false,
        creditCost: cap.creditCost,
        explanation: `Draft formal sales invoice for ${customerName}.`,
      };
    }

    // --- INTENT H: Record Expense ---
    if (promptLower.includes("expense") || (promptLower.includes("record") && (promptLower.includes("bill") || promptLower.includes("paid")))) {
      const cap = this.findAuthorizedCap(authorizedCaps, "finance:record_expense");
      const amountMatch = userPrompt.match(/(?:kes|ksh|\$)?\s*([\d,]+(?:\.\d+)?)/i);
      const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, "")) : 0;

      const actionCard: MascotActionCard = {
        id: `card_${Date.now()}`,
        capabilityId: cap.id,
        title: `Record Expense: KES ${amount.toLocaleString()}`,
        description: `Record operating expense entry of KES ${amount.toLocaleString()} into store accounting.`,
        riskLevel: "FINANCIAL",
        requiresApproval: true,
        status: "pending_approval",
        payload: { amount, description: userPrompt },
      };

      return {
        intent: "record_expense",
        capabilityId: cap.id,
        capability: cap,
        entities: { amount },
        actionType: "EXECUTE",
        requiresApproval: true,
        creditCost: cap.creditCost,
        explanation: `Record financial expense entry of KES ${amount.toLocaleString()}.`,
        actionCard,
      };
    }

    // --- INTENT: Active Agent Tasks Inquiry ---
    if (
      promptLower.includes("working on") ||
      promptLower.includes("active task") ||
      promptLower.includes("what is the agent") ||
      promptLower.includes("current task") ||
      promptLower.includes("background job")
    ) {
      const cap = this.findAuthorizedCap(authorizedCaps, "tasks:query_active_tasks");
      return {
        intent: "query_active_tasks",
        capabilityId: cap.id,
        capability: cap,
        entities: {},
        actionType: "READ",
        requiresApproval: false,
        creditCost: cap.creditCost,
        explanation: "Inspect currently active background tasks and worker progress.",
      };
    }

    // --- INTENT: Pending Approvals Inquiry ---
    if (
      promptLower.includes("waiting for my approval") ||
      promptLower.includes("pending approval") ||
      promptLower.includes("approvals waiting") ||
      promptLower.includes("tasks need approval") ||
      (promptLower.includes("approval") && (promptLower.includes("show") || promptLower.includes("what") || promptLower.includes("which")))
    ) {
      const cap = this.findAuthorizedCap(authorizedCaps, "approvals:query_pending_approvals");
      return {
        intent: "query_pending_approvals",
        capabilityId: cap.id,
        capability: cap,
        entities: {},
        actionType: "READ",
        requiresApproval: false,
        creditCost: cap.creditCost,
        explanation: "Check tasks awaiting human-in-the-loop review and authorization.",
      };
    }

    // --- INTENT: Integrations Overview & Missing Accounts ---
    if (
      promptLower.includes("need connecting") ||
      promptLower.includes("which accounts") ||
      promptLower.includes("connected accounts") ||
      promptLower.includes("integration status") ||
      promptLower.includes("show my integrations") ||
      (promptLower.includes("integration") && (promptLower.includes("what") || promptLower.includes("show") || promptLower.includes("status")))
    ) {
      const cap = this.findAuthorizedCap(authorizedCaps, "integrations:list_connections");
      return {
        intent: "list_connections",
        capabilityId: cap.id,
        capability: cap,
        entities: {},
        actionType: "READ",
        requiresApproval: false,
        creditCost: cap.creditCost,
        explanation: "Inspect active and available account integrations for this store.",
      };
    }

    // --- INTENT: Integration Troubleshooting & Health Check ---
    if (
      ((promptLower.includes("not working") || promptLower.includes("why is")) &&
        (promptLower.includes("facebook") || promptLower.includes("instagram") || promptLower.includes("whatsapp") || promptLower.includes("connection"))) ||
      promptLower.includes("test connection") ||
      promptLower.includes("verify connection") ||
      promptLower.includes("connection health")
    ) {
      const cap = this.findAuthorizedCap(authorizedCaps, "integrations:verify_health");
      const provider = promptLower.includes("facebook")
        ? "facebook"
        : promptLower.includes("instagram")
        ? "instagram"
        : promptLower.includes("whatsapp")
        ? "whatsapp"
        : promptLower.includes("google")
        ? "google"
        : "facebook";

      return {
        intent: "verify_health",
        capabilityId: cap.id,
        capability: cap,
        entities: { provider },
        actionType: "READ",
        requiresApproval: false,
        creditCost: cap.creditCost,
        explanation: `Execute health check probe to diagnose ${provider} connection.`,
      };
    }

    // --- INTENT: Connect Account / Guided Integration Onboarding ---
    if (
      promptLower.includes("connect") ||
      promptLower.includes("link my") ||
      promptLower.includes("set up whatsapp") ||
      promptLower.includes("setup whatsapp") ||
      promptLower.includes("configure payment") ||
      promptLower.includes("connect payment")
    ) {
      const cap = this.findAuthorizedCap(authorizedCaps, "integrations:connect_provider");
      let provider = "facebook";
      if (promptLower.includes("instagram")) provider = "instagram";
      else if (promptLower.includes("whatsapp")) provider = "whatsapp";
      else if (promptLower.includes("google")) provider = "google";
      else if (promptLower.includes("payment") || promptLower.includes("mpesa") || promptLower.includes("daraja")) provider = "mpesa";
      else if (promptLower.includes("stripe")) provider = "stripe";
      else if (promptLower.includes("email")) provider = "email_smtp";

      return {
        intent: "connect_provider",
        capabilityId: cap.id,
        capability: cap,
        entities: { provider },
        actionType: "PREPARE",
        requiresApproval: false,
        creditCost: cap.creditCost,
        explanation: `Initiate guided onboarding workflow for ${provider}.`,
      };
    }

    // --- INTENT I: WhatsApp Customer Message ---
    if (promptLower.includes("whatsapp") || (promptLower.includes("message") && promptLower.includes("customer"))) {
      const isSend = promptLower.includes("send");
      const capId = isSend ? "messaging:send_whatsapp_message" : "messaging:draft_whatsapp_message";
      const cap = this.findAuthorizedCap(authorizedCaps, capId);

      return {
        intent: isSend ? "send_whatsapp_message" : "draft_whatsapp_message",
        capabilityId: cap.id,
        capability: cap,
        entities: { prompt: userPrompt },
        actionType: isSend ? "EXECUTE" : "PREPARE",
        requiresApproval: cap.requiresApproval,
        creditCost: cap.creditCost,
        explanation: isSend ? "Dispatch WhatsApp message to customer." : "Prepare draft WhatsApp communication.",
      };
    }

    // --- INTENT J: Marketing & Social Post ---
    if (promptLower.includes("social") || promptLower.includes("facebook") || promptLower.includes("instagram") || promptLower.includes("post")) {
      const cap = this.findAuthorizedCap(authorizedCaps, "marketing:create_social_post");
      return {
        intent: "create_social_post",
        capabilityId: cap.id,
        capability: cap,
        entities: { topic: userPrompt },
        actionType: "PREPARE",
        requiresApproval: false,
        creditCost: cap.creditCost,
        explanation: "Draft engaging social media post and copy for marketing channels.",
      };
    }

    // --- INTENT K: Marketplace / Ghuba ---
    if (promptLower.includes("ghuba") || promptLower.includes("marketplace")) {
      const isPublish = promptLower.includes("add") || promptLower.includes("publish") || promptLower.includes("list");
      const capId = isPublish ? "marketplace:publish_listings" : "marketplace:view_ghuba_sync_status";
      const cap = this.findAuthorizedCap(authorizedCaps, capId);

      return {
        intent: isPublish ? "publish_listings" : "view_ghuba_sync_status",
        capabilityId: cap.id,
        capability: cap,
        entities: { query: userPrompt },
        actionType: isPublish ? "EXECUTE" : "READ",
        requiresApproval: cap.requiresApproval,
        creditCost: cap.creditCost,
        explanation: isPublish ? "Sync and publish store products to Ghuba marketplace." : "Inspect Ghuba sync status.",
      };
    }

    // --- INTENT L: Education / School Mode ---
    if (promptLower.includes("student") || promptLower.includes("class") || promptLower.includes("grade") || promptLower.includes("report card")) {
      const isReport = promptLower.includes("report") || promptLower.includes("card");
      const capId = isReport ? "education:generate_student_report" : "education:view_student_records";
      const cap = this.findAuthorizedCap(authorizedCaps, capId);

      return {
        intent: isReport ? "generate_student_report" : "view_student_records",
        capabilityId: cap.id,
        capability: cap,
        entities: { query: userPrompt },
        actionType: isReport ? "PREPARE" : "READ",
        requiresApproval: cap.requiresApproval,
        creditCost: cap.creditCost,
        explanation: isReport ? "Generate student academic performance report card." : "Query student roster and academic records.",
      };
    }

    // --- DEFAULT FALLBACK: Catalog Search / Inquire ---
    const defaultCap = this.findAuthorizedCap(authorizedCaps, "products:view_catalog");
    return {
      intent: "general_inquiry",
      capabilityId: defaultCap.id,
      capability: defaultCap,
      entities: { query: userPrompt },
      actionType: "READ",
      requiresApproval: false,
      creditCost: 0.5,
      explanation: "Search store knowledge and catalog to answer user inquiry.",
    };
  }

  private static findAuthorizedCap(
    authorizedCaps: MascotCapability[],
    capabilityId: string,
  ): MascotCapability {
    const found = authorizedCaps.find((c) => c.id === capabilityId);
    if (!found) {
      const capDef = MascotCapabilityRegistry.getCapability(capabilityId);
      const capName = capDef?.name || capabilityId;
      throw new Error(
        `Action '${capName}' is not permitted for your current role or store settings. Please consult your store administrator.`,
      );
    }
    return found;
  }
}
