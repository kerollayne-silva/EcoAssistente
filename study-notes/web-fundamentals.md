# 📚 Estudo de Fundamentos Web + IA

## O que é programar?
- **Ensinar** a máquina
  - **Algoritmos**: passo a passo lógico e finito para resolver um problema
  - **Sintaxe**: forma de escrever o código corretamente
- **Resolver problemas**
  - Entender o problema é a chave
  - Método 3E: **Entender**, **Escrever**, **Examinar**

---

## 🖌️ Algumas anotações sobre CSS

Significado
- **C**ascading: regras em cascata, hierarquia de estilos
- **S**tyle: estilo visual
- **S**heet: folha de estilos

Conceitos básicos
- Arquivo CSS contém **declarações**, compostas por **seletores**, **propriedades** e **valores**
- O CSS afeta visualmente os elementos do HTML

Seletor universal
- `*` é o **seletor universal**, aplica a todos os elementos
- Sobre **especificidade** de seletores (Selector Specificity):
  ```css
  body *, :root { }
Ex: :root tem uma especificidade (0,1,0) = 10

Box Model
Espaço interno: padding
Conteúdo: content
Bordas: border
Espaço externo: margin
Largura: width
Altura: height

Unidades
px (pixels): menor unidade fixa
rem (root em): unidade relativa ao tamanho da fonte do elemento :root (geralmente 16px); melhor para acessibilidade e responsividade

Regras especiais (@)
Tudo que começa com @ é uma **at-rule**
Exemplo:
@keyframes appear {
  /* animação */
}

---

🧠 IA no contexto de desenvolvimento web
IA geralmente responde em Markdown
Para converter para **HTML**: usar libs como `ShowdownJS` (https://github.com/showdownjs/showdown)
CSS: `initial` reseta a propriedade para o valor padrão do navegador

🧱 HTML - HyperText Markup Language
- HyperText
Liga textos e documentos (links, mídia, etc.)
- Markup
Marcação com tags: <a>, <p>, etc.
Atributos: href="", id, class
- Language
Sintaxe própria da linguagem de marcação

🌐 HTTP - HyperText Transfer Protocol
Protocolo para comunicação web
Métodos: GET, POST, PATCH/PUT, DELETE
Headers: instruções extras nas requisições

🔗 URL - Uniform Resource Locator
Endereço que localiza um recurso na web

🖧 IP - Internet Protocol
Conjunto de regras para identificar dispositivos na rede

🌍 DNS - Domain Name System
Traduz domínios (ex: google.com) para endereços IP

🎨 CSS (resumo extra)
Estiliza o conteúdo HTML
Segue o modelo: seletor → propriedade: valor;

⚙️ JS - JavaScript
Linguagem de programação para o navegador
Fundamentos
- Entrada → processamento → saída
- Variáveis
- Tipos de dados:
number, string, boolean, object

Funções
- Blocos reutilizáveis de código:
Agrupam lógica
Reutilizam código
Têm sequência lógica
Podem retornar valores com return

- Outros conceitos
Estruturas de dados
Estruturas de decisão (condições)
- Pensamento computacional:
Abstração, decomposição, algoritmo, reconhecimento de padrões
- Eventos e manipulação do DOM

🧾 DOM - Document Object Model
Interface para acessar e modificar HTML com JS

🔌 API - Application Programming Interface
Permite comunicação entre sistemas
JSON (JavaScript Object Notation) é formato comum de dados

🚚 CDN - Content Delivery Network
Distribui arquivos (JS, CSS, imagens) de forma rápida e global

🧠 LLM - Large Language Model
Modelos de linguagem como Gemini, GPT (OpenAI), Claude (Anthropic)

🤖 Agentes de IA
Usam ferramentas para acessar informações externas
Melhoram o contexto da resposta

🧩 Engenharia de Prompt
One-shot: uma pergunta direta
Few-shot: inclui exemplos na pergunta
Chain of Thought: IA raciocina passo a passo