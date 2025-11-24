
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { config } from "dotenv";

config();

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function test() {
  try {
    console.log("Testing gemini-2.5-flash-lite...");
    const { textStream } = await streamText({
      model: google("gemini-2.5-flash-lite"),
      prompt: "Hello, are you working?",
    });

    for await (const delta of textStream) {
      process.stdout.write(delta);
    }
    console.log("\nDone.");
  } catch (error) {
    console.error("Error:", error);
  }
}

test();
