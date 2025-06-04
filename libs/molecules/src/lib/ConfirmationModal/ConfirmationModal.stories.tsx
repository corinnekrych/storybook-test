// libs/molecules/src/lib/ConfirmationModal/ConfirmationModal.stories.tsx
import { Meta, StoryFn } from '@storybook/react';
import { ConfirmationModal } from './ConfirmationModal';
import type { IConfirmationModalProps } from './types';

export default {
  title: 'Molecules/ConfirmationModal',
  component: ConfirmationModal.Modal,
  subcomponents: {
    Title: ConfirmationModal.Title,
    Content: ConfirmationModal.Content,
    ContentText: ConfirmationModal.ContentText,
    Actions: ConfirmationModal.Actions,
    ActionItem: ConfirmationModal.ActionItem,
  },
  argTypes: {
    open: { control: 'boolean' },
    onClose: { action: 'onClose' },
  },
} as Meta;

const Template: StoryFn<IConfirmationModalProps> = (args) => (
  <ConfirmationModal.Modal {...args}>
    <ConfirmationModal.Title>Confirm Action</ConfirmationModal.Title>
    <ConfirmationModal.Content>
      <ConfirmationModal.ContentText>
        Are you sure you want to proceed with this action? This action cannot be undone.
      </ConfirmationModal.ContentText>
    </ConfirmationModal.Content>
    <ConfirmationModal.Actions>
      <ConfirmationModal.ActionItem variant="contained" color="primary" onClick={() => alert('Confirmed')}>
        Confirm
      </ConfirmationModal.ActionItem>
      <ConfirmationModal.ActionItem variant="outlined" color="secondary" onClick={args.onClose}>
        Cancel
      </ConfirmationModal.ActionItem>
    </ConfirmationModal.Actions>
  </ConfirmationModal.Modal>
);

export const Default = Template.bind({});
Default.args = {
  open: true,
};
