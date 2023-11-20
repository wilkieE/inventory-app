<template>
  <UCard>
    <template #header>
      <h1>Current inventory status:</h1>
    </template>
    <div class="grid grid-cols-2 gap-4">
      <UCard>
        <template #header>
          <h2>User Overview</h2>
        </template>
        <p>Total Users: {{ userStats.totalUsers }}</p>
        <template #footer>
          <UButton trailing color="gray" size="xs">
            <NuxtLink to="/users" class="text-blue-600 hover:text-blue-800">View all users</NuxtLink>
          </UButton>
        </template>
      </UCard>
      <UCard>
        <template #header>
          <h2>Item Overview</h2>
        </template>
        <div class="flex justify-between">

          <p>Total Items: {{ itemStats.totalItems }}</p>
          <p>Items in Use: {{ itemStats.itemsInUse }}</p>
          <p>Available Items: {{ itemStats.itemsAvailable }}</p>
        </div>
        <template #footer>

          <UButton trailing color="gray" size="xs">
            <NuxtLink to="/items" class="text-blue-600 hover:text-blue-800">View all items</NuxtLink>
          </UButton>
        </template>
      </UCard>
    </div>
  </UCard>
</template>


 

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useFetch } from '#app';

interface Item {
  id: number;
  name: string;
  description: string;
  status: 'available' | 'in use';
  deletedAt: null | string;
}

interface User {
  id: number;
  name: string;
  email: string;
  department: string;
  deletedAt: null | string;
  checkedOutItems: Item[];
}

const userStats = ref({ totalUsers: 0 });
const itemStats = ref({ totalItems: 0, itemsInUse: 0, itemsAvailable: 0 });

const { data: usersData } = await useFetch<User[]>('/api/users');
const { data: itemsData } = await useFetch<Item[]>('/api/items');

watch(usersData, (newData) => {
  if (Array.isArray(newData)) {
    userStats.value.totalUsers = newData.length;
  }
}, { immediate: true });

watch(itemsData, (newData) => {
  if (Array.isArray(newData)) {
    itemStats.value.totalItems = newData.length;
    itemStats.value.itemsInUse = newData.filter(item => item.status === 'in use').length;
    itemStats.value.itemsAvailable = itemStats.value.totalItems - itemStats.value.itemsInUse;
  }
}, { immediate: true });
</script>

