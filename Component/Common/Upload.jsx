'use client';

import React, { useRef } from 'react'
import Link from 'next/link'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import { useSession } from 'next-auth/react'

const STEPS = [
    { key: 'uploading', label: 'Uploading file' },
    { key: 'extracting', label: 'Extracting key terms' },
    { key: 'embedding', label: 'Checking for risks and deadlines' },
]

const MAX_SIZE = 20 * 1024 * 1024 // 20MB
const ALLOWED_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const validationSchema = Yup.object({
    file: Yup.mixed()
        .required('Please choose a file to upload')
        .test('fileType', 'Only PDF or DOCX files are supported', (file) => !file || ALLOWED_TYPES.includes(file.type))
        .test('fileSize', 'File must be 20MB or smaller', (file) => !file || file.size <= MAX_SIZE),
})



const Upload = ({ open, onClose }) => {

    const { data: session } = useSession()
    const fileInputRef = useRef(null)

    const formik = useFormik({
        initialValues: {
            stage: 'idle', // idle | processing | done
            file: null,
            fileName: '',
            stepIndex: -1,
            dragActive: false,
            result: null,
        },
        validationSchema,
        validateOnChange: false,
        onSubmit: async (values) => {
            setFieldValue('stage', 'processing')
            setFieldValue('stepIndex', 0)

            try {
                const formData = new FormData()
                formData.append('file', values.file)
                formData.append('userId', session?.user?.id || '')

                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                })
                const uploadData = await uploadRes.json();

                if (!uploadRes.ok) {
                    toast.error(uploadData.error || 'Upload failed. Please try again.')
                    setFieldValue('stage', 'idle')
                    return uploadData;
                }

                setFieldValue('stepIndex', 1)

                const extractRes = await fetch("/api/extract", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ documentId: uploadData._id }),
                })
                const extractData = await extractRes.json();

                if (!extractRes.ok) {
                    toast.error(extractData.error || 'Extraction failed. Please try again.')
                    setFieldValue('stage', 'idle')
                    return extractData;
                }

                setFieldValue('stepIndex', 2)

                const embedRes = await fetch("/api/embed", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ documentId: uploadData._id }),
                })
                const embedData = await embedRes.json();

                if (!embedRes.ok) {
                    toast.error(embedData.error || 'Analysis failed. Please try again.')
                    setFieldValue('stage', 'idle')
                    return embedData;
                }

                const analyzeRes = await fetch("/api/analyze", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ documentId: uploadData._id }),
                })
                const analyzeData = await analyzeRes.json();

                if (!analyzeRes.ok) {
                    toast.error(analyzeData.error || 'Analysis failed. Please try again.')
                    setFieldValue('stage', 'idle')
                    return analyzeData;
                }

                toast.success('Document uploaded and analyzed')
                setFieldValue('result', analyzeData)
                setFieldValue('stage', 'done')
                return analyzeData;
            } catch (err) {
                toast.error('Something went wrong. Please try again.')
                setFieldValue('stage', 'idle')
                throw err;
            }
        },
    })

    const { values, errors, setFieldValue, setFieldError, resetForm, submitForm } = formik

    if (!open) return null

    const handleClose = () => {
        resetForm()
        onClose?.()
    }

    const startProcessing = async (file) => {
        if (!file) return

        setFieldError('file', undefined)

        try {
            await validationSchema.validateAt('file', { file })
        } catch (validationError) {
            setFieldError('file', validationError.message)
            toast.error(validationError.message)
            return
        }

        await setFieldValue('file', file)
        await setFieldValue('fileName', file.name)
        submitForm()
    }

    const handleFileChange = (e) => {
        const file = e.target.files?.[0]
        startProcessing(file)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setFieldValue('dragActive', false)
        const file = e.dataTransfer.files?.[0]
        startProcessing(file)
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4"
            onClick={handleClose}
        >
            <div
                className="bg-white rounded-2xl shadow-[0_30px_60px_rgba(20,30,45,0.25)] w-full max-w-105 p-6"
                onClick={(e) => e.stopPropagation()}
            >
                {values.stage === 'idle' && (
                    <>
                        <h2 className="text-lg font-bold text-text-primary mb-1.5">Upload a document</h2>
                        <p className="text-[13.5px] text-text-faint leading-relaxed mb-5">
                            Drop a contract or invoice, or choose a file. We&apos;ll take it from there.
                        </p>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.docx"
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); setFieldValue('dragActive', true); }}
                            onDragLeave={() => setFieldValue('dragActive', false)}
                            onDrop={handleDrop}
                            className={`w-full flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-9 transition-colors cursor-pointer ${values.dragActive
                                ? 'border-primary bg-primary-tint'
                                : errors.file
                                    ? 'border-red-400 bg-red-50'
                                    : 'border-border-strong bg-background hover:bg-[#FAF8F5]'
                                }`}
                        >
                            <span className="w-10 h-10 rounded-full bg-primary-tint flex items-center justify-center">
                                <svg className="w-4.5 h-4.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                            <span className="text-sm font-bold text-text-primary">Drag &amp; drop, or click to browse</span>
                            <span className="text-[12.5px] text-text-faint">PDF, DOCX up to 20MB</span>
                        </button>

                        {errors.file && (
                            <p className="text-[12.5px] font-semibold text-red-500 mt-2">{errors.file}</p>
                        )}

                        <div className="flex justify-end mt-5">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="text-[13.5px] font-semibold text-text-faint hover:text-text-secondary cursor-pointer bg-transparent border-none p-0"
                            >
                                Cancel
                            </button>
                        </div>
                    </>
                )}

                {values.stage === 'processing' && (
                    <>
                        <h2 className="text-lg font-bold text-text-primary mb-1.5 truncate">Reading {values.fileName}</h2>
                        <p className="text-[13.5px] text-text-faint mb-5">This usually takes under a minute.</p>

                        <div className="flex flex-col gap-3.5">
                            {STEPS.map((step, i) => {
                                const active = i <= values.stepIndex
                                return (
                                    <div key={step.key} className="flex items-center gap-2.5">
                                        <span
                                            className={`w-5 h-5 flex-none rounded-full flex items-center justify-center ${active ? 'bg-primary-tint' : 'bg-background border border-border-strong'
                                                }`}
                                        >
                                            {active && (
                                                <svg className="w-3 h-3 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </span>
                                        <span className={`text-[13.5px] font-semibold ${active ? 'text-primary' : 'text-text-faint'}`}>
                                            {step.label}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                )}

                {values.stage === 'done' && (() => {
                    const result = values.result || {}
                    const clauses = result.flaggedClauses || []
                    const clauseCount = clauses.length
                    const topClause = [...clauses].sort((a, b) => {
                        const order = { high: 0, medium: 1, low: 2 }
                        return (order[a.severity] ?? 3) - (order[b.severity] ?? 3)
                    })[0]

                    return (
                        <>
                            <span className="w-9 h-9 rounded-full bg-primary-tint flex items-center justify-center mb-4">
                                <svg className="w-4.5 h-4.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>

                            <h2 className="text-lg font-bold text-text-primary mb-1.5">
                                {clauseCount === 0
                                    ? 'Done — no risks flagged'
                                    : `Done — ${clauseCount} clause${clauseCount === 1 ? '' : 's'} flagged`}
                            </h2>
                            <p className="text-[13.5px] text-text-faint leading-relaxed mb-4">
                                {topClause
                                    ? topClause.explanation
                                    : (result.summary || "We didn't find anything that needs a second look.")}
                            </p>

                            {typeof result.riskScore === 'number' && (
                                <div className="flex items-center gap-2 mb-5">
                                    <span className="text-[12.5px] font-semibold text-text-secondary">Risk score</span>
                                    <span className="text-[12.5px] font-bold text-primary">{result.riskScore}/100</span>
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                                <Link
                                    href={result._id ? `/documents/${result._id}` : '#'}
                                    onClick={handleClose}
                                    className="flex-1 text-center bg-primary hover:bg-primary-dark text-white border-none rounded-[10px] py-3 font-semibold text-[14.5px] cursor-pointer transition-colors"
                                >
                                    View document
                                </Link>
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="text-[13.5px] font-semibold text-text-faint hover:text-text-secondary cursor-pointer bg-transparent border-none p-0"
                                >
                                    Close
                                </button>
                            </div>
                        </>
                    )
                })()}
            </div>
        </div>
    )
}

export default Upload
