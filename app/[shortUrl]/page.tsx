// app/[shortUrl]/page.tsx
import { redirect } from "next/navigation";

interface PageProps {
  params: {
    shortUrl: string;
  };
}

export default async function ShortenLinkPage({ params }: PageProps) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
  }

  console.log(params.shortUrl);

  // Redirect to API endpoint
  redirect(`${baseUrl}/${params.shortUrl}`);
}
