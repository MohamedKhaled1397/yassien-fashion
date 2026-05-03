import { readCategories } from "@/lib/categories";
import { readProducts } from "@/lib/products";
import { readSiteSocial } from "@/lib/site-social";
import { AdminDashboard } from "@/components/AdminDashboard";

export default async function AdminHomePage() {
  const categories = await readCategories();
  const products = await readProducts();
  const social = await readSiteSocial();
  return (
    <AdminDashboard
      initialProducts={products}
      initialCategories={categories}
      initialSocial={social}
    />
  );
}