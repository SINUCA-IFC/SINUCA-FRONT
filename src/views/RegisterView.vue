<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthShell from '@/components/forms/AuthShell.vue'
import RegisterStepOne from '@/components/forms/RegisterStepOne.vue'
import RegisterStepTwo from '@/components/forms/RegisterStepTwo.vue'
import RegisterStepThree from '@/components/forms/RegisterStepThree.vue'
const route = useRoute()
const router = useRouter()
const currentStep = ref(1)
const checkingEmail = computed(() => route.query.etapa === 'email')
const draft = reactive({ email: '', password: '', name: '', gang: null, matriculation: '' })
</script>
<template>
  <AuthShell :title="checkingEmail ? 'Confirme seu e-mail' : 'Criar conta'">
    <RegisterStepTwo v-if="checkingEmail" />
    <RegisterStepOne v-else-if="currentStep === 1" :draft="draft" @next-step="currentStep = 2" />
    <RegisterStepThree
      v-else
      :draft="draft"
      :user-id="route.query.id"
      @back="currentStep = 1"
      @registered="router.replace({ name: 'cadastro', query: { etapa: 'email' } })"
    />
  </AuthShell>
</template>
