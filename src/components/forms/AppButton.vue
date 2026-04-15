<script setup>
defineProps({
    type: {
        type: String,
        default: 'button'
    },
    variant: {
        type: String,
        default: 'primary' //secondary and danger
    },
    disabled: Boolean,
});
</script>

<template>
    <button 
        :type="type"
        :disabled="disabled"
        :class="['app-button', `variant-${variant}`]"
        >
        <slot></slot>
    </button>
</template>

<style scoped>
.app-button {
    padding: 8px 30px;
    font-family: 'Poppins';
    font-weight: 600;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: all .3s;
}

.app-button:disabled{
    opacity: 0.5;
    cursor: not-allowed;
}

/*PRIMARY BUTTON*/
.variant-primary {
    background-color: #01295F;
    color: #fff;
    transition: all .3s;
}

.variant-primary:hover{
    background-color: #002453;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.25);
}

.variant-primary:active {
    transform: scale(0.98);
    background-color: #002453;
}

/*SECONDARY BUTTON*/
.variant-secondary {
    background-color: inherit;
    border: 2px solid #01295F;
    color: #01295F;
}

.variant-secondary:hover {
    background-color: #e2e1e1;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.25);
}

.variant-secondary:active {
    background-color: #e2e1e1;
    transform: scale(0.98);
}

/*DANGER BUTTON*/
.variant-danger {
    background-color: #FD151B;
    color: #fff;
}

.variant-danger:hover {
    background-color: #d6050c;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.25);
}

.variant-danger:active {
    background-color: #d6050c;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.25);
    transform: scale(0.98);
}

</style>