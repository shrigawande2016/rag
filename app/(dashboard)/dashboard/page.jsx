import Header from '@/Component/Common/Header'
import React from 'react'

const page = () => {
  return (
    <div className='px-4 md:px-6'>
      <Header
        data={{
          title: 'Dashboard',
          subtitle: 'Overview of your documents and deadlines.',
          breadcrumbs: [{ label: 'Dashboard' }],
        }}
      />
    </div>
  )
}

export default page
