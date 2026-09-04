interface CaseStudyLayoutPageProps {
  title: string;
  slots: Record<string, unknown> | null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function asArray(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is Record<string, unknown> => Boolean(asRecord(entry)));
}

function asText(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

/**
 * Renders the output of the `layout-binding:case-study` agent (v2) — a slots
 * object shaped by caseStudyTemplateContract.ts: Company, Domain, Customer,
 * Problem (up to 2 parts), Solution (up to 3 parts), Impact (up to 2 parts).
 * "Company" is fixed content merged in by bindCaseStudyLayout.ts, not derived
 * from the document — see CASE_STUDY_COMPANY_SLOT.
 *
 * Every other section is conditional on its slot actually being non-null:
 * RULE 5 in the binding prompt hides unsupported slots rather than
 * fabricating copy for them, so an absent section here means the source
 * document genuinely had nothing for that phase — not a rendering bug.
 */
export function CaseStudyLayoutPage({ title, slots }: CaseStudyLayoutPageProps) {
  if (!slots) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center text-neutral-500">
        <p>This case study could not be fit into the layout — the storyline or template contract was malformed.</p>
      </div>
    );
  }

  const company = asRecord(slots.company);
  const domain = asRecord(slots.domain);
  const customer = asRecord(slots.customer);
  const problem = asArray(slots.problem);
  const solution = asArray(slots.solution);
  const impact = asArray(slots.impact);

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <header className="mx-auto max-w-3xl px-6 pb-16 pt-24 text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-neutral-400">Case study</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">{title}</h1>
      </header>

      {asText(company?.body) && (
        <section className="mx-auto max-w-2xl border-t border-neutral-100 px-6 py-16">
          <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-400">
            {asText(company?.name) ?? "Company"}
          </h2>
          <p className="mt-4 text-xl leading-relaxed">{asText(company?.body)}</p>
        </section>
      )}

      {asText(domain?.body) && (
        <section className="mx-auto max-w-2xl border-t border-neutral-100 px-6 py-16">
          <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-400">Domain</h2>
          <p className="mt-4 text-xl leading-relaxed">{asText(domain?.body)}</p>
        </section>
      )}

      {asText(customer?.body) && (
        <section className="mx-auto max-w-2xl border-t border-neutral-100 px-6 py-16">
          <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-400">Customer</h2>
          <p className="mt-4 text-xl leading-relaxed">{asText(customer?.body)}</p>
        </section>
      )}

      {problem.length > 0 && (
        <section className="mx-auto max-w-2xl border-t border-neutral-100 px-6 py-16">
          <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-400">Problem</h2>
          <div className="mt-6 flex flex-col gap-6">
            {problem.map((part, index) => (
              <div key={index}>
                {asText(part.title) && <p className="text-lg font-medium">{asText(part.title)}</p>}
                {asText(part.body) && <p className="mt-2 text-xl leading-relaxed">{asText(part.body)}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {solution.length > 0 && (
        <section className="mx-auto max-w-2xl border-t border-neutral-100 px-6 py-16">
          <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-400">Solution</h2>
          <ol className="mt-6 flex flex-col gap-6">
            {solution.map((part, index) => (
              <li key={index} className="border-l-2 border-neutral-200 pl-5">
                <p className="text-xs font-medium text-neutral-400">Part {index + 1}</p>
                {asText(part.title) && <p className="mt-1 text-lg font-medium">{asText(part.title)}</p>}
                {asText(part.body) && <p className="mt-2 text-neutral-700">{asText(part.body)}</p>}
              </li>
            ))}
          </ol>
        </section>
      )}

      {impact.length > 0 && (
        <section className="mx-auto max-w-2xl border-t border-neutral-100 px-6 py-16">
          <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-400">Impact</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {impact.map((part, index) => (
              <div key={index} className="rounded-2xl bg-neutral-50 p-5">
                {asText(part.title) && <p className="font-medium">{asText(part.title)}</p>}
                {asText(part.body) && <p className="mt-2 text-neutral-700">{asText(part.body)}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
