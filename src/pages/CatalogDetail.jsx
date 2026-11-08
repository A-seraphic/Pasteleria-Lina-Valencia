import { Navigate, useSearchParams } from "react-router-dom";

// Enlaces antiguos (/catalogo?id=1) llevan al catálogo de la página principal
export default function CatalogDetail() {
  const [params] = useSearchParams();
  const id = params.get("id");
  return <Navigate to={id ? `/?c=${id}` : "/#catalogo"} replace />;
}
