<script setup lang="ts">
import * as Tone from "tone";
import ArpeggioPlayer from '../utils/arpeggiator';
import { Keys, Mode, type Key } from "~/utils/arpeggiator/types";

const props = defineProps<{
    data?: number[]
    isSorting?: boolean
}>();

const emit = defineEmits<{
    startSorting: []
    stopSorting: []
}>();

let synth: Tone.Synth;
let player: ArpeggioPlayer;

onMounted(() => {
    synth = new Tone.Synth().toDestination();
    player = new ArpeggioPlayer({
        container_selector: '#main',
        aside_selector: '#aside',
        play_toggle_selector: '#play-toggle',
    }, props.data)
});

// Watch for data changes and update the arpeggiator
watch(() => props.data, (newData) => {
    if (newData && player?.updateData) {
        player.updateData(newData);
    }
}, { deep: true });

// Expose methods for external use (like during sorting)
const playNoteForValue = (value: number) => {
    if (!props.data || !player?.playNoteForValue) return;
    
    const minValue = Math.min(...props.data);
    const maxValue = Math.max(...props.data);
    player.playNoteForValue(value, minValue, maxValue, '8n');
};

const playKickDrum = () => {
    if (!player?.playKickDrum) return;
    player.playKickDrum('8n');
};

const playHiHat = () => {
    if (!player?.playHiHat) return;
    player.playHiHat('32n');
};

const playSnare = () => {
    if (!player?.playSnare) return;
    player.playSnare('16n');
};

const playBell = () => {
    if (!player?.playBell) return;
    player.playBell('8n');
};

const getCurrentBPM = () => {
    return player?.getCurrentBPM() || 75;
};

const playComparisonSound = () => {
    switch (comparisonSound.value) {
        case 'kick': playKickDrum(); break;
        case 'hihat': playHiHat(); break;
        case 'snare': playSnare(); break;
        case 'bell': playBell(); break;
        case 'none': break;
    }
};

const playSwapSound = () => {
    switch (swapSound.value) {
        case 'kick': playKickDrum(); break;
        case 'hihat': playHiHat(); break;
        case 'snare': playSnare(); break;
        case 'bell': playBell(); break;
        case 'none': break;
    }
};
const comparisonSound = ref<'none' | 'kick' | 'hihat' | 'snare' | 'bell'>('kick');
const swapSound = ref<'none' | 'kick' | 'hihat' | 'snare' | 'bell'>('hihat');

// Make methods available to parent component
defineExpose({
    playNoteForValue,
    playKickDrum,
    playHiHat,
    playSnare,
    playBell,
    playComparisonSound,
    playSwapSound,
    getCurrentBPM,
    comparisonSound,
    swapSound,
    player
});

const startStopButtonText = computed(() => {
    return props.isSorting ? 'Stop' : 'Start';
});

const algorithm = ref('bubbleSort');
const soundTheme = ref('electronic');

const beatsPerMinute = ref(75);

const mode = ref<Mode>(Mode.MINOR);
const key = ref<Key>('B');
const arpType = ref<'straight' | 'looped'>('straight');



watch(beatsPerMinute, (newBPM) => {
    if (!player.playerUpdateBPM) return
    player.playerUpdateBPM(newBPM);
});

watch(mode, (newMode) => {
    if (!player.msUpdateMode) return
    player.msUpdateMode(newMode);
});

watch(key, (newKey) => {
    if (!player.msUpdateKey) return
    player.msUpdateKey(newKey);
});

watch(arpType, (newArpType) => {
    if (!player.apUpdatePatternType) return
    player.apUpdatePatternType(newArpType);
});

function toggleSorting() {
    if (props.isSorting) {
        emit('stopSorting')
    } else {
        emit('startSorting')
    }
}
</script>

<template>
    <div class="bg-base-100 rounded-box p-4 md:w-64">
        <div class="mb-6">
            <label class="label mb-2">Algorithm</label>
            <select 
                class="select select-primary"
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
            <label class="label mb-2">Sound Theme</label>
            <select 
                class="select select-primary"
                v-model="soundTheme"
            >
                <option value="electronic">Electronic</option>
                <option value="orchestral">Orchestral</option>
                <option value="minimalist">Minimalist</option>
                <option value="8bit">8-Bit</option>
                <!-- <option v-if="activeTab === 'create'" value="custom">My Custom Theme</option> -->
            </select>
        </div>
        <div class="mb-6">
            <label class="label mb-2">Key</label>
            <select v-model="key" class="select select-primary">
                <option v-for="key in Keys" :value="key">{{key}}</option>
            </select>
        </div>
        <div class="mb-6">
            <label class="label mb-2">Mode</label>
            <select v-model="mode" class="select select-primary">
                <option :value="Mode.MINOR">Minor</option>
                <option :value="Mode.MAJOR">Major</option>
                <option :value="Mode.IONIAN">Ionian</option>
                <option :value="Mode.DORIAN">Dorian</option>
                <option :value="Mode.PHRYGIAN">Phrygian</option>
                <option :value="Mode.LYDIAN">Lydian</option>
                <option :value="Mode.MIXOLYDIAN">Mixolydian</option>
                <option :value="Mode.AEOLIAN">Aeolian</option>
                <option :value="Mode.LOCRIAN">Locrian</option>
                <option :value="Mode.MELODIC">Melodic</option>
                <option :value="Mode.HARMONIC">Harmonic</option>
            </select>
        </div>
        <div class="mb-6">
            <label class="label mb-2">{{ beatsPerMinute }} BPM</label>
            <input type="range" min="60" max="160" v-model="beatsPerMinute" class="range range-primary" />
        </div>
        <div class="mb-6">
            <label class="label mb-2">Comparison Sound</label>
            <select v-model="comparisonSound" class="select select-primary">
                <option value="none">None</option>
                <option value="kick">Kick Drum</option>
                <option value="hihat">Hi-Hat</option>
                <option value="snare">Snare Drum</option>
                <option value="bell">Bell</option>
            </select>
        </div>
        <div class="mb-6">
            <label class="label mb-2">Swap Sound</label>
            <select v-model="swapSound" class="select select-primary">
                <option value="none">None</option>
                <option value="kick">Kick Drum</option>
                <option value="hihat">Hi-Hat</option>
                <option value="snare">Snare Drum</option>
                <option value="bell">Bell</option>
            </select>
        </div>
        <div class="mt-auto">
            <button 
                class="btn btn-primary w-full mb-4"
                @click="toggleSorting"
            >
                <!-- <IconPlay class="mr-2" :size="18" /> -->
                {{ startStopButtonText }}
            </button>
            
            <button 
                class="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded flex items-center justify-center"
            >
                <!-- <IconRefreshCw class="mr-2" :size="18" /> -->
                New Data
            </button>
        </div>
    </div>
</template>