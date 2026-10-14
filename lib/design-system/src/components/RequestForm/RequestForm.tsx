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
import { DateField } from "../FormControls/DateField";
import { FormLayout } from "../FormControls/FormLayout";
import { Select } from "../FormControls/Select";
import { Textarea } from "../FormControls/Textarea";
import { TextField } from "../FormControls/TextField";
import styles from "./RequestForm.module.css";

export type RequestFormType = "quote" | "appointment";
export type RequestFormLayout = "stacked" | "two-column";
export type RequestFormVariant = "plain" | "surface" | "accent";
export type RequestFormHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type RequestFormServiceOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type RequestFormValues = {
  requestType: RequestFormType;
  name: string;
  email: string;
  phone?: string;
  service?: string;
  message?: string;
  preferredDate?: string;
  preferredTime?: string;
  consent?: boolean;
};

export type RequestFormDefaultValues = Partial<
  Omit<RequestFormValues, "requestType">
>;

type SubmissionState = "idle" | "submitting" | "success" | "error";
type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export type RequestFormProps = Omit<
  ComponentPropsWithRef<"section">,
  | "children"
  | "onSubmit"
  | "style"
  | "aria-label"
  | "aria-labelledby"
> & {
  heading: string;
  description?: ReactNode;
  requestType?: RequestFormType;
  onSubmit: (
    values: RequestFormValues,
    formData: FormData,
  ) => void | Promise<void>;
  defaultValues?: RequestFormDefaultValues;
  serviceOptions?: readonly RequestFormServiceOption[];
  additionalFields?: ReactNode;
  includePhone?: boolean;
  phoneRequired?: boolean;
  includeService?: boolean;
  serviceRequired?: boolean;
  includeMessage?: boolean;
  messageRequired?: boolean;
  includePreferredDate?: boolean;
  preferredDateRequired?: boolean;
  includePreferredTime?: boolean;
  preferredTimeRequired?: boolean;
  includeConsent?: boolean;
  consentLabel?: ReactNode;
  privacyText?: ReactNode;
  nameLabel?: string;
  namePlaceholder?: string;
  emailLabel?: string;
  emailPlaceholder?: string;
  phoneLabel?: string;
  phonePlaceholder?: string;
  serviceLabel?: string;
  servicePlaceholder?: string;
  messageLabel?: string;
  messagePlaceholder?: string;
  preferredDateLabel?: string;
  preferredTimeLabel?: string;
  submitLabel?: string;
  submittingLabel?: string;
  successMessage?: ReactNode;
  errorMessage?: ReactNode;
  resetOnSuccess?: boolean;
  headingLevel?: RequestFormHeadingLevel;
  layout?: RequestFormLayout;
  variant?: RequestFormVariant;
  style?: DesignSystemStyle;
};

type FieldValues = {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  preferredDate: string;
  preferredTime: string;
  consent: boolean;
};

function initialFieldValues(defaultValues?: RequestFormDefaultValues): FieldValues {
  return {
    name: defaultValues?.name ?? "",
    email: defaultValues?.email ?? "",
    phone: defaultValues?.phone ?? "",
    service: defaultValues?.service ?? "",
    message: defaultValues?.message ?? "",
    preferredDate: defaultValues?.preferredDate ?? "",
    preferredTime: defaultValues?.preferredTime ?? "",
    consent: defaultValues?.consent ?? false,
  };
}

function isHeadingLevel(value: number): value is RequestFormHeadingLevel {
  return Number.isInteger(value) && value >= 1 && value <= 6;
}

function validateServiceOptions(
  serviceOptions: readonly RequestFormServiceOption[],
) {
  const values = new Set<string>();
  serviceOptions.forEach((option, index) => {
    if (
      option == null ||
      typeof option.value !== "string" ||
      !option.value.trim() ||
      typeof option.label !== "string" ||
      !option.label.trim()
    ) {
      throw new Error(
        `RequestForm service option at index ${index} requires a non-empty value and label.`,
      );
    }
    if (values.has(option.value)) {
      throw new Error(
        `RequestForm service option value "${option.value}" is duplicated.`,
      );
    }
    values.add(option.value);
  });
}

