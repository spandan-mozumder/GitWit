'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const SyncUser = () => {
    const router = useRouter()

    useEffect(() => {
        const syncAndRedirect = async () => {
            try {
                const response = await fetch('/api/sync-user', {
                    method: 'POST',
                })
                
                if (!response.ok) {
                    throw new Error('Failed to sync user')
                }

                // Redirect after 3 seconds
                setTimeout(() => {
                    router.push('/dashboard')
                }, 3000)
            } catch (error) {
                // Still redirect even on error after 3 seconds
                setTimeout(() => {
                    router.push('/dashboard')
                }, 3000)
            }
        }

        syncAndRedirect()
    }, [router])

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Setting up your account...</h1>
                <p className="text-gray-600">Redirecting to dashboard in 3 seconds...</p>
            </div>
        </div>
    )
}

export default SyncUser