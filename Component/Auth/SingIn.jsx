'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Register from './Register';
import { signIn } from "next-auth/react"
import { useFormik } from 'formik';
import * as Yup from 'yup';

const SingIn = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showRegister, setShowRegister] = useState(false);
    const [error, setError] = useState('');

    const handleSignIn = async () => {
        setError('');
        const res = await signIn('credentials', {
            email,
            password,
            redirect: false,
        });

        if (res?.error) {
            setError('Invalid email or password');
            return;
        }

        router.push('/dashboard');
    };

    const handleGoogleSignIn = () => {
        signIn('google', { callbackUrl: '/dashboard' });
    };

    if (showRegister) {
        return <Register onBackToSignIn={() => setShowRegister(false)} />;
    }
    

    return (
        <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-[1fr_700px] bg-background font-sans">
            {/* Left: creative panel */}
            <div className="relative hidden lg:flex flex-col justify-between overflow-hidden p-6 sm:p-8 lg:p-11 bg-[linear-gradient(155deg,#2E4763_0%,#3D5A80_55%,#5D7FA6_100%)]">
                <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.14),transparent_45%),radial-gradient(circle_at_85%_75%,rgba(255,255,255,0.10),transparent_40%)]" />

                <div className="relative flex items-center gap-2.5">
                    <div className="w-[30px] h-[30px] rounded-lg bg-white/20 flex flex-none flex-col items-center justify-center gap-[3px]">
                        <div className="w-3.5 h-0.5 bg-white rounded-full" />
                        <div className="w-3.5 h-0.5 bg-white rounded-full" />
                        <div className="w-2.5 h-0.5 bg-white rounded-full self-start ml-[3px]" />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-white">Doc Intel</span>
                </div>

                <div className="relative flex-1 min-h-0 flex items-center justify-center py-2.5 scale-90 xl:scale-100" style={{ perspective: 1400 }}>
                    <div className="animate-float-chip1 absolute left-0 top-[3%] bg-surface rounded-xl px-3.5 py-2.5 shadow-[0_16px_32px_rgba(20,30,45,0.3)] flex items-center gap-2">
                        <span className="w-2 h-2 flex-none rotate-45 bg-risk-caution-text" />
                        <span className="text-xs font-semibold text-text-primary whitespace-nowrap">Price up 22% vs last order</span>
                    </div>

                    <div className="animate-float-chip2 absolute -right-[8%] -top-[2%] bg-surface rounded-xl px-3.5 py-2.5 shadow-[0_16px_32px_rgba(20,30,45,0.3)] flex items-center gap-2">
                        <span className="w-2 h-2 flex-none rounded-full bg-risk-safe-text" />
                        <span className="text-xs font-semibold text-text-primary whitespace-nowrap">Renewal notice in 12 days</span>
                    </div>

                    <div className="animate-float-chip3 absolute left-[2%] bottom-[2%] bg-surface rounded-xl px-3.5 py-2.5 shadow-[0_16px_32px_rgba(20,30,45,0.3)] flex items-center gap-2">
                        <span className="w-2 h-2 flex-none bg-risk-high-text [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
                        <span className="text-xs font-semibold text-text-primary whitespace-nowrap">Duplicate payment caught</span>
                    </div>

                    <div className="absolute w-[340px] h-[340px] rounded-full border border-white/15" />
                    <div className="absolute w-[420px] h-[420px] rounded-full border border-white/[0.08]" />

                    <div
                        className="animate-float-cards relative w-[150px] h-[130px]"
                        style={{ transformStyle: 'preserve-3d', transform: 'rotateX(18deg) rotateY(-22deg)' }}
                    >
                        <div
                            className="absolute inset-0 bg-surface rounded-2xl shadow-[0_30px_60px_rgba(20,30,45,0.35)] p-5.5"
                            style={{ transform: 'translateZ(-40px) translate(26px,34px)' }}
                        >
                            <div className="w-3/5 h-2 rounded bg-border-strong mb-2.5" />
                            <div className="w-4/5 h-2 rounded bg-border-soft mb-2.5" />
                            <div className="w-2/5 h-2 rounded bg-border-soft" />
                        </div>

                        <div
                            className="absolute inset-0 bg-surface rounded-2xl shadow-[0_30px_60px_rgba(20,30,45,0.3)] p-5.5"
                            style={{ transform: 'translateZ(0px) translate(-16px,-8px)' }}
                        >
                            <div className="flex items-center gap-2 mb-3.5">
                                <span className="w-2.5 h-2.5 flex-none rounded-full bg-risk-caution-text" />
                                <div className="w-[55%] h-2 rounded bg-border-strong" />
                            </div>
                            <div className="w-[85%] h-2 rounded bg-border-soft mb-2" />
                            <div className="w-[70%] h-2 rounded bg-border-soft mb-2" />
                            <div className="w-[75%] h-2 rounded bg-border-soft" />
                        </div>

                        <div
                            className="absolute inset-0 bg-surface rounded-2xl shadow-[0_40px_80px_rgba(20,30,45,0.4)] p-5.5"
                            style={{ transform: 'translateZ(46px) translate(4px,-40px)' }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-1/2 h-[9px] rounded bg-primary-dark" />
                                <span className="text-[10px] font-bold text-risk-safe-text bg-risk-safe-bg px-2 py-[3px] rounded-full">Safe</span>
                            </div>
                            <div className="w-[88px] h-[88px] rounded-full mx-auto mt-1.5 flex items-center justify-center bg-[conic-gradient(#0E7490_320deg,#EFEAE4_320deg_360deg)]">
                                <div className="w-16.5 h-16.5 rounded-full bg-surface flex items-center justify-center font-mono font-semibold text-xl text-text-primary">89</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative text-white mt-6">
                    <p className="text-xl font-bold leading-snug tracking-tight mb-2 max-w-90">
                        Know what you&apos;re signing, before you sign it.
                    </p>
                    <p className="text-[13.5px] text-white/75 leading-relaxed max-w-90">
                        Doc Intel reads every contract and invoice so you don&apos;t have to catch the fine print yourself.
                    </p>
                </div>
            </div>

            {/* Right: form */}
            <div className="flex flex-col items-center justify-center p-6 sm:p-8 lg:p-10 min-h-screen lg:min-h-0">
                <div className="w-full max-w-85">
                    <div className="flex lg:hidden items-center gap-2.5 mb-8">
                        <div className="w-[30px] h-[30px] rounded-lg bg-primary-tint flex flex-none flex-col items-center justify-center gap-[3px]">
                            <div className="w-3.5 h-0.5 bg-primary rounded-full" />
                            <div className="w-3.5 h-0.5 bg-primary rounded-full" />
                            <div className="w-2.5 h-0.5 bg-primary rounded-full self-start ml-[3px]" />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-text-primary">Doc Intel</span>
                    </div>

                    <h1 className="text-xl sm:text-[22px] font-extrabold tracking-tight mb-1.5 text-text-primary">Welcome back</h1>
                    <p className="text-[13.5px] text-text-muted mb-6.5">Sign in to review your documents and deadlines.</p>

                    <div className="flex flex-col gap-3.5">
                        <div>
                            <div className="text-[12.5px] font-semibold text-text-secondary mb-1.5">Email</div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@company.com"
                                className="w-full text-sm px-3.5 py-2.5 rounded-[10px] border border-border-strong outline-none bg-[#FAF8F5] text-text-primary focus:border-primary transition-colors"
                            />
                        </div>
                        <div>
                            <div className="text-[12.5px] font-semibold text-text-secondary mb-1.5">Password</div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full text-sm px-3.5 py-2.5 rounded-[10px] border border-border-strong outline-none bg-[#FAF8F5] text-text-primary focus:border-primary transition-colors"
                            />
                        </div>
                        <div className="flex justify-end -mt-1.5">
                            <span className="text-[12.5px] font-semibold text-primary cursor-pointer hover:text-primary-dark">Forgot password?</span>
                        </div>

                        {error && (
                            <p className="text-[12.5px] font-semibold text-red-600 -mt-1">{error}</p>
                        )}

                        <button
                            type="button"
                            onClick={handleSignIn}
                            className="bg-primary hover:bg-primary-dark text-white border-none rounded-[10px] py-3 font-semibold text-[14.5px] cursor-pointer shadow-[0_2px_6px_rgba(61,90,128,0.18),0_6px_16px_rgba(61,90,128,0.12)] mt-1.5 transition-colors"
                        >
                            Sign in
                        </button>
                    </div>

                    <div className="flex items-center gap-3 my-5.5">
                        <div className="flex-1 h-px bg-border-soft" />
                        <span className="text-xs text-text-faint-2">or</span>
                        <div className="flex-1 h-px bg-border-soft" />
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        className="w-full bg-surface text-text-secondary border border-border-strong rounded-[10px] py-2.5 font-semibold text-sm cursor-pointer hover:bg-background transition-colors"
                    >
                        Continue with Google
                    </button>

                    <p className="text-center text-[13px] text-text-faint mt-6">
                        New to Doc Intel?{' '}
                        <button
                            type="button"
                            onClick={() => setShowRegister(true)}
                            className="text-primary font-semibold cursor-pointer bg-transparent border-none p-0 inline"
                        >
                            Create an account
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SingIn;
