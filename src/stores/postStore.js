import PostService from "@/services/postService";
import {ref} from "vue";
import {defineStore} from "pinia";


const postService = new PostService()

export const usePostStore = defineStore('post', () => {

const posts = ref([])
const post = ref(
    {
  capa_attachment_key: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  title: "string",
  content: "string",
  foto: 0
}
)

const carregando = ref(false)

async function getPosts() {
    carregando.value = true;
    try {
    const data = await postService.getPosts()
    posts.value = data.results
} finally {
    carregando.value = false;
}
}

async function getPost(id) {
    post.value = await postService.getPost(id)
}

async function createPost(newPost) {
    const createdPost = await postService.createPost(newPost)
    posts.value.push(createdPost)
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
    post,
    getPosts,
    getPost,
    createPost,
    updatePost,
    deletePost
}
})