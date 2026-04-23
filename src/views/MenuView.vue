<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';
import { useCartStore } from '../stores/cart';
import { Plus, Info, ShoppingBag, Flame, Coffee, X } from 'lucide-vue-next';

const API_BASE = 'https://uncle-joes-api-539076178854.us-central1.run.app';
const cartStore = useCartStore();

const menuItems = ref<any[]>([]);
const loading = ref(true);
const selectedCategory = ref('All');
const showCartPreview = ref(false);
const selectedSizeByProduct = ref<Record<string, string>>({});

const SIZE_ORDER: Record<string, number> = {
  Small: 1,
  Medium: 2,
  Large: 3,
};

onMounted(async () => {
  try {
    const res = await axios.get(`${API_BASE}/menu`);
    menuItems.value = res.data;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
});

const categories = computed(() => {
  const cats = new Set(menuItems.value.map(item => item.category));
  return ['All', ...Array.from(cats)].sort();
});

const groupedMenu = computed(() => {
  const filtered = selectedCategory.value === 'All' 
    ? menuItems.value 
    : menuItems.value.filter(item => item.category === selectedCategory.value);
  
  const groups: Record<string, any[]> = {};
  filtered.forEach((item) => {
    if (!groups[item.category]) groups[item.category] = [];

    const productKey = `${item.category}::${item.name}`;
    let product = groups[item.category].find((p) => p.key === productKey);
    if (!product) {
      product = {
        key: productKey,
        name: item.name,
        category: item.category,
        variants: [],
      };
      groups[item.category].push(product);
    }

    product.variants.push(item);
  });

  Object.values(groups).forEach((products) => {
    products.forEach((product) => {
      product.variants.sort((a: any, b: any) => (SIZE_ORDER[a.size] ?? 99) - (SIZE_ORDER[b.size] ?? 99));
    });
  });

  return groups;
});

watch(
  groupedMenu,
  (groups) => {
    Object.values(groups).forEach((products) => {
      products.forEach((product: any) => {
        const currentSize = selectedSizeByProduct.value[product.key];
        const hasCurrentSize = product.variants.some((variant: any) => variant.size === currentSize);
        if (!hasCurrentSize && product.variants.length > 0) {
          selectedSizeByProduct.value[product.key] = product.variants[0].size;
        }
      });
    });
  },
  { immediate: true }
);

const getSelectedVariant = (product: any) => {
  const selectedSize = selectedSizeByProduct.value[product.key];
  return product.variants.find((variant: any) => variant.size === selectedSize) ?? product.variants[0];
};

const selectSize = (product: any, size: string) => {
  selectedSizeByProduct.value[product.key] = size;
};

const handleAddToCart = (product: any) => {
  const variant = getSelectedVariant(product);
  if (!variant) return;
  cartStore.addToCart(variant);
  showCartPreview.value = true;
};
</script>

<template>
  <div class="max-w-7xl mx-auto px-8 py-16 relative">
    <header class="mb-16 space-y-4">
      <h1 class="text-7xl md:text-9xl font-serif font-black text-ink uppercase leading-none -ml-1">The Menu</h1>
      <p class="text-highlight max-w-2xl text-lg font-medium">Rich, smooth, and locally roasted since 1982. Explore our selection of handcrafted perfection.</p>
    </header>

    <!-- Filters -->
    <div class="flex overflow-x-auto pb-8 mb-16 no-scrollbar gap-4 border-b border-border-joe">
      <button 
        v-for="cat in categories" 
        :key="cat"
        @click="selectedCategory = cat"
        :class="[
          'px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all',
          selectedCategory === cat 
            ? 'bg-mocha text-white shadow-xl translate-y-[-2px]' 
            : 'text-highlight hover:bg-border-joe/20'
        ]"
      >
        {{ cat }}
      </button>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-mocha"></div>
    </div>

    <div v-else class="space-y-24">
      <div v-for="(products, category) in groupedMenu" :key="category" class="space-y-12">
        <div class="flex justify-between items-end border-b-4 border-ink pb-4">
          <h2 class="text-6xl font-serif font-black text-ink uppercase leading-none">{{ category }}</h2>
          <span class="text-[10px] font-black uppercase tracking-widest text-highlight mb-2">{{ products.length }} Item{{ products.length > 1 ? 's' : '' }}</span>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-12">
          <div 
            v-for="product in products" 
            :key="product.key"
            class="group flex justify-between items-start border-b border-border-joe pb-8 hover:border-mocha transition-all"
          >
            <div class="space-y-2 flex-1">
              <div class="flex items-center gap-2">
                <h3 class="text-2xl font-serif font-black uppercase text-ink group-hover:text-mocha transition-colors">{{ product.name }}</h3>
                <span v-if="getSelectedVariant(product)?.calories < 100" class="px-2 py-0.5 bg-green-100 text-green-700 text-[8px] font-black uppercase tracking-widest rounded">Light</span>
              </div>
              <p class="text-[10px] text-highlight font-black tracking-widest uppercase">
                {{ getSelectedVariant(product)?.size }} • {{ getSelectedVariant(product)?.calories }} Cal
              </p>
              <div class="flex gap-2 pt-2">
                <button
                  v-for="variant in product.variants"
                  :key="variant.id"
                  @click="selectSize(product, variant.size)"
                  :class="[
                    'px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border transition-colors',
                    selectedSizeByProduct[product.key] === variant.size
                      ? 'bg-mocha text-white border-mocha'
                      : 'bg-white text-highlight border-border-joe hover:border-mocha hover:text-mocha'
                  ]"
                >
                  {{ variant.size }}
                </button>
              </div>
            </div>

            <div class="flex items-center gap-6">
              <span class="text-2xl font-mono font-bold text-ink">${{ getSelectedVariant(product)?.price.toFixed(2) }}</span>
              <button 
                @click="handleAddToCart(product)"
                class="w-12 h-12 bg-cream-joe border-2 border-mocha text-mocha rounded-full hover:bg-mocha hover:text-white transition-all flex items-center justify-center shadow-lg active:scale-110"
              >
                <Plus :size="20" stroke-width="3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating Cart Preview -->
    <div 
      v-if="cartStore.itemCount > 0"
      class="fixed bottom-24 lg:bottom-12 right-4 lg:right-12 z-40"
    >
      <div 
        v-if="showCartPreview"
        class="bg-white w-72 rounded-2xl shadow-2xl border border-mocha/10 p-6 mb-4 animate-in slide-in-from-bottom-4"
      >
        <div class="flex justify-between items-center mb-4">
          <h4 class="font-bold text-mocha">Your Order</h4>
          <button @click="showCartPreview = false" class="text-mocha/40 hover:text-mocha">
            <X :size="16" />
          </button>
        </div>
        <div class="max-h-48 overflow-y-auto space-y-3 mb-4 pr-1 thin-scrollbar">
          <div v-for="item in cartStore.items" :key="item.id" class="flex justify-between text-sm items-center">
            <div class="flex gap-2 items-center">
              <span class="font-bold text-latte">{{ item.quantity }}x</span>
              <span class="text-mocha/80 truncate w-32">{{ item.name }}</span>
            </div>
            <span class="font-mono text-mocha/60">${{ (item.price * item.quantity).toFixed(2) }}</span>
          </div>
        </div>
        <div class="border-t border-mocha/5 pt-4 text-center">
          <RouterLink 
            to="/profile"
            class="block w-full py-3 bg-mocha text-[var(--color-cream-joe)] font-bold rounded shadow-lg hover:bg-espresso transition-colors text-sm"
          >
            Review & Order (${{ cartStore.total.toFixed(2) }})
          </RouterLink>
        </div>
      </div>

      <button 
        v-else
        @click="showCartPreview = true"
        class="w-16 h-16 bg-mocha text-cream rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform relative group"
      >
        <ShoppingBag :size="24" />
        <span class="absolute -top-1 -right-1 w-6 h-6 bg-latte text-cream text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-cream group-hover:animate-bounce">
          {{ cartStore.itemCount }}
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.thin-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.thin-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(75, 54, 33, 0.1);
  border-radius: 9999px;
}
</style>
