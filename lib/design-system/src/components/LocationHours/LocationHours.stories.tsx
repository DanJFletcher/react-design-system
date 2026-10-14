import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import {
  LocationHours,
  type LocationHoursProps,
} from "./LocationHours";
import type {
  BusinessHour,
  BusinessHoursException,
} from "../ContactSection/ContactSection";
import { getLocationHoursStatus } from "./locationHoursStatus";

const address = {
  lines: ["214 Queen Street West", "Toronto, ON M5V 1Z4"],
  directionsHref: "https://maps.example.test/directions",
};

const hours = [
  { id: "monday", day: "Monday", dayOfWeek: 1, hours: "9:00 AM – 5:00 PM", intervals: [{ opensAt: "09:00", closesAt: "17:00" }] },
  { id: "tuesday", day: "Tuesday", dayOfWeek: 2, hours: "9:00 AM – 5:00 PM", intervals: [{ opensAt: "09:00", closesAt: "17:00" }] },
  { id: "wednesday", day: "Wednesday", dayOfWeek: 3, hours: "9:00 AM – 5:00 PM", intervals: [{ opensAt: "09:00", closesAt: "17:00" }] },
  { id: "thursday", day: "Thursday", dayOfWeek: 4, hours: "9:00 AM – 7:00 PM", intervals: [{ opensAt: "09:00", closesAt: "19:00" }] },
  { id: "friday", day: "Friday", dayOfWeek: 5, hours: "9:00 AM – 5:00 PM", intervals: [{ opensAt: "09:00", closesAt: "17:00" }] },
  { id: "saturday", day: "Saturday", dayOfWeek: 6, hours: "10:00 AM – 3:00 PM", intervals: [{ opensAt: "10:00", closesAt: "15:00" }] },
  { id: "sunday", day: "Sunday", dayOfWeek: 0, hours: "Closed", intervals: [] },
] satisfies readonly BusinessHour[];

function dateAfter(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

const specialHours = [
  {
    id: "holiday-closure",
    date: dateAfter(31),
    label: "Holiday closure",
    hours: "Closed",
    intervals: [],
  },
  {
    id: "early-close",
    date: dateAfter(30),
    label: "Early close",
    hours: "9:00 AM – 1:00 PM",
    intervals: [{ opensAt: "09:00", closesAt: "13:00" }],
  },
] satisfies readonly BusinessHoursException[];

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
    openStatus: { timeZone: "America/Toronto" },
    timeZone: "America/Toronto",
    specialHours,
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
    openStatus: { control: "object" },
    timeZone: { control: "text" },
    specialHours: { control: "object" },
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
    await expect(canvas.getByRole("status")).toBeVisible();
  },
};

export const OpenStatus: Story = {
  render: (args) => <LocationHours {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByRole("status");
    await expect(status).toBeVisible();

    const openAtMidday = getLocationHoursStatus(
      hours,
      { timeZone: "America/Toronto" },
      new Date("2026-10-14T15:00:00.000Z"),
    );
    await expect(openAtMidday).toEqual({
      state: "open",
      message: "Open now · Closes at 5:00 PM",
    });

    const closedAfterHours = getLocationHoursStatus(
      hours,
      { timeZone: "America/Toronto" },
      new Date("2026-10-14T22:00:00.000Z"),
    );
    await expect(closedAfterHours).toEqual({
      state: "closed",
      message: "Closed · Opens tomorrow at 9:00 AM",
    });

    const overnightHours = hours.map((entry) =>
      entry.dayOfWeek === 1
        ? { ...entry, intervals: [{ opensAt: "22:00", closesAt: "02:00" }] }
        : { ...entry, intervals: [] },
    );
    const openAfterMidnight = getLocationHoursStatus(
      overnightHours,
      { timeZone: "America/Toronto" },
      new Date("2026-10-13T05:00:00.000Z"),
    );
    await expect(openAfterMidnight).toEqual({
      state: "open",
      message: "Open now · Closes at 2:00 AM",
    });

    const sameDayClosure = getLocationHoursStatus(
      hours,
      { timeZone: "America/Toronto" },
      new Date("2026-10-14T15:00:00.000Z"),
      [{
        id: "staff-training",
        date: "2026-10-14",
        label: "Staff training",
        hours: "Closed",
        intervals: [],
      }],
    );
    await expect(sameDayClosure).toEqual({
      state: "closed",
      message: "Closed · Opens tomorrow at 9:00 AM",
    });

    const sameDayScheduleChange = getLocationHoursStatus(
      hours,
      { timeZone: "America/Toronto" },
      new Date("2026-10-14T15:00:00.000Z"),
      [{
        id: "early-closing",
        date: "2026-10-14",
        label: "Early closing",
        hours: "9:00 AM – 1:00 PM",
        intervals: [{ opensAt: "09:00", closesAt: "13:00" }],
      }],
    );
    await expect(sameDayScheduleChange).toEqual({
      state: "open",
      message: "Open now · Closes at 1:00 PM",
    });

    const allClosedHours = hours.map((entry) => ({ ...entry, intervals: [] }));
    const opensForEvent = getLocationHoursStatus(
      allClosedHours,
      { timeZone: "America/Toronto" },
      new Date("2026-10-14T15:00:00.000Z"),
      [{
        id: "community-market",
        date: "2026-10-16",
        label: "Community market",
        hours: "10:00 AM – 2:00 PM",
        intervals: [{ opensAt: "10:00", closesAt: "14:00" }],
      }],
    );
    await expect(opensForEvent).toEqual({
      state: "closed",
      message: "Closed · Opens in 2 days at 10:00 AM",
    });
  },
};

export const SpecialHours: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "Special hours" })).toBeVisible();
    await expect(canvas.getByText("Early close")).toBeVisible();
    await expect(canvas.getByText("Holiday closure")).toBeVisible();
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
      {(["acme", "luna", "orchid", "atom", "sublime"] as const).map((theme) => (
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
