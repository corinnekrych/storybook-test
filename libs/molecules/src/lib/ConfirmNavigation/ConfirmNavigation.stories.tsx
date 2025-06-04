import React, { useState } from 'react'
import { createMemoryRouter, RouterProvider, useNavigate } from 'react-router-dom'
import { ConfirmNavigation } from './ConfirmNavigation'
import type { Meta } from '@storybook/react'
import Button from '@mui/material/Button'

const meta: Meta<typeof ConfirmNavigation> = {
  title: 'Molecules/ConfirmNavigation',
  component: ConfirmNavigation,
  argTypes: {
    shouldBlock: { control: 'boolean' },
    title: { control: 'text' },
    content: { control: 'text' },
  },
}

export default meta

const About = () => <div>Other Page</div>

const ContentWithBlocker = ({blocker = false} : {blocker?:boolean}) => {
  const [shouldBlock, setShouldBlock] = useState(blocker);
  const navigate = useNavigate();
  const onClick = () => {
    setShouldBlock(true);
    navigate('/other');
  }
  return (
    <div>
      <Button variant="contained" onClick={onClick}>
        Click here to see navigate away
      </Button>
      <ConfirmNavigation
        title="Leave this page?"
        content="You have unsaved changes. Are you sure you want to leave?"
        shouldBlock={shouldBlock}
      />
    </div>
  )
}

const createRouter = (blocker: boolean) =>
  createMemoryRouter([
    {
      path: '/',
      element: <ContentWithBlocker blocker={blocker} />,
    },
    {
      path: '/other',
      element: <About />,
    },
  ]);

export const ContentWithBlockerStory = () => {
  return <RouterProvider router={createRouter(true)} />;
};

export const ContentWithoutBlockerStory = () => {
  return <RouterProvider router={createRouter(false)} />;
};
