import { useNavigate, useSearchParams } from "react-router-dom";
import { CATALOG } from "../data/catalogData";
import SubcatalogView from "../components/SubcatalogView";

export default function CatalogDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialId = parseInt(searchParams.get("id") || "1");
  const productIdx = Math.max(0, CATALOG.findIndex((p) => p.id === initialId));
  const product = CATALOG[productIdx];

  return (
    <SubcatalogView
      product={product}
      productIdx={productIdx}
      onBack={() => navigate("/")}
    />
  );
}