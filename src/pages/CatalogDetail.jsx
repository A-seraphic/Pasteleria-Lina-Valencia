import { useNavigate, useSearchParams } from "react-router-dom";
import { usePublicCatalog } from "@/data/catalogStore";
import SubcatalogView from "../components/SubcatalogView";

export default function CatalogDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { categories } = usePublicCatalog();
  const initialId = parseInt(searchParams.get("id") || "1");
  const productIdx = Math.max(0, categories.findIndex((p) => p.id === initialId));
  const product = categories[productIdx];

  if (!product) return null;
  return (
    <SubcatalogView
      product={product}
      productIdx={productIdx}
      onBack={() => navigate("/")}
    />
  );
}
