<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthShell from '@/components/forms/AuthShell.vue'
import RegisterStepOne from '@/components/forms/RegisterStepOne.vue'
import RegisterStepTwo from '@/components/forms/RegisterStepTwo.vue'
import RegisterStepThree from '@/components/forms/RegisterStepThree.vue'
const route = useRoute()
const router = useRouter()
const currentStep = ref(1)
const checkingEmail = computed(() => route.query.etapa === 'email')
const draft = reactive({ email: '', password: '', name: '', gang: '', matriculation: '' })
watch(
  () => route.query.id,
  () => {
    currentStep.value = 1
    Object.assign(draft, { email: '', password: '', name: '', gang: '', matriculation: '' })
  },
)
</script>
<template>
  <AuthShell
    title="Criar conta"
    :subtitle="
      checkingEmail ? 'Verifique sua caixa de entrada' : 'Preencha seus dados para se cadastrar'
    "
    login-layout
  >
    <RegisterStepTwo v-if="checkingEmail" />
    <RegisterStepOne v-else-if="currentStep === 1" :draft="draft" @next-step="currentStep = 2" />
    <RegisterStepThree
      v-else
      :draft="draft"
      :user-id="route.query.id"
      @back="currentStep = 1"
      @registered="
        router.replace({ name: 'cadastro', query: { id: route.query.id, etapa: 'email' } })
      "
    />
  </AuthShell>
</template>
