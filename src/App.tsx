import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import Index from "./pages/Index";
import CategoryPage from "./pages/CategoryPage";
import CartPage from "./pages/CartPage";
import WhyUsPage from "./pages/WhyUsPage";
import ContactPage from "./pages/ContactPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/self-care" element={<CategoryPage category="Self-Care" />} />
            <Route path="/self-care/tondeuse" element={<CategoryPage category="Self-Care" subcategory="Tondeuse" />} />
            <Route path="/self-care/spa" element={<CategoryPage category="Self-Care" subcategory="Pack de Soin/SPA" />} />
            <Route path="/self-care/massage" element={<CategoryPage category="Self-Care" subcategory="Articles de Massage" />} />
            <Route path="/fragrances" element={<CategoryPage category="Fragrances" />} />
            <Route path="/fragrances/men" element={<CategoryPage category="Fragrances" subcategory="For Men" />} />
            <Route path="/fragrances/women" element={<CategoryPage category="Fragrances" subcategory="For Women" />} />
            <Route path="/air-diffusers" element={<CategoryPage category="Air Diffusers" />} />
            <Route path="/watches" element={<CategoryPage category="Watches" />} />
            <Route path="/watches/men" element={<CategoryPage category="Watches" subcategory="For Men" />} />
            <Route path="/watches/women" element={<CategoryPage category="Watches" subcategory="For Women" />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/why-us" element={<WhyUsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
