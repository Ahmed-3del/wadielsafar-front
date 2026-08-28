import { cn } from "@/lib/utils/cn";

export interface AccordionItem {
  id: string;
  question: string;
  answer: string;
}

/*
 * Built on native <details>/<summary>: it ships no JavaScript, is keyboard and
 * screen-reader accessible for free, and works before hydration — which matters
 * on an FAQ that search engines and slow connections both need to read.
 */
export function Accordion({ items, className }: { items: AccordionItem[]; className?: string }) {
  return (
    <div className={cn("divide-y divide-sand-200 rounded-2xl border border-sand-200 bg-white", className)}>
      {items.map((item) => (
        <details key={item.id} className="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-navy-900">
            {item.question}
            <span
              aria-hidden="true"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sand-100 text-navy-700 transition-transform duration-300 ease-out-soft group-open:rotate-180"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                <path
                  d="M6 9l6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </summary>
          <p className="mt-3 text-sm leading-7 text-sand-600">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
