# Por que fiz as coisas do jeito que fiz

Bom, vou explicar aqui as decisões que tomei durante o desenvolvimento. Algumas foram acertos, outras... bom, funcionaram.

## Stack que escolhi

### Backend: Node.js + TypeScript + Express

Pensei em usar Python no começo (até tinha começado), mas acabei ficando com Node mesmo.

**Por quê?**
- Já manjo bem Node, então foi mais rápido
- TypeScript ajuda muito a não fazer besteira (especialmente com as queries do banco)
- Express é simples e direto ao ponto
- Performance é boa o suficiente pra esse tipo de aplicação
- Tem bastante coisa pronta no NPM

**O que pensei em usar mas não usei:**
- **Python/FastAPI**: Seria legal mas ia demorar mais pra fazer as APIs
- **Java/Spring**: Nem passou pela cabeça, seria overkill demais
- **Go**: Performance seria melhor mas não tenho muita experiência

### Frontend: React + TypeScript + Vite

Aqui foi mais tranquilo, já uso React no trabalho então foi natural.

**Motivos:**
- Já conheço bem React, então foi mais produtivo
- Vite é MUITO mais rápido que webpack (sério, a diferença é absurda)
- TypeScript no frontend também ajuda muito
- Tem muita biblioteca pronta pra React
- Recharts funcionou bem pros gráficos

**Alternativas Consideradas**:
- **Vue.js**: Mais simples, mas ecossistema menor para gráficos
- **Svelte**: Interessante, mas menos maduro
- **Angular**: Over-engineering para este escopo

### Visualizações: Recharts

**Decisão**: Recharts ao invés de Chart.js, D3.js ou Victory.

**Justificativa**:
- **React Native**: Integra perfeitamente com React
- **Responsivo**: Gráficos se adaptam automaticamente
- **API Simples**: Fácil de usar, bom para dashboards
- **Manutenção Ativa**: Projeto bem mantido

**Alternativas Consideradas**:
- **Chart.js**: Excelente, mas precisa wrapper para React
- **D3.js**: Muito poderoso, mas muito verboso para casos simples
- **Victory**: Similar ao Recharts, escolhido Recharts por preferência

## 2. Arquitetura do Backend

### Estrutura Modular

```
backend/
├── config/      # Configurações (DB, cache, env)
├── services/    # Lógica de negócio (AnalyticsService, QueryBuilder)
├── routes/      # Endpoints HTTP
└── utils/       # Utilitários (cache, helpers)
```

**Decisão**: Separar concerns em camadas bem definidas.

**Justificativa**:
- **Testabilidade**: Fácil mockar dependências
- **Manutenibilidade**: Código organizado e fácil de navegar
- **Reutilização**: Services podem ser reutilizados em diferentes contexts
- **Escalabilidade**: Fácil adicionar novos endpoints/services

### Query Builder Customizado

**Decisão**: Criar um QueryBuilder ao invés de usar ORM (TypeORM, Sequelize) ou query builder genérico (Knex).

**Justificativa**:
- **Controle Total**: Controle sobre queries geradas
- **Performance**: Queries otimizadas para o schema específico
- **Flexibilidade**: Permite queries complexas específicas para analytics
- **Sem Overhead**: Sem abstração pesada de ORM
- **SQL Nativo**: Quando necessário, usa SQL puro para complexidade

**Alternativas Consideradas**:
- **TypeORM**: Bom para CRUD, mas limitado para analytics complexas
- **Knex**: Query builder genérico, mas sem tipos específicos para nosso schema
- **SQL Direto**: Muito verboso e difícil de manter

### Cache em Memória (Node-cache)

**Decisão**: Cache em memória ao invés de Redis.

**Justificativa**:
- **Simplicidade**: Não requer serviço externo
- **Adequado**: Para MVP, cache em memória é suficiente
- **Performance**: Extremamente rápido (nanosegundos)
- **TTL Configurável**: Permite controle fino sobre invalidação

**Quando Migrar para Redis**:
- Múltiplas instâncias da aplicação (sharing de cache)
- Cache persistence entre restarts
- Necessidade de cache distribuído

## 3. Arquitetura do Frontend

### Componentização

**Decisão**: Componentes funcionais pequenos e focados.

**Justificativa**:
- **Reutilização**: Componentes como `MetricCard`, `DateRangePicker` são reutilizáveis
- **Testabilidade**: Componentes pequenos são fáceis de testar
- **Manutenção**: Fácil encontrar e corrigir bugs
- **Performance**: React otimiza melhor componentes pequenos

### Estado Local vs Global

**Decisão**: Usar estado local (useState) ao invés de Redux/Zustand.

**Justificativa**:
- **Simplicidade**: Não há estado complexo compartilhado
- **Performance**: Não precisa de gerenciamento global de estado
- **Menos Overhead**: Redux adiciona complexidade desnecessária

**Se Precisar de Estado Global no Futuro**:
- Context API do React (simples)
- Zustand (se precisar de mais features)

### Rotas com React Router

**Decisão**: React Router ao invés de Next.js routing.

**Justificativa**:
- **SPA**: Aplicação é SPA, não precisa SSR
- **Simplicidade**: React Router é suficiente
- **Controle**: Mais controle sobre routing

**Se Precisar de SSR/SSG**:
- Next.js seria escolha natural

## 4. Banco de Dados

### PostgreSQL

**Decisão**: Usar o PostgreSQL fornecido (não trocar banco).

**Justificativa**:
- **Requerimento**: Era parte do desafio
- **Adequado**: PostgreSQL é excelente para analytics (window functions, CTEs)
- **Performance**: Com índices corretos, performance é ótima

### Índices (Sugeridos)

Para melhorar performance, sugerimos criar índices:

