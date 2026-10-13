import {
  forwardRef,
  useId,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import { Button } from "../Button/Button";
import { Checkbox } from "../FormControls/Checkbox";
import { TextField } from "../FormControls/TextField";
import styles from "./NewsletterSignup.module.css";

export type NewsletterSignupHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type NewsletterSignupLayout = "inline" | "stacked";
export type NewsletterSignupVariant = "plain" | "surface" | "accent";

export type NewsletterSignupValues = {
  name?: string;
  email: string;
  consent: boolean;
};

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
type SubmissionState = "idle" | "submitting" | "success" | "error";

export type NewsletterSignupProps = Omit<
  ComponentPropsWithRef<"section">,
  "children" | "onSubmit" | "style" | "aria-label" | "aria-labelledby"
> & {
  heading: string;
  description?: ReactNode;
  onSubmit: (values: NewsletterSignupValues) => void | Promise<void>;
  includeName?: boolean;
  requiresConsent?: boolean;
  consentLabel?: ReactNode;
  privacyText?: ReactNode;
  emailLabel?: string;
  emailPlaceholder?: string;
  nameLabel?: string;
  namePlaceholder?: string;
  submitLabel?: string;
  submittingLabel?: string;
  successMessage?: ReactNode;
  errorMessage?: ReactNode;
  headingLevel?: NewsletterSignupHeadingLevel;
  layout?: NewsletterSignupLayout;
  variant?: NewsletterSignupVariant;
  style?: DesignSystemStyle;
};

export const NewsletterSignup = forwardRef<HTMLElement, NewsletterSignupProps>(
  function NewsletterSignup(
    {
      heading,
      description,
      onSubmit,
      includeName = false,
      requiresConsent = false,
      consentLabel = "I agree to receive email updates and understand I can unsubscribe at any time.",
      privacyText,
      emailLabel = "Email address",
      emailPlaceholder = "you@example.com",
      nameLabel = "Name",
      namePlaceholder = "Your name",
      submitLabel = "Subscribe",
      submittingLabel = "Submitting…",
      successMessage = "Thanks for subscribing.",
      errorMessage = "We couldn't subscribe you. Please try again.",
      headingLevel = 2,
      layout = "stacked",
      variant = "plain",
      className,
      style,
      ...sectionProps
    },
    ref,
  ) {
    const generatedId = useId();
    const Heading = `h${headingLevel}` as HeadingTag;
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [consent, setConsent] = useState(false);
    const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
    const isSubmitting = submissionState === "submitting";

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (isSubmitting) return;

      setSubmissionState("submitting");
      try {
        await onSubmit({
          ...(includeName ? { name: name.trim() } : {}),
          email: email.trim(),
          consent,
        });
        setName("");
        setEmail("");
        setConsent(false);
        setSubmissionState("success");
      } catch {
        setSubmissionState("error");
      }
    };

    const clearSubmissionState = () => {
      if (submissionState !== "idle") setSubmissionState("idle");
    };

    return (
      <section
        {...sectionProps}
        ref={ref}
        aria-labelledby={`${generatedId}-heading`}
        className={[styles.newsletter, className].filter(Boolean).join(" ")}
        data-layout={layout}
        data-variant={variant}
        style={style as CSSProperties | undefined}
      >
        <header className={styles.intro}>
          <Heading className={styles.heading} id={`${generatedId}-heading`}>
            {heading}
          </Heading>
          {description != null && <div className={styles.description}>{description}</div>}
        </header>

        <form
          aria-label={`Sign up for ${heading}`}
          aria-busy={isSubmitting || undefined}
          className={styles.form}
          data-layout={layout}
          noValidate={false}
          onSubmit={handleSubmit}
        >
          <div className={styles.fields}>
            {includeName && (
              <TextField
                autoComplete="name"
                disabled={isSubmitting}
                id={`${generatedId}-name`}
                label={nameLabel}
                name="name"
                onChange={(event) => {
                  setName(event.currentTarget.value);
                  clearSubmissionState();
                }}
                placeholder={namePlaceholder}
                value={name}
              />
            )}
            <TextField
              autoComplete="email"
              disabled={isSubmitting}
              id={`${generatedId}-email`}
              label={emailLabel}
              name="email"
              onChange={(event) => {
                setEmail(event.currentTarget.value);
                clearSubmissionState();
              }}
              placeholder={emailPlaceholder}
              required
              type="email"
              value={email}
            />
            <Button
              className={styles.submit}
              disabled={isSubmitting}
              fullWidth={layout === "stacked"}
              loading={isSubmitting}
              type="submit"
            >
              {isSubmitting ? submittingLabel : submitLabel}
            </Button>
          </div>

          {requiresConsent && (
            <div className={styles.consent}>
              <Checkbox
                checked={consent}
                disabled={isSubmitting}
                label={consentLabel}
                name="consent"
                onChange={(event) => {
                  setConsent(event.currentTarget.checked);
                  clearSubmissionState();
                }}
                required
              />
            </div>
          )}

          {privacyText != null && <div className={styles.privacy}>{privacyText}</div>}

          {submissionState === "success" && (
            <p className={[styles.status, styles.success].join(" ")} role="status">
              {successMessage}
            </p>
          )}
          {submissionState === "error" && (
            <p className={[styles.status, styles.error].join(" ")} role="alert">
              {errorMessage}
            </p>
          )}
        </form>
      </section>
    );
  },
);

NewsletterSignup.displayName = "NewsletterSignup";
