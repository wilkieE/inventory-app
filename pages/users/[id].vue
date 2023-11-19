<template>
    <div v-if="user" class="container mx-auto p-4">
        <h1 class="text-2xl font-bold mb-4">{{ user.name }}</h1>
        <p><strong>Email:</strong> {{ user.email }}</p>
        <p><strong>Department:</strong> {{ user.department }}</p>

        <!-- Usage History -->
        <div v-if="user.usageLogs && user.usageLogs.length">
            <h2 class="text-xl font-bold mt-6 mb-4">Usage History</h2>
            <ul>
                <li v-for="log in user.usageLogs" :key="log.id">
                    <strong>{{ log.item.name }}</strong>: {{ log.item.description }}
                    <br>Start Time: {{ new Date(log.startTime).toLocaleString() }}
                    <template v-if="log.endTime">
                        <br>End Time: {{ new Date(log.endTime).toLocaleString() }}
                    </template>
                    <template v-if="log.returnNotes">
                        <br>Return Notes: {{ log.returnNotes }}
                    </template>
                </li>
            </ul>
        </div>
    </div>
    <div v-else-if="error" class="container mx-auto p-4">
        <p>Error fetching user details: {{ error.message }}</p>
    </div>
    <div v-else class="container mx-auto p-4">
        <p>Loading...</p>
    </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed } from 'vue';

interface UserResponse {
    data?: {
        id: number;
        name: string;
        email: string;
        department: string;
        deletedAt: string | null;
        usageLogs: Array<{
            id: number;
            startTime: string;
            endTime: string | null;
            userId: number;
            itemId: number;
            returnNotes: string | null;
            deletedAt: string | null;
            item: {
                id: number;
                name: string;
                description: string;
                status: string;
                deletedAt: string | null;
            };
        }>;
    };
    error?: string;
    statusCode: number;
}

const route = useRoute();

const { data, error, pending } = await useFetch<UserResponse>(`/api/users/${route.params.id}`);
const user = computed(() => data.value?.data);

</script>
