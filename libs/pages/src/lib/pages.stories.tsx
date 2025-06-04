import type { Meta, StoryObj } from '@storybook/react';
import { Pages } from './pages';
import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const meta: Meta<typeof Pages> = {
  component: Pages,
  title: 'Pages',
};
export default meta;
type Story = StoryObj<typeof Pages>;

export const Primary = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/Welcome to Pages!/gi)).toBeTruthy();
  },
};
