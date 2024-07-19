import { defineNuxtConfig } from 'nuxt/config';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,

  modules: [['nuxt-ssr-lit', { litElementPrefix: ['pie-'] }]],

  devServer: {
      port: 3002,
  },

  compatibilityDate: '2024-07-18',
})