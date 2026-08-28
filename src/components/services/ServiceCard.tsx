import { Link } from "@/i18n/navigation";

interface ServiceCardProps {
  href: string;
  title: string;
  description: string;
}

export function ServiceCard({ href, title, description }: ServiceCardProps) {
  return (
    <Link
      href={href}
      className="card-lift rounded-2xl border border-sand-200 bg-white p-6"
    >
      <h3 className="text-lg font-semibold text-navy-900">{title}</h3>
      {description ? <p className="mt-2 text-sm text-sand-600">{description}</p> : null}
    </Link>
  );
}
