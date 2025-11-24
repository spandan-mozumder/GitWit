
import { askQuestion } from "./src/app/(protected)/dashboard/action";

async function test() {
  try {
    console.log("Calling askQuestion...");
    const { output, filesRefrences } = await askQuestion(
      "What is this project about?",
      "cmic2e7wm0000l80447fj3j3f"
    );

    console.log("Files found:", filesRefrences.length);
    
    console.log("Stream output:");
    for await (const delta of output) {
      process.stdout.write(delta);
    }
    console.log("\nDone.");
  } catch (error) {
    console.error("Error:", error);
  }
}

test();
