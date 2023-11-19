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
                        <option v-for="item in filteredItems" :key="item.id" :value="item.id">{{ item.name }}</option>
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
  
<script setup lang="ts">
import { ref, computed, type ComputedRef } from 'vue';
import { useFetch } from '#app';

interface Item {
    id: number;
    name: string;
    status: string;
}

const selectedItem = ref<number | string>('');
const returnNotes = ref<string>('');
const { data: items, pending, refresh } = await useFetch<Item[]>('/api/items');

const filteredItems: ComputedRef<Item[]> = computed(() => {
    return items.value?.filter(item => item.status === 'in use') || [];

});

const returnItem = async (): Promise<void> => {
    if (!selectedItem.value) {
        alert('Please select an item to return.');
        return;
    }

    try {
        const response = await fetch('/api/items/return', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId: selectedItem.value, returnNotes: returnNotes.value })
        });

        if (response.ok) {
            alert('Item returned successfully!');
            selectedItem.value = '';
            returnNotes.value = '';
            await refresh();
        } else {
            throw new Error('Failed to return item');
        }
    } catch (error: any) {
        console.error('Error returning item:', error);
        alert('Failed to return item.');
    }
};
</script>
  