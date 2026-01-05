import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Parfums from "./pages/Parfums";
import Skincare from "./pages/Skincare";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Admin from "./pages/Admin";
import ImageUpload from "./pages/ImageUpload";
import ProductManager from "./pages/ProductManager";
import ProductDetail from "./pages/ProductDetail";
import NotFound from "./pages/NotFound";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <WhatsAppButton />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/parfums" element={<Parfums />} />
              <Route path="/skincare" element={<Skincare />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              {/* Authentification routes removed for static version */}

              {/* Local Admin Tools */}
              <Route path="/upload-images" element={<ImageUpload />} />
              <Route path="/manage-products" element={<ProductManager />} />

              <Route path="/product/:id" element={<ProductDetail />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
