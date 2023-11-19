<template>
    <div class="container mx-auto p-4">
        <h1 class="text-2xl font-bold mb-4">Checkout Item</h1>
        <form @submit.prevent="checkoutItem">
            <div class="mb-4">
                <label for="item" class="block text-gray-700 text-sm font-bold mb-2">Select Item:</label>
                <select id="item" v-model="selectedItem"
                    class="shadow border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                    <option v-for="item in items" :key="item.id" :value="item.id" :disabled="item.status !== 'available'"
                        :class="{ 'text-gray-500': item.status !== 'available' }">
                        {{ item.name }} ({{ item.status }})
                    </option>
                </select>
            </div>
            <div class="mb-4">
                <label for="user" class="block text-gray-700 text-sm font-bold mb-2">Select User:</label>
                <select id="user" v-model="selectedUser"
                    class="shadow border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                    <option v-for="user in users" :key="user.id" :value="user.id">{{ user.name }}</option>
                </select>
            </div>
            <div class="flex items-center justify-between">
                <button
                    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    type="submit">
                    Checkout
                </button>
            </div>
        </form>
    </div>
</template>
  
<script setup lang="ts">
import { ref } from 'vue';
import { useFetch } from '#app';

interface Item {
    id: number;
    name: string;
    status: string;
}

interface User {
    id: number;
    name: string;
}

const selectedItem = ref<number | string>('');
const selectedUser = ref<number | string>('');
const { data: items, refresh: refreshItems } = await useFetch<Item[]>('/api/items');
const { data: users, refresh: refreshUsers } = await useFetch<User[]>('/api/users');

const checkoutItem = async (): Promise<void> => {
    if (!selectedItem.value || !selectedUser.value) {
        alert('Please select both an item and a user.');
        return;
    }

    try {
        const response = await fetch('/api/items/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId: selectedItem.value, userId: selectedUser.value })
        });

        if (response.ok) {
            alert('Item checked out successfully!');
            selectedItem.value = '';
            selectedUser.value = '';
            await refreshItems();
            await refreshUsers();
        } else {
            throw new Error('Failed to checkout item');
        }
    } catch (error) {
        console.error('Error checking out item:', error);
        alert('Failed to checkout item.');
    }
};
</script>