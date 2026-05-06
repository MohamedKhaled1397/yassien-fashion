import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryById } from "@/lib/categories";
import { productImageSrc } from "@/lib/product-image-url";
import { getProductById } from "@/lib/products";
import { getWhatsAppStoreContext } from "@/lib/store-whatsapp-context";
import { ProductDetailClient } from "./ProductDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) {
    return {
      title: "Product Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: product.name,
    description: product.description.slice(0, 160),
    alternates: {
      canonical: `/product/${product.id}`,
    },
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      type: "website",
      url: `/product/${product.id}`,
      images: [
        {
          url: productImageSrc(product.imageFilename),
          alt: product.name,
        },
      ],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();
  const category = await getCategoryById(product.categoryId);
  const waCtx = await getWhatsAppStoreContext();

  return (
    <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href="/shop"
        className="text-xs font-semibold uppercase tracking-widest text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
      >
        ← Shop
      </Link>
      <div className="mt-8 grid gap-10 md:grid-cols-2 md:items-start">
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200 dark:bg-zinc-900 dark:ring-stone-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={productImageSrc(product.imageFilename)}
            alt={product.name}
            className="aspect-[4/5] w-full bg-stone-100 object-cover dark:bg-zinc-900"
          />
        </div>
        <ProductDetailClient
          product={product}
          categoryName={category?.name}
          waDigits={waCtx.waDigits}
          siteOrigin={waCtx.siteOrigin}
        />
      </div>
    </article>
  );
}
