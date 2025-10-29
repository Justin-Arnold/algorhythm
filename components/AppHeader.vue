<script setup lang="ts">
const APP_NAME = 'AlgoRhythm';

/** 
 *  Originally this component included tabs to switch
 *  between different modes such as a learning mode that
 *  provided explanations of sorting algorithms, and 
 *  a create mode that allowed users to design their own
 *  sorting algorithms. 
 * 
 *  However, these features were removed to streamline MVP
 *  development and focus on the core sorting visualization.
 *  Future iterations may reintroduce these modes
 */
</script>

<template>
    <header class="p-4 bg-base-100">
        <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold text-primary">
                {{ APP_NAME }}
            </h1>
        </div>
    </header>
</template>