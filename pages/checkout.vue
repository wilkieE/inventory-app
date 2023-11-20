<template>
    <div class="container mx-auto p-4">
        <h1 class="text-2xl font-bold mb-4">Checkout Item</h1>

        <UForm :validate="validate" :state="formState" class="space-y-4" @submit="checkoutItem">
            <UFormGroup label="Select Item to checkout:" name="selectedItem">
                <USelectMenu v-model="formState.selectedItem" :options="itemOptions" class="w-full"
                    placeholder="Select an Item" searchable searchable-placeholder="Search an item..."
                    value-attribute="value" option-attribute="label">
                    <template #label>
                        <span class="min-h-[22px]">
                            {{ currentItem?.name || 'Select an Item' }}
                        </span>
                    </template>
                </USelectMenu>
            </UFormGroup>

            <UFormGroup label="Select User to checkout:" name="selectedUser">
                <USelectMenu v-model="formState.selectedUser" :options="userOptions" class="w-full"
                    placeholder="Select a User" searchable searchable-placeholder="Search a user..." value-attribute="value"
                    option-attribute="label">
                    <template #label>
                        <span class="min-h-[22px]">
                            {{ currentUser?.name || 'Select a User' }}
                        </span>
                    </template>
                </USelectMenu>
            </UFormGroup>

            <div class="flex items-center justify-between">
                <UButton type="submit"
                    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                    Checkout
                </UButton>
            </div>
        </UForm>
    </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import type { FormError } from '#ui/types';
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

const formState = reactive({
    selectedItem: undefined as number | undefined,
    selectedUser: undefined as number | undefined,
});

const { data: items, refresh: refreshItems } = await useFetch<Item[]>('/api/items');
const { data: users, refresh: refreshUsers } = await useFetch<User[]>('/api/users');

const currentItem = computed(() => {
    return items.value?.find(item => item.id === formState.selectedItem);
});

const currentUser = computed(() => {
    return users.value?.find(user => user.id === formState.selectedUser);
});

const itemOptions = computed(() => items.value?.map(item => ({
    label: `${item.name} (${item.status})`,
    value: item.id,
    disabled: item.status !== 'available'
})) ?? []);

const userOptions = computed(() => users.value?.map(user => ({
    label: user.name,
    value: user.id
})) ?? []);

const validate = (state: any): FormError[] => {
    const errors = [];
    if (!state.selectedItem) errors.push({ path: 'selectedItem', message: 'Please select an item.' });
    if (!state.selectedUser) errors.push({ path: 'selectedUser', message: 'Please select a user.' });
    return errors;
};

const checkoutItem = async (): Promise<void> => {
    if (!formState.selectedItem || !formState.selectedUser) {
        alert('Please select both an item and a user.');
        return;
    }

    try {
        const response = await fetch('/api/items/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId: formState.selectedItem, userId: formState.selectedUser })
        });

        if (response.ok) {
            alert('Item checked out successfully!');
            formState.selectedItem = undefined;
            formState.selectedUser = undefined;
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