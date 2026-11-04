import type { Product } from "../../types/product.types";

interface ProductStatutorySectionProps {
  product: Product;
}

export default function ProductStatutorySection({ product }: ProductStatutorySectionProps) {
  const aboutItems = Array.isArray(product?.about) ? (product.about as any[]) : [];

  const aboutNetQtyItem = aboutItems.find((item) => {
    if (typeof item === "string") return item.toLowerCase().includes("quantity");
    if (item && typeof item === "object" && typeof item.key === "string") {
      return item.key.toLowerCase().includes("net quantity") || item.key.toLowerCase().includes("quantity");
    }
    return false;
  });
  const aboutNetQty = typeof aboutNetQtyItem === "string" ? aboutNetQtyItem : aboutNetQtyItem?.value;

  const aboutDimItem = aboutItems.find((item) => {
    if (typeof item === "string") return item.toLowerCase().includes("dimension") || item.toLowerCase().includes("size");
    if (item && typeof item === "object" && typeof item.key === "string") {
      return item.key.toLowerCase().includes("dimension") || item.key.toLowerCase().includes("size");
    }
    return false;
  });
  const aboutDimensions = typeof aboutDimItem === "string" ? aboutDimItem : aboutDimItem?.value;

  const productNameLower = (product?.name || "").toLowerCase();
  const isPillow = product?.categoryId === "cat_pillows" || productNameLower.includes("pillow");
  const isProtector = product?.categoryId === "cat_bedding" || productNameLower.includes("protector");

  const netQuantity =
    aboutNetQty ||
    (isPillow
      ? "1 N (1 Piece Pillow)"
      : isProtector
      ? "1 N (1 Piece T-Shirt)"
      : "1 N (1 Piece T-Shirt)");

  const standardDimensions =
    aboutDimensions ||
    (isPillow
      ? "60 cm x 38 cm x 11.5 cm (24 x 15 x 4.5 inches)"
      : isProtector
      ? "198 cm x 182 cm x 25 cm (78 x 72 inches, fits up to 10-inch mattress)"
      : "198 cm x 182 cm x 15.2 cm (78 x 72 x 6 inches - Standard King)");

  const genericName = isPillow
    ? "Orthopedic Ergonomic Pillow"
    : isProtector
    ? "Polo Cotton T-Shirt"
    : "Premium Cotton Casual T-Shirt";

  return (
    <div className="pt-4 border-t border-gray-200 space-y-2 select-none">
      <h3 className="font-bold text-base text-[#0f1111]">Product details</h3>
      <table className="w-full text-xs text-left">
        <tbody>
          <tr>
            <td className="py-1 pr-4 font-bold text-[#0f1111] w-36 sm:w-48 align-top">
              Country of Origin
            </td>
            <td className="py-1 text-[#0f1111] font-normal align-top">
              India
            </td>
          </tr>
          <tr>
            <td className="py-1 pr-4 font-bold text-[#0f1111] w-36 sm:w-48 align-top">
              Net Quantity
            </td>
            <td className="py-1 text-[#0f1111] font-normal align-top">
              {netQuantity}
            </td>
          </tr>
          <tr>
            <td className="py-1 pr-4 font-bold text-[#0f1111] w-36 sm:w-48 align-top">
              Item Dimensions
            </td>
            <td className="py-1 text-[#0f1111] font-normal align-top">
              {standardDimensions}
            </td>
          </tr>
          <tr>
            <td className="py-1 pr-4 font-bold text-[#0f1111] w-36 sm:w-48 align-top">
              Product Type
            </td>
            <td className="py-1 text-[#0f1111] font-normal align-top">
              {genericName}
            </td>
          </tr>
          <tr>
            <td className="py-1 pr-4 font-bold text-[#0f1111] w-36 sm:w-48 align-top">
              Manufacturer &amp; Packer
            </td>
            <td className="py-1 text-[#0f1111] font-normal align-top">
              Luvars Fashion, Paramathi Velur, Namakkal, Tamil Nadu - 637207, India
            </td>
          </tr>
          <tr>
            <td className="py-1 pr-4 font-bold text-[#0f1111] w-36 sm:w-48 align-top">
              Customer Support
            </td>
            <td className="py-1 text-[#0f1111] font-normal align-top">
              support@luvarsfashion.com | +91 94433 00000
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
