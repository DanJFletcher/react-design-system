import { Callout } from "@workspace/design-system";

export default function PreviewFormNotice() {
  return (
    <Callout className="preview-callout" title="Preview form — not connected" tone="info">
      This form is a design preview only. It does not send or store inquiries. Please don’t enter personal or confidential information.
    </Callout>
  );
}
