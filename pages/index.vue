<template>
  <div>
    <h1>Welcome to the Inventory Management System</h1>
    <AppAlert>
      Stay updated with the latest status of users and items!
    </AppAlert>
    <div>
      <h2>User Overview</h2>
      <p>Total Users: {{ userStats.totalUsers }}</p>
      <p><a href="/users">View all users</a></p>
    </div>
    <div>
      <h2>Item Overview</h2>
      <p>Total Items: {{ itemStats.totalItems }}</p>
      <p>Items in Use: {{ itemStats.itemsInUse }}</p>
      <p>Available Items: {{ itemStats.itemsAvailable }}</p>
      <p><a href="/items">View all items</a></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useFetch } from '#app';

const userStats = ref({ totalUsers: 0 });
const itemStats = ref({ totalItems: 0, itemsInUse: 0, itemsAvailable: 0 });

const { data: usersData } = await useFetch('/api/users');
const { data: itemsData } = await useFetch('/api/items');

const isArrayOfObjects = (data: any): data is Array<{ [key: string]: any }> => 
  Array.isArray(data) && data.every(item => typeof item === 'object');

watch(usersData, (newData) => {
  if (isArrayOfObjects(newData)) {
    userStats.value.totalUsers = newData.length;
  }
}, { immediate: true });

watch(itemsData, (newData) => {
  if (isArrayOfObjects(newData)) {
    itemStats.value.totalItems = newData.length;
    itemStats.value.itemsInUse = newData.filter(item => item.status === 'in use').length;
    itemStats.value.itemsAvailable = itemStats.value.totalItems - itemStats.value.itemsInUse;
  }
}, { immediate: true });
</script>