<template>
  <div
    class="container mx-auto mt-4 p-4 overflow-hidden rounded-lg divide-y divide-gray-200 dark:divide-gray-800 ring-1 ring-gray-200 dark:ring-gray-800 shadow bg-white dark:bg-gray-900">
    <div class="flex justify-between items-center mb-6 mt-2">
      <h1 class="text-2xl font-bold">User Management</h1>
      <UButton color="blue" @click="showAddUserModal">Add New User</UButton>
    </div>

    <UTable :rows="users" :columns="columns">

      <!-- Custom Name Slot -->
      <template #name-data="{ row }">
        <NuxtLink :to="`/users/${row.id}`" class="text-blue-600 hover:text-blue-800">{{ row.name }}</NuxtLink>
      </template>
      <!-- Checked Out Items -->
      <template #checkedOutItems-data="{ row }">
        <div>
          <span v-for="(item, index) in row.checkedOutItems" :key="item.id">
            <NuxtLink :to="`/items/${item.id}`" class="text-blue-600 hover:text-blue-800">{{ item.name }}</NuxtLink>
            <span v-if="index < row.checkedOutItems.length - 1">, </span>
          </span>
        </div>
      </template>
      <!-- Action Buttons -->
      <template #actions-data="{ row }">
        <UButton color="blue" @click="editUser(row)">Edit</UButton>
        <UButton color="red" class="ml-2" @click="confirmDeleteUser(row.id)">Delete</UButton>
      </template>
    </UTable>


    <!-- Add/Edit User Modal -->
    <UModal v-model="showModal">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <h2 class="text-lg font-semibold mb-4">{{ editingUser ? 'Edit User' : 'Add New User' }}</h2>

        <div class="mb-3">
          <input v-model="modalData.name" type="text" placeholder="Name"
            class="w-full px-2 py-1 border border-gray-700 focus:border-gray-900 rounded focus:outline-none bg-gray-100 dark:bg-gray-800">
        </div>

        <div class="mb-3">
          <input v-model="modalData.email" type="email" placeholder="Email"
            class="w-full px-2 py-1 border border-gray-700 focus:border-gray-900 rounded focus:outline-none bg-gray-100 dark:bg-gray-800">
        </div>

        <div class="mb-4">
          <input v-model="modalData.department" type="text" placeholder="Department"
            class="w-full px-2 py-1 border border-gray-700 focus:border-gray-900 rounded focus:outline-none bg-gray-100 dark:bg-gray-800">
        </div>

        <div class="flex justify-end space-x-2">
          <UButton @click="closeModal" variant="outline">Cancel</UButton>
          <UButton color="blue" @click="handleModalSubmit">
            {{ editingUser ? 'Update' : 'Add' }}
          </UButton>
        </div>
      </UCard>
    </UModal>

  </div>

  <!-- Confirmation Dialog -->
  <UModal v-model="showConfirmationDialog">
    <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <h2 class="text-lg font-semibold mb-4">Confirm Deletion</h2>
      <p>Are you sure you want to delete this user?</p>
      <div class="flex justify-end space-x-2">
        <UButton variant="outline" @click="cancelDeletion">Cancel</UButton>
        <UButton color="red" @click="confirmDeletion">Yes, Delete</UButton>
      </div>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useFetch } from '#app';

interface NewUser {
  name: string;
  email: string;
  department: string;
}

interface CheckedOutItem {
  id: string;
  name: string;
  description: string;
  status: string;
  deletedAt: Date | null;
}

interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  deletedAt: Date | null;
  checkedOutItems: CheckedOutItem[];
}

interface UserColumn {
  key: string;
  label: string;
  sortable?: boolean;
  cell?: (row: User) => string;
}


const { data: usersData, pending, refresh, error } = await useFetch<User[]>('/api/users');
const users = computed(() => usersData.value || []);

const showModal = ref(false);
const editingUser = ref<User | null>(null);
const modalData = ref({ name: '', email: '', department: '' });
const showConfirmationDialog = ref(false);
const userToDelete = ref<string | null>(null);

const columns: UserColumn[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'department', label: 'Department', sortable: true },
  { key: 'checkedOutItems', label: 'Checked Out Items' },
  { key: 'actions', label: 'Actions' }
];


const confirmDeleteUser = (userId: string) => {
  showConfirmationDialog.value = true;
  userToDelete.value = userId;
};

const confirmDeletion = async () => {
  if (userToDelete.value !== null) {
    await deleteUser(userToDelete.value);
  }
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

const editUser = (user: User) => {
  editingUser.value = user;
  modalData.value = { ...user };
  showModal.value = true;
};

const handleModalSubmit = async () => {
  if (editingUser.value) {
    const userToUpdate: User = {
      ...modalData.value,
      id: editingUser.value.id,
      deletedAt: editingUser.value.deletedAt,
      checkedOutItems: editingUser.value.checkedOutItems
    };
    await updateUser(userToUpdate.id, userToUpdate);
  } else {
    await addNewUser(modalData.value);
  }
  closeModal();
}

const closeModal = () => {
  showModal.value = false;
};

const addNewUser = async (newUser: NewUser) => {
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

const updateUser = async (userId: string, updatedUser: User) => {
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

const deleteUser = async (userId: string) => {
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

