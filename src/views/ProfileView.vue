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
  Clock, 
  Minus,
  Plus,
  ChevronDown,
  ChevronUp
} from 'lucide-vue-next';

const API_BASE = 'https://uncle-joes-api-539076178854.us-central1.run.app';
const authStore = useAuthStore();
const cartStore = useCartStore();
const router = useRouter();

const orders = ref<any[]>([]);
const loading = ref(true);
const locations = ref<any[]>([]);
const menuItems = ref<any[]>([]);
const expandedOrderId = ref<string | null>(null);
const orderItemsById = ref<Record<string, any[]>>({});
const orderDetailsLoadingById = ref<Record<string, boolean>>({});
const profileForm = ref({
  id: '',
  first_name: '',
  last_name: '',
  email: '',
  home_store: '',
  password: ''
});
const profileSaving = ref(false);
const profileError = ref<string | null>(null);
const profileSuccess = ref<string | null>(null);
const showEditAccount = ref(false);
const checkoutStoreQuery = ref('');
const homeStoreQuery = ref('');
const orderConfirmationMessage = ref<string | null>(null);

const STATE_NAME_TO_ABBR: Record<string, string> = {
  alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR', california: 'CA',
  colorado: 'CO', connecticut: 'CT', delaware: 'DE', florida: 'FL', georgia: 'GA',
  hawaii: 'HI', idaho: 'ID', illinois: 'IL', indiana: 'IN', iowa: 'IA',
  kansas: 'KS', kentucky: 'KY', louisiana: 'LA', maine: 'ME', maryland: 'MD',
  massachusetts: 'MA', michigan: 'MI', minnesota: 'MN', mississippi: 'MS', missouri: 'MO',
  montana: 'MT', nebraska: 'NE', nevada: 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
  'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', ohio: 'OH',
  oklahoma: 'OK', oregon: 'OR', pennsylvania: 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
  'south dakota': 'SD', tennessee: 'TN', texas: 'TX', utah: 'UT', vermont: 'VT',
  virginia: 'VA', washington: 'WA', 'west virginia': 'WV', wisconsin: 'WI', wyoming: 'WY'
};

const normalizeStateSearchTerm = (query: string) => {
  const lowered = query.trim().toLowerCase();
  const stateAbbr = STATE_NAME_TO_ABBR[lowered];
  return {
    lowered,
    stateAbbr: stateAbbr ? stateAbbr.toLowerCase() : null
  };
};

const getLocationLabel = (location: any) => {
  const primary = location?.name || location?.city || 'Store';
  const cityState = [location?.city, location?.state].filter(Boolean).join(', ');
  const address = location?.address_one || '';
  return [primary, cityState, address].filter(Boolean).join(' - ');
};

const locationMatchesQuery = (location: any, query: string) => {
  if (!query.trim()) return true;
  const { lowered, stateAbbr } = normalizeStateSearchTerm(query);
  const locationState = String(location?.state ?? '').toLowerCase();
  const searchableValues = [location?.name, location?.city, location?.state, location?.address_one]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

  if (searchableValues.some((value) => value.includes(lowered))) {
    return true;
  }

  return stateAbbr !== null && locationState === stateAbbr;
};

const filteredCheckoutLocations = computed(() =>
  locations.value.filter((loc) => locationMatchesQuery(loc, checkoutStoreQuery.value)).slice(0, 12)
);

const filteredHomeStoreLocations = computed(() =>
  locations.value.filter((loc) => locationMatchesQuery(loc, homeStoreQuery.value)).slice(0, 12)
);

const selectedCheckoutStore = computed(() =>
  locations.value.find((loc) => String(loc.id) === String(cartStore.selectedStoreId)) ?? null
);

const syncProfileForm = () => {
  if (!authStore.member) return;
  profileForm.value = {
    id: authStore.member.id ?? '',
    first_name: authStore.member.first_name ?? '',
    last_name: authStore.member.last_name ?? '',
    email: authStore.member.email ?? '',
    home_store: authStore.member.home_store ?? '',
    password: authStore.member.password ?? ''
  };
};

const updateStoreQueriesFromSelections = () => {
  const selectedCheckoutStore = locations.value.find((loc) => String(loc.id) === String(cartStore.selectedStoreId));
  if (selectedCheckoutStore) {
    checkoutStoreQuery.value = getLocationLabel(selectedCheckoutStore);
  }

  const selectedHomeStore = locations.value.find((loc) => String(loc.id) === String(profileForm.value.home_store));
  if (selectedHomeStore) {
    homeStoreQuery.value = getLocationLabel(selectedHomeStore);
  }
};

