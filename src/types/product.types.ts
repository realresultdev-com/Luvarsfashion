export interface Category {
  id: string;
  name: string;
  offer_badge_prefix?: string;
  offer_badge_value?: string;
}

export interface ProductAboutItem {
  key: string;
  value: string;
}

export interface ProductColorVariant {
  name: string;
  color?: string;
  hex?: string;
  image?: string;
  images?: string[];
}

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  colorName?: string | null;
  colorHex?: string | null;
  isPrimary?: boolean;
  sortOrder?: number;
  createdAt?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  categoryId: string;
  category?: Category;
  is_trending?: boolean;
  rating?: number;
  review_count?: number;
  reviewsCount?: number;
  about?: ProductAboutItem[];
  color_variants?: ProductColorVariant[];
  product_images?: ProductImage[];
  offer_badge_prefix?: string;
  offer_badge_value?: string;
  original_price?: number | null;
  originalMRP?: number | null;
  discount_percent?: number | null;
  discountPercent?: number | null;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  rating: number;
  title?: string;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface CanReviewResponse {
  canReview: boolean;
  alreadyReviewed: boolean;
  isPurchased?: boolean;
  reason?: string | null;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  color?: string;
}