```sql
CREATE INDEX idx_sales_created_at ON sales(created_at);
CREATE INDEX idx_sales_status ON sales(sale_status_desc);
CREATE INDEX idx_sales_channel ON sales(channel_id);
CREATE INDEX idx_sales_store ON sales(store_id);
CREATE INDEX idx_product_sales_sale ON product_sales(sale_id);
CREATE INDEX idx_delivery_addresses_sale ON delivery_addresses(sale_id);
```

**Nota**: Estes índices não foram criados automaticamente para não modificar o schema fornecido, mas são recomendados.

### Estratégia de Queries

**Decisão**: Queries otimizadas com JOINs apropriados e agregações.

**Justificativa**:
- **Performance**: JOINs no banco são mais rápidos que múltiplas queries
- **Consistência**: Dados consistentes em uma única query
- **Redução de Rountrips**: Menos chamadas ao banco

## 5. Performance e Escala

### Cache Strategy

**Decisão**: Cache com TTL de 5 minutos (configurável).

**Justificativa**:
- **Balanceamento**: Trade-off entre dados atualizados e performance
- **Adequado**: Para analytics, 5 minutos é aceitável
- **Invalidação**: Cache expira automaticamente

**Melhorias Futuras**:
- Cache por tipo de query (algumas queries podem ter TTL maior)
- Invalidação seletiva quando dados mudam
- Cache warming para queries frequentes

### Paginação e Limites

**Decisão**: Limites implícitos em queries (TOP N, LIMIT).

**Justificativa**:
- **Performance**: Evita retornar milhões de linhas
- **UX**: Usuários raramente precisam ver todos os dados
- **Escalabilidade**: Aplicação não quebra com datasets grandes

### Otimizações de Frontend

**Decisão**: Componentes otimizados com React.memo onde necessário.

**Justificativa**:
- **Re-renders**: Evita re-renders desnecessários
- **Performance**: Interface mais responsiva

## 6. Segurança

### Validação com Zod

**Decisão**: Usar Zod para validação de inputs.

**Justificativa**:
- **Type Safety**: Validação com inferência de tipos
- **Runtime Safety**: Valida dados em runtime
- **Erros Claros**: Mensagens de erro amigáveis

### SQL Injection Prevention

**Decisão**: Usar parameterized queries (pg.query com parâmetros).

**Justificativa**:
- **Segurança**: Previne SQL injection
- **Performance**: PostgreSQL otimiza queries preparadas

## 7. Deploy e DevOps

### Docker (Não Implementado no MVP)

**Decisão**: Não incluir Docker na solução inicial, mas documentar.

**Justificativa**:
- **Simplicidade**: Foco no core da solução
- **Flexibilidade**: Usuário pode escolher ambiente

**Docker Seria Útil Para**:
- Ambiente de desenvolvimento consistente
- Deploy simplificado
- CI/CD

### Variáveis de Ambiente

**Decisão**: Usar .env para configuração.

**Justificativa**:
- **Segurança**: Não commitar secrets
- **Flexibilidade**: Diferentes ambientes (dev, prod)
- **Padrão**: Prática comum na indústria

## 8. UX e Usabilidade

### Design Simples e Funcional

**Decisão**: Tailwind CSS para estilização rápida e consistente.

**Justificativa**:
- **Produtividade**: Estilização rápida
- **Consistência**: Design system implícito
- **Performance**: CSS otimizado (purge)

### Feedback Visual

**Decisão**: Loading states, mensagens de erro claras.

**Justificativa**:
- **UX**: Usuários sabem o que está acontecendo
- **Profissionalismo**: Aplicação parece polida

### Responsividade

**Decisão**: Design responsivo com Tailwind (sm:, md:, lg: breakpoints).

**Justificativa**:
- **Acesso**: Usuários podem acessar de qualquer dispositivo
- **Moderno**: Expectativa padrão hoje em dia

## 9. Trade-offs e Limitações

### O que NÃO foi Implementado (e Porquê)

1. **Autenticação Completa**
   - Motivo: Foco no core (analytics)
   - Impacto: Aplicação é "mock", mas estrutura permite adicionar depois

2. **Multi-tenancy**
   - Motivo: Escopo do desafio não exigia
   - Impacto: Solução atual assume dados de um restaurante/grupo

3. **Dashboards Salvos**
   - Motivo: Complexidade adicional não essencial para MVP
   - Impacto: Usuários criam queries, mas não salvam configurações

4. **Exportação PDF/Excel**
   - Motivo: Foco em visualização, não em relatórios
   - Impacto: Usuários podem copiar dados manualmente se necessário

5. **Testes Automatizados**
   - Motivo: Tempo limitado, foco em funcionalidade
   - Impacto: Código testável, mas sem testes implementados

### O que Foi Priorizado

1. **Resolução do Problema Core**: Analytics customizável ✅
2. **UX Intuitiva**: Interface simples e poderosa ✅
3. **Performance**: Queries rápidas e cache ✅
4. **Documentação**: Código bem documentado ✅

## 10. Conclusão

As decisões arquiteturais foram tomadas considerando:
- **Escopo do Desafio**: MVP funcional que resolve o problema
- **Tempo Disponível**: Priorizar funcionalidades core
- **Escalabilidade Futura**: Arquitetura permite evolução
- **Manutenibilidade**: Código limpo e organizado

A solução é **pronta para produção** com algumas melhorias incrementais (testes, deploy, autenticação). A arquitetura permite evoluir sem grandes refatorações.

---

**Nota**: Arquitetura não é sobre escolher a tecnologia "mais moderna", mas sobre escolher a solução certa para o problema. Esta arquitetura resolve o problema da Maria de forma eficiente e escalável.

