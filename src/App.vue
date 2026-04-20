<script setup lang="ts">
import { RouterView } from 'vue-router';
import Navbar from './components/Navbar.vue';
</script>

<template>
  <div class="min-h-screen bg-cream-joe font-sans text-ink">
    <Navbar />
    <main class="pt-20 pb-20 md:pb-0">
      <RouterView />
    </main>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');

:root {
  --color-mocha: #4b3621;
  --color-highlight: #8c7355;
  --color-border-joe: #dcd0c0;
  --color-cream-joe: #fdfbf7;
}

body {
  background-color: #fdfbf7;
}

.heading-serif {
  font-family: 'Georgia', serif;
}

.font-sans {
  font-family: 'Montserrat', sans-serif;
}

.font-mono {
  font-family: ui-monospace, SFMono-Regular, monospace;
}

/* Custom scrollbar for the theme */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #fdfbf7;
}
::-webkit-scrollbar-thumb {
  background: #dcd0c0;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #8c7355;
}
</style>
