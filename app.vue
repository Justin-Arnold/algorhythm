<template>
  <div class="flex flex-col h-screen bg-gray-900 text-white">
    <!-- Header -->
    <AppHeader />
    
    <!-- Main Content -->
    <main class="flex-1 flex flex-col md:flex-row overflow-hidden p-4 space-x-4">
      <ArpeggiatorPanel 
        ref="arpeggiatorPanel" 
        :data="dataToBeSorted" 
        :is-sorting="sortingState.isSorting" 
        @start-sorting="startSorting"
        @stop-sorting="stopSorting"
        @algorithm-changed="(newAlgorithm) => algorithm = newAlgorithm"
      />
      <AppSortingVisualizer 
        ref="visualizationCanvas" 
        :data-to-be-sorted="dataToBeSorted" 
        :sorting-state="sortingState"
        :get-bar-color="getBarColor"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import ArpeggiatorPanel from '~/components/ArpeggiatorPanel.vue';
import ArpeggioPlayer from '~/utils/arpeggiator/ArpeggioPlayer';
import type { SortingState } from '~/components/AppSortingVisualizer.vue';

// State variables
const isPlaying = ref(false);
const algorithm = ref('bubbleSort');

const dataSize = ref(20);
const editorTab = ref('algorithm');
const visualizationCanvas = ref(null);
const arpeggiatorPanel = ref(null);

const dataToBeSorted = ref([]);
const sortingState = ref<SortingState>({
    isSorting: false,
    currentIndices: [],
    swappedIndices: [],
    sortedIndices: [],
    leftSubarray: [],
    rightSubarray: [],
    mergingRange: null,
    pivotIndex: -1,
    partitionRange: null,
    leftPartition: [],
    rightPartition: [],
});


// Generate random data
const regenerateData = () => {
  dataToBeSorted.value = Array.from({ length: dataSize.value }, () => 
    Math.floor(Math.random() * 100) + 1
  );
  isPlaying.value = false;
};
// Watch for data size changes
watch(dataSize, () => {
  regenerateData();
});



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
    const arr = [...dataToBeSorted.value];
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
            
            // play base sound every 4th note
            if (j % 4 === 0) {
                arpeggiatorPanel.value?.playBaseSound();
                arpeggiatorPanel.value?.playAccentSound();
            }
            if (j % 2 === 1) {
                arpeggiatorPanel.value?.playAccentSound();
            }
            // arpeggiatorPanel.value?.playBaseSound();
            await new Promise(resolve => setTimeout(resolve, sixteenthNoteMs));
            
            // Play sound for both values being compared
            arpeggiatorPanel.value?.playNoteForValue(arr[j]);
            await new Promise(resolve => setTimeout(resolve, eighthNoteMs));
            arpeggiatorPanel.value?.playNoteForValue(arr[j + 1]);
            await new Promise(resolve => setTimeout(resolve, eighthNoteMs));
            
            if (arr[j] > arr[j + 1]) {
                // Swap and highlight
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                dataToBeSorted.value = [...arr];
                sortingState.value.swappedIndices = [j, j + 1];
                
                
                // Play a chord for the swap
                // arpeggiatorPanel.value?.playNoteForValue(arr[j]);
                // setTimeout(() => arpeggiatorPanel.value?.playNoteForValue(arr[j + 1]), sixteenthNoteMs);
                
                // await new Promise(resolve => setTimeout(resolve, eighthNoteMs));
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
    
    sortingState.value.isSorting = true;
    sortingState.value.sortedIndices = [];
    sortingState.value.currentIndices = [];
    sortingState.value.swappedIndices = [];
    sortingState.value.leftSubarray = [];
    sortingState.value.rightSubarray = [];
    sortingState.value.mergingRange = null;
    
    const arr = [...dataToBeSorted.value];
    
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
            dataToBeSorted.value = [...arr];
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
            dataToBeSorted.value = [...arr];
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
            dataToBeSorted.value = [...arr];
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
    
    const arr = [...dataToBeSorted.value];
    
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
                    dataToBeSorted.value = [...arr];
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
        dataToBeSorted.value = [...arr];
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