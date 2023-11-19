<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">User Management</h1>
    <div class="mb-4">
      <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" @click="showAddUserModal">Add New
        User</button>
    </div>

    <!-- User List -->
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
            <button class="text-red-600 hover:text-red-800 ml-2" @click="confirmDeleteUser(user.id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Add/Edit User Modal -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <h2 class="text-xl font-bold mb-4">{{ editingUser ? 'Edit User' : 'Add New User' }}</h2>
        <label>Name: <input v-model="modalData.name" type="text"></label>
        <label>Email: <input v-model="modalData.email" type="email"></label>
        <label>Department: <input v-model="modalData.department" type="text"></label>
        <button @click="handleModalSubmit">{{ editingUser ? 'Update' : 'Add' }}</button>
        <button @click="closeModal">Cancel</button>
      </div>
    </div>
  </div>

  <!-- Confirmation Dialog -->
  <div v-if="showConfirmationDialog" class="confirmation-dialog">
    <div class="confirmation-content">
      <h2>Confirm Deletion</h2>
      <p>Are you sure you want to delete this user?</p>
      <button @click="confirmDeletion">Yes, Delete</button>
      <button @click="cancelDeletion">Cancel</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useFetch } from '#app';

const { data: users, pending, refresh, error } = await useFetch('/api/users');

const showModal = ref(false);
const editingUser = ref(null);
const modalData = ref({ name: '', email: '', department: '' });

const showConfirmationDialog = ref(false);
let userToDelete = ref(null);

const confirmDeleteUser = (userId) => {
  showConfirmationDialog.value = true;
  userToDelete.value = userId;
};

const confirmDeletion = async () => {
  await deleteUser(userToDelete.value);
  showConfirmationDialog.value = false;
};

const cancelDeletion = () => {
  showConfirmationDialog.value = false;
};


const showAddUserModal = () => {
  editingUser.value = null;
  modalData.value = { name: '', email: '', department: '' };
  showModal.value = true;
};

const editUser = (user) => {
  editingUser.value = user;
  modalData.value = { ...user };
  showModal.value = true;
};

const handleModalSubmit = async () => {
  if (editingUser.value) {
    await updateUser(editingUser.value.id, modalData.value);
  } else {
    await addNewUser(modalData.value);
  }
  closeModal();
};

const closeModal = () => {
  showModal.value = false;
};

const addNewUser = async (newUser) => {
  try {
    const response = await fetch('api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newUser),
    });

    if (response.ok) {
      refresh();
    } else {
      console.error('Error adding user:', response.statusText);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

const updateUser = async (userId, updatedUser) => {
  try {
    const response = await fetch(`api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedUser),
    });

    if (response.ok) {
      refresh();
    } else {
      console.error('Error updating user:', response.statusText);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

const deleteUser = async (userId) => {
  try {
    const response = await fetch(`api/users/${userId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      refresh();
    } else {
      console.error('Error deleting user:', response.statusText);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
</script>

