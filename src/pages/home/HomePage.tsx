import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Search, Star } from 'lucide-react';

import headerLogoDark from '@/assets/logo-1.svg';
import headerLogoLight from '@/assets/logo-header-homepage.svg';
import bagIcon from '@/assets/bag.svg';

import heroImage from '@/assets/homepage-image.png';

import iconAllRestaurants from '@/assets/all-restaurants.svg';
import iconNearby from '@/assets/nearby.svg';
import iconDiscount from '@/assets/discount.svg';
import iconBestSeller from '@/assets/best-seller.svg';
import iconDelivery from '@/assets/delivery.svg';
import iconLunch from '@/assets/lunch.svg';

import footerLogo from '@/assets/logo-footer-homepage.svg';
import iconFacebook from '@/assets/facebook.svg';
import iconInstagram from '@/assets/instagram.svg';
import iconLinkedin from '@/assets/linkedin.svg';
import iconTiktok from '@/assets/tiktok.svg';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { useAppDispatch, useAppSelector } from '@/features/hooks';
import { setAuthSuccess, logout } from '@/features/auth/authSlice';

import { getProfile } from '@/services/api/auth';
import type { Restaurant } from '@/services/api/restaurants';
import { getRestaurantsByCategory } from '@/services/api/restaurants';
import { addToCart } from '@/services/api/cart';

// --------------------------------------------------
// Helper types & data
// --------------------------------------------------

type CategoryKey = 'all' | 'nearby' | 'discount' | 'bestSeller' | 'delivery' | 'lunch';

interface CategoryItem {
  key: CategoryKey;
  label: string;
  icon: string;
}

const CATEGORIES: CategoryItem[] = [
  { key: 'all', label: 'All Restaurant', icon: iconAllRestaurants },
  { key: 'nearby', label: 'Nearby', icon: iconNearby },
  { key: 'discount', label: 'Discount', icon: iconDiscount },
  { key: 'bestSeller', label: 'Best Seller', icon: iconBestSeller },
  { key: 'delivery', label: 'Delivery', icon: iconDelivery },
  { key: 'lunch', label: 'Lunch', icon: iconLunch },
];

// Map kategori UI ke endpoint API
const categoryToApi: Record<CategoryKey, 'all' | 'nearby' | 'bestSeller' | 'recommended'> = {
  all: 'all',
  nearby: 'nearby',
  discount: 'all',
  bestSeller: 'bestSeller',
  delivery: 'all',
  lunch: 'recommended',
};

// --------------------------------------------------
// Komponen utama
// --------------------------------------------------

