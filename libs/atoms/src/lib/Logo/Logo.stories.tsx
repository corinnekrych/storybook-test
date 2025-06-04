import { Logo } from './Logo';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Logo> = {
  title: 'Atoms/Logo',
  component: Logo,
  argTypes: {
    variant: {
      control: 'select',
      options: ['brandmark', 'lockup'],
    },
    color: { control: 'color' },
    width: { control: 'number' },
    height: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof Logo>;

const Template: Story = {
  render: (args) => <Logo {...args} />,
};

export const Brandmark: Story = {
  ...Template,
  args: {
    variant: 'brandmark',
    color: '#000',
    width: 64,
    height: 64,
  },
};

export const Lockup: Story = {
  ...Template,
  args: {
    variant: 'lockup',
    color: '#000',
    width: 128,
    height: 32,
  },
};
