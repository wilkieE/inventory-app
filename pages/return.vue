<template>
    <div class="container mx-auto p-4">
        <h1 class="text-2xl font-bold mb-4">Return Item</h1>
        <div v-if="pending" class="text-center">Loading...</div>
        <div v-else>
            <form @submit.prevent="returnItem">
                <div class="mb-4">
                    <label for="item" class="block text-gray-700 text-sm font-bold mb-2">Select Item to Return:</label>
                    <select id="item" v-model="selectedItem"
                        class="shadow border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                        <option v-for="item in items" :key="item.id" :value="item.id">{{ item.name }}</option>
                    </select>
                </div>
                <div class="mb-4">
                    <label for="notes" class="block text-gray-700 text-sm font-bold mb-2">Return Notes (optional):</label>
                    <textarea id="notes" v-model="returnNotes"
                        class="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Enter any return notes here..."></textarea>
                </div>
                <button type="submit"
                    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Return
                    Item</button>
            </form>
        </div>
    </div>
</template>
  
<script setup>
import { ref } from 'vue';
import { useFetch } from '#app';

//TODO filter items to only show items that are checked out
const { data: items, pending } = await useFetch('/api/items');
const selectedItem = ref('');
const returnNotes = ref('');

const returnItem = async () => {
    if (!selectedItem.value) {
        alert('Please select an item to return.');
        return;
    }

    // TODO implement return logic
};
</script> 