const HomePage = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchText, setSearchText] = useState('');

  // ----------------------------------------------
  // Header scroll effect
  // ----------------------------------------------
  useEffect(() => {
    const handleScroll = () => {
      setIsHeaderScrolled(window.scrollY > 10);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isAuthenticated = !!(auth.token || auth.user);

  // ----------------------------------------------
  // Fetch profile jika punya token tapi state kosong
  // ----------------------------------------------
  const token =
    typeof window !== 'undefined' ? window.localStorage.getItem('accessToken') : null;

  const profileQuery = useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: getProfile,
    enabled: Boolean(token) && !auth.user,
  });

  useEffect(() => {
    if (!token) return;
    if (auth.user) return;
    const data = profileQuery.data;
    if (!data) return;

    dispatch(
      setAuthSuccess({
        token,
        user: {
          id: String((data as any).id ?? ''),
          name: data.name,
          email: data.email,
          phoneNumber: data.phoneNumber,
        },
      }),
    );
  }, [profileQuery.data, token, auth.user, dispatch]);

  // ----------------------------------------------
  // Query restoran berdasarkan kategori (API)
  // ----------------------------------------------
  const apiCategory = categoryToApi[selectedCategory];

  const {
    data: restaurants,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['restaurants', apiCategory],
    queryFn: () => getRestaurantsByCategory(apiCategory),
  });

  // Normalisasi response API agar selalu berupa array
  const baseRestaurants: Restaurant[] = useMemo(() => {
    if (!restaurants) return [];

    if (Array.isArray(restaurants)) return restaurants as Restaurant[];

    if (Array.isArray((restaurants as any).data)) {
      return (restaurants as any).data as Restaurant[];
    }

    return [];
  }, [restaurants]);

  // Filter pencarian di sisi client (nama restoran)
  const filteredRestaurants: Restaurant[] = useMemo(() => {
    if (!searchTerm.trim()) return baseRestaurants;

    const lower = searchTerm.trim().toLowerCase();
    return baseRestaurants.filter((resto) =>
      String(resto.name ?? '').toLowerCase().includes(lower),
    );
  }, [baseRestaurants, searchTerm]);

  // ----------------------------------------------
  // Optimistic UI: Add to Cart
  // ----------------------------------------------
  const [inCartIds, setInCartIds] = useState<Set<string | number>>(
    () => new Set(),
  );

  const addToCartMutation = useMutation({
    mutationFn: (restaurantId: string | number) =>
      addToCart({ restaurantId }),
    onMutate: async (restaurantId) => {
      setInCartIds((prev) => {
        const next = new Set(prev);
        next.add(restaurantId);
        return next;
      });
      return { restaurantId };
    },
    onError: (_error, _variables, context) => {
      if (!context?.restaurantId) return;
      setInCartIds((prev) => {
        const next = new Set(prev);
        next.delete(context.restaurantId);
        return next;
      });
    },
  });

  // ----------------------------------------------
  // Handler
  // ----------------------------------------------

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchText);
  };

  const handleSignIn = () => {
    window.location.href = '/login';
  };

  const handleSignUp = () => {
    window.location.href = '/register';
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  // ----------------------------------------------
  // Render
  // ----------------------------------------------

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header
        className={`fixed inset-x-0 top-0 z-30 transition-colors ${
          isHeaderScrolled ? 'bg-white shadow-sm' : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 md:h-20">
          {/* Logo kiri */}
          <div className="flex items-center gap-2">
            <img
              src={isHeaderScrolled ? headerLogoDark : headerLogoLight}
              alt="Foody logo"
              className="h-8 w-auto md:h-9"
            />
          </div>

          {/* Right area: auth / user menu */}
          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignIn}
                  className={`rounded-full border-none px-4 py-1 text-sm ${
                    isHeaderScrolled
                      ? 'bg-transparent text-neutral-900 hover:bg-neutral-100'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={handleSignUp}
                  className="rounded-full bg-[#C12116] px-4 py-1 text-sm text-white hover:bg-[#a91b11]"
                >
                  Sign Up
                </Button>
              </>
            ) : (
              <>
                {/* Icon cart */}
                <button
                  type="button"
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${
                    isHeaderScrolled ? 'bg-neutral-100' : 'bg-white/10'
                  }`}
                >
                  <img src={bagIcon} alt="Cart" className="h-4 w-4" />
                </button>

                {/* User dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className={`flex items-center gap-2 rounded-full px-2 py-1 ${
                        isHeaderScrolled ? 'bg-neutral-100' : 'bg-white/10'
                      }`}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt={auth.user?.name ?? 'User'} />
                        <AvatarFallback className="bg-[#C12116] text-white">
                          {auth.user?.name?.charAt(0) ?? 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className={`hidden text-sm font-medium md:inline ${
                          isHeaderScrolled ? 'text-neutral-900' : 'text-white'
                        }`}
                      >
                        {auth.user?.name ?? 'User'}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleLogout}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex flex-col">
        {/* Hero Section */}
        <section className="relative isolate overflow-hidden">
          {/* Background hero image + overlay */}
          <div className="absolute inset-0 -z-10">
            <img
              src={heroImage}
              alt="Hero"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-b from-black/75 via-black/45 to-black/80" />
          </div>

          {/* Konten hero */}
          <div className="mx-auto flex h-105 max-w-6xl flex-col justify-center px-6 pt-20 pb-16 md:h-130 md:pt-24">
            <h1 className="max-w-2xl text-white text-center text-3xl font-extrabold leading-tight md:text-left md:text-[40px]">
              Explore Culinary Experiences
            </h1>
            <p className="mt-3 max-w-xl text-center text-sm text-white/80 md:text-left md:text-base">
              Search and refine your choice to discover the perfect restaurant.
            </p>

            {/* Search bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="mt-7 w-full max-w-3xl"
            >
              <div className="relative flex items-center">
                <Input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search restaurants, food and drink"
                  className="h-12 w-full rounded-full border-none bg-white px-5 pl-11 text-sm text-neutral-900 md:h-14 md:text-base"
                />
                <Search className="pointer-events-none absolute left-4 h-5 w-5 text-neutral-400" />
              </div>
            </form>
          </div>
        </section>

        {/* Category & Recommended */}
        {/* Overlap hero, background abu terang dan rounded top seperti Figma */}
        <section className="-mt-8 rounded-t-4xl bg-[#F5F5F5] pb-10 pt-10 md:-mt-12">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6">
            {/* Categories */}
            <div className="flex gap-4 overflow-x-auto pb-1">
              {CATEGORIES.map((cat) => {
                const isActive = cat.key === selectedCategory;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`flex min-w-32.5 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium shadow-sm ${
                      isActive
                        ? 'bg-white text-neutral-900 shadow-md'
                        : 'bg-white text-neutral-500'
                    }`}
                  >
                    <img src={cat.icon} alt={cat.label} className="h-6 w-6" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Recommended header */}
            <div className="mt-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">
                Recommended
              </h2>
              <button
                type="button"
                className="text-sm font-medium text-[#C12116]"
              >
                See All
              </button>
            </div>

            {/* Recommended grid */}
            <div className="mt-2 grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {isLoading && (
                <>
                  {Array.from({ length: 8 }).map((_, idx) => (
                    <Card
                      key={idx}
                      className="h-32 animate-pulse rounded-2xl border-0 bg-white"
                    >
                      <CardContent className="h-full" />
                    </Card>
                  ))}
                </>
              )}

              {isError && !isLoading && (
                <p className="col-span-full text-sm text-red-500">
                  Failed to load restaurants. Please try again later.
                </p>
              )}

              {!isLoading &&
                !isError &&
                Array.isArray(filteredRestaurants) &&
                filteredRestaurants.map((restaurant) => {
                  const id =
                    restaurant.id ??
                    (restaurant as any).restaurantId ??
                    (restaurant as any)._id ??
                    restaurant.name;
                  const key = String(id ?? Math.random());

                  const rating =
                    (restaurant as any).rating ??
                    (restaurant as any).avgRating ??
                    (restaurant as any).stars ??
                    0;

                  const city =
                    (restaurant as any).city ??
                    (restaurant as any).location ??
                    (restaurant as any).address ??
                    'Unknown';

                  const distance =
                    (restaurant as any).distanceKm ??
                    (restaurant as any).distance ??
                    (restaurant as any).km ??
                    null;

                  const isInCart = inCartIds.has(id as any);

                  return (
                    <Card
                      key={key}
                      className="rounded-2xl border-0 bg-white shadow-sm transition-shadow hover:shadow-md"
                    >
                      <CardContent className="flex h-full items-center gap-3 p-4">
                        {/* Thumbnail restoran */}
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-neutral-100">
                          {/* Ganti dengan logo restoran jika sudah ada */}
                          <span className="text-xs font-semibold text-neutral-500">
                            Logo
                          </span>
                        </div>

                        {/* Info */}
                        <div className="flex flex-1 flex-col gap-1">
                          <p className="text-sm font-semibold text-neutral-900">
                            {restaurant.name ?? 'Restaurant'}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-neutral-500">
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                            <span>
                              {typeof rating === 'number'
                                ? rating.toFixed(1)
                                : rating}
                            </span>
                            <span className="mx-1">•</span>
                            <span>{city}</span>
                            {distance != null && (
                              <>
                                <span className="mx-1">•</span>
                                <span>{distance} km</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Action: Add to cart (optimistic) */}
                        <Button
                          type="button"
                          size="sm"
                          onClick={() =>
                            addToCartMutation.mutate(id as string | number)
                          }
                          disabled={isInCart || addToCartMutation.isPending}
                          className={`h-8 w-20 rounded-full text-xs font-semibold ${
                            isInCart
                              ? 'bg-neutral-200 text-neutral-600 hover:bg-neutral-200'
                              : ''
                          }`}
                        >
                          {isInCart ? 'Added' : 'Add'}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>

            {/* Show More button */}
            <div className="mt-6 flex justify-center">
              <Button
                type="button"
                variant="outline"
                className="h-10 w-32 rounded-full border-neutral-200 bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Show More
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-10 bg-[#050816] py-12 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 md:flex-row md:justify-between">
          {/* Brand + description */}
          <div className="max-w-sm">
            <img
              src={footerLogo}
              alt="Foody footer logo"
              className="h-9 w-auto"
            />
            <p className="mt-4 text-sm text-neutral-300">
              Enjoy homemade flavors &amp; chef&apos;s signature dishes, freshly
              prepared every day. Order online or visit our nearest branch.
            </p>

            <p className="mt-4 text-sm font-semibold">Follow on Social Media</p>
            <div className="mt-3 flex gap-3">
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800"
              >
                <img src={iconFacebook} alt="Facebook" className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800"
              >
                <img src={iconInstagram} alt="Instagram" className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800"
              >
                <img src={iconLinkedin} alt="LinkedIn" className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="TikTok"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800"
              >
                <img src={iconTiktok} alt="TikTok" className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="grid gap-8 text-sm md:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="mb-3 font-semibold">Explore</p>
              <ul className="space-y-1 text-neutral-300">
                <li>All Food</li>
                <li>Nearby</li>
                <li>Discount</li>
                <li>Best Seller</li>
                <li>Delivery</li>
                <li>Lunch</li>
              </ul>
            </div>
            <div>
              <p className="mb-3 font-semibold">Help</p>
              <ul className="space-y-1 text-neutral-300">
                <li>How to Order</li>
                <li>Payment Methods</li>
                <li>Track My Order</li>
                <li>FAQ</li>
                <li>Contact Us</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;