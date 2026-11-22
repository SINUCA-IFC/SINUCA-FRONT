# Ambientes suportados

- Verificar correções tanto em desenvolvimento (`http://localhost:5173`) quanto em produção (`https://sinuca-ifc-mocha.vercel.app`).
- A API publicada é `https://sinuca-backend.class.fabricadesoftware.ifc.edu.br`.
- Chamadas comuns usam `/api`, com proxy no Vite e rewrite na Vercel. Fluxos OAuth com cookies usam diretamente a origem do backend para compartilhar a sessão do callback Google.
- Não considerar uma correção publicada apenas porque passou localmente. Informar explicitamente quando o deploy ou a configuração do backend ainda estiver pendente.
