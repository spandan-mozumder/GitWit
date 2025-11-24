
import { db } from "./src/server/db";

async function main() {
  const project = await db.project.findFirst();
  console.log("Project ID:", project?.id);
}

main();
