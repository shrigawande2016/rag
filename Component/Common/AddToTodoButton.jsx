'use client';

import { useState } from 'react'
import { toast } from 'react-toastify'

const AddToTodoButton = ({ title, dueDate, amount, currency, documentId }) => {
    const [added, setAdded] = useState(false)
    const [highlighted, setHighlighted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [todoId, setTodoId] = useState(null)

    const handleAdd = async () => {
        if (added || loading) return
        setLoading(true)
        try {
            const res = await fetch('/api/todos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, dueDate, amount, currency, documentId }),
            })
            const data = await res.json()

            if (!res.ok) {
                toast.error(data.error || 'Could not add to your to-do list.')
                return
            }

            setAdded(true)
            setTodoId(data.data._id)
            toast.success('Added to your to-do list')
        } catch (err) {
            toast.error('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleToggleHighlight = async () => {
        if (!todoId) return
        const next = !highlighted
        setHighlighted(next)
        try {
            await fetch(`/api/todos/${todoId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ highlighted: next }),
            })
        } catch (err) {
            setHighlighted(!next)
        }
    }

    return (
        <div className="flex items-center gap-1.5 flex-none">
            {added && (
                <button
                    type="button"
                    onClick={handleToggleHighlight}
                    aria-label={highlighted ? 'Remove highlight' : 'Highlight as important'}
                    className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                        highlighted ? 'text-risk-caution-text bg-risk-caution-bg' : 'text-text-faint hover:bg-background'
                    }`}
                >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill={highlighted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            )}
            <button
                type="button"
                onClick={handleAdd}
                disabled={added || loading}
                className={`text-[12px] font-semibold px-2.5 py-1.5 rounded-full flex-none cursor-pointer transition-colors ${
                    added
                        ? 'text-risk-safe-text bg-risk-safe-bg cursor-default'
                        : 'text-primary bg-primary-tint hover:bg-primary hover:text-white disabled:opacity-60'
                }`}
            >
                {added ? 'Added ✓' : loading ? 'Adding...' : '+ To-do'}
            </button>
        </div>
    )
}

export default AddToTodoButton
