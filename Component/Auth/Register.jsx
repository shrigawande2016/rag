'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { signIn } from 'next-auth/react';

const Register = ({ onBackToSignIn }) => {
    const router = useRouter();
    const [photo, setPhoto] = useState(null);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            phone: '',
            organization: '',
            role: '',
            password: '',
        },
        validationSchema: Yup.object({
            name: Yup.string().required('Name is required'),
            email: Yup.string().email('Invalid email address').required('Email is required'),
            phone: Yup.string().required('Phone is required'),
            organization: Yup.string(),
            role: Yup.string().required('Role is required'),
            password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
        }),
        onSubmit: async (values, { setSubmitting }) => {
            setError('');
            try {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...values, photo }),
                });

                const data = await res.json();

                if (!res.ok) {
                    setError(data.message || 'Registration failed');
                    return;
                }

                const signInRes = await signIn('credentials', {
                    email: values.email,
                    password: values.password,
                    redirect: false,
                });

                if (signInRes?.error) {
                    onBackToSignIn();
                    return;
                }

                router.push('/dashboard');
            } catch (err) {
                console.error('Registration error:', err);
                setError('Something went wrong. Please try again.');
            } finally {
                setSubmitting(false);
            }
        },
    });

    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (file) setPhoto(URL.createObjectURL(file));
    };

    return (
        <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-[340px_1fr] bg-background font-sans">
            {/* Left: creative panel */}
            <div className="relative hidden lg:flex flex-col justify-between overflow-hidden p-6 bg-[linear-gradient(155deg,#2E4763_0%,#3D5A80_55%,#5D7FA6_100%)]">
                <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.14),transparent_45%),radial-gradient(circle_at_85%_75%,rgba(255,255,255,0.10),transparent_40%)]" />

                <div className="relative flex items-center gap-2.5">
                    <div className="w-[30px] h-[30px] rounded-lg bg-white/20 flex flex-none flex-col items-center justify-center gap-[3px]">
                        <div className="w-3.5 h-0.5 bg-white rounded-full" />
                        <div className="w-3.5 h-0.5 bg-white rounded-full" />
                        <div className="w-2.5 h-0.5 bg-white rounded-full self-start ml-[3px]" />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-white">Doc Intel</span>
                </div>

                <div className="relative text-white">
                    <p className="text-xl font-bold leading-snug tracking-tight mb-2 max-w-65">
                        Set up in minutes.
                    </p>
                    <p className="text-[13.5px] text-white/75 leading-relaxed max-w-[260px]">
                        Create your account and upload your first contract or invoice — we&apos;ll take it from there.
                    </p>
                </div>

                <div className="relative flex flex-col gap-2.5">
                    <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2.5">
                        <span className="w-2 h-2 flex-none rounded-full bg-risk-caution-text" />
                        <span className="text-xs font-semibold text-white">Auto-renewal clauses flagged</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2.5">
                        <span className="w-2 h-2 flex-none rounded-full bg-risk-safe-text" />
                        <span className="text-xs font-semibold text-white">Deadlines tracked automatically</span>
                    </div>
                </div>
            </div>

            {/* Right: form */}
            <div className="flex items-center justify-center p-6 sm:p-10">
                <div className="w-full max-w-[560px]">
                    <h1 className="text-xl sm:text-[22px] font-extrabold tracking-tight mb-1.5 text-text-primary">Create your account</h1>
                    <p className="text-[13.5px] text-text-muted mb-6.5">Start tracking your contracts and invoices for free.</p>

                    <div className="flex items-center gap-4 mb-6.5">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-[72px] h-[72px] flex-none rounded-full border border-dashed border-border-strong bg-surface flex flex-col items-center justify-center gap-0.5 cursor-pointer overflow-hidden"
                        >
                            {photo ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={photo} alt="Profile preview" className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <span className="text-[11px] font-semibold text-text-secondary leading-tight text-center">Add<br />photo</span>
                                    <span className="text-[10px] text-text-faint leading-tight">
                                        or <span className="underline text-primary">browse</span>
                                    </span>
                                </>
                            )}
                        </button>
                        <div>
                            <div className="text-sm font-semibold text-text-primary">Profile photo</div>
                            <div className="text-[12.5px] text-text-faint">Optional — you can add this later.</div>
                        </div>
                    </div>

                    <form className="flex flex-col gap-3.5" onSubmit={formik.handleSubmit}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                                <div className="text-[12.5px] font-semibold text-text-secondary mb-1.5">Full name <span className="text-red-500">*</span></div>
                                <input
                                    type="text"
                                    name="name"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Jane Rivera"
                                    className="w-full text-sm px-3.5 py-2.5 rounded-[10px] border border-border-strong outline-none bg-[#FAF8F5] text-text-primary focus:border-primary transition-colors"
                                />
                                {formik.touched.name && formik.errors.name && (
                                    <div className="text-red-500 text-sm mt-1">{formik.errors.name}</div>
                                )}
                            </div>
                            <div>
                                <div className="text-[12.5px] font-semibold text-text-secondary mb-1.5">Phone <span className="text-red-500">*</span></div>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formik.values.phone}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="(555) 123-4567"
                                    className="w-full text-sm px-3.5 py-2.5 rounded-[10px] border border-border-strong outline-none bg-[#FAF8F5] text-text-primary focus:border-primary transition-colors"
                                />
                                {formik.touched.phone && formik.errors.phone && (
                                    <div className="text-red-500 text-sm mt-1">{formik.errors.phone}</div>
                                )}
                            </div>
                        </div>

                        <div>
                            <div className="text-[12.5px] font-semibold text-text-secondary mb-1.5">Email <span className="text-red-500">*</span></div>
                            <input
                                type="email"
                                name="email"
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="you@company.com"
                                className="w-full text-sm px-3.5 py-2.5 rounded-[10px] border border-border-strong outline-none bg-[#FAF8F5] text-text-primary focus:border-primary transition-colors"
                            />
                            {formik.touched.email && formik.errors.email && (
                                <div className="text-red-500 text-sm mt-1">{formik.errors.email}</div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                                <div className="text-[12.5px] font-semibold text-text-secondary mb-1.5">Organization</div>
                                <input
                                    type="text"
                                    name="organization"
                                    value={formik.values.organization}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Riverside Retail Co."
                                    className="w-full text-sm px-3.5 py-2.5 rounded-[10px] border border-border-strong outline-none bg-[#FAF8F5] text-text-primary focus:border-primary transition-colors"
                                />
                                {formik.touched.organization && formik.errors.organization && (
                                    <div className="text-red-500 text-sm mt-1">{formik.errors.organization}</div>
                                )}
                            </div>
                            <div>
                                <div className="text-[12.5px] font-semibold text-text-secondary mb-1.5">Role <span className="text-red-500">*</span></div>
                                <select
                                    name="role"
                                    value={formik.values.role}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className="w-full text-sm px-3.5 py-2.5 rounded-[10px] border border-border-strong outline-none bg-[#FAF8F5] text-text-primary focus:border-primary transition-colors"
                                >
                                    <option value="">Select</option>
                                    <option value="owner">Owner</option>
                                    <option value="admin">Admin</option>
                                    <option value="member">Member</option>
                                </select>
                                {formik.touched.role && formik.errors.role && (
                                    <div className="text-red-500 text-sm mt-1">{formik.errors.role}</div>
                                )}
                            </div>
                        </div>

                        <div>
                            <div className="text-[12.5px] font-semibold text-text-secondary mb-1.5">Password <span className="text-red-500">*</span></div>
                            <input
                                type="password"
                                name="password"
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="At least 8 characters"
                                className="w-full text-sm px-3.5 py-2.5 rounded-[10px] border border-border-strong outline-none bg-[#FAF8F5] text-text-primary focus:border-primary transition-colors"
                            />
                            {formik.touched.password && formik.errors.password && (
                                <div className="text-red-500 text-sm mt-1">{formik.errors.password}</div>
                            )}
                        </div>

                        {error && (
                            <p className="text-[12.5px] font-semibold text-red-600">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={formik.isSubmitting}
                            className="bg-primary hover:bg-primary-dark text-white border-none rounded-[10px] py-3 font-semibold text-[14.5px] cursor-pointer shadow-[0_2px_6px_rgba(61,90,128,0.18),0_6px_16px_rgba(61,90,128,0.12)] mt-1.5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {formik.isSubmitting ? 'Creating account...' : 'Create account'}
                        </button>
                    </form>

                    <p className="text-center text-[12.5px] text-text-faint mt-4 leading-relaxed">
                        By creating an account, you agree to our <span className="underline cursor-pointer">Terms</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
                    </p>

                    <p className="text-center text-[13px] text-text-faint mt-4">
                        Already have an account?{' '}
                        <button
                            type="button"
                            onClick={onBackToSignIn}
                            className="text-primary font-semibold cursor-pointer bg-transparent border-none p-0 inline"
                        >
                            Sign in
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
