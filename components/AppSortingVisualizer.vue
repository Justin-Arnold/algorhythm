<script setup lang="ts">

export type SortingState = {
    isSorting: boolean;
    currentIndices: number[];
    swappedIndices: number[];
    sortedIndices: number[];
    leftSubarray: number[];
    rightSubarray: number[];
    mergingRange: { left: number, right: number } | null;
    pivotIndex: number;
    partitionRange: { left: number, right: number } | null;
    leftPartition: number[];
    rightPartition: number[];
};

const props = defineProps<{
    dataToBeSorted: number[];
    sortingState: SortingState;
}>();

// Color logic for bars based on sorting state
const getBarColor = (index: number) => {
    if (props.sortingState.sortedIndices.includes(index)) {
        return '#10b981'; // Green for sorted
    }
    if (props.sortingState.currentIndices.includes(index)) { //
        return '#f59e0b'; // Orange for currently comparing
    }
    return '#6366f1'; // Default blue
};

</script>

<template>
    <div class="flex-1 overflow-hidden flex flex-col">
        <!-- Visualization Canvas -->
        <div class="flex-1 bg-base-100 rounded-box p-4 overflow-hidden flex justify-center items-center relative">
            <!-- Canvas for visualization -->
            <div ref="visualizationCanvas" class="absolute inset-0">
                <div class="w-full h-full">
                    <!-- Visualization of the algorithm -->
                    <div class="flex h-full items-end justify-around p-4">
                        <div 
                        v-for="(value, index) in dataToBeSorted" 
                        :key="index"
                        class="w-2 md:w-4 rounded-t transition-all duration-300"
                        :style="{ 
                            height: `${value}%`,
                            backgroundColor: getBarColor(index)
                        }"
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>