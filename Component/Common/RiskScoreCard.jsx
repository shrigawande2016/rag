import React from 'react'
import { riskFromScore } from '@/lib/risk'

const STATUS_STYLES = {
  high: { label: 'Needs attention', color: '#7C3AED', text: 'text-purple-700', bg: 'bg-purple-100' },
  caution: { label: 'Some risk', color: '#C2410C', text: 'text-risk-caution-text', bg: 'bg-risk-caution-bg' },
  safe: { label: 'Looks good', color: '#0E7490', text: 'text-risk-safe-text', bg: 'bg-risk-safe-bg' },
}

const CATEGORY_META = {
  financial: { label: 'Financial', barColor: 'bg-risk-caution-text', verb: 'increase your costs.' },
  legal: { label: 'Legal', barColor: 'bg-purple-600', verb: 'create real exposure.' },
  missingProtections: { label: 'Missing protections', barColor: 'bg-text-faint', verb: 'leave gaps in your protection.' },
}

const captionFor = (category, flaggedClauses) => {
  const titles = flaggedClauses
    .filter((c) => c.category === category)
    .map((c) => c.title)

  if (!titles.length) return 'No issues found in this category.'

  const joined = titles.length > 2
    ? `${titles.slice(0, -1).join(', ')}, and ${titles[titles.length - 1]}`
    : titles.join(' and ')

  return `${joined} ${CATEGORY_META[category].verb}`
}

const RiskScoreCard = ({ riskScore, riskBreakdown, flaggedClauses = [] }) => {
  if (typeof riskScore !== 'number' || !riskBreakdown) return null

  const status = riskFromScore(riskScore)
  const statusStyle = STATUS_STYLES[status]
  const degrees = Math.round((riskScore / 100) * 360)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-border-faint p-6 w-full">
      <div className="text-[11px] font-semibold text-text-faint tracking-wide uppercase text-center mb-4">Risk score</div>

      <div className="flex justify-center mb-4">
        <div
          className="w-40 h-40 rounded-full flex items-center justify-center"
          style={{ background: `conic-gradient(${statusStyle.color} ${degrees}deg, #EFEAE4 ${degrees}deg 360deg)` }}
        >
          <div className="w-31 h-31 rounded-full bg-white flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-text-primary font-mono">{riskScore}</span>
            <span className="text-[12px] text-text-faint">out of 100</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center mb-4">
        <span className={`text-[12.5px] font-bold px-3.5 py-1.5 rounded-full ${statusStyle.text} ${statusStyle.bg}`}>
          {statusStyle.label}
        </span>
      </div>

      <p className="text-[13.5px] text-text-secondary text-center leading-relaxed mb-5">
        {flaggedClauses.length === 0
          ? 'No clauses were flagged in this document.'
          : `${flaggedClauses.length} clause${flaggedClauses.length === 1 ? '' : 's'} need${flaggedClauses.length === 1 ? 's' : ''} your attention before you renew.`}
      </p>

      <div className="flex flex-col gap-4">
        {Object.entries(CATEGORY_META).map(([key, meta]) => {
          const value = riskBreakdown[key] || 0
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[13px] font-semibold text-text-primary">{meta.label}</span>
                <span className="text-[12.5px] font-mono text-text-faint">{value} / 100</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-background overflow-hidden mb-1.5">
                <div
                  className={`h-full rounded-full ${meta.barColor}`}
                  style={{ width: `${value}%` }}
                />
              </div>
              <p className="text-[12.5px] text-text-faint leading-relaxed">
                {captionFor(key, flaggedClauses)}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default RiskScoreCard
