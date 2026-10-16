import { ServicesSection } from "@workspace/design-system";

type HomeServicesProps = { base: string };

export default function HomeServices({ base }: HomeServicesProps) {
  return (
    <ServicesSection
      className="home-services"
      eyebrow="What we make"
      heading="Software is only useful when it fits."
      description="We work across the stack, choosing the right shape for the problem—not pushing every idea into the same template."
      columns={2}
      variant="plain"
      cardVariant="surface"
      cardSize="lg"
      cardShape="rounded"
      items={[
        {
          id: "custom-applications",
          eyebrow: "01 / APPLICATIONS",
          icon: "↗",
          title: "Custom software & web apps",
          description: "Purpose-built tools that bring your workflows, data, and people into one coherent place.",
          link: { href: `${base}services/#custom-software`, label: "Explore custom software →" },
        },
        {
          id: "ai-automation",
          eyebrow: "02 / INTELLIGENCE",
          icon: "⌘",
          title: "AI, automation & integrations",
          description: "Connect systems and automate the repetitive parts, with AI where it can make a practical difference.",
          link: { href: `${base}services/#ai-automation`, label: "Explore AI & automation →" },
        },
        {
          id: "digital-products",
          eyebrow: "03 / PRODUCTS",
          icon: "◫",
          title: "SaaS & consumer products",
          description: "From first product thinking to a dependable digital product people can use and grow with.",
          link: { href: `${base}services/#digital-products`, label: "Explore digital products →" },
        },
        {
          id: "business-websites",
          eyebrow: "04 / WEB PRESENCE",
          icon: "⌁",
          title: "Websites for small business",
          description: "Professional, clear websites that explain what you do and make the next step obvious.",
          link: { href: `${base}services/#business-websites`, label: "Explore business websites →" },
        },
      ]}
    />
  );
}
