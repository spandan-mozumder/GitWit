"use client"
import React, { useState } from 'react'
import { Button } from '~/components/ui/button';
import { Tabs, TabsContent } from '~/components/ui/tabs';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {lucario} from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '~/lib/utils';
type Props ={
    filesRefrences:{
        fileName:string;
        sourceCode: string;
        summary:string;
    }[]
}
const CodeRefrence = ({ filesRefrences }: Props) => {
    const [tab,setTab] = useState(filesRefrences[0]?.fileName);
    if (filesRefrences.length === 0) return null
  return (
    <div className='max-w-[70vw]'>
       <Tabs value={tab} onValueChange={setTab}>
        <div className='flex gap-2 overflow-x-auto rounded-2xl border border-border/60 bg-background/70 p-2'>
            {filesRefrences.map((file )=>(
                <Button variant={'outline'} onClick={()=>setTab(file.fileName)} key={file.fileName} className={cn(
                    'rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:bg-muted',
                    {
                        'bg-primary text-primary-foreground hover:bg-primary':  tab === file.fileName,
                    }
                )}>
                    {file.fileName}
                </Button>
            ))}
        </div>
        {filesRefrences.map((file)=>(
            <TabsContent key={file.fileName} value={file.fileName} className='max-h-[40vh] max-w-7xl overflow-scroll rounded-2xl border border-border/60 bg-background/80'>
                <SyntaxHighlighter language='typescript' style={lucario} customStyle={{ margin: 0, borderRadius: '1rem' }}>
                    {file.sourceCode}
                </SyntaxHighlighter>
            </TabsContent>
        ))}
       </Tabs>
    </div>
  )
}
export default CodeRefrence