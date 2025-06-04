import { Meta, StoryFn } from '@storybook/react';
import { CircularProgressCenterLoader } from './CircularProgressCenterLoader';
import { CircularProgressProps } from '@mui/material/CircularProgress';

export default {
  title: 'Atoms/CircularProgressCenterLoader',
  component: CircularProgressCenterLoader,
  argTypes: {
    color: {
      control: {
        type: 'select',
        options: ['primary', 'secondary', 'inherit'],
      },
    },
    size: {
      control: {
        type: 'number',
      },
    },
    thickness: {
      control: {
        type: 'number',
      },
    },
  },
} as Meta;

const Template: StoryFn<CircularProgressProps> = (args) => <CircularProgressCenterLoader {...args} />;

export const Default = Template.bind({});
Default.args = {
  color: 'primary',
  size: 40,
  thickness: 3.6,
};

export const Secondary = Template.bind({});
Secondary.args = {
  color: 'secondary',
  size: 50,
  thickness: 4,
};
