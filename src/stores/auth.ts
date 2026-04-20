import { defineStore } from 'pinia';
import axios from 'axios';

const API_BASE = 'https://uncle-joes-api-539076178854.us-central1.run.app';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    member: null as any,
    isAuthenticated: false,
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async login(credentials: { email: string; password: any }) {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.post(`${API_BASE}/login`, credentials);
        // The API returns {} on success or errors. 
        // We'll need to fetch all members to find the one with this email since the login response is empty.
        const membersRes = await axios.get(`${API_BASE}/members`);
        const members = membersRes.data;
        const user = members.find((m: any) => m.email === credentials.email);
        
        if (user) {
          this.member = user;
          this.isAuthenticated = true;
          localStorage.setItem('joe_member_id', user.id);
        } else {
          this.error = "Invalid credentials";
        }
      } catch (err) {
        this.error = "Login failed. Please check your credentials.";
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    async fetchProfile(memberId: string) {
      try {
        const res = await axios.get(`${API_BASE}/members/${memberId}`);
        this.member = res.data;
        this.isAuthenticated = true;
      } catch (err) {
        console.error(err);
        this.logout();
      }
    },
    logout() {
      this.member = null;
      this.isAuthenticated = false;
      localStorage.removeItem('joe_member_id');
    }
  }
});
