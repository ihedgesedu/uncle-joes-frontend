<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';
import { Search, MapPin, Wifi, Car, Clock } from 'lucide-vue-next';

const API_BASE = 'https://uncle-joes-api-539076178854.us-central1.run.app';

type Location = {
  id: number | string;
  city: string;
  state: string;
  zip_code: string;
  address_one: string;
  wifi?: boolean;
  drive_thru?: boolean;
};

const locations = ref<Location[]>([]);
const loading = ref(true);
const searchQuery = ref('');
const filters = ref({
  wifi: false,
  drive_thru: false,
});

const fetchLocations = async () => {
  loading.value = true;
  try {
    const params: Record<string, boolean> = {};
    if (filters.value.wifi) params.wifi = true;
    if (filters.value.drive_thru) params.drive_thru = true;

    const res = await axios.get(`${API_BASE}/locations`, { params });
    locations.value = res.data;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchLocations);

watch(filters, fetchLocations, { deep: true });

const filteredLocations = computed(() => {
  if (!searchQuery.value) return locations.value;
  const q = searchQuery.value.toLowerCase();
  return locations.value.filter(loc => 
    loc.city.toLowerCase().includes(q) || 
    loc.state.toLowerCase().includes(q) || 
    loc.address_one.toLowerCase().includes(q)
  );
});

const openDirections = (loc: Location) => {
  const destination = [loc.address_one, loc.city, loc.state, loc.zip_code]
    .filter(Boolean)
    .join(', ');
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;

  window.open(mapsUrl, '_blank', 'noopener,noreferrer');
};
</script>

<template>
  <div class="max-w-7xl mx-auto px-8 py-16">
    <header class="mb-16 space-y-4">
      <h1 class="text-7xl md:text-9xl font-serif font-black text-ink uppercase leading-none -ml-1">Locations</h1>
      <p class="text-highlight max-w-2xl text-lg font-medium">From Madison to Chicago. Find your local Uncle Joe's sanctuary.</p>
      
      <div class="max-w-md relative mt-8">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-highlight" :size="20" />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="ENTER CITY OR STATE..." 
          class="w-full pl-12 pr-4 py-4 bg-white border-2 border-border-joe rounded-xl font-black text-xs uppercase tracking-widest focus:outline-none focus:border-mocha transition-all"
        />
      </div>

      <div class="max-w-2xl mt-6 p-4 bg-white border border-border-joe rounded-2xl">
        <p class="text-[10px] font-black uppercase tracking-widest text-highlight mb-3">Amenities Legend</p>
        <div class="flex flex-wrap gap-3">
          <button
            type="button"
            @click="filters.wifi = !filters.wifi"
            :class="[
              'inline-flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors',
              filters.wifi
                ? 'bg-mocha text-white border-mocha'
                : 'bg-cream-joe border-border-joe text-ink hover:border-mocha'
            ]"
          >
            <Wifi :size="14" :class="filters.wifi ? 'text-white' : 'text-mocha'" />
            <span :class="[
              'text-[10px] font-black uppercase tracking-widest',
              filters.wifi ? 'text-white' : 'text-ink'
            ]">Wi-Fi Available</span>
          </button>
          <button
            type="button"
            @click="filters.drive_thru = !filters.drive_thru"
            :class="[
              'inline-flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors',
              filters.drive_thru
                ? 'bg-mocha text-white border-mocha'
                : 'bg-cream-joe border-border-joe text-ink hover:border-mocha'
            ]"
          >
            <Car :size="14" :class="filters.drive_thru ? 'text-white' : 'text-mocha'" />
            <span :class="[
              'text-[10px] font-black uppercase tracking-widest',
              filters.drive_thru ? 'text-white' : 'text-ink'
            ]">Drive-Thru Available</span>
          </button>
        </div>
      </div>
    </header>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-mocha"></div>
    </div>

    <div v-else-if="filteredLocations.length === 0" class="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-border-joe text-highlight">
      <MapPin :size="48" class="mx-auto mb-4 opacity-20" />
      <p class="text-lg font-black uppercase tracking-tighter">No locations found.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div 
        v-for="loc in filteredLocations" 
        :key="loc.id"
        class="group bg-white rounded-3xl border border-border-joe hover:border-mocha transition-all duration-500 overflow-hidden shadow-sm hover:shadow-2xl"
      >
        <div class="h-56 bg-mocha/5 relative overflow-hidden">
          <img 
            :src="`https://picsum.photos/seed/${loc.city}/800/600`" 
            referrerpolicy="no-referrer"
            class="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
          />
          <div class="absolute top-4 right-4 flex flex-col gap-2">
            <span v-if="loc.wifi" class="w-10 h-10 bg-white border border-border-joe rounded-full flex items-center justify-center text-mocha shadow-lg">
              <Wifi :size="16" />
            </span>
            <span v-if="loc.drive_thru" class="w-10 h-10 bg-white border border-border-joe rounded-full flex items-center justify-center text-mocha shadow-lg">
              <Car :size="16" />
            </span>
          </div>
        </div>
        
        <div class="p-8 space-y-6">
          <div class="space-y-1">
            <h3 class="text-3xl font-serif font-black text-ink uppercase leading-none">{{ loc.city }}</h3>
            <p class="text-[10px] text-highlight font-black tracking-widest uppercase">{{ loc.state }}</p>
          </div>

          <div class="space-y-4 pt-4 border-t border-border-joe">
            <div class="flex items-start gap-3">
              <MapPin :size="18" class="text-mocha shrink-0 mt-0.5" />
              <p class="text-sm font-medium leading-normal text-ink">
                {{ loc.address_one }}, {{ loc.zip_code }}
              </p>
            </div>
            
            <div class="flex items-center gap-3">
              <Clock :size="18" class="text-mocha shrink-0" />
              <p class="text-[10px] font-black uppercase tracking-widest text-highlight">Open until 9:00 PM</p>
            </div>
          </div>

          <button
            type="button"
            @click="openDirections(loc)"
            class="w-full py-4 bg-cream-joe border-2 border-mocha text-mocha font-black uppercase tracking-widest rounded-xl hover:bg-mocha hover:text-white transition-all shadow-lg active:translate-y-1"
          >
            Get Directions
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
