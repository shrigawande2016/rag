import React from 'react'
import Link from 'next/link'
import { riskFromScore } from '@/lib/risk'

const RISK_STYLES = {
  caution: { icon: '▲', color: 'text-risk-caution-text', label: 'Caution' },
  high: { icon: '◆', color: 'text-purple-600', label: 'High risk' },
  safe: { icon: '●', color: 'text-risk-safe-text', label: 'Safe' },
}

const DocumentHeader = ({
  _id,
  fileName,
  badge,
  fullText,
  status = 'Analyzed',
  analyzing = false,
  risk,
  riskScore,
  deadlineLabel,
  deadlineDate,
  deadlineIn,
}) => {
  const riskType = risk?.type || riskFromScore(riskScore)
  const riskLabel = risk?.label || RISK_STYLES[riskType]?.label
  const riskStyle = riskType ? RISK_STYLES[riskType] : null

  return (
    <Link
      href={`/documents/${_id}`}
      className="bg-white px-5 py-4 rounded-2xl shadow-sm border border-border-faint flex items-center gap-4 mb-3 hover:shadow-md transition-shadow hover:scale-[1.001] cursor-pointer"
    >
      <div className="flex flex-col gap-0.5 min-w-0 flex-2">
        <div className="flex items-center gap-2">
          <h2 className="font-inter text-sm font-semibold text-text-primary truncate">{fileName}</h2>
          <span className="text-[11px] font-semibold text-text-secondary bg-background px-2 py-0.5 rounded-full flex-none">{badge}</span>
        </div>
        <p className="text-[13px] text-text-faint truncate">{fullText}</p>
      </div>

      <div className="flex-1 flex items-center gap-1.5 text-[13px] text-text-faint">
        {analyzing && (
          <span className="w-3 h-3 rounded-full border-2 border-border-strong border-t-transparent animate-spin flex-none" />
        )}
        <span>{status}</span>
      </div>

      <div className="flex-1">
        {riskStyle ? (
          <span className={`flex items-center gap-1.5 text-[13px] font-semibold ${riskStyle.color}`}>
            <span>{riskStyle.icon}</span>
            <span>{riskLabel}</span>
          </span>
        ) : (
          <span className="text-[13px] text-text-faint">—</span>
        )}
      </div>

      <div className="flex-[1.4] flex flex-col gap-0.5">
        {deadlineLabel ? (
          <>
            <span className="text-[13px] font-semibold text-text-primary">{deadlineLabel}</span>
            <span className="text-[12.5px] text-text-faint">{deadlineDate} · in {deadlineIn}</span>
          </>
        ) : (
          <span className="text-[13px] text-text-faint">—</span>
        )}
      </div>

      <svg className="w-4 h-4 text-text-faint flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  )
}

export default DocumentHeader