export const RequestForm = forwardRef<HTMLElement, RequestFormProps>(
  function RequestForm(
    {
      heading,
      description,
      requestType = "quote",
      onSubmit,
      defaultValues,
      serviceOptions = [],
      additionalFields,
      includePhone = true,
      phoneRequired = false,
      includeService = true,
      serviceRequired = true,
      includeMessage = true,
      messageRequired = true,
      includePreferredDate,
      preferredDateRequired = false,
      includePreferredTime,
      preferredTimeRequired = false,
      includeConsent = false,
      consentLabel = "I agree to be contacted about this request.",
      privacyText,
      nameLabel = "Full name",
      namePlaceholder = "Your name",
      emailLabel = "Email address",
      emailPlaceholder = "you@example.com",
      phoneLabel = "Phone number",
      phonePlaceholder = "Your phone number",
      serviceLabel = "Service",
      servicePlaceholder,
      messageLabel = "How can we help?",
      messagePlaceholder = "Tell us a little about your request.",
      preferredDateLabel = "Preferred date",
      preferredTimeLabel = "Preferred time",
      submitLabel,
      submittingLabel = "Sending request…",
      successMessage,
      errorMessage = "We couldn't send your request. Please try again.",
      resetOnSuccess = false,
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
    const [fieldValues, setFieldValues] = useState(() =>
      initialFieldValues(defaultValues),
    );
    const [submissionState, setSubmissionState] =
      useState<SubmissionState>("idle");
    const isSubmitting = submissionState === "submitting";
    const showPreferredDate = includePreferredDate ?? requestType === "appointment";
    const showPreferredTime = includePreferredTime ?? requestType === "appointment";
    const resolvedServicePlaceholder =
      servicePlaceholder ??
      (serviceOptions.length > 0 ? "Choose a service" : "Describe the service");
    const resolvedSubmitLabel =
      submitLabel ??
      (requestType === "appointment"
        ? "Request an appointment"
        : "Request a quote");
    const resolvedSuccessMessage =
      successMessage ??
      (requestType === "appointment"
        ? "Your appointment request has been sent. We'll be in touch to confirm a time."
        : "Your quote request has been sent. We'll be in touch soon.");

    if (typeof heading !== "string" || !heading.trim()) {
      throw new Error("RequestForm requires a non-empty `heading`.");
    }
    if (!isHeadingLevel(headingLevel)) {
      throw new Error("RequestForm `headingLevel` must be an integer from 1 to 6.");
    }
    if (!["quote", "appointment"].includes(requestType)) {
      throw new Error("RequestForm `requestType` must be `quote` or `appointment`.");
    }
    if (!Array.isArray(serviceOptions)) {
      throw new Error("RequestForm `serviceOptions` must be an array.");
    }
    validateServiceOptions(serviceOptions);

    const updateField = <Key extends keyof FieldValues>(
      key: Key,
      value: FieldValues[Key],
    ) => {
      setFieldValues((current) => ({ ...current, [key]: value }));
      setSubmissionState("idle");
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (isSubmitting) return;
      const formData = new FormData(event.currentTarget);
      setSubmissionState("submitting");

      try {
        await onSubmit(
          {
            requestType,
            name: fieldValues.name.trim(),
            email: fieldValues.email.trim(),
            ...(includePhone ? { phone: fieldValues.phone.trim() } : {}),
            ...(includeService ? { service: fieldValues.service.trim() } : {}),
            ...(includeMessage ? { message: fieldValues.message.trim() } : {}),
            ...(showPreferredDate
              ? { preferredDate: fieldValues.preferredDate }
              : {}),
            ...(showPreferredTime
              ? { preferredTime: fieldValues.preferredTime }
              : {}),
            ...(includeConsent ? { consent: fieldValues.consent } : {}),
          },
          formData,
        );
        if (resetOnSuccess) setFieldValues(initialFieldValues(defaultValues));
        setSubmissionState("success");
      } catch {
        setSubmissionState("error");
      }
    };

    return (
      <section
        {...sectionProps}
        ref={ref}
        aria-labelledby={`${generatedId}-heading`}
        className={[styles.requestForm, className].filter(Boolean).join(" ")}
        data-layout={layout}
        data-variant={variant}
        style={style as CSSProperties | undefined}
      >
        <header className={styles.intro}>
          <Heading className={styles.heading} id={`${generatedId}-heading`}>
            {heading}
          </Heading>
          {description != null && (
            <div className={styles.description}>{description}</div>
          )}
        </header>

        <form
          aria-busy={isSubmitting || undefined}
          aria-label={`${heading} request form`}
          className={styles.form}
          onSubmit={handleSubmit}
        >
          <input name="requestType" type="hidden" value={requestType} />

          <FormLayout
            className={styles.fields}
            columns={layout === "two-column" ? 2 : 1}
            gap="md"
          >
            <TextField
              autoComplete="name"
              disabled={isSubmitting}
              id={`${generatedId}-name`}
              label={nameLabel}
              name="name"
              onChange={(event) => updateField("name", event.currentTarget.value)}
              placeholder={namePlaceholder}
              required
              value={fieldValues.name}
            />
            <TextField
              autoComplete="email"
              disabled={isSubmitting}
              id={`${generatedId}-email`}
              label={emailLabel}
              name="email"
              onChange={(event) => updateField("email", event.currentTarget.value)}
              placeholder={emailPlaceholder}
              required
              type="email"
              value={fieldValues.email}
            />
            {includePhone && (
              <TextField
                autoComplete="tel"
                disabled={isSubmitting}
                id={`${generatedId}-phone`}
                label={phoneLabel}
                name="phone"
                onChange={(event) => updateField("phone", event.currentTarget.value)}
                placeholder={phonePlaceholder}
                required={phoneRequired}
                type="tel"
                value={fieldValues.phone}
              />
            )}
            {includeService &&
              (serviceOptions.length > 0 ? (
                <Select
                  disabled={isSubmitting}
                  id={`${generatedId}-service`}
                  label={serviceLabel}
                  name="service"
                  onChange={(event) =>
                    updateField("service", event.currentTarget.value)
                  }
                  required={serviceRequired}
                  value={fieldValues.service}
                >
                  <option disabled hidden value="">
                    {resolvedServicePlaceholder}
                  </option>
                  {serviceOptions.map((option) => (
                    <option
                      disabled={option.disabled}
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </Select>
              ) : (
                <TextField
                  disabled={isSubmitting}
                  id={`${generatedId}-service`}
                  label={serviceLabel}
                  name="service"
                  onChange={(event) =>
                    updateField("service", event.currentTarget.value)
                  }
                  placeholder={resolvedServicePlaceholder}
                  required={serviceRequired}
                  value={fieldValues.service}
                />
              ))}
            {showPreferredDate && (
              <DateField
                disabled={isSubmitting}
                id={`${generatedId}-preferred-date`}
                label={preferredDateLabel}
                name="preferredDate"
                onChange={(event) =>
                  updateField("preferredDate", event.currentTarget.value)
                }
                required={preferredDateRequired}
                type="date"
                value={fieldValues.preferredDate}
              />
            )}
            {showPreferredTime && (
              <DateField
                disabled={isSubmitting}
                id={`${generatedId}-preferred-time`}
                label={preferredTimeLabel}
                name="preferredTime"
                onChange={(event) =>
                  updateField("preferredTime", event.currentTarget.value)
                }
                required={preferredTimeRequired}
                type="time"
                value={fieldValues.preferredTime}
              />
            )}
          </FormLayout>

          {includeMessage && (
            <Textarea
              disabled={isSubmitting}
              id={`${generatedId}-message`}
              label={messageLabel}
              name="message"
              onChange={(event) =>
                updateField("message", event.currentTarget.value)
              }
              placeholder={messagePlaceholder}
              required={messageRequired}
              value={fieldValues.message}
            />
          )}

          {additionalFields != null && (
            <div className={styles.additionalFields}>{additionalFields}</div>
          )}

          {includeConsent && (
            <Checkbox
              checked={fieldValues.consent}
              disabled={isSubmitting}
              label={consentLabel}
              name="consent"
              onChange={(event) =>
                updateField("consent", event.currentTarget.checked)
              }
              required
            />
          )}

          {privacyText != null && (
            <div className={styles.privacy}>{privacyText}</div>
          )}

          <div className={styles.actions}>
            <Button
              disabled={isSubmitting}
              fullWidth={layout === "stacked"}
              loading={isSubmitting}
              type="submit"
            >
              {isSubmitting ? submittingLabel : resolvedSubmitLabel}
            </Button>
          </div>

          {submissionState === "success" && (
            <p className={[styles.status, styles.success].join(" ")} role="status">
              {resolvedSuccessMessage}
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

RequestForm.displayName = "RequestForm";
