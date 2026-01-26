import api from './axios';

export interface Restaurant {
  id?: string | number;
  name?: string;
  rating?: number;
  city?: string;
  distanceKm?: number;
  // izinkan field lain dari backend
  [key: string]: any;
}

export type RestaurantCategoryApi = 'all' | 'nearby' | 'bestSeller' | 'recommended';

const endpointByCategory: Record<RestaurantCategoryApi, string> = {
  all: '/resto',
  nearby: '/resto/nearby',
  bestSeller: '/resto/best-seller',
  recommended: '/resto/recommended',
};

export const getRestaurantsByCategory = async (
  category: RestaurantCategoryApi,
): Promise<Restaurant[]> => {
  const path = endpointByCategory[category];
  const { data } = await api.get<Restaurant[]>(path);
  return data;
};

export const getRecommendedRestaurants = () => getRestaurantsByCategory('recommended');