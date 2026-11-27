import PostService from "@/services/postService";
import { getAllPages } from '@/services/pagination';
import {ref} from "vue";
import {defineStore} from "pinia";


const postService = new PostService()

export const usePostStore = defineStore('post', () => {

const posts = ref([])
async function getPosts() {
    posts.value = await getAllPages(page => postService.getPosts(page))
}

async function createPost(newPost) {
    const createdPost = await postService.createPost(newPost)
    posts.value.unshift(createdPost)
}

async function updatePost(id, updatedPost) {
    const updated = await postService.updatePost(id, updatedPost)
    const index = posts.value.findIndex(t => t.id === id)
    if (index !== -1) {
        posts.value[index] = updated
    }
}

async function deletePost(id) {
    await postService.deletePost(id)
    posts.value = posts.value.filter(t => t.id !== id)
}

return {
    posts,
    getPosts,
    createPost,
    updatePost,
    deletePost
}
})
