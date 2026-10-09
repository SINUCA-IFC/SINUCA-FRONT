<script setup>
import { useRoute } from 'vue-router';
const route = useRoute();

const tabsFooter = [
    {id: 1, name: 'Mural', icon: 'mdi mdi-bulletin-board', path: '/mural'},
    {id: 2, name: 'Cronograma', icon: 'mdi mdi-calendar-month-outline', path: '/cronograma'},
];

</script>

<template>
    <footer>
        <nav class="nav-footer">
            <ul class="navtabs-list">
                <li 
                    v-for="tab in tabsFooter"
                    :key="tab.id"
                    class="navtab-item"
                    :class="route.path === tab.path ? 'active' : ''"
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
    z-index: 30;
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
    display: flex;
    justify-content: space-around;
    padding: 1rem 0.5rem calc(1rem + env(safe-area-inset-bottom, 0px));
}

.navtab-item span {
    font-size: 1.1rem;
}

.navtab-item .icon{
    display: block;
    text-align: center;
    font-size: 1.3rem;
    margin-bottom: 0.4rem;
}

.navtab-item a{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    min-width: 80px;
    color: #969696;
}

.active a{
    color: #01295F;
    font-weight: bold;
}

</style>
