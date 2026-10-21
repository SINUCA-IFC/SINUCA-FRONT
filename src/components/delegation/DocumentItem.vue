<script setup>
const props = defineProps({
    title: String,
    link: String,
    class: {
        type: String,
        default: 'debate'
    }
});
</script>

<template>
    <div :class="['docs-card', props.class]">
        <div style="display: flex; align-items: center;">
            <span class="mdi mdi-link-variant"></span>
            <div class="docs-content">
                <h4 class="docs-title">{{ props.title }}</h4>
                <a :href="props.link" target="_blank" class="docs-link">
                    {{ props.link }}
                </a>
            </div>
        </div>
        <span class="mdi mdi-open-in-new" style="font-size: 1.4rem; color: #969696;"></span>
    </div>
</template>

<style scoped>
.docs-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    padding: 2rem 1.5rem;
    border-radius: 10px;
}



</style>