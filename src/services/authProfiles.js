export const authProfiles = [
  {
    id: '1',
    role: 'organizer',
    title: 'Organizador',
    icon: 'mdi-crown-outline',
    color: '#849324',
    description: 'Gerencie o evento e controle as atividades.',
  },
  {
    id: '2',
    role: 'student',
    title: 'Discente',
    icon: 'mdi-account-outline',
    color: '#FFB30F',
    description: 'Represente seu país e participe das tarefas.',
  },
  {
    id: '3',
    role: 'evaluator',
    title: 'Avaliador',
    icon: 'mdi-star-outline',
    color: '#FD151B',
    description: 'Avalie as delegações e seu desempenho.',
  },
]
export const getAuthProfile = (id) => authProfiles.find((profile) => profile.id === String(id))
export function validateProfileEmail(email, role) {
  if (role === 'evaluator' && !/^[^\s@]+@ifc\.edu\.br$/i.test(email.trim())) {
    throw new Error('O avaliador deve usar um e-mail @ifc.edu.br.')
  }
}
