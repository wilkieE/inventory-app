<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">User Management</h1>
    <div class="mb-4">
      <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" @click="addNewUser">Add New User</button>
    </div>
    <table class="min-w-full bg-white">
      <thead>
        <tr>
          <th
            class="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Name</th>
          <th
            class="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Email</th>
          <th
            class="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Department</th>
          <th
            class="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td class="px-4 py-2 border-b border-gray-200">{{ user.name }}</td>
          <td class="px-4 py-2 border-b border-gray-200">{{ user.email }}</td>
          <td class="px-4 py-2 border-b border-gray-200">{{ user.department }}</td>
          <td class="px-4 py-2 border-b border-gray-200">
            <button class="text-blue-600 hover:text-blue-800" @click="editUser(user)">Edit</button>
            <button class="text-red-600 hover:text-red-800 ml-2" @click="deleteUser(user.id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useFetch } from '#app';

const { data: users, pending, refresh, error } = await useFetch('/api/users');

//TODO add crud logic
const addNewUser = () => {
};

const editUser = (user) => {
};

const deleteUser = async (userId) => {
  refresh();
};

</script>
