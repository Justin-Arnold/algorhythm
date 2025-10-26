<!-- AlgoRhythmApp.vue -->
<template>
  <div class="flex flex-col h-screen bg-gray-900 text-white">
    <!-- Header -->
    <header class="p-4 bg-base-100">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold text-primary">AlgoRhythm</h1>
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
      <ArpeggiatorPanel 
        ref="arpeggiatorPanel" 
        :data="arrayData" 
        :is-sorting="sortingState.isSorting" 
        @start-sorting="startSorting"
        @stop-sorting="stopSorting"
        @algorithm-changed="(newAlgorithm) => algorithm = newAlgorithm"
      />
      <!-- Main Visualization Area -->
      <div class="flex-1 overflow-hidden flex flex-col">
        <!-- Visualization Canvas -->
        <div class="flex-1 bg-base-100 rounded-box p-4 overflow-hidden flex justify-center items-center relative">
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
import ArpeggioPlayer from '~/utils/arpeggiator/ArpeggioPlayer';

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
    sortedIndices: [] as number[],
    leftSubarray: [] as number[],
    rightSubarray: [] as number[],
    mergingRange: null as { left: number, right: number } | null,
    pivotIndex: -1,
    partitionRange: null as { left: number, right: number } | null,
    leftPartition: [] as number[],
    rightPartition: [] as number[]
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
    quickSort: {
      name: 'Quick Sort',
      description: 'Quick Sort is a divide-and-conquer algorithm that selects a pivot element and partitions the array around it, recursively sorting the sub-arrays.',
      sounds: [
        'Pivot selection is marked with a distinctive bell sound',
        'Partitioning creates ascending scales and rhythmic swaps',
        'Each correctly placed pivot plays a resolution chord'
      ],
      timeComplexity: 'O(n log n) average, O(n²) worst',
      spaceComplexity: 'O(log n)'
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
    if (sortingState.value.pivotIndex === index) {
        return '#dc2626'; // Dark red for pivot
    }
    if (sortingState.value.swappedIndices.includes(index)) {
        return '#ef4444'; // Red for swapped/merged
    }
    if (sortingState.value.currentIndices.includes(index)) {
        return '#f59e0b'; // Orange for currently comparing
    }
    if (sortingState.value.leftPartition.includes(index)) {
        return '#8b5cf6'; // Purple for left partition (elements < pivot)
    }
    if (sortingState.value.rightPartition.includes(index)) {
        return '#06b6d4'; // Cyan for right partition (elements > pivot)
    }
    if (sortingState.value.leftSubarray.includes(index)) {
        return '#8b5cf6'; // Purple for left subarray (merge sort)
    }
    if (sortingState.value.rightSubarray.includes(index)) {
        return '#06b6d4'; // Cyan for right subarray (merge sort)
    }
    if (sortingState.value.mergingRange && 
        index >= sortingState.value.mergingRange.left && 
        index <= sortingState.value.mergingRange.right) {
        return '#fbbf24'; // Yellow for merging range
    }
    if (sortingState.value.partitionRange && 
        index >= sortingState.value.partitionRange.left && 
        index <= sortingState.value.partitionRange.right) {
        return '#fbbf24'; // Yellow for current partition range
    }
    return '#6366f1'; // Default blue
};

