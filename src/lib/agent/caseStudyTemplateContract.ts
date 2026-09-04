/**
 * The slot contract for the (single, fixed) case-study page layout. This is
 * the `{{TEMPLATE_CONTRACT}}` the `layout-binding:case-study` prompt binds a
 * storyline into. Slot ids are used verbatim as the output JSON's keys, and
 * each slot's `phase` is what lets the binding agent route a phase-tagged
 * chunk into the right slot (RULE 12a).
 *
 * "company" is deliberately NOT included here — it describes Warp Drive
 * itself, not anything in the customer's case-study document, so it's never
 * something the layout-binding agent should derive from the storyline. See
 * CASE_STUDY_COMPANY_SLOT below, which bindCaseStudyLayout.ts merges into the
 * final result directly in code instead.
 */
export const CASE_STUDY_TEMPLATE_CONTRACT_ID = "case-study-fixed-v2";

export const CASE_STUDY_TEMPLATE_CONTRACT = {
  templateId: CASE_STUDY_TEMPLATE_CONTRACT_ID,
  voice: "Clear, confident, third-person business narrative. No hype, no second-person address.",
  slots: [
    {
      id: "domain",
      type: "single",
      phase: "domain",
      fields: [{ name: "body", maxChars: 400 }],
    },
    {
      id: "customer",
      type: "single",
      phase: "customer",
      fields: [{ name: "body", maxChars: 500 }],
    },
    {
      id: "problem",
      type: "list",
      phase: "problem",
      // No fixed count: a dense document (e.g. a 50-slide deck with its own
      // challenge/solution/impact per slide) should keep every scenario, not
      // get trimmed down to a small fixed number. max is a generous ceiling,
      // not a target.
      min: 1,
      max: 50,
      fields: [
        { name: "title", maxChars: 60 },
        { name: "body", maxChars: 400 },
      ],
    },
    {
      id: "solution",
      type: "list",
      phase: "solution",
      min: 1,
      max: 50,
      fields: [
        { name: "title", maxChars: 60 },
        { name: "body", maxChars: 400 },
        { name: "emphasis", maxChars: 6 },
      ],
    },
    {
      id: "impact",
      type: "list",
      phase: "impact",
      min: 1,
      max: 50,
      fields: [
        { name: "title", maxChars: 60 },
        { name: "body", maxChars: 400 },
        { name: "evidenceGrade", maxChars: 20 },
      ],
    },
  ],
} as const;

/**
 * Fixed "Company" section content — injected directly, never run through the
 * layout-binding LLM call. Sourced from warpdrivetech.in (home + about pages)
 * on 2026-09-03; update this constant (not a prompt) if that changes.
 */
export const CASE_STUDY_COMPANY_SLOT = {
  name: "Warp Drive Tech Works",
  body: "Warp Drive Tech Works is a Salesforce Summit (Platinum) Partner delivering Salesforce implementation and consulting services, positioned as a trusted CRM partner for the Agentic Era. Founded in 2016, the company has grown to more than 400 employees serving 200+ enterprise clients across 9 countries — including HDFC Bank, Razorpay, Flipkart, and Apollo Hospitals — spanning Financial Services, Manufacturing, Healthcare & Pharma, Retail & CPG, Technology & EdTech, and Real Estate. Warp Drive delivers Salesforce-first, AI-ready implementations across Sales Cloud, Service Cloud, and Revenue Cloud, building AI solutions on Agentforce, Einstein, OpenAI, and Claude, backed by outcomes-based, fixed-fee contracts with a contractual zero-cost-overrun guarantee.",
} as const;
