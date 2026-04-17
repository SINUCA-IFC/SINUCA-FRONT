<script setup>
import { computed } from 'vue';

const props = defineProps({
    modelValue: [String, Number],
    label: String,
    type: String,
    placeholder: String,
    required: Boolean,
});

const emit = defineEmits(['update:modelValue']);

const value = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
})
</script>

<template>
    <div class="app-input">
        <label v-if="label" class="label-class">
            {{ label }}
            <span v-if="required" class="required">*</span>
        </label>
        <input 
            v-model="value"
            :type="type"
            :placeholder="placeholder"
            :required="required"
            class="input-class"
        >
    </div>

</template>

<style scoped>
.app-input {
    margin-bottom: 4vw;
}

.label-class{
    display: block;
    margin-bottom: 10px;
    font-size: 1.2rem;
    font-weight: 500;
}

.input-class {
    box-sizing: border-box;
    border: 2px solid #D9D9D9;
    background-color: inherit;
    padding: 8px 15px;
    width: 100%;
    border-radius: 5px;
    font-family: 'Poppins';
    transition: all .3s;
}

.input-class:focus {
    outline: none;
    border: 2px solid #01295F ;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.required {
    color: #FD151B;
}


@media(min-width: 768px) {
    .app-input {
        margin-bottom: 2vw;
    }
}
</style>