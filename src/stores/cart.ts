import { defineStore } from 'pinia';
import axios from 'axios';

const API_BASE = 'https://uncle-joes-api-539076178854.us-central1.run.app';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as any[],
    selectedStoreId: null as string | null,
    placingOrder: false,
  }),
  getters: {
    total: (state) => state.items.reduce((acc, item) => acc + (item.price * item.quantity), 0),
    itemCount: (state) => state.items.reduce((acc, item) => acc + item.quantity, 0),
  },
  actions: {
    addToCart(menuItem: any) {
      const existing = this.items.find(i => i.id === menuItem.id);
      if (existing) {
        existing.quantity++;
      } else {
        this.items.push({ ...menuItem, quantity: 1 });
      }
    },
    removeFromCart(itemId: string) {
      const index = this.items.findIndex(i => i.id === itemId);
      if (index > -1) {
        if (this.items[index].quantity > 1) {
          this.items[index].quantity--;
        } else {
          this.items.splice(index, 1);
        }
      }
    },
    async placeOrder(memberId: string | null) {
      if (!this.selectedStoreId) return;
      this.placingOrder = true;
      try {
        const orderId = `ORD-${Date.now()}`;
        const orderPayload = {
          order_id: orderId,
          member_id: memberId,
          store_id: this.selectedStoreId,
          order_total: this.total
        };

        await axios.post(`${API_BASE}/orders`, orderPayload);

        for (const item of this.items) {
          await axios.post(`${API_BASE}/order-items`, {
            id: `OI-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            order_id: orderId,
            menu_item_id: item.id,
            quantity: item.quantity,
            price: item.price
          });
        }

        this.items = [];
        return orderId;
      } catch (err) {
        console.error(err);
        throw err;
      } finally {
        this.placingOrder = false;
      }
    }
  }
});
