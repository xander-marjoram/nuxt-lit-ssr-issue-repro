<template>
  <div>
    <h1>Title</h1>
    <p>Paragraph</p>
    <test-component :testBoolean="true">
      <p>Slotted content</p>
    </test-component>
  </div>
</template>

<script setup lang="ts">
import './dist/index.js';
</script>
