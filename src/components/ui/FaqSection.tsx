import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Accordion, type AccordionItem } from "@/components/ui/Accordion";
import { cn } from "@/lib/utils/cn";

interface FaqSectionProps {
  title: string;
  description?: string;
  items: AccordionItem[];
  className?: string;
}

/*
 * Answers the questions that otherwise arrive as a WhatsApp message the sales
 * team has to type out by hand. Every question here is one that was going to
 * be asked anyway; the only thing in question is whether it costs an agent's
 * afternoon.
 */
export function FaqSection({ title, description, items, className }: FaqSectionProps) {
  if (items.length === 0) return null;

  return (
    <Section className={cn(className)}>
      <Container className="max-w-3xl">
        <SectionHeading title={title} description={description} align="center" />
        <Accordion items={items} className="mt-6 sm:mt-10" />
      </Container>
    </Section>
  );
}
