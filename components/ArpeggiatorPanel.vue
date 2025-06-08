<script setup lang="ts">
import * as Tone from "tone";
import ArpeggioPlayer from '../utils/arpeggiator';

let synth: Tone.Synth;
let player: ArpeggioPlayer;

onMounted(() => {
    synth = new Tone.Synth().toDestination();
    player = new ArpeggioPlayer({
        container_selector: '#main',
        aside_selector: '#aside',
        play_toggle_selector: '#play-toggle',
    })
});

const isPlaying = computed(() => {
    return player?.player.playing
});

const algorithm = ref('bubbleSort');
const soundTheme = ref('electronic');

</script>

<template>
    <div class="bg-base-100 rounded-box p-4 md:w-64">
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
                <!-- <option v-if="activeTab === 'create'" value="custom">My Custom Algorithm</option> -->
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
        <div class="mt-auto">
            <button 
                class="btn btn-primary w-full mb-4"
                @click="player.playerToggle"
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
    </div>
</template>