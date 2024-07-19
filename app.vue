<template>
  <pie-modal
    :isOpen="true"
    :leadingAction="{ text: 'Button text' }">
    Modal content
  </pie-modal>
</template>

<script setup lang="ts">
import './dist/index.js';

// Remove leadingAction prop to see the modal render without an SSR error
</script>
