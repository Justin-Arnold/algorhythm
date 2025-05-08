<script setup lang="ts">
const activeTab = ref('explore');

function setActiveTab(tab: string) {
  activeTab.value = tab;
}
</script>

<template>
  <div class="flex flex-col h-screen bg-gray-900 text-white">
    <header class="p-4 bg-gray-800 border-b border-gray-700">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold text-indigo-400">AlgoRhythm</h1>
          <nav class="flex">
            <button 
              class="px-4 py-2 rounded-l-md"
              :class="activeTab === 'explore' ? 'bg-indigo-700' : 'bg-gray-700'"
              @click="() => setActiveTab('explore')"
            >
              Explore
            </button>
            <button 
              class="px-4 py-2"
              :class="activeTab === 'learn' ? 'bg-indigo-700' : 'bg-gray-700'"
              @click="() => setActiveTab('learn')"
            >
              Learn
            </button>
            <button 
              class="px-4 py-2 rounded-r-md"
              :class="activeTab === 'create' ? 'bg-indigo-700' : 'bg-gray-700'"
              @click="() => setActiveTab('create')"
            >
              Create
            </button>
          </nav>
        </div>
      </header>
  </div>
</template>
