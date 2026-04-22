<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useAuthStore } from '../stores/auth';
import { useCartStore } from '../stores/cart';
import { 
  User, 
  ShoppingBag, 
  MapPin, 
  Star, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  AlertCircle
} from 'lucide-vue-next';

const API_BASE = 'https://uncle-joes-api-539076178854.us-central1.run.app';
const authStore = useAuthStore();
const cartStore = useCartStore();
const router = useRouter();

const orders = ref<any[]>([]);
const loading = ref(true);
const locations = ref<any[]>([]);
const orderSuccess = ref<string | null>(null);

onMounted(async () => {
  const memberId = localStorage.getItem('joe_member_id');
  if (!memberId) {
    router.push('/login');
    return;
  }

  if (!authStore.isAuthenticated) {
    await authStore.fetchProfile(memberId);
  }

  try {
    const [ordersRes, _rewards, locationsRes] = await Promise.all([
      axios.get(`${API_BASE}/orders/member/${memberId}`),
      authStore.fetchRewards(memberId),
      axios.get(`${API_BASE}/locations`)
    ]);
    orders.value = ordersRes.data;
    locations.value = locationsRes.data;
    
    // Default store if not set
    if (!cartStore.selectedStoreId && locations.value.length > 0) {
      cartStore.selectedStoreId = locations.value[0].id;
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
});

const getStoreName = (storeId: string) => {
  return locations.value.find(l => l.id === storeId)?.city || 'Unknown Store';
};

const handlePlaceOrder = async () => {
  try {
    const orderId = await cartStore.placeOrder(authStore.member?.id);
    if (orderId) {
      orderSuccess.value = orderId;
      // Refresh orders
      const ordersRes = await axios.get(`${API_BASE}/orders/member/${authStore.member?.id}`);
      orders.value = ordersRes.data;
      await authStore.fetchRewards(authStore.member?.id);
    }
  } catch (err) {
    alert("Failed to place order. Please try again.");
  }
};
</script>

<template>
  <div class="max-w-7xl mx-auto px-8 py-16">
    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-mocha"></div>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-16">
      <!-- Left Column: User Info & Rewards -->
      <div class="space-y-12">
        <div class="bg-mocha p-10 rounded-[40px] text-white shadow-2xl space-y-8 relative overflow-hidden">
           <div class="absolute -bottom-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
           
           <div class="flex items-center gap-6">
             <div class="w-20 h-20 bg-latte rounded-[24px] flex items-center justify-center text-mocha border-2 border-white/20">
               <User :size="40" />
             </div>
             <div>
               <h2 class="text-3xl font-serif font-black uppercase leading-none">{{ authStore.member?.first_name }} {{ authStore.member?.last_name }}</h2>
               <p class="text-[10px] font-black uppercase tracking-widest text-white/40 mt-1">Club Member since '24</p>
             </div>
           </div>

           <div class="bg-black/20 p-8 rounded-3xl border border-white/10 text-center space-y-2">
             <div class="text-[10px] uppercase font-black tracking-[0.3em] text-latte">Accrued Status</div>
             <div class="text-7xl font-serif font-black">{{ authStore.rewards?.points_balance || 0 }}</div>
             <p class="text-[10px] font-black uppercase tracking-widest text-white/30 pt-2">Points until next reward: {{ 100 - ((authStore.rewards?.points_balance || 0) % 100) }}</p>
           </div>
           
           <div class="space-y-6 pt-4">
             <h3 class="text-[10px] uppercase font-black tracking-widest text-white/40 border-b border-white/10 pb-3">The Dossier</h3>
             <div class="space-y-4">
               <div class="flex justify-between items-center text-xs">
                 <span class="text-white/40 uppercase font-black tracking-widest">ID Handle</span>
                 <span class="font-bold font-mono">{{ authStore.member?.email.split('@')[0] }}</span>
               </div>
               <div class="flex justify-between items-center text-xs">
                 <span class="text-white/40 uppercase font-black tracking-widest">Home Store</span>
                 <span class="font-black uppercase">{{ getStoreName(authStore.member?.home_store) }}</span>
               </div>
             </div>
           </div>
        </div>

        <!-- Store Selection -->
        <div class="bg-white p-10 rounded-[40px] border border-border-joe shadow-sm space-y-6">
          <h3 class="text-xs font-black uppercase tracking-[0.2em] text-highlight flex items-center gap-2">
            <MapPin :size="16" />
            Store Selection
          </h3>
          <select 
            v-model="cartStore.selectedStoreId"
            class="w-full p-5 bg-cream-joe border-2 border-border-joe rounded-2xl font-black text-xs uppercase tracking-widest focus:outline-none focus:border-mocha"
          >
            <option v-for="loc in locations" :key="loc.id" :value="loc.id">
              {{ loc.city }} — {{ loc.address_one }}
            </option>
          </select>
          <p class="text-[10px] text-highlight leading-relaxed font-medium italic">Internal Pilot Protocol: Order online, finalize payment at registration upon arrival.</p>
        </div>
      </div>

      <!-- Right Column: Cart & Order History -->
      <div class="lg:col-span-2 space-y-16">
        <!-- Successful Order Alert -->
        <div v-if="orderSuccess" class="bg-ink p-8 rounded-[40px] text-white flex items-center justify-between mb-12 shadow-2xl animate-in fade-in zoom-in duration-500">
          <div class="flex items-center gap-6">
            <CheckCircle2 :size="32" class="text-green-400" />
            <div>
              <h4 class="text-2xl font-serif font-black uppercase leading-none">Order Dispatched</h4>
              <p class="text-white/60 text-xs font-mono mt-1 tracking-widest">Order: {{ orderSuccess }}</p>
            </div>
          </div>
          <button @click="orderSuccess = null" class="text-[10px] font-black uppercase tracking-widest hover:text-latte transition-colors">Acknowledge</button>
        </div>

        <div class="space-y-12">
          <div class="border-b-4 border-ink pb-4">
            <h2 class="text-6xl font-serif font-black text-ink uppercase leading-none">Order History</h2>
          </div>

          <!-- Checkout / Current Cart -->
          <div v-if="cartStore.items.length > 0" class="bg-white border-2 border-ink rounded-[44px] p-10 space-y-10 shadow-2xl relative">
            <div class="absolute -top-4 -right-4 w-12 h-12 bg-mocha rounded-full flex items-center justify-center text-white font-black text-sm border-4 border-white">
              {{ cartStore.itemCount }}
            </div>

            <div class="space-y-8">
              <div v-for="item in cartStore.items" :key="item.id" class="flex justify-between items-center group border-b border-border-joe pb-6 last:border-0 last:pb-0">
                <div class="flex items-center gap-6">
                  <div class="text-3xl font-serif font-black text-mocha">
                    {{ item.quantity }}
                  </div>
                  <div>
                    <h4 class="text-xl font-serif font-black uppercase text-ink">{{ item.name }}</h4>
                    <p class="text-[10px] font-black uppercase tracking-widest text-highlight">{{ item.size }} Selection</p>
                  </div>
                </div>
                <div class="flex items-center gap-8">
                  <span class="text-2xl font-mono font-bold text-ink">${{ (item.price * item.quantity).toFixed(2) }}</span>
                  <div class="flex gap-2">
                    <button @click="cartStore.removeFromCart(item.id)" class="w-8 h-8 rounded-lg bg-cream-joe border border-border-joe flex items-center justify-center hover:bg-mocha hover:text-white transition-all">
                      <ChevronRight class="rotate-180" :size="14" stroke-width="3" />
                    </button>
                    <button @click="cartStore.addToCart(item)" class="w-8 h-8 rounded-lg bg-cream-joe border border-border-joe flex items-center justify-center hover:bg-mocha hover:text-white transition-all">
                      <ChevronRight :size="14" stroke-width="3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="pt-10 border-t-2 border-ink space-y-8">
              <div class="flex justify-between items-end">
                <div>
                   <p class="text-[10px] font-black uppercase tracking-[0.2em] text-highlight">Total Order Value</p>
                   <h3 class="text-5xl font-serif font-black text-ink leading-none">${{ cartStore.total.toFixed(2) }}</h3>
                </div>
              </div>
              <button 
                @click="handlePlaceOrder"
                :disabled="cartStore.placingOrder"
                class="w-full py-6 bg-mocha text-white font-black uppercase tracking-widest rounded-2xl shadow-2xl hover:bg-ink transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <div v-if="cartStore.placingOrder" class="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span v-else>Finalize Selection & Accrue {{ Math.floor(cartStore.total) }} Points</span>
                <ShoppingBag v-if="!cartStore.placingOrder" :size="20" stroke-width="3" />
              </button>
            </div>
          </div>

          <!-- Order History -->
          <div class="space-y-8 pt-8">
            <h3 class="text-[10px] font-black uppercase tracking-[0.3em] text-highlight border-b border-border-joe pb-4">Order History</h3>
            
            <div v-if="orders.length === 0" class="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-border-joe">
              <Clock :size="48" class="mx-auto mb-4 opacity-10" />
              <p class="text-xs font-black uppercase tracking-widest text-highlight">No historical records found.</p>
              <RouterLink to="/menu" class="text-mocha font-black uppercase tracking-widest text-[10px] underline underline-offset-8 mt-4 inline-block">Initialize Order</RouterLink>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div v-for="order in orders" :key="order.order_id" class="bg-white p-8 rounded-[32px] border border-border-joe hover:shadow-xl transition-all group">
                <div class="space-y-6">
                  <div class="flex justify-between items-start">
                    <div class="space-y-1">
                       <span class="text-[10px] font-black uppercase tracking-widest text-highlight">Order #{{ order.order_id.slice(-8) }}</span>
                       <h4 class="text-xl font-serif font-black uppercase text-ink leading-none group-hover:text-mocha transition-colors">{{ getStoreName(order.store_id) }}</h4>
                    </div>
                    <div class="text-right">
                       <p class="text-2xl font-mono font-bold leading-none">${{ order.order_total.toFixed(2) }}</p>
                    </div>
                  </div>
                  <div class="flex justify-between items-end pt-4 border-t border-border-joe/50">
                    <div class="space-y-1">
                      <p class="text-[10px] font-black uppercase tracking-widest text-highlight">Accrued</p>
                      <p class="text-sm font-bold text-latte">{{ Math.floor(order.order_total) }} PTS</p>
                    </div>
                    <span class="text-[9px] font-bold text-highlight/50 uppercase">Ordered 2026</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
