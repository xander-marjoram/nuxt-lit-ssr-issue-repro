<template>
  <pie-modal
    heading="Heading"
    :isOpen="true"
    :leadingAction="{ text: 'Button text' }">
    Modal content
  </pie-modal>
</template>

<script setup lang="ts">
import './dist/index.js';
</script>
