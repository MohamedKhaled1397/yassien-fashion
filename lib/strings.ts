export type Lang = "en" | "ar";

export const STRINGS: Record<
  Lang,
  {
    home: string;
    shop: string;
    categories: string;
    categoriesIntro: string;
    newArrivals: string;
    admin: string;
    heroTitle: string;
    heroSubtitle: string;
    shopNow: string;
    featured: string;
    productsCount: string;
    sort: string;
    apply: string;
    sortNewest: string;
    sortPriceLow: string;
    sortPriceHigh: string;
    sortName: string;
    shopFilterCategory: string;
    shopAllCategories: string;
    noProducts: string;
    view: string;
    currency: string;
    whatsAppCta: string;
    priceOnRequest: string;
  }
> = {
  en: {
    home: "Home",
    shop: "Shop",
    categories: "Categories",
    categoriesIntro: "Choose a category to see matching products in the shop.",
    newArrivals: "New Arrivals",
    admin: "Admin",
    heroTitle: "YASSIN FASHION",
    heroSubtitle:
      "CURATED APPAREL AND ACCESSORIES — ELEVATED STYLE, THOUGHTFUL DETAIL, AND A WARDROBE THAT MOVES WITH YOU.",
    shopNow: "SHOP NOW",
    featured: "Featured Products",
    productsCount: "products",
    sort: "Sort",
    apply: "Apply",
    sortNewest: "Newest",
    sortPriceLow: "Price: low to high",
    sortPriceHigh: "Price: high to low",
    sortName: "Name",
    shopFilterCategory: "Category",
    shopAllCategories: "All",
    noProducts: "No products yet. Check back soon.",
    view: "View",
    currency: "LE",
    whatsAppCta: "WhatsApp",
    priceOnRequest: "Price on request",
  },
  ar: {
    home: "الرئيسية",
    shop: "المتجر",
    categories: "التصنيفات",
    categoriesIntro: "اختر تصنيفاً لعرض المنتجات المناسبة في المتجر.",
    newArrivals: "وصل حديثاً",
    admin: "الإدارة",
    heroTitle: "ياسين فاشون",
    heroSubtitle:
      "أزياء وإكسسوارات مختارة — أسلوب راقٍ وتفاصيل مدروسة وخزانة تناسب يومك.",
    shopNow: "تسوق الآن",
    featured: "منتجات مميزة",
    productsCount: "منتجات",
    sort: "ترتيب",
    apply: "تطبيق",
    sortNewest: "الأحدث",
    sortPriceLow: "السعر: من الأقل",
    sortPriceHigh: "السعر: من الأعلى",
    sortName: "الاسم",
    shopFilterCategory: "التصنيف",
    shopAllCategories: "الكل",
    noProducts: "لا توجد منتجات بعد. عد لاحقاً.",
    view: "عرض",
    currency: "ج.م",
    whatsAppCta: "واتساب",
    priceOnRequest: "السعر عند الطلب",
  },
};
