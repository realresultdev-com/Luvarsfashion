import { createBrowserRouter, Navigate } from "react-router-dom";
import RootLayout from "../components/layout/RootLayout";
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";
import AdminLayout from "../components/layout/AdminLayout";

// Public pages
import Home from "../pages/public/Home";
import Shop from "../pages/public/Shop";
import ProductDetail from "../pages/public/ProductDetail";
import CategoryPage from "../pages/public/CategoryPage";
import Cart from "../pages/public/Cart";
import Checkout from "../pages/public/Checkout";
import OrderSuccess from "../pages/public/OrderSuccess";
import About from "../pages/public/About";
import PrivacyPolicy from "../pages/public/PrivacyPolicy";
import TermsOfService from "../pages/public/TermsOfService";
import RefundPolicy from "../pages/public/RefundPolicy";
import ShippingPolicy from "../pages/public/ShippingPolicy";
import GrievanceRedressal from "../pages/public/GrievanceRedressal";
import AccountDeletion from "../pages/public/AccountDeletion";
import Login from "../pages/public/Login";
import Register from "../pages/public/Register";

// User private pages
import Profile from "../pages/user/Profile";
import OrderHistory from "../pages/user/OrderHistory";
import Addresses from "../pages/user/Addresses";

// Admin pages
import Dashboard from "../pages/admin/Dashboard";
import ProductsList from "../pages/admin/ProductsList";
import ProductForm from "../pages/admin/ProductForm";
import CategoriesManage from "../pages/admin/CategoriesManage";
import HeroVideoManage from "../pages/admin/HeroVideoManage";
import OrdersManage from "../pages/admin/OrdersManage";
import UsersManage from "../pages/admin/UsersManage";

import ErrorBoundary from "../components/common/ErrorBoundary";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      // Public
      { index: true, element: <Home /> },
      { path: "shop", element: <Shop /> },
      { path: "about", element: <About /> },
      { path: "privacy", element: <PrivacyPolicy /> },
      { path: "privacy-policy", element: <PrivacyPolicy /> },
      { path: "terms", element: <TermsOfService /> },
      { path: "terms-of-service", element: <TermsOfService /> },
      { path: "refund-policy", element: <RefundPolicy /> },
      { path: "return-policy", element: <RefundPolicy /> },
      { path: "refunds", element: <RefundPolicy /> },
      { path: "returns", element: <RefundPolicy /> },
      { path: "shipping-policy", element: <ShippingPolicy /> },
      { path: "grievance", element: <GrievanceRedressal /> },
      { path: "grievance-redressal", element: <GrievanceRedressal /> },
      { path: "delete-account", element: <AccountDeletion /> },
      { path: "account-deletion", element: <AccountDeletion /> },
      { path: "product/:id", element: <ProductDetail /> },
      { path: "category/:id", element: <CategoryPage /> },
      { path: "cart", element: <Cart /> },
      { path: "checkout", element: <Checkout /> },
      { path: "order-success", element: <OrderSuccess /> },
      // User Authenticated
      {
        element: <PrivateRoute />,
        children: [
          { path: "profile", element: <Profile /> },
          { path: "orders", element: <OrderHistory /> },
          { path: "addresses", element: <Addresses /> },
        ],
      },
    ],
  },
  // Standalone Auth Pages (Google OAuth Only)
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Login />,
  },
  // Admin Portal
  {
    path: "/admin",
    element: <AdminRoute />,
    children: [
      {
        element: <RootLayout />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { index: true, element: <Dashboard /> },
              { path: "products", element: <ProductsList /> },
              { path: "products/new", element: <ProductForm /> },
              { path: "products/:id/edit", element: <ProductForm /> },
              { path: "media", element: <Navigate to="/admin/products" replace /> },
              { path: "categories", element: <CategoriesManage /> },
              { path: "hero-videos", element: <HeroVideoManage /> },
              { path: "orders", element: <OrdersManage /> },
              { path: "users", element: <UsersManage /> },
            ],
          },
        ],
      },
    ],
  },
]);
