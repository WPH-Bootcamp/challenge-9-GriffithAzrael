import api from './axios';

// payload sesuaikan dengan backend nanti
export interface AddToCartPayload {
  restaurantId: string | number;
}

export const addToCart = async (payload: AddToCartPayload) => {
  const { data } = await api.post('/cart', payload);
  return data;
};