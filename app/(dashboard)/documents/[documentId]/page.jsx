import Link from 'next/link'
import { connectToDatabase } from '@/lib/db'
import Document from '@/models/document'
import ReanalyzeButton from '@/Component/Common/ReanalyzeButton'
import RiskScoreCard from '@/Component/Common/RiskScoreCard'
import DocumentChat from '@/Component/Common/DocumentChat'
import React from 'react'

const FILE_TYPE_LABELS = {
  contract: 'Contract',
  invoice: 'Invoice',
  lease: 'Lease',
  nda: 'NDA',
  other: 'Document',
}

const SEVERITY_STYLES = {
  high: 'text-purple-700 bg-purple-100',
  medium: 'text-risk-caution-text bg-risk-caution-bg',
  low: 'text-risk-safe-text bg-risk-safe-bg',
}

const SEVERITY_LABELS = {
  high: 'High risk',
  medium: 'Medium risk',
  low: 'Low risk',
}

const OBLIGATION_TYPE_LABELS = {
  renewal: 'Renewal',
  expiry: 'Expiry',
  deadline: 'Deadline',
  review: 'Review',
  other: 'Other',
}

const formatDate = (date) => {
  if (!date) return null
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

// currency isn't captured in the schema (documents can be in USD, EUR, GBP, etc.),
// so amounts are shown as plain numbers rather than assuming a currency symbol.
const formatAmount = (amount) => {
  if (typeof amount !== 'number') return null
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const daysUntil = (date) => {
  const ms = new Date(date).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)
  return Math.round(ms / 86400000)
}

const daysUntilLabel = (date) => {
  const days = daysUntil(date)
  if (days === 0) return 'today'
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`
  return `in ${days} day${days === 1 ? '' : 's'}`
}

const buildUpcoming = (doc) => {
  const items = []

  for (const ob of doc.obligations || []) {
    if (ob.date) items.push({ date: ob.date, title: ob.title })
  }
  for (const p of doc.payments || []) {
    if (p.dueDate) items.push({ date: p.dueDate, title: p.description })
  }

  return items.sort((a, b) => new Date(a.date) - new Date(b.date))
}

const timeAgo = (date) => {
  if (!date) return ''
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  for (const [label, secondsInUnit] of units) {
    const count = Math.floor(seconds / secondsInUnit)
    if (count >= 1) return `${count} ${label}${count > 1 ? 's' : ''} ago`
  }
  return 'just now'
}

const page = async ({ params }) => {
  const { documentId } = await params

  await connectToDatabase()
  const doc = await Document.findById(documentId).lean().catch(() => null)

  if (!doc) {
    return (
      <div className='px-4 md:px-6 py-6'>
        <Link href="/documents" className="text-[13px] font-semibold text-text-faint hover:text-primary">
          &larr; All documents
        </Link>
        <h1 className="text-2xl font-bold text-text-primary mt-4">Document not found</h1>
      </div>
    )
  }

  const upcoming = buildUpcoming(doc)
  const hasInvoiceDetails = doc.fileType === 'invoice' && doc.invoiceDetails &&
    Object.values(doc.invoiceDetails).some((v) => v !== null && v !== undefined && v !== '')

  return (
    <div className='px-4 md:px-6 py-6 max-w-350 mx-auto'>
      <Link href="/documents" className="text-[13px] font-semibold text-text-faint hover:text-primary">
        &larr; All documents
      </Link>

      <h1 className="text-2xl font-bold text-text-primary mt-3 mb-1">{doc.fileName}</h1>
      <div className="flex items-center gap-2 mb-6">
        <p className="text-[13.5px] text-text-faint">
          {FILE_TYPE_LABELS[doc.fileType] || 'Document'} &middot; Uploaded {timeAgo(doc.createdAt)}
        </p>
        <span className="text-text-faint">&middot;</span>
        <ReanalyzeButton documentId={doc._id.toString()} />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex-1 min-w-0">
          {upcoming.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-text-primary mb-3">Upcoming for this document</h2>
              <div className="bg-white rounded-2xl shadow-sm border border-border-faint overflow-hidden">
                {upcoming.map((item, i) => (
                  <div
                    key={item.title + i}
                    className={`flex items-center justify-between gap-3 px-5 py-4 ${i > 0 ? 'border-t border-border-faint' : ''}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[13.5px] font-mono font-semibold text-text-primary flex-none">{formatDate(item.date)}</span>
                      <span className="text-[13.5px] text-text-secondary truncate">{item.title}</span>
                    </div>
                    <span className="text-[12px] font-semibold text-primary bg-primary-tint px-2.5 py-1 rounded-full flex-none">
                      {daysUntilLabel(item.date)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {doc.summary && (
            <div className="bg-white rounded-2xl shadow-sm border border-border-faint p-5 mb-6">
              <div className="text-[11px] font-semibold text-text-faint tracking-wide uppercase mb-2">In plain terms</div>
              <p className="text-[14px] text-text-primary leading-relaxed">{doc.summary}</p>
            </div>
          )}

          {doc.flaggedClauses?.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-text-primary">Flagged clauses</h2>
                <span className="text-[13px] text-text-faint">{doc.flaggedClauses.length} to review</span>
              </div>

              <div className="flex flex-col gap-3.5">
                {doc.flaggedClauses.map((clause, i) => (
                  <div key={clause.title + i} className="bg-white rounded-2xl shadow-sm border border-border-faint p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-[15px] font-bold text-text-primary">{clause.title}</h3>
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex-none ${SEVERITY_STYLES[clause.severity] || 'text-text-faint bg-background'}`}>
                        {SEVERITY_LABELS[clause.severity] || clause.severity}
                      </span>
                    </div>
                    <p className="text-[13.5px] text-text-secondary leading-relaxed mb-3">{clause.explanation}</p>
                    {clause.quote && (
                      <div className="bg-background rounded-xl p-3.5">
                        <div className="text-[10.5px] font-semibold text-text-faint tracking-wide uppercase mb-1">From the document</div>
                        <p className="text-[13px] text-text-secondary italic leading-relaxed">&quot;{clause.quote}&quot;</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {doc.obligations?.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-text-primary mb-3">Obligations</h2>

              <div className="flex flex-col gap-2.5">
                {doc.obligations.map((ob, i) => (
                  <div
                    key={ob.title + i}
                    className="bg-white rounded-2xl shadow-sm border border-border-faint p-4 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-[13.5px] font-semibold text-text-primary truncate">{ob.title}</div>
                      {ob.date && (
                        <div className="text-[12.5px] text-text-faint">{formatDate(ob.date)}</div>
                      )}
                    </div>
                    {ob.type && (
                      <span className="text-[11px] font-semibold text-text-secondary bg-background px-2.5 py-1 rounded-full flex-none">
                        {OBLIGATION_TYPE_LABELS[ob.type] || ob.type}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {doc.payments?.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-text-primary mb-3">Payments</h2>

              <div className="flex flex-col gap-2.5">
                {doc.payments.map((p, i) => {
                  const details = [
                    p.invoiceNumber && { label: 'Invoice', value: p.invoiceNumber },
                    p.vendor && { label: 'Vendor', value: p.vendor },
                    p.accountNumber && { label: 'Account', value: p.accountNumber },
                    p.billingPeriod && { label: 'Billing period', value: p.billingPeriod },
                  ].filter(Boolean)

                  return (
                    <div
                      key={p.description + i}
                      className="bg-white rounded-2xl shadow-sm border border-border-faint p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[13.5px] font-semibold text-text-primary truncate">{p.description}</div>
                          <div className="flex items-center gap-1.5 text-[12.5px] text-text-faint">
                            {formatDate(p.dueDate) && <span>Due {formatDate(p.dueDate)}</span>}
                            {p.recurring && (
                              <>
                                {formatDate(p.dueDate) && <span>&middot;</span>}
                                <span>Recurring</span>
                              </>
                            )}
                          </div>
                        </div>
                        {formatAmount(p.amount) !== null && (
                          <span className="text-[14px] font-bold text-text-primary flex-none whitespace-nowrap">
                            {p.currency ? `${p.currency} ` : ''}{formatAmount(p.amount)}
                          </span>
                        )}
                      </div>

                      {details.length > 0 && (
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3 pt-3 border-t border-border-faint">
                          {details.map((d) => (
                            <div key={d.label} className="min-w-0">
                              <div className="text-[10.5px] font-semibold text-text-faint tracking-wide uppercase">{d.label}</div>
                              <div className="text-[12.5px] text-text-secondary truncate">{d.value}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="w-full lg:w-100 flex-none flex flex-col gap-6 lg:sticky lg:top-6">
          {hasInvoiceDetails && (
            <div className="bg-white rounded-2xl shadow-sm border border-border-faint p-5">
              <div className="text-[11px] font-semibold text-text-faint tracking-wide uppercase mb-3">Invoice details</div>
              <div className="flex flex-col gap-2.5">
                {doc.invoiceDetails.invoiceNumber && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[12.5px] text-text-faint">Invoice number</span>
                    <span className="text-[13px] font-semibold text-text-primary">{doc.invoiceDetails.invoiceNumber}</span>
                  </div>
                )}
                {doc.invoiceDetails.invoiceDate && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[12.5px] text-text-faint">Invoice date</span>
                    <span className="text-[13px] font-semibold text-text-primary">{formatDate(doc.invoiceDetails.invoiceDate)}</span>
                  </div>
                )}
                {doc.invoiceDetails.vendor && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[12.5px] text-text-faint">Vendor</span>
                    <span className="text-[13px] font-semibold text-text-primary text-right">{doc.invoiceDetails.vendor}</span>
                  </div>
                )}
                {doc.invoiceDetails.accountNumber && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[12.5px] text-text-faint">Account number</span>
                    <span className="text-[13px] font-semibold text-text-primary">{doc.invoiceDetails.accountNumber}</span>
                  </div>
                )}
                {doc.invoiceDetails.billingPeriod && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[12.5px] text-text-faint">Billing period</span>
                    <span className="text-[13px] font-semibold text-text-primary text-right">{doc.invoiceDetails.billingPeriod}</span>
                  </div>
                )}
                {typeof doc.invoiceDetails.totalAmount === 'number' && (
                  <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-border-faint">
                    <span className="text-[12.5px] text-text-faint">Total amount</span>
                    <span className="text-[15px] font-bold text-text-primary">
                      {doc.invoiceDetails.currency ? `${doc.invoiceDetails.currency} ` : ''}{formatAmount(doc.invoiceDetails.totalAmount)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <RiskScoreCard
            riskScore={doc.riskScore}
            riskBreakdown={doc.riskBreakdown}
            flaggedClauses={doc.flaggedClauses || []}
          />
          <DocumentChat documentId={doc._id.toString()} fileName={doc.fileName} />
        </div>
      </div>
    </div>
  )
}

export default page
