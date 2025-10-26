<script setup lang="ts">

const APP_NAME = 'AlgoRhythm';
const tabs = ['explore', 'learn', 'create'] as const;
type Tab = typeof tabs[number];

const activeTab = ref<Tab>('explore');

function getCapitalizedTabName(tab: Tab): string {
    return tab.charAt(0).toUpperCase() + tab.slice(1);
}

function getTabClasses(tab: Tab, index: number): string {
    const baseClasses = 'px-4 py-2';
    const roundedClass = getTabRoundedClass(index);
    const activeClass = getTabActiveClass(tab);
    return [
        baseClasses,
        roundedClass,
        activeClass,
    ].join(' ');
}

function getTabRoundedClass(indexOfTab: number): string {
    if (indexOfTab === 0) return 'rounded-l-md';
    if (indexOfTab === tabs.length - 1) return 'rounded-r-md';
    return '';
}

function getTabActiveClass(tab: Tab): string {
    return activeTab.value === tab ? 'bg-indigo-700' : 'bg-gray-700';
}


</script>

<template>
    <header class="p-4 bg-base-100">
        <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold text-primary">
                {{ APP_NAME}}
            </h1>
            <nav class="flex">
                <button 
                    v-for="tab, index in tabs"
                    :key="tab"
                    :class="getTabClasses(tab, index)"
                    @click="activeTab = tab"
                >
                    {{ getCapitalizedTabName(tab) }}
                </button>
            </nav>
        </div>
    </header>
</template>