<template>
  <div class="app">
    <aside class="sidebar">
      <h2>Items</h2>
      <div>Add files</div>
      <ul class="items">
        <img
          class="item"
          v-for="(image, index) in images"
          :src="image"
          :key="index"
          :alt="`Image ${index}`"
        />
      </ul>
    </aside>

    <main class="main">
      <h1>Online Graphic Editor</h1>
      <div class="canvas-container">
        <div class="canvas"></div>
      </div>
    </main>

    <footer class="footer">
      <p>&copy; {{ currentYear }} Truong Tong</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear()

type ImagePath = string
const imageModules: Record<string, ImagePath> = import.meta.glob('./assets/images/*.{png,jpg,jpeg,gif,svg}', {
  eager: true,
  import: 'default',
})

const images: ImagePath[] = Object.values(imageModules)
</script>

<style scoped>
.app {
  display: grid;
  grid-template-areas:
    'sidebar main'
    'footer footer';
  grid-template-columns: 340px 1fr;
  grid-template-rows: 1fr auto;
  height: 100vh;
  width: 100%;
}

.sidebar {
  grid-area: sidebar;
  box-shadow: 0.125rem 0 1rem var(--color-box-shadow);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.items {
  padding: 1rem;
  display: grid;
  width: 100%;
  gap: 0.25rem;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
}

.item {
  width: 100px;
  height: 100px;
  object-fit: contain;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  background-color: var(--color-bg-white);
  cursor: pointer;
}

.item:hover {
  background-color: var(--color-bg-grey);
}

.main {
  grid-area: main;
  background-color: var(--color-bg-grey);
  padding: 1rem;
  display: flex;
  flex-direction: column;
}

.main h1 {
  text-align: center;
}

.canvas-container {
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  display: flex;
}

.canvas {
  width: 90%;
  height: 90%;
  background-color: var(--color-white);
  box-shadow: 0.125rem 0 1rem var(--color-box-shadow);
}

.footer {
  grid-area: footer;
  text-align: center;
  padding: 2rem;
  background-color: #353254;
  color: var(--color-white);
}
</style>
