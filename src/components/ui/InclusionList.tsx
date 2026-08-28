import { CheckIcon } from "./icons";
import { cn } from "@/lib/utils/cn";

/*
 * Renders الخدمات المشمولة, which editors author as free text. Splitting on
 * newlines (and Arabic commas that separate clauses) turns a paragraph into a
 * scannable checklist — travellers compare inclusions, they do not read them.
 */
export function InclusionList({ text, className }: { text: string; className?: string }) {
  const items = text
    .split(/\r?\n|،(?=\s)/)
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);

  if (items.length === 0) return null;

  return (
    <ul className={cn("grid gap-3 sm:grid-cols-2", className)}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-success-50 text-success-600">
            <CheckIcon className="h-3 w-3" />
          </span>
          <span className="text-sm leading-7 text-sand-700">{item}</span>
        </li>
      ))}
    </ul>
  );
}
