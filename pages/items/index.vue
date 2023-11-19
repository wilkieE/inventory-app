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
            Current User</th>
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
            <span v-if="item.currentUser">{{ item.currentUser.name }}</span>
            <span v-else>None</span>
          </td>
          <td class="px-4 py-2 border-b border-gray-200">
            <button class="text-blue-600 hover:text-blue-800" @click="editItem(item)">Edit</button>
            <button class="text-red-600 hover:text-red-800 ml-2" @click="confirmDeleteItem(item.id)"
              :disabled="item.status !== 'available'">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Add/Edit Item Modal -->
  <div v-if="showItemModal" class="modal">
    <div class="modal-content">
      <h2 class="text-xl font-bold mb-4">{{ editingItem ? 'Edit Item' : 'Add New Item' }}</h2>
      <label>Name: <input v-model="modalItemData.name" type="text"></label>
      <label>Description: <input v-model="modalItemData.description" type="text"></label>
      <div v-if="editingItem">
        <label>Status: <span>{{ modalItemData.status }}</span></label>
      </div>
      <button @click="handleItemModalSubmit">{{ editingItem ? 'Update' : 'Add' }}</button>
      <button @click="closeItemModal">Cancel</button>
    </div>
  </div>


  <!-- Confirmation Dialog for Items -->
  <div v-if="showItemConfirmationDialog" class="confirmation-dialog">
    <div class="confirmation-content">
      <h2>Confirm Deletion</h2>
      <p>Are you sure you want to delete this item?</p>
      <button @click="confirmItemDeletion">Yes, Delete</button>
      <button @click="cancelItemDeletion">Cancel</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, type Ref } from 'vue';
import { useFetch } from '#app';

interface Item {
  id: string;
  name: string;
  description: string;
  status: string;
  currentUser?: { name: string };
}

const { data: items, pending, refresh, error } = await useFetch<Item[]>('/api/items');
const selectedStatus: Ref<string> = ref('');
const statuses: Ref<string[]> = ref(['available', 'in use']);

const filteredItems = computed(() => {
  if (!items.value) {
    return [];
  }
  return selectedStatus.value ? items.value.filter(item => item.status === selectedStatus.value) : items.value;
});

// Modal and confirmation dialog state
const showItemModal: Ref<boolean> = ref(false);
const editingItem: Ref<Item | null> = ref(null);
const modalItemData: Ref<Partial<Item>> = ref({ name: '', description: '', status: 'available' });
const showItemConfirmationDialog: Ref<boolean> = ref(false);
let itemToDelete: Ref<string | null> = ref(null);


const addNewItem = () => {
  editingItem.value = null;
  modalItemData.value = { name: '', description: '', status: 'available' };
  showItemModal.value = true;
};

const editItem = (item: Item) => {
  editingItem.value = item;
  modalItemData.value = { ...item };
  showItemModal.value = true;
};

const handleItemModalSubmit = async () => {
  if (editingItem.value) {
    await updateItem(editingItem.value.id, modalItemData.value);
  } else {
    await createItem(modalItemData.value);
  }
  closeItemModal();
};

const closeItemModal = () => {
  showItemModal.value = false;
};

const confirmDeleteItem = (itemId: string) => {
  showItemConfirmationDialog.value = true;
  itemToDelete.value = itemId;
};

const confirmItemDeletion = async () => {
  if (!itemToDelete.value) {
    return;
  }
  await deleteItem(itemToDelete.value);
  showItemConfirmationDialog.value = false;
};

const cancelItemDeletion = () => {
  showItemConfirmationDialog.value = false;
};

// CRUD operations for items
const createItem = async (newItem: Partial<Item>) => {
  try {
    const response = await fetch('/api/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newItem),
    });

    if (response.ok) {
      refresh();
    } else {
      console.error('Error creating item:', response.statusText);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

const updateItem = async (itemId: string, updatedItem: Partial<Item>) => {
  try {
    const payload = {
      name: updatedItem.name,
      description: updatedItem.description
    };

    const response = await fetch(`/api/items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      refresh();
    } else {
      console.error('Error updating item:', response.statusText);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

const deleteItem = async (itemId: string) => {
  try {
    const response = await fetch(`/api/items/${itemId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      refresh();
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
</script>

