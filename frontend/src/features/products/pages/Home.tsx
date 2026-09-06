import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router";
import type { RootState } from "../../../app/app.store";
import { useProduct } from "../hooks/useProduct";
import { useEffect, useState } from "react";
import type { Product } from "../utils/productTypes";
import ProductCardSkeleton from "../components/ProductCardSkeleton";

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);

  const products = useSelector((state: RootState) => state.product.products);

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const category = searchParams.get("category");
  const parentCategory = searchParams.get("parentCategory");

  const { handleGetProducts } = useProduct();

  // useEffect(() => {
  //   handleGetProducts(category || undefined, parentCategory || undefined);
  // }, [category, parentCategory]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);

        await handleGetProducts(
          category || undefined,
          parentCategory || undefined,
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [category, parentCategory]);

  return (
    <>
      <div
        className="min-h-screen selection:bg-[#A8874F]/30"
        style={{
          backgroundColor: "#fbf9f6",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div className="mx-auto max-w-7xl px-8 lg:px-16 xl:px-24">
          {/* ── Hero / Header ── */}

          <div className="flex flex-col items-center pt-24 pb-24 text-center">
            <div className="mb-8 flex items-center gap-4">
              <div className="h-px w-12 bg-[#A8874F]/50" />

              <span
                className="text-[10px] font-medium tracking-[0.24em] uppercase"
                style={{ color: "#A8874F" }}
              >
                The Collection
              </span>

              <div className="h-px w-12 bg-[#A8874F]/50" />
            </div>

            <h1
              className="mb-6 text-5xl leading-tight font-light lg:text-7xl"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                color: "#1b1c1a",
              }}
            >
              Curated Archive
            </h1>

            <p
              className="mx-auto max-w-xl text-sm leading-relaxed"
              style={{ color: "#7A6E63" }}
              // style={{ color: "#5f574d" }}
            >
              Discover our latest curation of premium minimalist pieces,
              meticulously designed for effortless elegance and enduring
              quality.
            </p>
          </div>

          {/* ── Product Grid ── */}

          {isLoading ? (
            <div className="grid grid-cols-1 gap-x-8 gap-y-16 pb-32 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-8 gap-y-16 pb-32 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product: Product) => {
                const imageUrl =
                  product.images && product.images.length > 0
                    ? product.images[0].url
                    : "/snitch_editorial_warm.png"; // Fallback

                return (
                  <div
                    onClick={() => navigate(`/product/${product._id}`)}
                    key={product._id}
                    className="group animate-in fade-in slide-in-from-bottom-4 flex cursor-pointer flex-col rounded-2xl transition-all duration-500 hover:-translate-y-2"
                  >
                    {/* Image Container */}
                    {/* <div
                      className="mb-6 aspect-4/5 overflow-hidden"
                      style={{ backgroundColor: "#f5f3f0" }}
                    >
                      <img
                        src={imageUrl}
                        alt={product.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div> */}

                    <div className="relative mb-6 aspect-4/5 overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={product.title}
                        className="h-full w-full object-cover transition-all duration-700 group-hover:scale-[1.03]"
                      />

                      <div className="absolute inset-0 bg-black/0 transition-colors duration-700 group-hover:bg-black/5" />
                    </div>

                    {/* Product Details */}

                    <div className="flex flex-col gap-3">
                      <span
                        className="text-[10px] tracking-[0.22em] uppercase"
                        style={{ color: "#A8874F" }}
                      >
                        Curated Piece
                      </span>

                      <h3
                        className="text-xl leading-snug transition-colors duration-300 group-hover:text-[#A8874F]"
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          color: "#1b1c1a",
                        }}
                      >
                        {product.title}
                      </h3>

                      <p
                        className="line-clamp-2 text-[12px] leading-relaxed"
                        style={{ color: "#7A6E63" }}
                      >
                        {product.description}
                      </p>

                      <div className="mt-2 flex items-center justify-between">
                        <span
                          className="text-[12px] font-bold tracking-[0.2em] uppercase"
                          style={{ color: "#1b1c1a" }}
                        >
                          {/* {product.price?.currency}{" "}
                          {product.price?.amount?.toLocaleString()} */}
                          {product.price.currency === "INR" && "₹"}
                          {product.price?.amount}
                        </span>

                        <span
                          className="translate-x-2 text-[10px] tracking-[0.2em] uppercase opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100"
                          style={{ color: "#A8874F" }}
                        >
                          View Piece →
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center py-24 text-center">
              <h2
                className="mb-4 text-2xl"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  color: "#1b1c1a",
                }}
              >
                No pieces available.
              </h2>
              <p
                className="mx-auto max-w-md text-sm leading-relaxed"
                style={{ color: "#7A6E63" }}
              >
                We are currently preparing our next collection. Please check
                back later.
              </p>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <footer
          className="border-t py-12 text-center"
          style={{ borderColor: "#e4e2df" }}
        >
          <span
            className="text-[10px] tracking-[0.35em] uppercase"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "#A8874F",
            }}
          >
            Vastra © {new Date().getFullYear()}
          </span>
        </footer>
      </div>
    </>
  );
};

export default Home;
