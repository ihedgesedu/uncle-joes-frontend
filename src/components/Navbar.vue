<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useCartStore } from '../stores/cart';
import { Coffee, Menu, X, ShoppingBag, User, MapPin } from 'lucide-vue-next';

const isMenuOpen = ref(false);
const authStore = useAuthStore();
const cartStore = useCartStore();
const router = useRouter();

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

const handleLogout = () => {
  authStore.logout();
  router.push('/');
  closeMenu();
};

onMounted(() => {
  if (authStore.isAuthenticated) {
    authStore.fetchRewards();
  }
});

watch(
  () => authStore.member?.id,
  (memberId) => {
    if (memberId) {
      authStore.fetchRewards(memberId);
    }
  }
);
</script>

<template>
  <nav class="fixed top-0 left-0 right-0 z-50 bg-cream-joe/90 backdrop-blur-xl border-b border-border-joe h-20">
    <div class="max-w-7xl mx-auto px-8 h-full flex items-center justify-between">
      <!-- Logo -->
      <RouterLink to="/" class="flex items-center gap-3 group" @click="closeMenu">
        <div class="w-10 h-10 rounded-full bg-mocha flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform">
          <Coffee :size="20" />
        </div>
        <div class="flex flex-col leading-none">
          <span class="text-2xl font-black font-serif tracking-tighter uppercase text-ink">Uncle Joe's</span>
          <span class="text-[10px] font-normal tracking-[0.2em] text-highlight">COFFEE COMPANY</span>
        </div>
      </RouterLink>

      <!-- Desktop Navigation -->
      <div class="hidden md:flex items-center gap-8">
        <RouterLink to="/menu" class="text-xs font-black uppercase tracking-widest text-ink hover:text-highlight transition-colors">The Menu</RouterLink>
        <RouterLink to="/locations" class="text-xs font-black uppercase tracking-widest text-ink hover:text-highlight transition-colors">Locations</RouterLink>
        <RouterLink v-if="!authStore.isAuthenticated" to="/login" class="text-xs font-black uppercase tracking-widest text-ink hover:text-highlight transition-colors">Member Login</RouterLink>
        <div v-else class="flex items-center gap-6">
          <div class="text-right hidden sm:block">
            <p class="text-[10px] uppercase font-bold tracking-widest text-highlight leading-none">Club Status</p>
            <p class="text-lg font-black font-mono leading-tight">{{ authStore.rewards?.points_balance ?? 0 }} PTS</p>
          </div>
          <RouterLink to="/profile" class="w-12 h-12 bg-latte rounded-full border-2 border-mocha flex items-center justify-center hover:scale-105 transition-transform">
            <span class="text-mocha font-bold">{{ authStore.member?.first_name.charAt(0) }}{{ authStore.member?.last_name.charAt(0) }}</span>
          </RouterLink>
          <button @click="handleLogout" class="text-xs font-black uppercase tracking-widest text-red-700/70 hover:text-red-800 transition-colors">
            Sign Out
          </button>
        </div>
      </div>

      <!-- Actions (Mobile Only) -->
      <div class="flex items-center gap-4 md:hidden">
        <RouterLink to="/menu" class="relative p-2 text-mocha">
          <ShoppingBag :size="22" />
          <span v-if="cartStore.itemCount > 0" class="absolute top-0 right-0 w-4 h-4 bg-mocha text-white text-[9px] font-black rounded-full flex items-center justify-center">
            {{ cartStore.itemCount }}
          </span>
        </RouterLink>
        
        <button @click="toggleMenu" class="p-2 text-mocha">
          <Menu v-if="!isMenuOpen" :size="24" />
          <X v-else :size="24" />
        </button>
      </div>
    </div>

    <!-- Mobile Navigation Panel -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <div v-if="isMenuOpen" class="md:hidden bg-cream-joe border-b border-border-joe">
        <div class="px-8 py-8 space-y-6 flex flex-col">
          <RouterLink to="/menu" @click="closeMenu" class="text-2xl font-black uppercase tracking-tighter border-b border-border-joe pb-3">The Menu</RouterLink>
          <RouterLink to="/locations" @click="closeMenu" class="text-2xl font-black uppercase tracking-tighter border-b border-border-joe pb-3">Locations</RouterLink>
          
          <template v-if="!authStore.isAuthenticated">
            <RouterLink to="/login" @click="closeMenu" class="text-2xl font-black uppercase tracking-tighter border-b border-border-joe pb-3">Club Login</RouterLink>
          </template>
          <template v-else>
            <RouterLink to="/profile" @click="closeMenu" class="text-2xl font-black uppercase tracking-tighter border-b border-border-joe pb-3 flex justify-between items-center">
              <span>My Profile</span>
              <span class="text-sm font-mono text-highlight">{{ authStore.rewards?.points_balance ?? 0 }} PTS</span>
            </RouterLink>
            <button @click="handleLogout" class="text-left text-xs font-black uppercase tracking-widest text-red-700/60">Sign Out</button>
          </template>
        </div>
      </div>
    </transition>

    <!-- Mobile Bottom Taskbar -->
    <div class="md:hidden fixed bottom-1 left-0 right-0 z-50 px-4">
      <nav class="bg-white/95 backdrop-blur-lg border border-border-joe h-16 flex items-center justify-around rounded-2xl shadow-2xl overflow-hidden">
        <RouterLink to="/" class="flex flex-col items-center gap-1 text-highlight/40" active-class="text-mocha !opacity-100">
          <Coffee :size="20" />
          <span class="text-[9px] font-black uppercase tracking-tighter">Home</span>
        </RouterLink>
        <RouterLink to="/menu" class="flex flex-col items-center gap-1 text-highlight/40" active-class="text-mocha !opacity-100">
          <Menu :size="20" />
          <span class="text-[9px] font-black uppercase tracking-tighter">Menu</span>
        </RouterLink>
        <RouterLink to="/locations" class="flex flex-col items-center gap-1 text-highlight/40" active-class="text-mocha !opacity-100">
          <MapPin :size="20" />
          <span class="text-[9px] font-black uppercase tracking-tighter">Map</span>
        </RouterLink>
        <RouterLink :to="authStore.isAuthenticated ? '/profile' : '/login'" class="flex flex-col items-center gap-1 text-highlight/40" active-class="text-mocha !opacity-100">
          <User :size="20" />
          <span class="text-[9px] font-black uppercase tracking-tighter">Club</span>
        </RouterLink>
      </nav>
    </div>
  </nav>
</template>
