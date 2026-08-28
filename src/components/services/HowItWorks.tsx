import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PlaneMarkIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";

export interface HowItWorksStep {
  id: string;
  title: string;
  body: string;
}

interface HowItWorksProps {
  eyebrow?: string;
  title: string;
  description?: string;
  steps: HowItWorksStep[];
  className?: string;
}

/*
 * The site takes enquiries rather than selling seats, so the single biggest
 * question in a visitor's head is "what actually happens after I send this?".
 * Answering it before the form — not after — is what turns a page of fields
 * into a process someone is willing to start.
 *
 * The steps sit on a dashed flight path with a plane at the far end: the
 * arrival is the point being made, and it reuses the brand's own motif rather
 * than a generic row of numbered circles.
 */
/* Static class names: Tailwind scans source text, so a computed
 * `lg:grid-cols-${n}` would never be generated. */
const COLUMNS: Record<number, string> = {
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
};

export function HowItWorks({ eyebrow, title, description, steps, className }: HowItWorksProps) {
  // One row, however many steps: a wrapped final step sits off the end of the
  // flight path and stops reading as part of the sequence.
  const columns = COLUMNS[steps.length] ?? "lg:grid-cols-3";

  return (
    <Section className={cn("bg-sand-50", className)}>
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} description={description} />

        <ol className={cn("relative mt-12 grid gap-10 lg:gap-8", columns)}>
          {/* Flight path. Decorative, and only where there is room to draw it. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-6 hidden border-t-2 border-dashed border-gold-300 lg:block"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-6 hidden h-5 w-5 -translate-y-1/2 text-gold-500 lg:block ltr:right-0 ltr:translate-x-1/2 rtl:left-0 rtl:-translate-x-1/2"
          >
            <PlaneMarkIcon className="h-5 w-5" />
          </span>

          {steps.map((step, index) => (
            <Reveal key={step.id} delay={index * 90}>
              <li className="relative">
                <span className="grid h-12 w-12 place-items-center rounded-full border-2 border-gold-300 bg-white text-lg font-bold text-navy-900 shadow-xs">
                  {index + 1}
                </span>
                <h3 className="mt-5 text-lg font-bold text-navy-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-7 text-sand-600">{step.body}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
