'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import Upload from '@/Component/Common/Upload';

const NAV_ITEMS = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Documents', href: '/documents' },
    { label: 'To-do', href: '/todos' },
    { label: 'Settings', href: '/settings' },
];

const Sidebar = () => {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [uploadOpen, setUploadOpen] = useState(false);

    return (
        <aside className="hidden lg:flex flex-col w-64 flex-none h-screen sticky top-0 border-r border-border bg-surface">
            <div className="flex items-center gap-2.5 px-6 py-6">
                <div className="w-7.5 h-7.5 rounded-lg bg-primary-tint flex flex-none flex-col items-center justify-center gap-0.75">
                    <div className="w-3.5 h-0.5 bg-primary rounded-full" />
                    <div className="w-3.5 h-0.5 bg-primary rounded-full" />
                    <div className="w-2.5 h-0.5 bg-primary rounded-full self-start ml-0.75" />
                </div>
                <span className="font-bold text-lg tracking-tight text-text-primary">Doc Intel</span>
            </div>

            <nav className="flex-1 px-3 py-2 flex flex-col gap-1">
                {NAV_ITEMS.map((item) => {
                    const active = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${active
                                    ? 'bg-primary-tint text-primary'
                                    : 'text-text-secondary hover:bg-background'
                                }`}
                        >
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="px-3 pb-4">
                <button
                    type="button"
                    onClick={() => setUploadOpen(true)}
                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-semibold py-3 rounded-[10px] cursor-pointer transition-colors"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Upload document
                </button>
            </div>

            {session?.user && (
                <div className="px-3 py-4 border-t border-border flex items-center gap-2.5">
                    {session.user.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={session.user.image}
                            alt={session.user.name || 'Profile'}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full flex-none object-cover"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full flex-none bg-primary-tint flex items-center justify-center text-xs font-bold text-primary">
                            {session.user.name?.[0]?.toUpperCase() || '?'}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-text-primary truncate">
                            {session.user.name}
                        </div>
                        <button
                            type="button"
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="text-xs font-semibold text-text-faint hover:text-primary cursor-pointer bg-transparent border-none p-0"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            )}

            <Upload open={uploadOpen} onClose={() => setUploadOpen(false)} />
        </aside>
    );
};

export default Sidebar;
