import { Banner } from './Banner';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Banner> = {
  title: 'Atoms/Banner',
  component: Banner,
  argTypes: {
    severity: {
      control: 'select',
      options: ['error', 'warning', 'info', 'success'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Banner>;

export const Default: Story = {
  args: {
    severity: 'info',
    children: 'This is an informational banner.',
  },
};

export const Error: Story = {
  args: {
    severity: 'error',
    children: 'This is an error banner.',
  },
};

export const Success: Story = {
  args: {
    severity: 'success',
    children: 'This is a success banner.',
  },
};

export const Warning: Story = {
  args: {
    severity: 'warning',
    children: 'This is a warning banner.',
  },
};
