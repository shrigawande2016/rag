import Header from '@/Component/Common/Header'
import React from 'react'

const page = () => {
  return (
    <div className='px-4 md:px-6'>
      <Header
        data={{
          title: 'Settings',
          subtitle: 'Manage your account and preferences.',
          breadcrumbs: [{ label: 'Settings' }],
        }}
      />
    </div>
  )
}

export default page
