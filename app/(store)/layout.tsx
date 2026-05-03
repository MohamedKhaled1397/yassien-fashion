import { SiteHeader } from "@/components/SiteHeader";
import { SocialLinks } from "@/components/SocialLinks";
import { readSiteSocial } from "@/lib/site-social";

export const dynamic = "force-dynamic";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const social = await readSiteSocial();
  return (
    <div className="min-h-screen bg-marble text-stone-900 dark:text-stone-100">
      <SiteHeader social={social} />
      {children}
      <footer className="border-t border-stone-200/80 py-10 dark:border-stone-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 sm:flex-row sm:justify-between sm:px-6">
          <p className="text-center text-[10px] uppercase tracking-[0.35em] text-stone-400 dark:text-stone-600">
            Yassien Fashion · {new Date().getFullYear()}
          </p>
          <SocialLinks social={social} />
        </div>
      </footer>
    </div>
  );
}
