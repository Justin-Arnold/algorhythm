<!-- AlgoRhythmApp.vue -->
<template>
  <div class="flex flex-col h-screen bg-gray-900 text-white">
    <!-- Header -->
    <header class="p-4 bg-gray-800 border-b border-gray-700">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold text-indigo-400">AlgoRhythm</h1>
        <nav class="flex">
          <button 
            class="px-4 py-2 rounded-l-md"
            :class="activeTab === 'explore' ? 'bg-indigo-700' : 'bg-gray-700'"
            @click="activeTab = 'explore'"
          >
            Explore
          </button>
          <button 
            class="px-4 py-2"
            :class="activeTab === 'learn' ? 'bg-indigo-700' : 'bg-gray-700'"
            @click="activeTab = 'learn'"
          >
            Learn
          </button>
          <button 
            class="px-4 py-2 rounded-r-md"
            :class="activeTab === 'create' ? 'bg-indigo-700' : 'bg-gray-700'"
            @click="activeTab = 'create'"
          >
            Create
          </button>
        </nav>
      </div>
    </header>
    
    <!-- Main Content -->
    <main class="flex-1 flex flex-col md:flex-row overflow-hidden p-4 space-x-4">
      <!-- Left Panel - Controls -->
      <!-- <div class="w-full md:w-64 bg-gray-800 p-4 flex flex-col">
        <div class="mb-6">
          <label class="block text-sm font-medium mb-2">Algorithm</label>
          <select 
            class="w-full bg-gray-700 rounded p-2 text-white border border-gray-600"
            v-model="algorithm"
          >
            <option value="bubbleSort">Bubble Sort</option>
            <option value="mergeSort">Merge Sort</option>
            <option value="quickSort">Quick Sort</option>
            <option value="binarySearch">Binary Search</option>
            <option value="dijkstra">Dijkstra's Algorithm</option>
            <option value="gameOfLife">Game of Life</option>
            <option v-if="activeTab === 'create'" value="custom">My Custom Algorithm</option>
          </select>
        </div>
        
        <div class="mb-6">
          <label class="block text-sm font-medium mb-2">Sound Theme</label>
          <select 
            class="w-full bg-gray-700 rounded p-2 text-white border border-gray-600"
            v-model="soundTheme"
          >
            <option value="electronic">Electronic</option>
            <option value="orchestral">Orchestral</option>
            <option value="minimalist">Minimalist</option>
            <option value="8bit">8-Bit</option>
            <option v-if="activeTab === 'create'" value="custom">My Custom Theme</option>
          </select>
        </div>
        
        <div class="mb-6">
          <label class="block text-sm font-medium mb-2">Playback Speed: {{ speed }}x</label>
          <input 
            type="range" 
            min="0.25" 
            max="4" 
            step="0.25" 
            v-model.number="speed"
            class="w-full"
          />
        </div>
        
        <div class="mb-6">
          <label class="block text-sm font-medium mb-2">Data Size: {{ dataSize }}</label>
          <input 
            type="range" 
            min="5" 
            max="100" 
            v-model.number="dataSize"
            class="w-full"
          />
        </div>
        
        <div class="mt-auto">
          <button 
            class="btn btn-primary w-full mb-4"
            id="play-toggle"
          >
            <span v-if="isPlaying">
              <IconPause class="mr-2" :size="18" />
              Pause
            </span>
            <span v-else>
              <IconPlay class="mr-2" :size="18" />
              Play
            </span>
          </button>
          
          <button 
            class="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded flex items-center justify-center"
            @click="regenerateData"
          >
            <IconRefreshCw class="mr-2" :size="18" />
            New Data
          </button>
        </div>
      </div> -->
      <ArpeggiatorPanel 
        ref="arpeggiatorPanel" 
        :data="arrayData" 
        :is-sorting="sortingState.isSorting" 
        @start-sorting="startSorting"
        @stop-sorting="stopSorting"
      />
      <!-- Main Visualization Area -->
      <div class="flex-1 overflow-hidden flex flex-col">
        <!-- Visualization Canvas -->
        <div class="flex-1 bg-gray-800 rounded-lg overflow-hidden flex justify-center items-center mb-4 relative">
          <!-- Canvas for visualization -->
          <div ref="visualizationCanvas" class="absolute inset-0">
            <div class="w-full h-full">
              <!-- Visualization of the algorithm -->
              <div class="flex h-full items-end justify-around p-4">
                <div 
                  v-for="(value, index) in arrayData" 
                  :key="index"
                  class="w-2 md:w-4 rounded-t transition-all duration-300"
                  :style="{ 
                    height: `${value}%`,
                    backgroundColor: getBarColor(index, value)
                  }"
                ></div>
              </div>
            </div>
          </div>
          
          <div v-if="activeTab === 'create'" class="absolute top-4 right-4 flex">
            <button class="bg-indigo-600 p-2 rounded-full shadow-lg mr-2">
              <!-- <IconSave :size="20" /> -->
            </button>
            <button class="bg-pink-600 p-2 rounded-full shadow-lg">
              <!-- <IconMusic :size="20" /> -->
            </button>
          </div>
        </div>
        
        <!-- Create Mode Interface -->
        <div v-if="activeTab === 'create'" class="h-64 bg-gray-800 rounded-lg p-4 overflow-hidden">
          <div class="flex mb-2">
            <button 
              class="bg-gray-700 px-4 py-2 rounded-l-md flex items-center text-sm font-medium"
              :class="{'bg-gray-600': editorTab === 'algorithm'}"
              @click="editorTab = 'algorithm'"
            >
              <!-- <IconCode class="mr-2" :size="16" /> -->
              Algorithm
            </button>
            <button 
              class="bg-gray-700 px-4 py-2 rounded-r-md flex items-center text-sm font-medium"
              :class="{'bg-gray-600': editorTab === 'sound'}"
              @click="editorTab = 'sound'"
            >
              <!-- <IconMusic class="mr-2" :size="16" /> -->
              Sound Mapping
            </button>
          </div>
          
          <div class="bg-gray-900 h-full rounded p-2 font-mono text-sm overflow-auto">
            <pre v-if="editorTab === 'algorithm'" class="text-green-400">{{ algorithmCode }}</pre>
            <div v-else-if="editorTab === 'sound'" class="p-2">
              <div v-for="(operation, index) in soundOperations" :key="index" class="mb-3">
                <div class="text-indigo-300 mb-1">{{ operation.name }}:</div>
                <div class="flex items-center">
                  <select 
                    v-model="operation.instrument" 
                    class="bg-gray-800 border border-gray-700 rounded p-1 mr-2 text-sm"
                  >
                    <option value="synth">Synth</option>
                    <option value="fm">FM Synth</option>
                    <option value="am">AM Synth</option>
                    <option value="membrane">Percussion</option>
                    <option value="metal">Metallic</option>
                  </select>
                  <input 
                    type="range" 
                    min="0.1" 
                    max="1.0" 
                    step="0.1" 
                    v-model.number="operation.volume" 
                    class="w-24 mx-2"
                  />
                  <span class="text-xs">{{ operation.volume.toFixed(1) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Learn Mode Interface -->
        <div v-if="activeTab === 'learn'" class="h-64 bg-gray-800 rounded-lg p-4 overflow-auto">
          <h2 class="text-xl font-bold mb-2">{{ algorithmInfo.name }}</h2>
          <p class="mb-2">{{ algorithmInfo.description }}</p>
          <h3 class="text-lg font-semibold mb-1">Sonification Approach</h3>
          <p class="mb-2">In our sonification:</p>
          <ul class="list-disc pl-5 mb-2">
            <li v-for="(sound, index) in algorithmInfo.sounds" :key="index">
              {{ sound }}
            </li>
          </ul>
          <p>
            Time Complexity: {{ algorithmInfo.timeComplexity }} - 
            Space Complexity: {{ algorithmInfo.spaceComplexity }}
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import ArpeggiatorPanel from '~/components/ArpeggiatorPanel.vue';

// import { 
//   Play as IconPlay, 
//   Pause as IconPause, 
//   RefreshCw as IconRefreshCw,
//   Settings as IconSettings,
//   Code as IconCode,
//   Music as IconMusic,
//   Save as IconSave
// } from 'lucide-vue-next';

// State variables
const isPlaying = ref(false);
const algorithm = ref('bubbleSort');
const activeTab = ref('explore');
const dataSize = ref(20);
const editorTab = ref('algorithm');
const visualizationCanvas = ref(null);
const arpeggiatorPanel = ref(null);

// Sample array data
const arrayData = ref([]);

// Sorting state
const sortingState = ref({
    isSorting: false,
    currentIndices: [] as number[],
    swappedIndices: [] as number[],
    sortedIndices: [] as number[]
});

// Algorithm code for editor
const algorithmCode = ref(`// Example of a custom algorithm
function customAlgorithm(array) {
  const steps = [];
  
  // Your algorithm here
  for (let i = 0; i < array.length; i++) {
    // Add comparison steps
    steps.push({
      type: 'comparison',
      elements: [array[i]],
      indices: [i]
    });
    
    // Add custom musical events
    if (i % 3 === 0) {
      steps.push({
        type: 'custom',
        elements: [array[i]],
        indices: [i],
        metadata: { note: 'C', octave: 4 }
      });
    }
  }
  
  return steps;
}`);

// Sound operations for the sound mapping editor
const soundOperations = ref([
  { name: 'Comparison', instrument: 'synth', volume: 0.7 },
  { name: 'Swap', instrument: 'membrane', volume: 0.8 },
  { name: 'Access', instrument: 'fm', volume: 0.5 },
  { name: 'Custom Event', instrument: 'metal', volume: 0.6 }
]);

// Algorithm info for learn tab
const algorithmInfo = computed(() => {
  const infos = {
    bubbleSort: {
      name: 'Bubble Sort',
      description: 'Bubble Sort is a simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
      sounds: [
        'Comparisons are represented by short melodic notes',
        'Swaps trigger percussion sounds',
        'The pitch corresponds to the value being examined'
      ],
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)'
    },
    mergeSort: {
      name: 'Merge Sort',
      description: 'Merge Sort is a divide-and-conquer algorithm that divides the input array into two halves, recursively sorts them, and finally merges the sorted halves.',
      sounds: [
        'Dividing the array creates a descending scale',
        'Merging operations use harmonic sounds that build chords',
        'The final merge creates a satisfying resolution'
      ],
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(n)'
    },
    // Add more algorithm information as needed
  };
  
  return infos[algorithm.value] || infos.bubbleSort;
});

// Generate random data
const regenerateData = () => {
  arrayData.value = Array.from({ length: dataSize.value }, () => 
    Math.floor(Math.random() * 100) + 1
  );
  isPlaying.value = false;
};
// Watch for data size changes
watch(dataSize, () => {
  regenerateData();
});

// Color logic for bars based on sorting state
const getBarColor = (index: number, value: number) => {
    if (sortingState.value.sortedIndices.includes(index)) {
        return '#10b981'; // Green for sorted
    }
    if (sortingState.value.swappedIndices.includes(index)) {
        return '#ef4444'; // Red for swapped
    }
    if (sortingState.value.currentIndices.includes(index)) {
        return '#f59e0b'; // Orange for currently comparing
    }
    return '#6366f1'; // Default blue
};

// Bubble sort with sound visualization
const bubbleSortWithSound = async () => {
    if (sortingState.value.isSorting) return;
    
    sortingState.value.isSorting = true;
    sortingState.value.sortedIndices = [];
    const arr = [...arrayData.value];
    const n = arr.length;
    
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (!sortingState.value.isSorting) return; // Stop if sorting is cancelled
            // Highlight current comparison
            sortingState.value.currentIndices = [j, j + 1];
            sortingState.value.swappedIndices = [];
            
            // Play kick drum for comparison
            arpeggiatorPanel.value?.playKickDrum();
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Play sound for both values being compared
            arpeggiatorPanel.value?.playNoteForValue(arr[j]);
            await new Promise(resolve => setTimeout(resolve, 200));
            arpeggiatorPanel.value?.playNoteForValue(arr[j + 1]);
            await new Promise(resolve => setTimeout(resolve, 200));
            
            if (arr[j] > arr[j + 1]) {
                // Swap and highlight
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                arrayData.value = [...arr];
                sortingState.value.swappedIndices = [j, j + 1];
                
                // Play a chord for the swap
                arpeggiatorPanel.value?.playNoteForValue(arr[j]);
                setTimeout(() => arpeggiatorPanel.value?.playNoteForValue(arr[j + 1]), 100);
                
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        }
        // Mark as sorted
        sortingState.value.sortedIndices.push(n - 1 - i);
    }
    
    // Mark first element as sorted
    sortingState.value.sortedIndices.push(0);
    sortingState.value.currentIndices = [];
    sortingState.value.swappedIndices = [];
    sortingState.value.isSorting = false;
};

// Start sorting when play button is clicked
const startSorting = () => {
    if (!sortingState.value.isSorting) {
        bubbleSortWithSound();
    }
};

const stopSorting = () => {
    sortingState.value.isSorting = false;
    sortingState.value.currentIndices = [];
    sortingState.value.swappedIndices = [];
};

onMounted(() => {
  regenerateData();
});
</script>

<style>
/* You can add any specific component styles here */
</style>