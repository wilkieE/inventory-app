<template>
  <div class="bg-gray-800 text-white p-4 flex justify-between items-center">
    <span class="font-semibold text-xl">Inventory App</span>
    <nav>
      <NuxtLink to="/" class="px-4 py-2 hover:bg-gray-700 rounded">Dashboard</NuxtLink>
      <NuxtLink to="/users" class="px-4 py-2 hover:bg-gray-700 rounded">Users</NuxtLink>
      <NuxtLink to="/items" class="px-4 py-2 hover:bg-gray-700 rounded">Items</NuxtLink>
      <NuxtLink to="/checkout" class="px-4 py-2 hover:bg-gray-700 rounded">Check Out Item</NuxtLink>
      <NuxtLink to="/return" class="px-4 py-2 hover:bg-gray-700 rounded">Return Item</NuxtLink>
    </nav>
  </div>
</template>
  