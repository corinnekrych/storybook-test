import type { Meta, StoryObj } from '@storybook/react';
import { Organisms } from './organisms';
import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const meta: Meta<typeof Organisms> = {
  component: Organisms,
  title: 'Organisms',
};
export default meta;
type Story = StoryObj<typeof Organisms>;

export const Primary = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/Welcome to Organisms!/gi)).toBeTruthy();
  },
};
