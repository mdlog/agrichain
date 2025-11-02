'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function RouteProgress() {
    const pathname = usePathname()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        // Set loading to true when route changes
        setLoading(true)
        
        // Hide progress bar after navigation completes
        const timer = setTimeout(() => {
            setLoading(false)
        }, 200)

        return () => {
            clearTimeout(timer)
            setLoading(false)
        }
    }, [pathname])

    if (!loading) return null

    return (
        <div className="fixed top-16 left-0 right-0 h-1 bg-gray-200 z-[60]">
            <div 
                className="h-full bg-primary-600 animate-[shimmer_1s_ease-in-out_infinite]"
                style={{
                    width: '100%',
                }}
            />
            <style jsx>{`
                @keyframes shimmer {
                    0% {
                        transform: translateX(-100%);
                    }
                    50% {
                        transform: translateX(0%);
                    }
                    100% {
                        transform: translateX(100%);
                    }
                }
            `}</style>
        </div>
    )
}

