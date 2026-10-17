import type { Meta, StoryObj } from "@storybook/react";
import { AspectRatio, type AspectRatioProps } from "./AspectRatio";

const sampleImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 360'%3E%3Crect width='640' height='360' fill='%23dbeafe'/%3E%3Ccircle cx='500' cy='85' r='42' fill='%23fbbf24'/%3E%3Cpath d='M0 280L220 120L400 280L520 190L640 320V360H0Z' fill='%230b4f71'/%3E%3C/svg%3E";

const renderImageFrame = (args: AspectRatioProps) => (
  <AspectRatio {...args} data-testid="aspect-ratio-frame">
    <img src={sampleImage} alt="Abstract blue landscape beneath a yellow sun" />
  </AspectRatio>
);

const meta = {
  title: "Foundations/Layout helpers/Aspect ratio",
  id: "components-layout-aspectratio",
  component: AspectRatio,
  args: {
    ratio: 16 / 9,
    fit: "cover",
  },
  argTypes: {
    ratio: {
      control: { type: "number", min: 0.25, max: 3, step: 0.05 },
    },
    fit: {
      control: "inline-radio",
      options: ["cover", "contain"],
    },
    children: { control: false },
    className: { control: false },
    style: { control: false },
  },
} satisfies Meta<typeof AspectRatio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => renderImageFrame(args),
};

export const SquareContain: Story = {
  args: {
    ratio: 1,
    fit: "contain",
  },
  render: (args) => renderImageFrame(args),
};

export const PortraitCrop: Story = {
  args: {
    ratio: 3 / 4,
    fit: "cover",
  },
  render: (args) => renderImageFrame(args),
};
