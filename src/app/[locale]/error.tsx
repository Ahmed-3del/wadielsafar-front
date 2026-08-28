"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";

/*
 * Route-level boundary for every page under /[locale]. Detail pages rethrow
 * anything that isn't a genuine 404 (see lib/api/fetch-detail.ts), so an API
 * outage lands here with a retry rather than a "page not found" that offers the
 * visitor no way forward.
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("ErrorPage");

  useEffect(() => {
    // Server-side details are redacted in production, so the digest is the only
    // handle that ties this render to the server log entry.
    console.error("Route error", error.digest ?? error.message);
  }, [error]);

  return (
    <Section>
      <Container className="max-w-xl">
        <ErrorState
          title={t("title")}
          description={t("description")}
          action={
            <Button onClick={reset} size="lg">
              {t("retry")}
            </Button>
          }
        />
      </Container>
    </Section>
  );
}
