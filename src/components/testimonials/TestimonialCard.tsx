import { MediaImage } from "@/components/ui/MediaImage";
import { useLocale, useTranslations } from "next-intl";
import type { Testimonial } from "@/types/testimonial";
import { StarRating } from "@/components/ui/StarRating";

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  const locale = useLocale();
  const t = useTranslations("Testimonials");
  const isArabic = locale === "ar";
  const content = isArabic ? testimonial.content_ar : testimonial.content_en;
  const customerTitle = isArabic
    ? testimonial.customer_title_ar
    : testimonial.customer_title_en;
  const avatar =
    testimonial.avatar_image;

  return (
    <figure className="flex h-full flex-col justify-between rounded-2xl border border-sand-200 p-6">
      <blockquote className="text-sm leading-6 text-sand-700">&ldquo;{content}&rdquo;</blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <MediaImage
          src={avatar}
          alt={testimonial.customer_name}
          width={40}
          height={40}
          className="rounded-full object-cover"
        />
        <div>
          <p className="text-sm font-semibold text-navy-900">{testimonial.customer_name}</p>
          {customerTitle ? <p className="text-xs text-sand-500">{customerTitle}</p> : null}
          <StarRating
            value={testimonial.rating}
            label={t("ratingLabel", { rating: testimonial.rating })}
            className="text-sm"
          />
        </div>
      </figcaption>
    </figure>
  );
}
