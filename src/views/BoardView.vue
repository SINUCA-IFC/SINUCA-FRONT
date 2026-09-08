<script setup>
import { onMounted } from 'vue';
import { usePostStore } from '@/stores/postStore';
import AppHeaderMob from '@/components/layout/mobile/AppHeaderMob.vue'
import AppTabFooter from '@/components/layout/mobile/AppTabFooter.vue'
import CardPostComponent from '@/components/posts/CardPostComponent.vue'

const postStore = usePostStore();

const formatDate = (data) => {
    if (!data) return ''
    const date = new Date(data)

    return new Intl.DateTimeFormat('pt-BR', {
        month: 'long',
        day: '2-digit',
    }).format(date)
}


onMounted(() => {
    postStore.getPosts();
});
</script>
<template>
    <AppHeaderMob title="Mural" />
    <main>
        <section class="banner">
            <div class="section-name">
                <div style="display: flex; gap: 1rem; align-items: center">
                    <h2 class="name">Mural</h2>
                    <span class="mdi mdi-bulletin-board"></span>
                </div>
                <p class="section-desc">Notícias Atualizadas sobre o SINUCA</p>
            </div>
            <img src="/static/ods-shape.svg" alt="ods-shape" style="width: auto; height: 160px" />
        </section>

        <section class="post-list">
            <CardPostComponent 
                v-for="post in postStore.posts"
                :key="post.id"
                :title="post.title"
                :date="formatDate(post.created_at)"
                :description="post.content"
                :image-url="post.foto.url"
            />
        </section>
    </main>
    <AppTabFooter />
</template>
<style scoped>
.banner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 10px;
    background-color: #fff;
}

span {
    font-size: 2rem;
}

.section-name {
    padding: 1em;

    & .name {
        font-weight: bold;
    }

    & .section-desc {
        color: #969696;
        margin-top: 0.5rem;
    }
}

.post-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 2rem;
}
</style>
