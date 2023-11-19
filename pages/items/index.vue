<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Item Management</h1>
    <div class="mb-4 flex justify-between items-center">
      <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" @click="addNewItem">Add New Item</button>
      <select v-model="selectedStatus"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block p-2.5">
        <option value="">All Statuses</option>
        <option v-for="status in statuses" :key="status" :value="status">{{ status }}</option>
      </select>
    </div>
    <table class="min-w-full bg-white">
      <thead>
        <tr>
          <th
            class="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Name</th>
          <th
            class="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Description</th>
          <th
            class="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Status</th>
          <th
            class="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in filteredItems" :key="item.id">
          <td class="px-4 py-2 border-b border-gray-200">{{ item.name }}</td>
          <td class="px-4 py-2 border-b border-gray-200">{{ item.description }}</td>
          <td class="px-4 py-2 border-b border-gray-200">{{ item.status }}</td>
          <td class="px-4 py-2 border-b border-gray-200">
            <button class="text-blue-600 hover:text-blue-800" @click="editItem(item)">Edit</button>
            <button class="text-red-600 hover:text-red-800 ml-2" @click="deleteItem(item.id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useFetch } from '#app';

const { data: items, pending, refresh, error } = await useFetch('/api/items');
const selectedStatus = ref('');
const statuses = ref(['available', 'in use']);

const filteredItems = computed(() => {
  return selectedStatus.value ? items.value.filter(item => item.status === selectedStatus.value) : items.value;
});

//TODO add crud logic
const addNewItem = () => {
};

const editItem = (item) => {
};

const deleteItem = async (itemId) => {
  refresh();
};
</script>
