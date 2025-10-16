"use client"
import { Gift, ShieldCheck } from 'lucide-react'
import React from 'react'
const BillingPage = () => {
  return (
    <div className='flex min-h-[60vh] flex-col items-center justify-center px-4'>
        <div className='max-w-2xl space-y-8 rounded-3xl border border-border/70 bg-card/70 p-10 text-center shadow-lg shadow-primary/5'>
            <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/12 text-primary'>
                <Gift className='h-7 w-7' />
            </div>
            <div className='space-y-3'>
                <h1 className='text-3xl font-semibold md:text-4xl'>
                    Pricing stays simple: every capability is included while we are in open access.
                </h1>
                <p className='text-base text-muted-foreground'>
                    We are partnering with early customers to shape the roadmap. Use GitWit without limits—projects, meetings,
                    and automations are all on us during this phase.
                </p>
            </div>
            <div className='flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-background/70 px-6 py-5 text-sm text-foreground'>
                <ShieldCheck className='h-5 w-5 text-primary' />
                <p className='font-medium'>Enterprise security guarantees apply even on free access.</p>
                <p className='text-muted-foreground'>Bring your team aboard—we will reach out before any billing changes.</p>
            </div>
        </div>
    </div>
  )
}
export default BillingPage