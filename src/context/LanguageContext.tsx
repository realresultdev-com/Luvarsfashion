import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "ta";

export const translations = {
  en: {
    // Navigation
    searchPlaceholder: "Search",
    search: "Search",
    allDepartments: "All Departments",
    todaysDeals: "Today's Deals",
    freeDeliveryBadge: "New Arrivals & Free Delivery",
    adminPanel: "Admin Page",
    sellerCentral: "Admin Page",
    signIn: "Sign In",
    signOut: "Sign Out",
    cart: "Cart",
    returns: "Returns",
    orders: "& Orders",
    returnsAndOrders: "Returns & Orders",
    yourOrders: "Your Orders",
    yourOrdersTracking: "Your Orders & Tracking",
    yourAccount: "Your Account",
    yourProfile: "Your Profile & Settings",
    savedAddresses: "Saved Addresses",
    storeAdmin: "Store Administrator",
    clubMember: "Luvars Fashion Club Member",
    newToBuddy: "New to Luvars Fashion?",
    startHere: "Start here.",
    deliverTo: "Deliver to",
    india: "India",
    exploreAll: "Explore All T-Shirts & Collections",
    shoppingCart: "Shopping Cart",
    adminDashboard: "Admin Dashboard",
    selectLanguage: "Select Language",
    english: "English",
    tamil: "தமிழ்",
    hello: "Hello",

    // Hero Banner
    heroBadge: "15-Day Returns HOME TRIAL",
    heroTitle: "Wear Your Style. Express Yourself.",
    heroSubtitle: "India's favourite t-shirts, polos, graphic tees and casual fashion for every mood.",
    shopMattresses: "Shop All T-Shirts",
    warrantyButton: "Quality Guarantee",

    // Sleep Club Card
    joinClubTitle: "Join the Luvars Fashion Club",
    joinClubDesc: "Unlock exclusive member pricing, early access to new drops, and free delivery across India.",
    signInClubBtn: "Sign In to Luvars Fashion",
    benefitTrial: "Easy 15-Day Returns",
    benefitWarranty: "Quality Guarantee",
    benefitDelivery: "Free Delivery & Fast Shipping",

    // Departments / Taxonomy
    departments: "Departments:",
    noProductsFound: "No products found in this category.",
    noProductsSub: "Check back soon or explore our other collections.",
    featuredCollectionTitle: "Featured Fashion Collection",
    featuredCollectionDesc: "Crafted with premium fabrics, vibrant prints, and comfortable fits for everyday wear.",

    // Product Card
    bestSeller: "Best Seller",
    buddyPick: "Buddy Pick",
    reviews: "reviews",
    limitedDeal: "Limited Deal",
    off: "OFF",
    freeDoorstepDelivery: "Free Doorstep Delivery",
    trialAndWarranty: "100-Night Trial • Quality Assured",
    addToCart: "Add to Cart",
    addedToCart: "Added to Cart",
    currentlyUnavailable: "Currently Unavailable",

    // Product Details & Buy Box
    officialStore: "Official Luvars Fashion Store",
    buddysChoice: "Buddy's Choice",
    answeredQuestions: "answered questions",
    aboutThisItem: "About this item",
    inStock: "In stock",
    onlyLeft: "Only {n} left",
    shipsFrom: "Ships from",
    soldBy: "Sold by",
    trialPeriod: "Trial Period",
    trial100Nights: "100 Nights Free",
    quantity: "Quantity:",
    buyNow: "Buy Now",
    secureCheckout: "100% Secure Encrypted Checkout",
    buddyPrimeFree: "✓ Luvars Express FREE delivery within 3-5 days",
    deliverToLocation: "Deliver to Bengaluru 560001",

    // Trust Guarantees
    guaranteeReplacement: "15-Day Returns",
    guaranteeDelivery: "Free Delivery",
    guaranteeWarranty: "Quality Assured",
    guaranteeTopBrand: "Top Brand",

    // Footer
    backToTop: "Back to top",
    getToKnowUs: "Get to Know Us",
    aboutBuddy: "About Luvars Fashion",
    careers: "Careers",
    pressReleases: "Press Releases",
    buddyCares: "Buddy Cares",
    connectWithUs: "Connect with Us",
    facebook: "Facebook",
    twitter: "Twitter / X",
    instagram: "Instagram",
    makeMoney: "Make Money with Us",
    sellOnBuddy: "Sell on Luvars Fashion",
    becomeAffiliate: "Become an Affiliate",
    fulfillmentByBuddy: "Fulfillment by Buddy",
    advertiseProducts: "Advertise Your Products",
    letUsHelp: "Let Us Help You",
    yourAccountFooter: "Your Account",
    returnsCentre: "Returns & Replacement Centre",
    warrantyAssistance: "Quality Assured Help",
    helpCentre: "Help Centre & Contact",
    allRightsReserved: "Luvars Fashion. All rights reserved.",
  },
  ta: {
    // Navigation
    searchPlaceholder: "டி-ஷர்ட்கள், போலோக்கள், ஃபேஷன் தேடுக...",
    search: "தேடுக",
    allDepartments: "அனைத்து பிரிவுகள்",
    todaysDeals: "இன்றைய சலுகைகள்",
    freeDeliveryBadge: "புதிய வருகைகள் & இலவச டெலிவரி",
    adminPanel: "நிர்வாகப் பக்கம்",
    sellerCentral: "நிர்வாகப் பக்கம் (Admin Page)",
    signIn: "உள்நுழைக",
    signOut: "வெளியேறு",
    cart: "கூடை",
    returns: "திரும்பப் பெறல்",
    orders: "& ஆர்டர்கள்",
    returnsAndOrders: "ஆர்டர்கள் & திரும்பப் பெறல்",
    yourOrders: "உங்கள் ஆர்டர்கள்",
    yourOrdersTracking: "உங்கள் ஆர்டர்கள் & கண்காணிப்பு",
    yourAccount: "உங்கள் கணக்கு",
    yourProfile: "சுயவிவரம் மற்றும் அமைப்புகள்",
    savedAddresses: "சேமிக்கப்பட்ட முகவரிகள்",
    storeAdmin: "ஸ்டோர் நிர்வாகி",
    clubMember: "Luvars Fashion கிளப் உறுப்பினர்",
    newToBuddy: "Luvars Fashion-க்கு புதியவரா?",
    startHere: "இங்கே தொடங்கவும்.",
    deliverTo: "டெலிவரி இடம்",
    india: "இந்தியா",
    exploreAll: "அனைத்து டி-ஷர்ட்கள் & சேகரிப்புகள்",
    shoppingCart: "ஷாப்பிங் கூடை",
    adminDashboard: "நிர்வாக பலகை",
    selectLanguage: "மொழியைத் தேர்வு செய்க",
    english: "English",
    tamil: "தமிழ்",
    hello: "வணக்கம்",

    // Hero Banner
    heroBadge: "புதிய சேகரிப்பு இப்போது வந்தது",
    heroTitle: "உங்கள் பாணியை வெளிப்படுத்துங்கள். ஃபேஷனாக உடுத்துங்கள்.",
    heroSubtitle: "இந்தியாவின் பிரிய டி-ஷர்ட்கள், போலோக்கள் மற்றும் கேஷுவல் ஃபேஷன்.",
    shopMattresses: "அனைத்து டி-ஷர்ட்களையும் காண்க",
    warrantyButton: "தர உறுதிமொழி",

    // Sleep Club Card
    joinClubTitle: "Luvars Fashion கிளப்பில் சேருங்கள்",
    joinClubDesc: "பிரத்யேக உறுப்பினர் விலை, புதிய சேகரிப்புகளுக்கு முன்னுரிமை மற்றும் இந்தியா முழுவதும் இலவச டெலிவரி பெறுங்கள்.",
    signInClubBtn: "Luvars Fashion-ல் உள்நுழைக",
    benefitTrial: "15 நாள் எளிய திரும்பப்பெறல்",
    benefitWarranty: "தர உறுதிமொழி",
    benefitDelivery: "இலவச டெலிவரி & விரைவான ஷிப்பிங்",

    // Departments / Taxonomy
    departments: "பிரிவுகள்:",
    noProductsFound: "இப்பிரிவில் பொருட்கள் எதுவும் காணப்படவில்லை.",
    noProductsSub: "விரைவில் மீண்டும் பார்க்கவும் அல்லது பிற பிரிவுகளை ஆராயவும்.",
    featuredCollectionTitle: "சிறப்பு ஃபேஷன் தொகுப்பு",
    featuredCollectionDesc: "உயர்தர துணிகள், தெளிவான அச்சுகள் மற்றும் அன்றாட அணிதலுக்கான வசதியான பொருத்தங்களுடன் உருவாக்கப்பட்டது.",

    // Product Card
    bestSeller: "அதிக விற்பனை",
    buddyPick: "Buddy தேர்வு",
    reviews: "மதிப்புரைகள்",
    limitedDeal: "சிறப்பு சலுகை",
    off: "தள்ளுபடி",
    freeDoorstepDelivery: "இலவச வீட்டு டெலிவரி",
    trialAndWarranty: "100-இரவு சோதனை • தர உறுதி",
    addToCart: "கூடையில் சேர்க்க",
    addedToCart: "கூடையில் சேர்க்கப்பட்டது",
    currentlyUnavailable: "தற்போது கிடைக்கவில்லை",

    // Product Details & Buy Box
    officialStore: "அதிகாரப்பூர்வ Luvars Fashion ஸ்டோர்",
    buddysChoice: "Buddy-ன் தேர்வு",
    answeredQuestions: "பதிலளிக்கப்பட்ட கேள்விகள்",
    aboutThisItem: "இந்த பொருளைப் பற்றி",
    inStock: "கையிருப்பில் உள்ளது",
    onlyLeft: "{n} மட்டுமே உள்ளன",
    shipsFrom: "அனுப்புபவர்",
    soldBy: "விற்பனையாளர்",
    trialPeriod: "சோதனை காலம்",
    trial100Nights: "15 நாட்கள் திரும்பப்பெறல்",
    quantity: "அளவு:",
    buyNow: "இப்போதே வாங்குக",
    secureCheckout: "100% பாதுகாப்பான 256-பிட் என்க்ரிப்ட் செய்யப்பட்ட கட்டணம்",
    buddyPrimeFree: "✓ Buddy Express இலவச டெலிவரி 2-4 நாட்களில்",
    deliverToLocation: "பெங்களூரு 560001-க்கு டெலிவரி",

    // Trust Guarantees
    guaranteeReplacement: "15 நாட்கள் திரும்பப்பெறல்",
    guaranteeDelivery: "இலவச டெலிவரி",
    guaranteeWarranty: "தர உறுதி",
    guaranteeTopBrand: "முன்னணி பிராண்ட்",

    // Footer
    backToTop: "மேலே செல்க",
    getToKnowUs: "எங்களைப் பற்றி",
    aboutBuddy: "Luvars Fashion பற்றி",
    careers: "வேலைவாய்ப்புகள்",
    pressReleases: "செய்தி வெளியீடுகள்",
    buddyCares: "Buddy சமுதாயப் பணி",
    connectWithUs: "எங்களுடன் இணையுங்கள்",
    facebook: "பேஸ்புக்",
    twitter: "ட்விட்டர் / X",
    instagram: "இன்ஸ்டாகிராம்",
    makeMoney: "எங்களுடன் பணம் ஈட்டுங்கள்",
    sellOnBuddy: "Buddy-ல் விற்பனை செய்ய",
    becomeAffiliate: "இணைப்பு பங்குதாரராக",
    fulfillmentByBuddy: "Buddy மூலம் பூர்த்தி செய்தல்",
    advertiseProducts: "உங்கள் தயாரிப்புகளை விளம்பரப்படுத்துங்கள்",
    letUsHelp: "உங்களுக்கு உதவ நாங்கள் தயார்",
    yourAccountFooter: "உங்கள் கணக்கு",
    returnsCentre: "திரும்பப் பெறல் மையம்",
    warrantyAssistance: "தர உறுதி உதவி",
    helpCentre: "உதவி மையம் & தொடர்பு",
    allRightsReserved: "Luvars Fashion. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.",
  },
};

export type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, any>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("preferred_language");
    return saved === "ta" ? "ta" : "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("preferred_language", lang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
    if (language === "ta") {
      document.documentElement.classList.add("font-tamil");
    } else {
      document.documentElement.classList.remove("font-tamil");
    }
  }, [language]);

  const t = (key: TranslationKey, params?: Record<string, any>): string => {
    let str = translations[language][key] || translations.en[key] || (key as string);
    if (params) {
      Object.keys(params).forEach((k) => {
        str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(params[k]));
      });
    }
    return str;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
