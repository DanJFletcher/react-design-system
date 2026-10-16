import { Footer } from "@workspace/design-system";

type SiteFooterProps = { base: string };

export default function SiteFooter({ base }: SiteFooterProps) {
  return (
    <Footer
      className="site-footer"
      variant="plain"
      size="lg"
      headingLevel={4}
      brand={
        <span className="footer-logo-shell">
          <img src={`${base}assets/fletchstack-logo.webp`} alt="FletchStack" width="1024" height="280" />
        </span>
      }
      logoHref={base}
      logoLabel="FletchStack home"
      description="A Canadian software studio for thoughtful products, useful automation, and websites built to do their job."
      linkGroups={[
        {
          id: "explore",
          title: "Explore",
          links: [
            { id: "services", label: "Services", href: `${base}services/` },
            { id: "approach", label: "Approach", href: `${base}approach/` },
            { id: "about", label: "About FletchStack", href: `${base}about/` },
          ],
        },
        {
          id: "contact",
          title: "Get in touch",
          links: [
            { id: "project-inquiry", label: "Project inquiry", href: `${base}contact/` },
            { id: "contact-form", label: "Contact page", href: `${base}contact/#form` },
          ],
        },
      ]}
      copyright={<>© {new Date().getFullYear()} FletchStack</>}
      bottomContent={<span>Software should fit the work—not the other way around.</span>}
    />
  );
}
