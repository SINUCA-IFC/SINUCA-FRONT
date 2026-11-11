import { defineStore } from "pinia";
import { ref } from "vue";

import CategoryService from "@/services/categoryService";
import { getAllPages } from '@/services/pagination';
import { getCategoryStyle } from '@/utils/categoryStyle';

const categoryService = new CategoryService();

export const UseCategoryStore = defineStore('categoria', () => {
    const categories = ref([]);
    const category = ref();
    const loading = ref(false);

    const categoriesStyle = {
        2: { icon: 'mdi mdi-book-open-page-variant-outline', activeStyle: 'background-color: #FFB30F;', },
        3: { icon: 'mdi mdi-forum-outline', activeStyle: 'background-color: #01295F;',},
        4: { icon: 'mdi mdi-instagram', activeStyle: 'background-color: #FD151B;', },
        5: { icon: 'mdi mdi-handshake-outline', activeStyle: 'background-color: #849324;', },
        6: { icon: 'mdi mdi-drama-masks', activeStyle: 'background-color: #FFB30F;',},
        7: { icon: 'mdi mdi-dots-horizontal', activeStyle: 'background-color: #01295F;',}
    }

    function getCategoryActive(id){
        return getCategoryStyle(id, categoriesStyle)
    }


    async function getCategories() {
        loading.value = true
        try {
            categories.value = await getAllPages(page => categoryService.getAllCategorys(page));
        }
        finally {
            loading.value = false
        }
    }

    return {
        getCategories,
        getCategoryActive,
        categories,
        category,
        categoriesStyle,
    }
});
