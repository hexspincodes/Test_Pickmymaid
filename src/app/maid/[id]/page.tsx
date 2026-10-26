import { permanentRedirect, notFound } from "next/navigation";
import { getMaid } from "@/lib/api";
import { toList } from "@/lib/multiValue";

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default async function MaidRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Unknown ids come back as empty data; request failures go to the error page.
  const maid = (await getMaid(id)).data?.jobApplication;
  if (!maid) notFound();

  const slug = slugify(`${maid.name} ${toList(maid.option).join(" ")} ${maid.nationality}`);
  permanentRedirect(`/maid/${id}/${slug}`);
}
