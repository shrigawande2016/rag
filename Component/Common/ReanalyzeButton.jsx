'use client';

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

const ReanalyzeButton = ({ documentId }) => {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleClick = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documentId }),
            })
            const data = await res.json()

            if (!res.ok) {
                toast.error(data.error || 'Re-analysis failed. Please try again.')
                return
            }

            toast.success('Document re-analyzed')
            router.refresh()
        } catch (err) {
            toast.error('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={loading}
            className="text-[13px] font-semibold text-primary hover:text-primary-dark cursor-pointer bg-transparent border-none p-0 disabled:opacity-60 disabled:cursor-not-allowed"
        >
            {loading ? 'Re-analyzing...' : 'Re-analyze'}
        </button>
    )
}

export default ReanalyzeButton
