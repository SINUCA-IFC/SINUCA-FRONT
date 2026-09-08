<script setup>
import { ref } from 'vue'

const props = defineProps({
    title: String,
    date: String,
    description: String,
    imageUrl: String,
})

const isExpanded = ref(false)
const textWrapref = ref(null)

function toggle() {
    isExpanded.value = !isExpanded.value
    if (!isExpanded.value && textWrapref.value) {
        textWrapref.value.scrollTop = 0
    }
}
</script>

<template>
    <div class="card">
        <div class="header-post">
            <h3 class="post-title">{{ props.title }}</h3>
            <span class="post-date">Postado em {{ props.date }}</span>
        </div>

        <div class="text-wrap" :class="{ expanded: isExpanded }" ref="textWrapref">
            <p class="post-desc">{{ props.description }}</p>
        </div>

        <button class="toggle-btn" @click="toggle">
            {{ isExpanded ? 'Ver menos' : 'Ver mais' }}
        </button>

        <img class="img-post" v-if="props.imageUrl" :src="props.imageUrl" />
    </div>
</template>

<style scoped>
.card {
    background-color: white;
    padding: 2rem 1.5rem;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(161, 161, 161, 0.5);
}

.header-post {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin-bottom: 1rem;
    gap: 0.8rem;

    & .post-title {
        font-size: 1.1rem;
        font-weight: bold;
    }

    & .post-date {
        font-size: 0.9rem;
        color: #969696;
    }
}

.text-wrap {
    max-height: 90px;
    overflow: hidden;
    position: relative;
    transition: max-height 0.25s ease;
}

.text-wrap.expanded {
    max-height: 180px;
    overflow-y: auto;
}

.text-wrap:not(.expanded)::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 28px;
    background: linear-gradient(to bottom, transparent, #ffffff);
}

.post-desc {
    font-size: 0.9rem;
    text-align: justify;
    color: #525050;
    line-height: 1.3;
}

.toggle-btn {
    margin-top: 0.5rem;
    background: none;
    border: none;
    padding: 0;
    color: #01295f;
    outline: none;
    cursor: pointer;
    font-weight: 600;
}

.img-post {
    width: 100%;
    height: auto;
    margin-top: 1rem;
    border-radius: 10px;
}
</style>