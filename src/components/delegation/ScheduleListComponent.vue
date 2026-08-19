<script setup>
import { ref } from "vue";
import { onMounted } from "vue";
import { useScheduleStore } from "@/stores/scheduleStore";

const scheduleStore = useScheduleStore();
const schedules = ref()

onMounted(() => {
  scheduleStore.getSchedules();
});

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${day}/${month}`;
};

</script>

<template>
  <section>
    <div class="header-section">
      <h4 style="font-weight: bolder; font-size: 1.5rem; margin-bottom: 1.5rem;">Cronograma</h4>
    </div>
    <ul>
      <li v-for="s in scheduleStore.schedules" :key="s.id" class="schedule-item">
        <div class="header-schedule">
        
          <span style="color: #969696;" v-if="s.category == '1'" class="mdi mdi-instagram">
            Postagem
          </span>

          <span style="color: #969696;" v-else-if="s.category == '2'" class="mdi mdi-forum-outline">
            Debate
          </span>

          <span style="color: #969696;" v-else-if="s.category == '3'" class="mdi mdi-handshake-outline">
            Mesa de cooperação
          </span>

          <p style="font-weight: 500">
            <span class="mdi mdi-calendar-blank" style="font-size: 1.05rem"></span>
            {{ formatDate(s.endDate) }}
          </p>
        </div>
        <h3>
          {{ s.title }}
        </h3>
        <p style="font-size: 1rem; color: #969696">Clique para ver mais detalhes.</p>
      </li>
    </ul>
  </section>
</template>

<style scoped>
ul {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

li:active{
    transition: all .3s;
    transform: scale(0.95);
}

.schedule-item {
  margin-top: 0.6rem;
  padding: 1.2rem 1.4rem;
  background-color: #fff;
  border-radius: 0.8rem;
}

.schedule-item:has(.mdi-instagram) {
  border-left: 0.9rem solid #FD151B;
}

.schedule-item:has(.mdi-forum-outline) {
  border-left: 0.9rem solid #01295F;
}

.schedule-item:has(.mdi-handshake-outline) {
  border-left: 0.9rem solid #849324;
}

.header-schedule {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.2rem;
}

h3 {
    font-size: 1.2rem; 
    margin-bottom: 0.6rem;
    max-width: 90%;
    word-break: break-word;
}

</style>
