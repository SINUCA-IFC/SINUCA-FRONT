<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
const route = useRoute();

const tabsFooter = [
    {id: 1, name: 'História', icon: 'mdi mdi-book-open-page-variant-outline', path: '/historia'},
    {id: 2, name: 'Mural', icon: 'mdi mdi-bulletin-board', path: '/mural'},
    {id: 3, name: 'Chat', icon: 'mdi mdi-chat-outline', path: '/chat'},
    {id: 4, name: 'Delegação', icon: 'mdi mdi-earth', path: '/delegacao'},
];

const currentRoute = ref(route.fullPath)
</script>

<template>
    <footer>
        <nav class="nav-footer">
            <ul class="navtabs-list">
                <li 
                    v-for="tab in tabsFooter"
                    :key="tab.id"
                    class="navtab-item"
                    :class="currentRoute === tab.path ? 'active' : ''"
                >
                    <RouterLink :to="tab.path">
                        <span class="icon" :class="tab.icon"></span>
                        <span >{{ tab.name }}</span>
                    </RouterLink>
                </li>
            </ul>
        </nav>
    </footer>
</template>

<style scoped>
footer {
    position: fixed;
    bottom: 0;
    right: 0;
    left: 0;
    background-color: white;
    box-shadow: 0 -3px 8px rgba(0, 0, 0, 0.1);
    border-top: 8px solid transparent;
    border-image: url("/static/border-nav.svg") 1;
}

.navtabs-list {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.25rem;
    padding: 0.75rem 0.5rem calc(0.75rem + env(safe-area-inset-bottom, 0px));
}

.navtab-item span {
    font-size: clamp(0.7rem, 2.8vw, 0.95rem);
}

.navtab-item .icon{
    display: block;
    text-align: center;
    font-size: 1.3rem;
    margin-bottom: 0.4rem;
}

.navtab-item a{
    display: flex;
    min-height: 44px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    line-height: 1.4;
    color: #969696;
}

.active a{
    color: #01295F;
    font-weight: bold;
}

</style>
