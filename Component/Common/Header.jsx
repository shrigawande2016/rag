import React from 'react'
import Link from 'next/link'

const Header = ({ data }) => {
    const breadcrumbs = data.breadcrumbs || []

    return (
        <div className='flex flex-col gap-1 mb-4 py-4 p-4 md:px-6'>
            {breadcrumbs.length > 0 && (
                <nav className="flex items-center gap-1.5 mb-1.5" aria-label="Breadcrumb">
                    {breadcrumbs.map((crumb, index) => {
                        const isLast = index === breadcrumbs.length - 1
                        return (
                            <div key={crumb.href || crumb.label} className="flex items-center gap-1.5">
                                {index > 0 && (
                                    <svg className="w-3.5 h-3.5 text-text-faint flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                                {isLast || !crumb.href ? (
                                    <span className="text-[13px] font-semibold text-text-primary">{crumb.label}</span>
                                ) : (
                                    <Link
                                        href={crumb.href}
                                        className="text-[13px] font-semibold text-text-faint hover:text-primary transition-colors"
                                    >
                                        {crumb.label}
                                    </Link>
                                )}
                            </div>
                        )
                    })}
                </nav>
            )}

            <h1 className="text-2xl font-bold">{data.title}</h1>
            <p className="text-text-faint">{data.subtitle}</p>
        </div>
    )
}

export default Header
