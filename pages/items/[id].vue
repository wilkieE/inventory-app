<template>
    <div v-if="item" class="container mx-auto p-4">
        <h1 class="text-2xl font-bold mb-4">{{ item.name }}</h1>
        <p><strong>Description:</strong> {{ item.description }}</p>
        <p v-if="isCurrentlyInUse"><strong>Status:</strong> Currently in use by {{ currentUserName }}</p>
        <p v-else><strong>Status:</strong> {{ item.status }}</p>

        <!-- Rent History -->
        <div v-if="item.usageLogs && item.usageLogs.length">
            <h2 class="text-xl font-bold mt-6 mb-4">Rent History</h2>
            <ul>
                <li v-for="log in item.usageLogs" :key="log.id">
                    <strong>{{ log.user.name }}</strong> ({{ log.user.department }})
                    <br>Start Time: {{ new Date(log.startTime).toLocaleString() }}
                    <template v-if="log.endTime">
                        <br>End Time: {{ new Date(log.endTime).toLocaleString() }}
                    </template>
                </li>
            </ul>
        </div>
    </div>
    <div v-else-if="error" class="container mx-auto p-4">
        <p>Error fetching item details: {{ error.message }}</p>
    </div>
    <div v-else class="container mx-auto p-4">
        <p>Loading...</p>
    </div>
</template>
  
<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed } from 'vue';

interface ItemResponse {
    data?: {
        id: number;
        name: string;
        description: string;
        status: string;
        deletedAt: string | null;
        usageLogs: Array<{
            id: number;
            startTime: string;
            endTime: string;
            userId: number;
            itemId: number;
            deletedAt: string | null;
            user: {
                id: number;
                name: string;
                email: string;
                department: string;
                deletedAt: string | null;
            };
        }>;
    };
    error?: string;
    statusCode: number;
}

const route = useRoute();

const { data, error, pending } = await useFetch<ItemResponse>(`/api/items/${route.params.id}`);
const item = computed(() => data.value?.data);

//check if item is currently in use
const isCurrentlyInUse = computed(() => {
    const latestLog = item.value?.usageLogs?.[0];
    return latestLog && !latestLog.endTime;
});
// get name of the user currently using the item
const currentUserName = computed(() => {
    if (isCurrentlyInUse.value) {
        return item.value?.usageLogs?.[0]?.user.name;
    }
    return '';
});

</script>
  
  