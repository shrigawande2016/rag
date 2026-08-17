import React from 'react'

const Loader = ({ fullScreen = false, label }) => {
    return (
        <div
            className={
                fullScreen
                    ? 'min-h-screen w-full flex flex-col items-center justify-center gap-3'
                    : 'w-full flex flex-col items-center justify-center gap-3 py-16'
            }
        >
            <span className="w-8 h-8 rounded-full border-[3px] border-border-strong border-t-primary animate-spin" />
            {label && <span className="text-[13px] font-semibold text-text-faint">{label}</span>}
        </div>
    )
}

export default Loader
