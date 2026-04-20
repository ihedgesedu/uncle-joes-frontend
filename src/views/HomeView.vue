<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { ArrowRight, Coffee, Heart, Star, TrendingUp } from 'lucide-vue-next';

const featured = [
  { id: '1', name: 'Mocha Dream', price: 5.25, img: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&q=80&w=400' },
  { id: '2', name: 'Caramel Macchiato', price: 4.95, img: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&q=80&w=400' },
  { id: '3', name: 'Nitro Cold Brew', price: 4.50, img: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=400' },
];
</script>

<template>
  <div class="overflow-x-hidden">
    <!-- Hero Section -->
    <section class="relative h-[80vh] flex items-center bg-mocha overflow-hidden">
      <!-- Background Texture -->
      <div class="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/coffee-beans.png')]"></div>
      
      <div class="max-w-7xl mx-auto px-8 w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
        <div class="space-y-6">
          <h1 class="text-6xl md:text-8xl font-serif font-black text-white leading-none uppercase -ml-1">
            Pure <br/> <span class="bg-white text-mocha px-2 inline-block transform rotate-1">Espresso</span> <br/> Since '82.
          </h1>
          <p class="text-white/70 max-w-md text-lg font-medium leading-relaxed">
            Rich, smooth, and locally roasted in Chicago. Handcrafted intensity for the true coffee advocate.
          </p>
          <div class="flex flex-wrap gap-4 pt-4">
            <RouterLink to="/menu" class="px-8 py-4 bg-white text-mocha font-black uppercase tracking-widest hover:bg-highlight hover:text-white transition-all rounded-lg shadow-2xl flex items-center gap-2">
              The Menu
              <ArrowRight :size="18" />
            </RouterLink>
            <RouterLink to="/locations" class="px-8 py-4 border-2 border-white/20 text-white font-black uppercase tracking-widest hover:bg-white/10 transition-all rounded-lg">
              Locations
            </RouterLink>
          </div>
        </div>
        
        <div class="hidden md:block relative">
          <div class="w-[500px] h-[500px] bg-white rounded-full absolute -top-10 -right-10 opacity-10 blur-3xl"></div>
          <img 
            src="https://images.unsplash.com/photo-1541167760496-162955ed8a9f?auto=format&fit=crop&q=80&w=800" 
            alt="Delicious Latte" 
            class="rounded-3xl shadow-2xl relative z-10 p-4 bg-white/5 backdrop-blur-3xl border border-white/10"
          />
        </div>
      </div>
    </section>

    <!-- Values / Stats -->
    <section class="py-20 bg-cream-joe border-y border-border-joe">
      <div class="max-w-7xl mx-auto px-8 grid grid-cols-2 lg:grid-cols-4 gap-8">
        <div class="text-center space-y-2 border-r border-border-joe last:border-r-0 pr-4">
          <p class="text-[10px] uppercase font-black tracking-[0.2em] text-highlight">Store Count</p>
          <h3 class="text-6xl font-serif font-black tracking-tighter">500</h3>
        </div>
        <div class="text-center space-y-2 border-r border-border-joe last:border-r-0 pr-4">
          <p class="text-[10px] uppercase font-black tracking-[0.2em] text-highlight">Patron Rating</p>
          <h3 class="text-6xl font-serif font-black tracking-tighter">4.8</h3>
        </div>
        <div class="text-center space-y-2 border-r border-border-joe last:border-r-0 pr-4">
          <p class="text-[10px] uppercase font-black tracking-[0.2em] text-highlight">Club Members</p>
          <h3 class="text-6xl font-serif font-black tracking-tighter">1M+</h3>
        </div>
        <div class="text-center space-y-2 pr-4">
          <p class="text-[10px] uppercase font-black tracking-[0.2em] text-highlight">Roast Cycle</p>
          <h3 class="text-6xl font-serif font-black tracking-tighter uppercase italic">Daily</h3>
        </div>
      </div>
    </section>

    <!-- CTA To Join -->
    <section class="py-24 bg-white">
      <div class="max-w-4xl mx-auto px-8 text-center space-y-8">
        <h2 class="text-6xl md:text-8xl font-serif font-black text-ink uppercase leading-none">Coffee Club</h2>
        <p class="text-xl text-highlight font-medium">
          Earn points with every sip. Join 1,000,000+ members and get exclusive rewards.
        </p>
        <RouterLink to="/login" class="inline-block px-12 py-5 bg-mocha text-white font-black uppercase tracking-widest rounded-xl shadow-2xl hover:translate-y-[-4px] transition-all">
          Join the Club
        </RouterLink>
      </div>
    </section>
  </div>
</template>
