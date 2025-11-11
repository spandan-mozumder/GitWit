import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No user ID found" }, { status: 401 });
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    if (!user.emailAddresses[0]?.emailAddress) {
      return NextResponse.json(
        { error: "No email address found" },
        { status: 400 },
      );
    }

    await db.user.upsert({
      where: {
        EmailAddress: user.emailAddresses[0].emailAddress,
      },
      update: {
        imageUrl: user.imageUrl,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      create: {
        id: userId,
        EmailAddress: user.emailAddresses[0].emailAddress,
        imageUrl: user.imageUrl,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });

    return NextResponse.json(
      { success: true, message: "User synced successfully" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
  }
}
