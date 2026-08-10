export type SiteConfigInput = {
  name?: string;
  artistName?: string;
  description?: string;
};

export type SiteConfig = {
  name: string;
  artistName: string;
  description: string;
  brandLead: string;
  brandAccent: string;
};

function clean(value: string | undefined) {
  return value?.trim().replace(/\s+/g, " ") || "";
}

export function createSiteConfig(input: SiteConfigInput): SiteConfig {
  const name = clean(input.name) || "DJey Music";
  const words = name.split(" ");
  const brandAccent = words.pop() || name;
  const brandLead = words.join(" ");
  const artistName = clean(input.artistName) || brandLead || name;
  const description =
    clean(input.description) || `Original music by ${artistName}.`;

  return { name, artistName, description, brandLead, brandAccent };
}

export const SITE_CONFIG = createSiteConfig({
  name: process.env.NEXT_PUBLIC_SITE_NAME,
  artistName: process.env.NEXT_PUBLIC_ARTIST_NAME,
  description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION,
});
