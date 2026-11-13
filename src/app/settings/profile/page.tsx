import { redirect } from "next/navigation";
import { EditProfileClient } from "@/components/edit-profile-client";
import { USERNAME_CHANGE_COOLDOWN_DAYS } from "@/lib/constants";
import { prisma } from "@/server/prisma";
import { getServerUser } from "@/server/session";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export default async function EditProfilePage() {
  const viewer = await getServerUser();
  if (!viewer) redirect("/login");

  const record = await prisma.user.findUnique({
    where: { id: viewer.id },
    select: { usernameChangedAt: true },
  });

  let cooldownDaysLeft = 0;
  if (record?.usernameChangedAt) {
    const elapsedMs = Date.now() - record.usernameChangedAt.getTime();
    const cooldownMs = USERNAME_CHANGE_COOLDOWN_DAYS * MS_PER_DAY;
    if (elapsedMs < cooldownMs) {
      cooldownDaysLeft = Math.ceil((cooldownMs - elapsedMs) / MS_PER_DAY);
    }
  }

  return (
    <EditProfileClient
      initialUser={{
        name: viewer.name,
        username: viewer.username,
        bio: viewer.bio,
        image: viewer.image,
      }}
      cooldownDaysLeft={cooldownDaysLeft}
      hasUsedInitialChange={Boolean(record?.usernameChangedAt)}
    />
  );
}
