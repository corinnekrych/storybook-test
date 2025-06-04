import type { Meta, StoryObj } from '@storybook/react';
import { Templates } from './templates';
import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const meta: Meta<typeof Templates> = {
  component: Templates,
  title: 'Templates',
};
export default meta;
type Story = StoryObj<typeof Templates>;

export const Primary = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/Welcome to Templates!/gi)).toBeTruthy();
  },
};
