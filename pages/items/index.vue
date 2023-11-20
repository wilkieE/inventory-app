<template>
  <div
    class="container mx-auto mt-4 p-4 overflow-hidden rounded-lg divide-y divide-gray-200 dark:divide-gray-800 ring-1 ring-gray-200 dark:ring-gray-800 shadow bg-white dark:bg-gray-900">
    <div class="flex justify-between items-center mb-6 mt-2">
      <div class="flex gap-4">
        <h1 class="text-2xl font-bold">Item Management</h1>
        <USelectMenu v-model="selectedStatus" placeholder="Select a Status" :options="statusOptions">
          <template #label>
            <span class="min-h-[22px]">
              {{ selectedStatus || 'All Statuses' }}
            </span>
          </template>
        </USelectMenu>
      </div>
      <UButton color="blue" @click="addNewItem">Add New Item</UButton>
    </div>



    <UTable :rows="filteredItems" :columns="columns">
      <!-- Custom Name Slot -->
      <template #name-data="{ row }">
        <NuxtLink :to="`/items/${row.id}`" class="text-blue-600 hover:text-blue-800">{{ row.name }}</NuxtLink>
      </template>

      <!-- Custom Description Slot -->
      <template #description-data="{ row }">
        <span>{{ row.description }}</span>
      </template>

      <!-- Custom Status Slot -->
      <template #status-data="{ row }">
        <span>{{ row.status }}</span>
      </template>

      <!-- Custom Current User Slot -->
      <template #currentUser-data="{ row }">
        <div>
          <span v-if="row.currentUser">
            <NuxtLink :to="`/users/${row.currentUser.id}`" class="text-blue-600 hover:text-blue-800">
              {{ row.currentUser.name }}
            </NuxtLink>
          </span>
          <span v-else>None</span>
        </div>
      </template>

      <!-- Custom Action Buttons Slot -->
      <template #actions-data="{ row }">
        <UButton color="blue" @click="editItem(row)">Edit</UButton>
        <UButton color="red" class="ml-2" @click="confirmDeleteItem(row.id)" :disabled="row.status !== 'available'">Delete
        </UButton>
      </template>
    </UTable>


    <!-- Add/Edit Item Modal -->
    <UModal v-model="showItemModal">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <h2 class="text-lg font-semibold mb-4">{{ editingItem ? 'Edit Item' : 'Add New Item' }}</h2>

        <div class="mb-3">
          <input v-model="modalItemData.name" type="text" placeholder="Name"
            class="w-full px-2 py-1 border border-gray-700 focus:border-gray-900 rounded focus:outline-none bg-gray-100 dark:bg-gray-800">
        </div>

        <div class="mb-3">
          <input v-model="modalItemData.description" type="text" placeholder="Description"
            class="w-full px-2 py-1 border border-gray-700 focus:border-gray-900 rounded focus:outline-none bg-gray-100 dark:bg-gray-800">
        </div>

        <div v-if="editingItem" class="mb-4">
          <span>Status: {{ modalItemData.status }}</span>
        </div>

        <div class="flex justify-end space-x-2">
          <UButton @click="closeItemModal" variant="outline">Cancel</UButton>
          <UButton color="blue" @click="handleItemModalSubmit">
            {{ editingItem ? 'Update' : 'Add' }}
          </UButton>
        </div>
      </UCard>
    </UModal>


    <!-- Confirmation Dialog -->
    <UModal v-model="showItemConfirmationDialog">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <h2 class="text-lg font-semibold mb-4">Confirm Deletion</h2>
        <p>Are you sure you want to delete this item?</p>
        <div class="flex justify-end space-x-2">
          <UButton variant="outline" @click="cancelItemDeletion">Cancel</UButton>
          <UButton color="red" @click="confirmItemDeletion">Yes, Delete</UButton>
        </div>
      </UCard>
    </UModal>
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
  currentUser?: { name: string, id: string };
}

const { data: items, pending, refresh, error } = await useFetch<Item[]>('/api/items');
const selectedStatus: Ref<string> = ref('all items');
const statusOptions = ref(['available', 'in use', "all items"]);
const filteredItems = computed(() => {
  if (!items.value) {
    return [];
  }
  return selectedStatus.value == "all items" ? items.value : items.value.filter(item => item.status === selectedStatus.value);
});

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'description', label: 'Description' },
  { key: 'status', label: 'Status' },
  { key: 'currentUser', label: 'Current User' },
  { key: 'actions', label: 'Actions' }
];

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

