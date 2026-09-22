<script setup>
import { ref, onMounted } from 'vue';
import { useLinkStore } from '@/stores/linkStore';

const linkStore = useLinkStore();

onMounted(() => {
    linkStore.getLinks();
});


</script>
<template>
    
</template>
<style scoped>
.geral {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: white;
    border-radius: 0.5rem;
    padding: 2rem 1.2rem;
    cursor: pointer;
    transition: 
        transform 0.15s ease,
        box-shadow 0.15s ease,
        background-color 0.15s ease;


    -webkit-tap-highlight-color: transparent;
}

.geral:hover {
    background-color: #fafafa;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
}


.geral:active {
    transform: scale(0.98);
    background-color: #f2f4f7;
    box-shadow: none;
}

h5 {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 2vw;
}

p {
    font-size: 0.9rem;
}

div.span1 span {
    color: #01295F;
    font-size: 2.5rem;
    margin-right: 3vw;

}

div.separando {
    display: flex;
    align-items: center;
}

div.span2 span {
    font-size: 1.5rem;
    color: #969696;
}

</style>