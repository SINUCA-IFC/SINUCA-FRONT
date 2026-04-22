import { computed } from "vue";
import { defineStore } from "pinia";
import { useTaskStore } from "./taskStore";

export const useStatusStore = defineStore('status', () => {
    const taskStore = useTaskStore();

    const toDo = computed(() => {
        return taskStore.tasks.filter(task => task.status === 1);
    });

    const doing = computed(() => {
        return taskStore.tasks.filter(task => task.status === 2);
    });

    const done = computed(() => {
        return taskStore.tasks.filter(task => task.status === 3);
    });

    return {
        toDo,
        doing,
        done
    }
});