'use client';

import DocumentHeader from '@/Component/Common/DocumentHeader'
import Header from '@/Component/Common/Header'
import Loader from '@/Component/Common/Loader'
import Upload from '@/Component/Common/Upload'
import React, { useEffect, useState } from 'react'



const page = () => {
  const [uploadOpen, setUploadOpen] = useState(false)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await fetch('/api/documents', {
          method: "GET"
        })
        const data = await res.json()

        if (!res.ok) {
          setDocuments([]) // covers both 401 (not logged in) and 404 (no documents yet)
          return
        }
        setDocuments(data.data)

      } catch (err) {
        console.log(err)
        setDocuments([])
      } finally {
        setLoading(false)
      }
    }
    fetchDocuments()
  }, [])


  console.log(documents)
  return (
    <div className='px-4 md:px-6'>
      <div className='flex justify-between items-start'>
        <Header
          data={{
            title: 'Documents',
            subtitle: "Everything you've uploaded, at a glance.",
            breadcrumbs: [{ label: 'Documents' }],
          }}
        />

        <div className="flex items-center gap-2.5 pt-4">
          <span className="flex items-center gap-1.5 text-[13px] font-semibold text-risk-caution-text bg-risk-caution-bg px-3 py-1.5 rounded-full">
            <span>▲</span>
            <span>2 payment issues flagged</span>
          </span>
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="bg-primary hover:bg-primary-dark text-white text-[13.5px] font-semibold px-4 py-2.5 rounded-[10px] cursor-pointer transition-colors"
          >
            Upload document
          </button>
        </div>
      </div>

      {loading ? (
        <Loader label="Loading documents..." />
      ) : (
        <>
          <div className="flex items-center gap-4 px-5 mb-2">
            <span className="flex-2 text-[11px] font-semibold text-text-faint tracking-wide uppercase">Document</span>
            <span className="flex-1 text-[11px] font-semibold text-text-faint tracking-wide uppercase">Status</span>
            <span className="flex-1 text-[11px] font-semibold text-text-faint tracking-wide uppercase">Risk</span>
            <span className="flex-[1.4] text-[11px] font-semibold text-text-faint tracking-wide uppercase">Next deadline</span>
            <span className="w-4" />
          </div>

          {documents.map((doc) => (
            <DocumentHeader key={doc._id} {...doc} />
          ))}
        </>
      )}

      <Upload open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </div>
  )
}

export default page
