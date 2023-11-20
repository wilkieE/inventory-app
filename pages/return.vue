<template>
    <div class="container mx-auto p-4">
        <UCard>
            <template #header>
                <h1 class="text-2xl font-bold">Return Item</h1>
            </template>

            <div v-if="pending" class="text-center">Loading...</div>
            <div v-else>
                <UForm :state="formState" class="space-y-4" @submit="returnItem">
                    <UFormGroup label="Select Item to Return:" name="selectedItem">
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

                    <UFormGroup label="Return Notes (optional):" name="returnNotes">
                        <UTextarea v-model="formState.returnNotes" placeholder="Enter any return notes here..."
                            class="w-full">
                        </UTextarea>
                    </UFormGroup>

                    <div class="flex items-center justify-between">
                        <UButton type="submit"
                            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                            Return Item
                        </UButton>
                    </div>
                </UForm>
            </div>

            <template #footer></template>
        </UCard>
    </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue';
import { useFetch } from '#app';

interface Item {
    id: number;
    name: string;
    status: string;
}

const formState = reactive({
    selectedItem: undefined as number | undefined,
    returnNotes: '',
});

const { data: items, pending, refresh } = await useFetch<Item[]>('/api/items');

const itemOptions = computed(() => items.value?.filter(item => item.status === 'in use').map(item => ({
    label: item.name,
    value: item.id
})) ?? []);

const currentItem = computed(() => {
    return items.value?.find(item => item.id === formState.selectedItem);
});

const returnItem = async (): Promise<void> => {
    if (!formState.selectedItem) {
        alert('Please select an item to return.');
        return;
    }

    try {
        const response = await fetch('/api/items/return', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId: formState.selectedItem, returnNotes: formState.returnNotes })
        });

        if (response.ok) {
            alert('Item returned successfully!');
            formState.selectedItem = undefined;
            formState.returnNotes = '';
            await refresh();
        } else {
            throw new Error('Failed to return item');
        }
    } catch (error: any) {
        console.error('Error returning item:', error);
        alert('Failed to return item.');
    }
};
</script>