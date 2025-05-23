/* eslint-disable @typescript-eslint/no-unused-vars */
// app/details/[type]/[id]/page.tsx
import Image from "next/image";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";

type PageProps = {
  params: {
    type: "anime" | "manga";
    id: string;
  };
};

async function getDetails(type: string, id: string) {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/${type}/${id}`, {
      next: { revalidate: 3600 }, // cache for 1 hour
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.data;
  } catch (error) {
    return null;
  }
}

export default async function DetailPage({ params }: PageProps) {
  const { type, id } = params;
  const item = await getDetails(type, id);

  if (!item) return notFound();

  const year =
    item.aired?.prop?.from?.year ??
    item.published?.prop?.from?.year ??
    "Unknown";

  const episodesOrChapters =
    type === "anime"
      ? `${item.episodes ?? "N/A"} Episodes`
      : `${item.chapters ?? "N/A"} Chapters`;

  return (
    <section className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative w-full md:w-1/3">
          <Image
            src={item.images.jpg.image_url}
            alt={item.title}
            width={500}
            height={700}
            className="rounded-xl w-full h-auto object-cover"
            unoptimized
          />
            <Badge variant="secondary" className="absolute top-2 left-2 z-10 bg-indigo-500 text-white">
                {item.type === "Manga" ? "Manga" : "Anime"}
            </Badge>
        </div>

        <div className="w-full md:w-2/3 space-y-3">
          <h1 className="text-3xl font-bold">{item.title}</h1>
          <p className="text-sm text-muted-foreground italic mb-2">
            {item.title_japanese}
          </p>

          <ul className="space-y-1 text-base">
            <li><strong>Type:</strong> {item.type}</li>
            <li><strong>Status:</strong> {item.status}</li>
            <li><strong>Year:</strong> {year}</li>
            <li><strong>Season:</strong> {item.season ?? "N/A"}</li>
            <li><strong>{type === "anime" ? "Episodes" : "Chapters"}:</strong> {episodesOrChapters}</li>
            <li><strong>Score:</strong> {item.score ?? "N/A"}</li>
          </ul>

          {item.synopsis && (
            <div className="pt-4">
              <h2 className="text-xl font-semibold mb-1">Synopsis</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.synopsis}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
