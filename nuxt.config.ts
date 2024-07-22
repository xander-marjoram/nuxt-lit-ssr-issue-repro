import { defineNuxtConfig } from 'nuxt/config';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-07-22',
  modules: [['nuxt-ssr-lit', { litElementPrefix: ['test-'] }]],
  ssr: true,
})