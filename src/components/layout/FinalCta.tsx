import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { buttonVariants } from "@/components/ui/Button";

export async function FinalCta() {
  const t = await getTranslations("FinalCta");

  return (
    <Section className="bg-navy-900">
      <Container className="flex flex-col items-center gap-6 text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">{t("title")}</h2>
        <p className="max-w-xl text-lg text-sand-300">{t("description")}</p>
        <Link href="/contact" className={buttonVariants("primary", "lg")}>
          {t("cta")}
        </Link>
      </Container>
    </Section>
  );
}
