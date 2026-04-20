<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { Coffee, Mail, Lock, ArrowRight, Loader2 } from 'lucide-vue-next';

const authStore = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');

const handleLogin = async () => {
  await authStore.login({ email: email.value, password: password.value });
  if (authStore.isAuthenticated) {
    router.push('/profile');
  }
};
</script>

<template>
  <div class="min-h-[calc(100vh-80px)] flex items-center justify-center p-8 bg-cream-joe">
    <div class="max-w-md w-full bg-white rounded-[32px] shadow-2xl border border-border-joe p-10 md:p-14 space-y-10 relative overflow-hidden">
      <!-- Decorative element -->
      <div class="absolute top-0 right-0 w-32 h-32 bg-mocha rounded-bl-full opacity-5"></div>
      
      <div class="text-center space-y-3 relative z-10">
        <div class="inline-flex p-5 bg-mocha text-white rounded-3xl mb-4 rotate-3">
          <Coffee :size="40" />
        </div>
        <h1 class="text-5xl font-serif font-black text-ink uppercase tracking-tighter leading-none">Coffee Club</h1>
        <p class="text-[10px] font-black uppercase tracking-[0.2em] text-highlight">Loyalty • Excellence • Community</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-8">
        <div v-if="authStore.error" class="p-4 bg-red-50 border-l-4 border-red-900 text-red-900 text-[10px] font-black uppercase tracking-widest rounded-r">
          {{ authStore.error }}
        </div>

        <div class="space-y-6">
          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-[0.2em] text-highlight px-1">Email Address</label>
            <div class="relative">
              <input 
                v-model="email"
                type="email" 
                required
                placeholder="JOE@UNCLEJOES.COM"
                class="w-full px-6 py-5 bg-cream-joe border-2 border-border-joe rounded-2xl font-black text-xs uppercase tracking-widest focus:outline-none focus:border-mocha transition-all"
              />
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-[0.2em] text-highlight px-1">Club Password</label>
            <div class="relative">
              <input 
                v-model="password"
                type="password" 
                required
                placeholder="••••••••"
                class="w-full px-6 py-5 bg-cream-joe border-2 border-border-joe rounded-2xl font-black text-xs uppercase tracking-widest focus:outline-none focus:border-mocha transition-all"
              />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          :disabled="authStore.loading"
          class="w-full py-5 bg-mocha text-white font-black uppercase tracking-widest rounded-2xl shadow-2xl hover:bg-ink hover:translate-y-[-2px] active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <span v-if="!authStore.loading">Enter the Club</span>
          <Loader2 v-else class="animate-spin" />
          <ArrowRight v-if="!authStore.loading" :size="20" stroke-width="3" />
        </button>
      </form>

      <div class="text-center pt-6 border-t border-border-joe">
        <p class="text-[10px] font-black uppercase tracking-widest text-highlight">
          Not a member? <a href="#" class="text-mocha underline underline-offset-4">Join Now</a>
        </p>
      </div>
    </div>
  </div>
</template>
