import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import {
  LocationHours,
  type LocationHoursProps,
} from "./LocationHours";

const address = {
  lines: ["214 Queen Street West", "Toronto, ON M5V 1Z4"],
  directionsHref: "https://maps.example.test/directions",
};

const hours = [
  { id: "monday", day: "Monday", hours: "9:00 AM – 5:00 PM" },
  { id: "tuesday", day: "Tuesday", hours: "9:00 AM – 5:00 PM" },
  { id: "wednesday", day: "Wednesday", hours: "9:00 AM – 5:00 PM" },
  { id: "thursday", day: "Thursday", hours: "9:00 AM – 7:00 PM" },
  { id: "friday", day: "Friday", hours: "9:00 AM – 5:00 PM" },
  { id: "saturday", day: "Saturday", hours: "10:00 AM – 3:00 PM" },
  { id: "sunday", day: "Sunday", hours: "Closed" },
];

function MapPreview() {
  return (
    <div
      aria-hidden="true"
      style={{
        display: "grid",
        inlineSize: "100%",
        blockSize: "100%",
        placeItems: "center",
        backgroundColor: "var(--ds-color-surface-secondary)",
        backgroundImage:
          "linear-gradient(34deg, transparent 43%, var(--ds-color-border-control) 44%, var(--ds-color-border-control) 47%, transparent 48%), linear-gradient(120deg, transparent 38%, var(--ds-color-border-control) 39%, var(--ds-color-border-control) 42%, transparent 43%), linear-gradient(90deg, transparent 48%, var(--ds-color-border-control) 49%, var(--ds-color-border-control) 52%, transparent 53%)",
      }}
    >
      <span
        style={{
          padding: "var(--ds-space-2) var(--ds-space-3)",
          border: "var(--ds-border-width-default) solid var(--ds-color-border-control)",
          borderRadius: "var(--ds-radius-control)",
          background: "var(--ds-color-surface-primary)",
          color: "var(--ds-color-text-primary)",
          fontFamily: "var(--ds-font-family-sans)",
          fontSize: "var(--ds-font-size-sm)",
          fontWeight: "var(--ds-font-weight-semibold)",
        }}
      >
        Map preview
      </span>
    </div>
  );
}

const meta = {
  title: "Components/Location & Hours",
  component: LocationHours,
  args: {
    heading: "Visit Harbor & Pine Studio",
    description:
      "Stop by our neighborhood studio or call to plan your visit.",
    address,
    phone: {
      label: "Call",
      value: "(416) 555-0148",
      href: "tel:+14165550148",
    },
    hours,
    variant: "surface",
    layout: "split",
    mapPosition: "end",
    headingLevel: 2,
  },
  argTypes: {
    heading: { control: "text" },
    description: { control: "text" },
    address: { control: "object" },
    phone: { control: "object" },
    hours: { control: "object" },
    map: { control: false },
    mapLabel: { control: "text" },
    addressHeading: { control: "text" },
    contactHeading: { control: "text" },
    hoursHeading: { control: "text" },
    headingLevel: { control: "select", options: [1, 2, 3, 4, 5, 6] },
    layout: { control: "inline-radio", options: ["split", "stacked"] },
    mapPosition: { control: "inline-radio", options: ["start", "end"] },
    variant: { control: "inline-radio", options: ["plain", "surface", "accent"] },
    className: { control: false },
    style: { control: false },
  },
  render: (args) => <LocationHours {...args} map={<MapPreview />} />,
} satisfies Meta<typeof LocationHours>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const section = canvas.getByRole("region", {
      name: "Visit Harbor & Pine Studio",
    });
    await expect(section).toBeVisible();
    await expect(
      within(section).getByRole("link", { name: "(416) 555-0148" }),
    ).toHaveAttribute("href", "tel:+14165550148");
    await expect(
      within(section).getByRole("link", { name: "Get directions" }),
    ).toHaveAttribute("href", address.directionsHref);
    await expect(
      canvas.getByRole("complementary", {
        name: "Map showing the location",
      }),
    ).toBeVisible();
  },
};

export const DetailsOnly: Story = {
  render: (args) => <LocationHours {...args} />,
};

export const MapOnTheLeft: Story = {
  args: {
    mapPosition: "start",
  },
};

export const StackedLayout: Story = {
  args: {
    layout: "stacked",
  },
};

export const ThemeCoverage: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-5)" }}>
      {(["acme", "luna", "orchid", "atom"] as const).map((theme) => (
        <section
          key={theme}
          aria-label={`${theme} theme`}
          data-ds-theme={theme}
          style={{
            padding: "var(--ds-space-4)",
            backgroundColor: "var(--ds-color-canvas)",
          }}
        >
          <LocationHours
            address={address}
            description={`Find our studio and check the ${theme} theme location details.`}
            heading={`${theme.toUpperCase()} studio`}
            hours={hours}
            mapLabel={`${theme.toUpperCase()} location map`}
            map={<MapPreview />}
            phone={{
              label: "Call",
              value: "(416) 555-0148",
              href: "tel:+14165550148",
            }}
            variant="surface"
          />
        </section>
      ))}
    </div>
  ),
};

export const LongLocationDetails: Story = {
  render: (args: LocationHoursProps) => (
    <div style={{ inlineSize: "22rem" }}>
      <LocationHours
        {...args}
        address={{
          lines: [
            "Suite 204, 38 Old Mill Road, North Building",
            "North York, Ontario, M2N 7C3",
          ],
          directionsHref: "https://maps.example.test/directions",
        }}
        heading="Visit the Harbor & Pine team"
        phone={{
          label: "Call our customer service team",
          value: "+1 (416) 555-0148 ext. 204",
          href: "tel:+14165550148,204",
        }}
        map={<MapPreview />}
      />
    </div>
  ),
};
