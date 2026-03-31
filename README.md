# YASSCREW — Plataforma de Customização de Roupas

## 🔴 Sobre o Projeto

**YASSCREW** é uma plataforma web premium para customização de roupas com visualização 3D em tempo real. Inspirada na energia editorial de marcas streetwear, oferece uma experiência de design completa direto no navegador, sem instalações.

**Tema:** Vermelho | Preto | Branco — Design premium e editorial  
**Propósito:** Ferramenta de customização 3D de peças de vestuário

---

## ✅ Funcionalidades Implementadas

### Páginas
- **`index.html`** — Homepage completa com hero animado, features, preview do customizador, galeria, processo e depoimentos
- **`customize.html`** — Ferramenta de customização 3D completa
- **`gallery.html`** — Galeria de peças com filtros e curtidas
- **`about.html`** — Página sobre a marca com manifesto, valores e números
- **`contact.html`** — Formulário de contato + FAQ interativo

### Customizador 3D (`customize.html`)
- ✅ Engine 3D com Three.js (WebGL) com fallback CSS 3D
- ✅ Seleção de peças: Camiseta, Moletom, Jaqueta, Boné, Calça, Shorts
- ✅ Paleta de cores ilimitada (12 cores preset + seletor personalizado)
- ✅ Adição de textos com múltiplas fontes e cores
- ✅ Adição de formas (círculo, quadrado, estrela, coração, raio, fogo)
- ✅ Upload de imagens (PNG, JPG, SVG até 5MB)
- ✅ Logos preset (YC, YASSCREW, ★, 01)
- ✅ Sistema de camadas com reordenação
- ✅ Propriedades por camada: opacidade, rotação, escala, posição X/Y
- ✅ Visualização em 4 ângulos (frente, costas, lateral E/D)
- ✅ Rotação manual via slider
- ✅ Auto-rotação
- ✅ Modo wireframe
- ✅ Undo/Redo (Ctrl+Z / Ctrl+Y)
- ✅ Salvar designs no localStorage
- ✅ Exportar design como SVG
- ✅ Fullscreen mode
- ✅ Pedido integrado com API de dados
- ✅ Atalhos de teclado (Delete, Escape, Ctrl+S)

### Design & UX
- ✅ Cursor customizado vermelho
- ✅ Loader animado com barra de progresso
- ✅ Header transparente → opaco ao scroll
- ✅ Menu mobile com animação
- ✅ Marquee ticker animado
- ✅ Partículas animadas no hero
- ✅ Efeito parallax no hero
- ✅ Contadores animados
- ✅ Animações de scroll (AOS-like)
- ✅ Slider de depoimentos com auto-play
- ✅ Toast notifications
- ✅ Scrollbar customizada

---

## 🗂 Estrutura de Arquivos

```
yasscrew/
├── index.html          → Homepage
├── customize.html      → Ferramenta 3D
├── gallery.html        → Galeria
├── about.html          → Sobre
├── contact.html        → Contato
├── css/
│   ├── style.css       → Estilos globais + tema
│   ├── customize.css   → Estilos do customizador
│   └── pages.css       → Estilos das páginas internas
└── js/
    ├── main.js         → Scripts globais (loader, cursor, nav, animações)
    └── customizer.js   → Engine do customizador 3D
```

---

## 🛣 Rotas / URIs

| Página | URL | Descrição |
|--------|-----|-----------|
| Home | `/index.html` | Landing page principal |
| Customizador 3D | `/customize.html` | Ferramenta de design |
| Galeria | `/gallery.html` | Galeria de criações com filtros |
| Sobre | `/about.html` | Manifesto, valores, tecnologia |
| Contato | `/contact.html` | Formulário + FAQ |

---

## 💾 Banco de Dados (RESTful Table API)

### Tabela `orders`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | text | ID único |
| piece | text | Tipo de peça (Camiseta, Moletom...) |
| size | text | Tamanho selecionado |
| base_color | text | Cor base hex |
| elements | number | Nº de camadas de design |
| quantity | number | Quantidade pedida |
| notes | text | Observações do cliente |
| total_price | number | Valor total |
| status | text | pending / in_production / shipped / delivered |

### Tabela `contacts`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | text | ID único |
| name | text | Nome do remetente |
| email | text | Email |
| phone | text | WhatsApp/telefone |
| subject | text | Assunto da mensagem |
| message | rich_text | Conteúdo da mensagem |
| status | text | new / read / replied |

---

## 🎨 Design System

```css
/* Cores */
--red: #E63946          /* Cor principal */
--red-dark: #b52a33     /* Red hover */
--black: #0a0a0a        /* Fundo principal */
--black-2: #111111      /* Fundo secundário */
--black-3: #1a1a1a      /* Cards */
--white: #ffffff        /* Texto principal */
--gray: #888888         /* Texto secundário */

/* Fontes */
--font-display: 'Bebas Neue'     /* Títulos */
--font-body: 'Space Grotesk'     /* Corpo */
--font-ui: 'Inter'               /* UI elements */
```

---

## 🔧 Tecnologias Utilizadas

- **HTML5 / CSS3 / JavaScript (ES6+)** — Vanilla, sem frameworks
- **Three.js v0.158** — Engine 3D para visualização da roupa
- **Font Awesome 6** — Ícones
- **Google Fonts** — Bebas Neue, Space Grotesk, Inter
- **Web APIs:** Canvas API, IntersectionObserver, localStorage, Fullscreen API

---

## 🚀 Próximos Passos Sugeridos

1. **Integração de pagamento** — Mercado Pago, Stripe ou PagSeguro
2. **Sistema de login/conta** — Para salvar pedidos e designs na nuvem
3. **Mais peças 3D** — Modelos Three.js mais detalhados (hoodie, jaqueta)
4. **Editor de texto avançado** — Efeitos (shadow, outline, gradient)
5. **Compartilhamento de designs** — Link público para compartilhar criações
6. **Calculadora de frete** — Integração com Melhor Envio / Correios API
7. **Painel admin** — Gestão de pedidos e mensagens recebidas
8. **AR Preview** — Visualização em realidade aumentada via câmera

---

## 📦 Deploy

Para publicar o site, acesse a **aba Publish** na interface e clique em publicar.

---

*YASSCREW — Customize Your Identity © 2024*
