<template>
  <div>
    <h1>Title</h1>
    <p>Paragraph</p>
    <pie-modal :isOpen="true" :leadingAction="{ text: 'Button text' }">
      Modal content
    </pie-modal>
  </div>
</template>

<script setup lang="ts">
import './dist/index.js';
</script>
