import { GITHUB_OWNER, REPOS } from "./config";
import { jsdelivrUrl } from "@omkara/core-schemas";

/**
 * Uploads a base64 encoded image to a specific GitHub repository and returns the jsDelivr CDN URL.
 */
export async function uploadToGithub(
  fileBase64: string,
  filename: string,
  repo: "core" | "products" | "content",
  folder: string = ""
): Promise<string> {
  const token = process.env.NEXT_PUBLIC_GITHUB_PAT;
  if (!token) throw new Error("GitHub PAT not configured in environment variables.");

  const repoName = REPOS[repo].split("/")[1];
  // Sanitize filename and create path
  const safeFilename = filename.replace(/[^a-zA-Z0-9.\-_]/g, "_").toLowerCase();
  const path = folder ? `${folder}/${safeFilename}` : safeFilename;
  
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${repoName}/contents/${path}`;
  
  // Extract pure base64 data from Data URL
  const base64Data = fileBase64.replace(/^data:image\/(png|jpeg|jpg|webp|avif|gif);base64,/, "");
  
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "Omkara-Admin-App",
    },
    body: JSON.stringify({
      message: `Upload asset: ${safeFilename}`,
      content: base64Data,
    }),
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({ message: "Unknown error" }))) as { message?: string };
    throw new Error(`GitHub Upload Failed: ${error.message || "Unknown error"}`);
  }

  // Use the Cloudflare Pages CDN for product assets
  if (repoName === "omkara-assets-products") {
    return `https://omkara-cdn.pages.dev/${path}`;
  }

  // Fallback to jsDelivr for other repos
  return jsdelivrUrl(`${GITHUB_OWNER}/${repoName}`, path, "main");
}