// Bubble sort with sound visualization
const bubbleSortWithSound = async () => {
    if (sortingState.value.isSorting) return;
    
    sortingState.value.isSorting = true;
    sortingState.value.sortedIndices = [];
    sortingState.value.leftSubarray = [];
    sortingState.value.rightSubarray = [];
    sortingState.value.mergingRange = null;
    sortingState.value.pivotIndex = -1;
    sortingState.value.partitionRange = null;
    sortingState.value.leftPartition = [];
    sortingState.value.rightPartition = [];
    const arr = [...arrayData.value];
    const n = arr.length;
    
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (!sortingState.value.isSorting) return; // Stop if sorting is cancelled
            // Highlight current comparison
            sortingState.value.currentIndices = [j, j + 1];
            sortingState.value.swappedIndices = [];
            
            // Get current BPM for timing
            const currentBPM = arpeggiatorPanel.value?.getCurrentBPM() || 75;
            const sixteenthNoteMs = ArpeggioPlayer.bpmToMsForNote(currentBPM, '16n');
            const eighthNoteMs = ArpeggioPlayer.bpmToMsForNote(currentBPM, '8n');
            
            // Play comparison sound
            arpeggiatorPanel.value?.playBaseSound();
            await new Promise(resolve => setTimeout(resolve, sixteenthNoteMs));
            
            // Play sound for both values being compared
            arpeggiatorPanel.value?.playNoteForValue(arr[j]);
            await new Promise(resolve => setTimeout(resolve, eighthNoteMs));
            arpeggiatorPanel.value?.playNoteForValue(arr[j + 1]);
            await new Promise(resolve => setTimeout(resolve, eighthNoteMs));
            
            if (arr[j] > arr[j + 1]) {
                // Swap and highlight
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                arrayData.value = [...arr];
                sortingState.value.swappedIndices = [j, j + 1];
                
                // Play swap sound
                arpeggiatorPanel.value?.playAccentSound();
                
                // Play a chord for the swap
                arpeggiatorPanel.value?.playNoteForValue(arr[j]);
                setTimeout(() => arpeggiatorPanel.value?.playNoteForValue(arr[j + 1]), sixteenthNoteMs);
                
                await new Promise(resolve => setTimeout(resolve, eighthNoteMs));
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

// Merge sort with sound visualization
const mergeSortWithSound = async () => {
    if (sortingState.value.isSorting) return;
    
    console.log('Merge sort starting with array:', arrayData.value);
    sortingState.value.isSorting = true;
    sortingState.value.sortedIndices = [];
    sortingState.value.currentIndices = [];
    sortingState.value.swappedIndices = [];
    sortingState.value.leftSubarray = [];
    sortingState.value.rightSubarray = [];
    sortingState.value.mergingRange = null;
    
    const arr = [...arrayData.value];
    
    const merge = async (left: number, mid: number, right: number) => {
        if (!sortingState.value.isSorting) return;
        
        // Highlight the subarrays being merged
        sortingState.value.leftSubarray = Array.from({length: mid - left + 1}, (_, i) => left + i);
        sortingState.value.rightSubarray = Array.from({length: right - mid}, (_, i) => mid + 1 + i);
        sortingState.value.mergingRange = { left, right };
        sortingState.value.currentIndices = [];
        sortingState.value.swappedIndices = [];
        
        const currentBPM = arpeggiatorPanel.value?.getCurrentBPM() || 75;
        const quarterNoteMs = ArpeggioPlayer.bpmToMsForNote(currentBPM, '4n');
        
        // Show the division for a moment
        await new Promise(resolve => setTimeout(resolve, quarterNoteMs));
        
        const leftArr = arr.slice(left, mid + 1);
        const rightArr = arr.slice(mid + 1, right + 1);
        
        let i = 0, j = 0, k = left;
        
        const sixteenthNoteMs = ArpeggioPlayer.bpmToMsForNote(currentBPM, '16n');
        const eighthNoteMs = ArpeggioPlayer.bpmToMsForNote(currentBPM, '8n');
        
        while (i < leftArr.length && j < rightArr.length) {
            if (!sortingState.value.isSorting) return;
            
            // Highlight elements being compared
            sortingState.value.currentIndices = [left + i, mid + 1 + j];
            
            // Play comparison sound (one sound per beat like bubble sort)
            arpeggiatorPanel.value?.playBaseSound();
            await new Promise(resolve => setTimeout(resolve, sixteenthNoteMs));
            
            // Play one note for the comparison
            arpeggiatorPanel.value?.playNoteForValue(leftArr[i]);
            await new Promise(resolve => setTimeout(resolve, eighthNoteMs));
            
            if (leftArr[i] <= rightArr[j]) {
                arr[k] = leftArr[i];
                i++;
            } else {
                arr[k] = rightArr[j];
                j++;
                // Play swap sound for merge operation
                arpeggiatorPanel.value?.playAccentSound();
                await new Promise(resolve => setTimeout(resolve, sixteenthNoteMs));
            }
            
            // Update visualization
            arrayData.value = [...arr];
            sortingState.value.swappedIndices = [k];
            
            // Play note for merged element (final sound of this beat)
            arpeggiatorPanel.value?.playNoteForValue(arr[k]);
            await new Promise(resolve => setTimeout(resolve, eighthNoteMs));
            
            k++;
        }
        
        // Copy remaining elements from left
        while (i < leftArr.length) {
            if (!sortingState.value.isSorting) return;
            arr[k] = leftArr[i];
            arrayData.value = [...arr];
            sortingState.value.swappedIndices = [k];
            sortingState.value.currentIndices = [left + i];
            arpeggiatorPanel.value?.playNoteForValue(arr[k]);
            await new Promise(resolve => setTimeout(resolve, eighthNoteMs));
            i++;
            k++;
        }
        
        // Copy remaining elements from right
        while (j < rightArr.length) {
            if (!sortingState.value.isSorting) return;
            arr[k] = rightArr[j];
            arrayData.value = [...arr];
            sortingState.value.swappedIndices = [k];
            sortingState.value.currentIndices = [mid + 1 + j];
            arpeggiatorPanel.value?.playNoteForValue(arr[k]);
            await new Promise(resolve => setTimeout(resolve, eighthNoteMs));
            j++;
            k++;
        }
        
        // Clear subarray highlights and mark merged section as sorted
        sortingState.value.leftSubarray = [];
        sortingState.value.rightSubarray = [];
        sortingState.value.mergingRange = null;
        sortingState.value.currentIndices = [];
        sortingState.value.swappedIndices = [];
        
        for (let idx = left; idx <= right; idx++) {
            if (!sortingState.value.sortedIndices.includes(idx)) {
                sortingState.value.sortedIndices.push(idx);
            }
        }
        
        // Brief pause to show the sorted section
        await new Promise(resolve => setTimeout(resolve, eighthNoteMs));
    };
    
    const mergeSortRecursive = async (left: number, right: number) => {
        console.log(`mergeSortRecursive called with left=${left}, right=${right}`);
        if (!sortingState.value.isSorting || left >= right) {
            console.log(`Base case hit: isSorting=${sortingState.value.isSorting}, left >= right: ${left >= right}`);
            return;
        }
        
        const mid = Math.floor((left + right) / 2);
        
        // Highlight the current range being divided
        sortingState.value.currentIndices = Array.from({length: right - left + 1}, (_, i) => left + i);
        sortingState.value.leftSubarray = [];
        sortingState.value.rightSubarray = [];
        
        const currentBPM = arpeggiatorPanel.value?.getCurrentBPM() || 75;
        const eighthNoteMs = ArpeggioPlayer.bpmToMsForNote(currentBPM, '8n');
        const quarterNoteMs = ArpeggioPlayer.bpmToMsForNote(currentBPM, '4n');
        
        // Play single note to indicate division start
        arpeggiatorPanel.value?.playNoteForValue(arr[left]);
        await new Promise(resolve => setTimeout(resolve, eighthNoteMs));
        
        // Clear highlighting before recursion
        sortingState.value.currentIndices = [];
        await new Promise(resolve => setTimeout(resolve, quarterNoteMs));
        
        await mergeSortRecursive(left, mid);
        await mergeSortRecursive(mid + 1, right);
        await merge(left, mid, right);
    };
    
    await mergeSortRecursive(0, arr.length - 1);
    
    // Final cleanup
    sortingState.value.currentIndices = [];
    sortingState.value.swappedIndices = [];
    sortingState.value.leftSubarray = [];
    sortingState.value.rightSubarray = [];
    sortingState.value.mergingRange = null;
    sortingState.value.isSorting = false;
};

// Quick sort with sound visualization
const quickSortWithSound = async () => {
    if (sortingState.value.isSorting) return;
    
    sortingState.value.isSorting = true;
    sortingState.value.sortedIndices = [];
    sortingState.value.currentIndices = [];
    sortingState.value.swappedIndices = [];
    sortingState.value.leftSubarray = [];
    sortingState.value.rightSubarray = [];
    sortingState.value.mergingRange = null;
    sortingState.value.pivotIndex = -1;
    sortingState.value.partitionRange = null;
    sortingState.value.leftPartition = [];
    sortingState.value.rightPartition = [];
    
    const arr = [...arrayData.value];
    
    const partition = async (low: number, high: number): Promise<number> => {
        if (!sortingState.value.isSorting) return low;
        
        // Choose last element as pivot
        const pivot = arr[high];
        sortingState.value.pivotIndex = high;
        sortingState.value.partitionRange = { left: low, right: high };
        
        const currentBPM = arpeggiatorPanel.value?.getCurrentBPM() || 75;
        const sixteenthNoteMs = ArpeggioPlayer.bpmToMsForNote(currentBPM, '16n');
        const eighthNoteMs = ArpeggioPlayer.bpmToMsForNote(currentBPM, '8n');
        const quarterNoteMs = ArpeggioPlayer.bpmToMsForNote(currentBPM, '4n');
        
        // Play a distinctive sound for pivot selection
        arpeggiatorPanel.value?.playBell();
        await new Promise(resolve => setTimeout(resolve, sixteenthNoteMs));
        arpeggiatorPanel.value?.playNoteForValue(pivot);
        await new Promise(resolve => setTimeout(resolve, eighthNoteMs));
        
        let i = low - 1; // Index of smaller element
        
        for (let j = low; j < high; j++) {
            if (!sortingState.value.isSorting) return low;
            
            // Highlight current comparison
            sortingState.value.currentIndices = [j, high];
            
            // Update partition visualization
            sortingState.value.leftPartition = [];
            sortingState.value.rightPartition = [];
            
            for (let k = low; k <= i; k++) {
                sortingState.value.leftPartition.push(k);
            }
            for (let k = i + 1; k < j; k++) {
                sortingState.value.rightPartition.push(k);
            }
            
            // Play comparison sound (one sound per beat like bubble sort)
            arpeggiatorPanel.value?.playBaseSound();
            await new Promise(resolve => setTimeout(resolve, sixteenthNoteMs));
            
            // Play single note for comparison
            arpeggiatorPanel.value?.playNoteForValue(arr[j]);
            await new Promise(resolve => setTimeout(resolve, eighthNoteMs));
            
            if (arr[j] < pivot) {
                i++;
                
                if (i !== j) {
                    // Swap elements
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                    arrayData.value = [...arr];
                    sortingState.value.swappedIndices = [i, j];
                    
                    // Play swap sound
                    arpeggiatorPanel.value?.playAccentSound();
                    await new Promise(resolve => setTimeout(resolve, sixteenthNoteMs));
                    
                    // Play single note for swap result
                    arpeggiatorPanel.value?.playNoteForValue(arr[i]);
                    await new Promise(resolve => setTimeout(resolve, eighthNoteMs));
                }
                
                // Update left partition
                sortingState.value.leftPartition.push(i);
            } else {
                // Update right partition  
                sortingState.value.rightPartition.push(j);
            }
        }
        
        // Place pivot in correct position
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        arrayData.value = [...arr];
        sortingState.value.swappedIndices = [i + 1, high];
        sortingState.value.pivotIndex = i + 1;
        
        // Play special sound for pivot placement
        arpeggiatorPanel.value?.playAccentSound();
        await new Promise(resolve => setTimeout(resolve, sixteenthNoteMs));
        arpeggiatorPanel.value?.playBell();
        await new Promise(resolve => setTimeout(resolve, sixteenthNoteMs));
        arpeggiatorPanel.value?.playNoteForValue(arr[i + 1]);
        await new Promise(resolve => setTimeout(resolve, eighthNoteMs));
        
        // Mark pivot as sorted
        sortingState.value.sortedIndices.push(i + 1);
        
        // Clear partition visualization
        sortingState.value.leftPartition = [];
        sortingState.value.rightPartition = [];
        sortingState.value.partitionRange = null;
        sortingState.value.currentIndices = [];
        sortingState.value.swappedIndices = [];
        
        return i + 1;
    };
    
    const quickSortRecursive = async (low: number, high: number) => {
        if (!sortingState.value.isSorting || low >= high) return;
        
        // Highlight current range being sorted
        sortingState.value.partitionRange = { left: low, right: high };
        
        const currentBPM = arpeggiatorPanel.value?.getCurrentBPM() || 75;
        const eighthNoteMs = ArpeggioPlayer.bpmToMsForNote(currentBPM, '8n');
        const quarterNoteMs = ArpeggioPlayer.bpmToMsForNote(currentBPM, '4n');
        
        // Play single note to indicate range start
        arpeggiatorPanel.value?.playNoteForValue(arr[low]);
        await new Promise(resolve => setTimeout(resolve, eighthNoteMs));
        
        await new Promise(resolve => setTimeout(resolve, quarterNoteMs));
        
        const pivotIndex = await partition(low, high);
        
        if (!sortingState.value.isSorting) return;
        
        // Recursively sort left and right partitions
        await quickSortRecursive(low, pivotIndex - 1);
        await quickSortRecursive(pivotIndex + 1, high);
        
        // Mark range as sorted if it's a leaf
        if (low === high) {
            sortingState.value.sortedIndices.push(low);
        }
    };
    
    await quickSortRecursive(0, arr.length - 1);
    
    // Mark all elements as sorted
    for (let i = 0; i < arr.length; i++) {
        if (!sortingState.value.sortedIndices.includes(i)) {
            sortingState.value.sortedIndices.push(i);
        }
    }
    
    // Final cleanup
    sortingState.value.currentIndices = [];
    sortingState.value.swappedIndices = [];
    sortingState.value.leftPartition = [];
    sortingState.value.rightPartition = [];
    sortingState.value.partitionRange = null;
    sortingState.value.pivotIndex = -1;
    sortingState.value.isSorting = false;
};

// Start sorting when play button is clicked
const startSorting = () => {
    if (!sortingState.value.isSorting) {
        console.log('Starting algorithm:', algorithm.value);
        switch (algorithm.value) {
            case 'mergeSort':
                console.log('Calling merge sort');
                mergeSortWithSound();
                break;
            case 'quickSort':
                console.log('Calling quick sort');
                quickSortWithSound();
                break;
            case 'bubbleSort':
            default:
                console.log('Calling bubble sort');
                bubbleSortWithSound();
                break;
        }
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