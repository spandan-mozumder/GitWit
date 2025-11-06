import { AssemblyAI } from 'assemblyai';
import { withTimeout } from './fetch-utils';

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLY_API_KEY || '',
});

function msToTime(ms:number){
    const seconds= ms/1000
    const minutes= Math.floor(seconds/60)
    const remainingSeconds= Math.floor(seconds%60)
    return `${minutes.toString().padStart(2,'0')}:${remainingSeconds.toString().padStart(2,'0')}`
}

export const processMeeting = async (meetingUrl: string) => {
    const transcriptPromise = client.transcripts.transcribe({
        audio: meetingUrl,
        auto_chapters: true,
    });

    const transcript = await withTimeout(
        transcriptPromise,
        300000,
        'AssemblyAI transcription timeout (5 minutes)'
    );

    const summaries = transcript.chapters?.map(chapter=>({
        start: msToTime(chapter.start),
        end: msToTime(chapter.end),
        gist:chapter.gist,
        headline:chapter.headline,
        summary: chapter.summary
    })) || []

    if(!transcript.text) throw new Error('No transcript found')

    return {
        summaries
    }
}