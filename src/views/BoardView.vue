<script setup>
import { onMounted } from 'vue';
import { usePostStore } from '@/stores/postStore';
import AppLayout from '@/components/layout/AppLayout.vue';
import BannerComponent from '@/components/layout/BannerComponent.vue';
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
    <AppLayout title="Mural" show-corner-ods>
        <main>
            <BannerComponent
                title="Mural"
                subtitle="Notícias Atualizadas sobre o SINUCA"
                icon="mdi mdi-bulletin-board"
            />

            <section class="post-list">
                <CardPostComponent 
                    v-for="post in postStore.posts"
                    :key="post.id"
                    :title="post.title"
                    :date="formatDate(post.created_at)"
                    :description="post.content"
                    :image-url="post.foto?.url"
                />
            </section>
        </main>
    </AppLayout>
</template>

<style scoped>
main {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.post-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 2rem;
}

@media (min-width: 1024px) {
    main {
        width: 100%;
        max-width: 58rem;
        margin-inline: auto;
        padding: 0;
        gap: 2.5rem;
    }

    .post-list {
        width: 100%;
        margin: 2rem 0 0;
        gap: 1.5rem;
    }
}
</style>