const initializeDefaultCheckoutStore = () => {
  if (cartStore.selectedStoreId) return;

  const homeStoreId = authStore.member?.home_store;
  const homeStoreMatch = locations.value.find((loc) => String(loc.id) === String(homeStoreId));
  if (homeStoreMatch) {
    cartStore.selectedStoreId = String(homeStoreMatch.id);
    checkoutStoreQuery.value = getLocationLabel(homeStoreMatch);
    return;
  }

  if (locations.value.length > 0) {
    cartStore.selectedStoreId = String(locations.value[0].id);
    checkoutStoreQuery.value = getLocationLabel(locations.value[0]);
  }
};

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
    const [ordersRes, _rewards, locationsRes, menuRes] = await Promise.all([
      axios.get(`${API_BASE}/orders/member/${memberId}`),
      authStore.fetchRewards(memberId),
      axios.get(`${API_BASE}/locations`),
      axios.get(`${API_BASE}/menu`)
    ]);
    orders.value = ordersRes.data;
    locations.value = locationsRes.data;
    menuItems.value = menuRes.data;
    
    syncProfileForm();
    initializeDefaultCheckoutStore();
    updateStoreQueriesFromSelections();
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
});

const getStoreName = (storeId: string) => {
  return locations.value.find(l => l.id === storeId)?.city || 'Unknown Store';
};

const getStoreAddress = (storeId: string) => {
  const location = locations.value.find(l => l.id === storeId);
  if (!location) return 'Address unavailable';
  return `${location.address_one}, ${location.city}, ${location.state} ${location.zip_code}`;
};

