'use client';

import Header from '@/Component/Common/Header'
import Loader from '@/Component/Common/Loader'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

const formatDate = (date) => {
  if (!date) return null
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const formatAmount = (amount) => {
  if (typeof amount !== 'number') return null
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const TodoRow = ({ todo, onToggleComplete, onToggleHighlight, onDelete }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-border-faint p-4 flex items-center gap-3 ${todo.completed ? 'opacity-60' : ''}`}>
    <button
      type="button"
      onClick={() => onToggleComplete(todo)}
      aria-label={todo.completed ? 'Mark incomplete' : 'Mark complete'}
      className={`w-5.5 h-5.5 flex-none rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${
        todo.completed ? 'bg-primary border-primary' : 'border-border-strong hover:border-primary'
      }`}
    >
      {todo.completed && (
        <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>

    <div className="flex-1 min-w-0">
      <div className={`text-[13.5px] font-semibold text-text-primary truncate ${todo.completed ? 'line-through' : ''}`}>
        {todo.title}
      </div>
      <div className="flex items-center gap-1.5 text-[12.5px] text-text-faint">
        {formatDate(todo.dueDate) && <span>{formatDate(todo.dueDate)}</span>}
        {todo.documentId && (
          <>
            {formatDate(todo.dueDate) && <span>&middot;</span>}
            <Link href={`/documents/${todo.documentId}`} className="hover:text-primary underline">
              View document
            </Link>
          </>
        )}
      </div>
    </div>

    {formatAmount(todo.amount) !== null && (
      <span className="text-[13.5px] font-bold text-text-primary flex-none whitespace-nowrap">
        {todo.currency ? `${todo.currency} ` : ''}{formatAmount(todo.amount)}
      </span>
    )}

    <button
      type="button"
      onClick={() => onToggleHighlight(todo)}
      aria-label={todo.highlighted ? 'Remove highlight' : 'Highlight as important'}
      className={`w-7 h-7 flex-none rounded-full flex items-center justify-center cursor-pointer transition-colors ${
        todo.highlighted ? 'text-risk-caution-text bg-risk-caution-bg' : 'text-text-faint hover:bg-background'
      }`}
    >
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill={todo.highlighted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>

    <button
      type="button"
      onClick={() => onDelete(todo)}
      aria-label="Delete task"
      className="w-7 h-7 flex-none rounded-full flex items-center justify-center text-text-faint hover:bg-background hover:text-red-500 cursor-pointer transition-colors"
    >
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  </div>
)

const page = () => {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const res = await fetch('/api/todos')
        const data = await res.json()
        setTodos(res.ok ? data.data : [])
      } catch (err) {
        setTodos([])
      } finally {
        setLoading(false)
      }
    }
    fetchTodos()
  }, [])

  const updateTodo = async (todo, updates) => {
    setTodos((prev) => prev.map((t) => (t._id === todo._id ? { ...t, ...updates } : t)))
    try {
      const res = await fetch(`/api/todos/${todo._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error()
    } catch (err) {
      toast.error('Could not update task')
      setTodos((prev) => prev.map((t) => (t._id === todo._id ? todo : t)))
    }
  }

  const handleDelete = async (todo) => {
    const prev = todos
    setTodos((cur) => cur.filter((t) => t._id !== todo._id))
    try {
      const res = await fetch(`/api/todos/${todo._id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
    } catch (err) {
      toast.error('Could not delete task')
      setTodos(prev)
    }
  }

  const highlighted = todos.filter((t) => t.highlighted && !t.completed)
  const active = todos.filter((t) => !t.completed && !t.highlighted)
  const completed = todos.filter((t) => t.completed)

  return (
    <div className='px-4 md:px-6'>
      <Header
        data={{
          title: 'To-do',
          subtitle: 'Deadlines and payments you\'ve saved from your documents.',
          breadcrumbs: [{ label: 'To-do' }],
        }}
      />

      {loading ? (
        <Loader label="Loading your tasks..." />
      ) : todos.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-border-faint p-8 text-center">
          <p className="text-[14px] text-text-faint">
            Nothing here yet. Add obligations or payments from a document&apos;s detail page.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6 max-w-190">
          {highlighted.length > 0 && (
            <div>
              <h2 className="text-[13px] font-bold text-text-faint tracking-wide uppercase mb-3">Highlighted</h2>
              <div className="flex flex-col gap-2.5">
                {highlighted.map((todo) => (
                  <TodoRow
                    key={todo._id}
                    todo={todo}
                    onToggleComplete={(t) => updateTodo(t, { completed: !t.completed })}
                    onToggleHighlight={(t) => updateTodo(t, { highlighted: !t.highlighted })}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {active.length > 0 && (
            <div>
              <h2 className="text-[13px] font-bold text-text-faint tracking-wide uppercase mb-3">To-do</h2>
              <div className="flex flex-col gap-2.5">
                {active.map((todo) => (
                  <TodoRow
                    key={todo._id}
                    todo={todo}
                    onToggleComplete={(t) => updateTodo(t, { completed: !t.completed })}
                    onToggleHighlight={(t) => updateTodo(t, { highlighted: !t.highlighted })}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {completed.length > 0 && (
            <div>
              <h2 className="text-[13px] font-bold text-text-faint tracking-wide uppercase mb-3">Completed</h2>
              <div className="flex flex-col gap-2.5">
                {completed.map((todo) => (
                  <TodoRow
                    key={todo._id}
                    todo={todo}
                    onToggleComplete={(t) => updateTodo(t, { completed: !t.completed })}
                    onToggleHighlight={(t) => updateTodo(t, { highlighted: !t.highlighted })}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default page