const getOrderDateLabel = (order: any) => {
  const rawDate = order.created_at ?? order.createdAt ?? order.order_date ?? order.ordered_at ?? order.timestamp;
  if (!rawDate) return 'Date unavailable';
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  const monthLabels = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'];
  return `${monthLabels[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

const getItemName = (item: any) => {
  const match = menuItems.value.find(m => m.id === item.menu_item_id);
  if (!match) return `Item ${String(item.menu_item_id).slice(-6)}`;
  const sizeLabel = match.size ? ` (${match.size})` : '';
  return `${match.name}${sizeLabel}`;
};

const fetchOrderDetails = async (orderId: string) => {
  if (orderItemsById.value[orderId]) return;

  orderDetailsLoadingById.value[orderId] = true;
  try {
    const res = await axios.get(`${API_BASE}/order-items/${orderId}`);
    const items = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.items) ? res.data.items : [];
    orderItemsById.value[orderId] = items;
  } catch (err) {
    console.error(err);
    orderItemsById.value[orderId] = [];
  } finally {
    orderDetailsLoadingById.value[orderId] = false;
  }
};

const toggleOrderDetails = async (orderId: string) => {
  if (expandedOrderId.value === orderId) {
    expandedOrderId.value = null;
    return;
  }
  expandedOrderId.value = orderId;
  await fetchOrderDetails(orderId);
};

const handlePlaceOrder = async () => {
  const selectedStoreLabel = selectedCheckoutStore.value
    ? getLocationLabel(selectedCheckoutStore.value)
    : 'Selected store';

  try {
    const orderId = await cartStore.placeOrder(authStore.member?.id);
    if (orderId) {
      orderConfirmationMessage.value = `Order ${orderId} confirmed. Pickup at ${selectedStoreLabel}\n\nReminder, payment is due at pickup`;
      // Refresh orders
      const ordersRes = await axios.get(`${API_BASE}/orders/member/${authStore.member?.id}`);
      orders.value = ordersRes.data;
      await authStore.fetchRewards(authStore.member?.id);
    }
  } catch (err) {
    alert("Failed to place order. Please try again.");
  }
};

const selectCheckoutStore = (location: any) => {
  cartStore.selectedStoreId = String(location.id);
  checkoutStoreQuery.value = getLocationLabel(location);
};

const selectHomeStore = (location: any) => {
  profileForm.value.home_store = String(location.id);
  homeStoreQuery.value = getLocationLabel(location);
};

const handleResetProfileForm = () => {
  syncProfileForm();
  updateStoreQueriesFromSelections();
  profileError.value = null;
  profileSuccess.value = null;
  showEditAccount.value = false;
};

const handleToggleEditAccount = () => {
  if (showEditAccount.value) {
    handleResetProfileForm();
  }
  showEditAccount.value = !showEditAccount.value;
};

const handleUpdateProfile = async () => {
  const memberId = authStore.member?.id ?? localStorage.getItem('joe_member_id');
  if (!memberId) return;

  profileSaving.value = true;
  profileError.value = null;
  profileSuccess.value = null;

  try {
    const payload: Record<string, string> = {
      id: profileForm.value.id,
      first_name: profileForm.value.first_name,
      last_name: profileForm.value.last_name,
      email: profileForm.value.email,
      home_store: profileForm.value.home_store
    };

    // Keep password unchanged if API expects it in the payload.
    if (profileForm.value.password) {
      payload.password = profileForm.value.password;
    }

    await axios.put(`${API_BASE}/members/${memberId}`, payload);
    await authStore.fetchProfile(memberId);
    syncProfileForm();
    updateStoreQueriesFromSelections();
    profileSuccess.value = 'Profile updated successfully.';
  } catch (err) {
    console.error(err);
    profileError.value = 'Failed to update profile. Please try again.';
  } finally {
    profileSaving.value = false;
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

           <button
             type="button"
             @click="handleToggleEditAccount"
             class="w-full py-4 bg-latte text-mocha font-black uppercase tracking-widest rounded-2xl hover:bg-white transition-colors"
           >
             {{ showEditAccount ? 'Close Edit Account' : 'Edit Account' }}
           </button>
        </div>

        <div v-if="showEditAccount" class="bg-white p-10 rounded-[40px] border border-border-joe shadow-sm space-y-6">
          <h3 class="text-xs font-black uppercase tracking-[0.2em] text-highlight">Edit Member Profile</h3>

          <div class="grid grid-cols-1 gap-4">
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest text-highlight">Member ID</label>
              <input
                :value="profileForm.id"
                disabled
                class="w-full p-4 bg-gray-100 border border-border-joe rounded-xl text-xs font-mono text-highlight/80 cursor-not-allowed"
              />
            </div>

            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest text-highlight">First Name</label>
              <input
                v-model="profileForm.first_name"
                type="text"
                class="w-full p-4 bg-cream-joe border border-border-joe rounded-xl text-xs font-semibold focus:outline-none focus:border-mocha"
              />
            </div>

            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest text-highlight">Last Name</label>
              <input
                v-model="profileForm.last_name"
                type="text"
                class="w-full p-4 bg-cream-joe border border-border-joe rounded-xl text-xs font-semibold focus:outline-none focus:border-mocha"
              />
            </div>

            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest text-highlight">Email</label>
              <input
                v-model="profileForm.email"
                type="email"
                class="w-full p-4 bg-cream-joe border border-border-joe rounded-xl text-xs font-semibold focus:outline-none focus:border-mocha"
              />
            </div>

            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest text-highlight">Home Store</label>
              <input
                v-model="homeStoreQuery"
                type="text"
                placeholder="Search by store, city, or state"
                class="w-full p-4 bg-cream-joe border border-border-joe rounded-xl text-xs font-semibold focus:outline-none focus:border-mocha"
              />
              <div class="max-h-44 overflow-y-auto border border-border-joe rounded-xl bg-white">
                <button
                  v-for="loc in filteredHomeStoreLocations"
                  :key="`home-store-${loc.id}`"
                  type="button"
                  @click="selectHomeStore(loc)"
                  :class="[
                    'w-full text-left px-4 py-3 text-xs border-b border-border-joe last:border-b-0 hover:bg-cream-joe transition-colors',
                    String(loc.id) === String(profileForm.home_store) ? 'bg-cream-joe font-black text-ink' : 'text-highlight'
                  ]"
                >
                  {{ getLocationLabel(loc) }}
                </button>
                <p v-if="filteredHomeStoreLocations.length === 0" class="px-4 py-3 text-xs text-highlight">
                  No matching stores found.
                </p>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest text-highlight">Password</label>
              <input
                type="password"
                value="********"
                disabled
                class="w-full p-4 bg-gray-100 border border-border-joe rounded-xl text-xs font-semibold text-highlight/80 cursor-not-allowed"
              />
            </div>
          </div>

          <p v-if="profileError" class="text-[11px] text-red-600 font-semibold">{{ profileError }}</p>
          <p v-if="profileSuccess" class="text-[11px] text-green-700 font-semibold">{{ profileSuccess }}</p>

          <div class="flex items-center gap-3">
            <button
              type="button"
              @click="handleUpdateProfile"
              :disabled="profileSaving"
              class="px-5 py-3 bg-mocha text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-ink transition-colors disabled:opacity-50"
            >
              {{ profileSaving ? 'Saving...' : 'Save Changes' }}
            </button>
            <button
              type="button"
              @click="handleResetProfileForm"
              :disabled="profileSaving"
              class="px-5 py-3 border border-border-joe text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-cream-joe transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>

      </div>

      <!-- Right Column: Cart & Order History -->
      <div class="lg:col-span-2 space-y-16">
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
                      <Minus :size="14" stroke-width="3" />
                    </button>
                    <button @click="cartStore.addToCart(item)" class="w-8 h-8 rounded-lg bg-cream-joe border border-border-joe flex items-center justify-center hover:bg-mocha hover:text-white transition-all">
                      <Plus :size="14" stroke-width="3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="pt-10 border-t-2 border-ink space-y-8">
              <div class="space-y-3">
                <h4 class="text-[10px] font-black uppercase tracking-[0.2em] text-highlight flex items-center gap-2">
                  <MapPin :size="14" />
                  Pickup Store
                </h4>
                <input
                  v-model="checkoutStoreQuery"
                  type="text"
                  placeholder="Search by store, city, or state"
                  class="w-full p-4 bg-cream-joe border border-border-joe rounded-xl text-xs font-semibold tracking-wide focus:outline-none focus:border-mocha"
                />
                <div class="max-h-52 overflow-y-auto border border-border-joe rounded-xl bg-white divide-y divide-border-joe">
                  <div
                    v-for="loc in filteredCheckoutLocations"
                    :key="`checkout-store-inline-${loc.id}`"
                    class="px-4 py-3 flex items-start justify-between gap-4"
                  >
                    <div class="min-w-0">
                      <p class="text-xs font-bold text-ink truncate">{{ loc.name || loc.city }}</p>
                      <p class="text-[11px] text-highlight">{{ loc.address_one }}, {{ loc.city }}, {{ loc.state }}</p>
                    </div>
                    <button
                      type="button"
                      @click="selectCheckoutStore(loc)"
                      :class="[
                        'shrink-0 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg border transition-colors',
                        String(loc.id) === String(cartStore.selectedStoreId)
                          ? 'bg-mocha text-white border-mocha'
                          : 'bg-cream-joe text-mocha border-mocha hover:bg-mocha hover:text-white'
                      ]"
                    >
                      {{ String(loc.id) === String(cartStore.selectedStoreId) ? 'Selected' : 'Select' }}
                    </button>
                  </div>
                  <p v-if="filteredCheckoutLocations.length === 0" class="px-4 py-3 text-xs text-highlight">
                    No matching stores found.
                  </p>
                </div>
                <p class="text-[11px] text-highlight">
                  Selected pickup store:
                  <span class="font-semibold text-ink">{{ selectedCheckoutStore ? getLocationLabel(selectedCheckoutStore) : 'None selected' }}</span>
                </p>
              </div>

              <div class="flex justify-between items-end">
                <div>
                   <p class="text-[10px] font-black uppercase tracking-[0.2em] text-highlight">Total Order Value</p>
                   <h3 class="text-5xl font-serif font-black text-ink leading-none">${{ cartStore.total.toFixed(2) }}</h3>
                </div>
              </div>
              <button 
                @click="handlePlaceOrder"
                :disabled="cartStore.placingOrder || !cartStore.selectedStoreId"
                class="w-full py-6 bg-mocha text-white font-black uppercase tracking-widest rounded-2xl shadow-2xl hover:bg-ink transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <div v-if="cartStore.placingOrder" class="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span v-else>Finalize Selection & Accrue {{ Math.floor(cartStore.total) }} Points</span>
                <ShoppingBag v-if="!cartStore.placingOrder" :size="20" stroke-width="3" />
              </button>
              <p class="text-[11px] text-highlight text-center">
                Pay Ahead Ordering is not available. All mobile orders must be paid for in store.
              </p>
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
              <div v-for="order in orders" :key="order.order_id" class="bg-white rounded-[32px] border border-border-joe hover:shadow-xl transition-all group overflow-hidden">
                <div class="space-y-6">
                  <button
                    type="button"
                    @click="toggleOrderDetails(order.order_id)"
                    class="w-full p-8 text-left hover:bg-cream-joe/40 transition-colors"
                  >
                    <div class="flex justify-between items-start gap-4">
                      <div class="space-y-1">
                        <span class="text-[10px] font-black uppercase tracking-widest text-highlight">Order #{{ order.order_id.slice(-8) }}</span>
                        <h4 class="text-xl font-serif font-black uppercase text-ink leading-none group-hover:text-mocha transition-colors">{{ getStoreName(order.store_id) }}</h4>
                        <p class="text-[10px] font-black uppercase tracking-widest text-highlight/70">Ordered {{ getOrderDateLabel(order) }}</p>
                      </div>
                      <div class="text-right">
                        <p class="text-2xl font-mono font-bold leading-none">${{ order.order_total.toFixed(2) }}</p>
                      </div>
                    </div>
                    <div class="flex justify-between items-end pt-4 border-t border-border-joe/50 mt-6">
                      <div class="space-y-1">
                        <p class="text-[10px] font-black uppercase tracking-widest text-highlight">Accrued</p>
                        <p class="text-sm font-bold text-latte">{{ Math.floor(order.order_total) }} PTS</p>
                      </div>
                      <div class="flex items-center gap-2 text-highlight/70">
                        <span class="text-[9px] font-bold uppercase">View Details</span>
                        <ChevronUp v-if="expandedOrderId === order.order_id" :size="14" />
                        <ChevronDown v-else :size="14" />
                      </div>
                    </div>
                  </button>

                  <div v-if="expandedOrderId === order.order_id" class="px-8 pb-8 -mt-2">
                    <div class="rounded-2xl border border-border-joe bg-cream-joe p-5 space-y-4">
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <p class="text-[10px] font-black uppercase tracking-widest text-highlight">Ordered</p>
                          <p class="font-semibold text-ink">{{ getOrderDateLabel(order) }}</p>
                        </div>
                        <div>
                          <p class="text-[10px] font-black uppercase tracking-widest text-highlight">Location</p>
                          <p class="font-semibold text-ink">{{ getStoreAddress(order.store_id) }}</p>
                        </div>
                      </div>

                      <div class="pt-2 border-t border-border-joe">
                        <p class="text-[10px] font-black uppercase tracking-widest text-highlight mb-2">Order Items</p>
                        <p v-if="orderDetailsLoadingById[order.order_id]" class="text-xs text-highlight">Loading items...</p>
                        <div v-else-if="(orderItemsById[order.order_id] ?? []).length === 0" class="text-xs text-highlight">
                          Item details are unavailable for this order.
                        </div>
                        <div v-else class="space-y-2">
                          <div
                            v-for="item in (orderItemsById[order.order_id] ?? [])"
                            :key="item.id"
                            class="flex justify-between items-start gap-4 text-xs"
                          >
                            <div>
                              <p class="font-bold text-ink">{{ getItemName(item) }}</p>
                              <p class="text-highlight uppercase tracking-wider">Qty {{ item.quantity }}</p>
                            </div>
                            <p class="font-mono font-bold text-ink">${{ (item.price * item.quantity).toFixed(2) }}</p>
                          </div>
                        </div>
                      </div>

                      <div class="pt-2 border-t border-border-joe flex justify-between items-center">
                        <p class="text-[10px] font-black uppercase tracking-widest text-highlight">Points Accrued</p>
                        <p class="text-sm font-bold text-latte">{{ Math.floor(order.order_total) }} PTS</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-if="orderConfirmationMessage" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
    <div class="w-full max-w-lg bg-white rounded-3xl border border-border-joe shadow-2xl p-8 space-y-6">
      <h4 class="text-2xl font-serif font-black uppercase text-ink">Order Confirmed</h4>
      <p class="text-sm text-ink whitespace-pre-line">{{ orderConfirmationMessage }}</p>
      <div class="flex justify-end">
        <button
          type="button"
          @click="orderConfirmationMessage = null"
          class="px-5 py-2.5 bg-mocha text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-ink transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>
