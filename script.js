const apiKeyInput = document.getElementById('apiKey')
const biomaSelect = document.getElementById('biomaSelect')
const questionInput = document.getElementById('questionInput')
const askButton = document.getElementById('askButton')
const chat = document.getElementById('chat')
const newChatButton = document.getElementById('newChatButton')
const form = document.getElementById('form')
const errorMessage = document.getElementById('errorMessage')

let historico = []
let biomaAnterior = ''

const markdownToHTML = (text) => {
  const converter = new showdown.Converter()
  // showdown só converte markdown em HTML; o DOMPurify remove scripts/eventos maliciosos (XSS)
  return DOMPurify.sanitize(converter.makeHtml(text))
}

const adicionarMensagem = (texto, quem) => {
  const bolha = document.createElement('div')
  bolha.classList.add('msg', quem)
  if (quem === 'user') {
    bolha.textContent = texto
  } else {
    bolha.innerHTML = markdownToHTML(texto)
  }
  chat.appendChild(bolha)
  chat.classList.remove('hidden')
  newChatButton.classList.remove('hidden')
  chat.scrollTop = chat.scrollHeight  // rola pro fim
}

// INDICADOR "digitando...": criado e removido sob demanda
const mostrarDigitando = (sim) => {
  const atual = chat.querySelector('.typing')
  if (sim && !atual) {
    const el = document.createElement('div')
    el.className = 'msg model typing'
    el.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>'
    chat.appendChild(el)
    chat.scrollTop = chat.scrollHeight
  } else if (!sim && atual) {
    atual.remove()
  }
}

// NOVA CONVERSA: zera memória E tela (o botão e a troca de bioma usam a mesma)
const novaConversa = () => {
  historico = []
  biomaAnterior = ''
  chat.innerHTML = ''
  chat.classList.add('hidden')
  newChatButton.classList.add('hidden')
}

newChatButton.addEventListener('click', novaConversa)

// UI DE ERRO: uma única forma de mostrar problemas (validação, API, rede)
const mostrarErro = (mensagem) => {
  errorMessage.textContent = mensagem
  errorMessage.classList.remove('hidden')
}

const limparErro = () => {
  errorMessage.textContent = ''
  errorMessage.classList.add('hidden')
}

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// STORAGE DA CHAVE: sessionStorage morre ao fechar a aba;
// try/catch protege caso o navegador esteja com storage bloqueado
const salvarChave = (chave) => {
  try {
    sessionStorage.setItem('geminiApiKey', chave)
  } catch {
    // storage indisponível: o app continua funcionando sem lembrar a chave
  }
}

const carregarChave = () => {
  try {
    return sessionStorage.getItem('geminiApiKey') ?? ''
  } catch {
    return ''
  }
}

// MAPA DE BIOMAS: cada chave é o valor do <select>, nome é como o bioma deve ser citado
const BIOMAS = {
  mata: { nome: 'Mata Atlântica' },
  cerrado: { nome: 'Cerrado' },
  amazonia: { nome: 'Amazônia' },
  pantanal: { nome: 'Pantanal' },
  caatinga: { nome: 'Caatinga' },
  pampa: { nome: 'Pampa' },
}

// INSTRUÇÃO DO SISTEMA (systemInstruction): quem o assistente é e como responde.
// A pergunta do usuário NÃO entra aqui — ela vai em "contents"
const montarInstrucao = (bioma) => {
  // ?? = "se for undefined/null, use o valor da direita" (proteção extra)
  const nome = BIOMAS[bioma]?.nome ?? bioma

  return `
## Especialidade
Você é um biólogo especialista no bioma ${nome}

## Tarefa
Você deve responder as perguntas do usuário com base no seu conhecimento acerca do bioma, como:
- características que definem o bioma
- exemplo de animais que fazem parte desse bioma (fale o máximo que puder)
- animais que atualmente se encontram ameaçados de extinção
- curiosidades gerais
- características e informações sobre **animais específicos desse bioma**

## Regras
- Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.
- Se a pergunta não está relacionada ao bioma, responda com 'Essa pergunta não está relacionada ao bioma.'
- Se a pergunta a cerca de algum animal específico não estiver relacionada com o bioma selecionado, responda com 'Esse animal não pertence a esse bioma, o animal em questão pertence a (coloque o bioma certo aqui).'
- Só responda o que o usuário desejar, não fale todos os tópicos se o usuário apenas quiser algum ponto em específico
- Considere a data atual ${new Date().toLocaleDateString()}
- Faça pesquisas atualizadas sobre a situação atual, baseado na data atual, para dar uma resposta coerente.
- Nunca responda características que você não tenha certeza de que existem no bioma atual.

## Resposta
- Não economize nas respostas, mas pode ser direto
- Responda em markdown
- Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.

## Exemplo de resposta
**Pergunta do usuário:** O que caracteriza o bioma ${nome}?
**Resposta:**

**Definição:** [coloque aqui a definição]
\n\n
**Animais atuais:** [exemplos]
\n\n
**Animais ameaçados de extinção:** [exemplos]
\n\n
**Curiosidades:** [se houver]

---

**Caso a pergunta do usuário seja sobre um animal específico do bioma, responda com os seguintes tópicos:**

**Nome científico:**
\n\n
**Hábitat:**
\n\n
**Comportamento:**
\n\n
**Status de conservação:**
\n\n
**Curiosidades:** [se possível]
---

`
}

// FUNÇÃO PRINCIPAL
const perguntarAI = async (question, bioma, apiKey) => {
  const model = "gemini-3.5-flash"
  const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`

  const conteudo = [
    ...historico,
    { role: 'user', parts: [{ text: question }] },
  ]
  const body = {
    systemInstruction: {
      parts: [{ text: montarInstrucao(bioma) }],
    },
    contents: conteudo,
  }

  // REMOVI tools, não é necessário
  const opcoes = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }

  let response = await fetch(geminiURL, opcoes)

  // 503 = demanda alta (transiente): espera 2s e tenta 1 vez mais.
  // Só 1 retry: falhou de novo → problema real → erro honesto (fail fast)
  if (response.status === 503) {
    await esperar(2000)
    response = await fetch(geminiURL, opcoes)
  }

  // fetch só rejeita em falha de rede; status 4xx/5xx chega "normal" aqui
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Cota da API excedida. Aguarde alguns minutos e tente novamente.')
    }
    const detalhe = data?.error?.message
    throw new Error(`Erro HTTP ${response.status}${detalhe ? ` — ${detalhe}` : ''}`)
  }

  // Em erro, a API devolve { error: {...} } e NÃO possui "candidates"
  if (data?.error) {
    throw new Error(data.error.message || 'A API retornou um erro.')
  }

  const texto = (data?.candidates?.[0]?.content?.parts ?? [])
    .filter((part) => part.text && !part.thought)
    .map((part) => part.text)
    .join('')
  if (!texto) {
    throw new Error('O modelo não gerou resposta. Reformule a pergunta e tente novamente.')
  }

  historico = [
    ...conteudo,
    { role: 'model', parts: [{ text: texto }] },
  ].slice(-20) // mantém apenas as últimas 20 interações para não estourar o limite de tokens

  return texto
}

// FORMULÁRIO
const enviarFormulario = async (event) => {
  event.preventDefault()
  const apiKey = apiKeyInput.value
  const bioma = biomaSelect.value
  const question = questionInput.value

  limparErro()

  if (apiKey == '' || bioma == '' || question == '') {
    mostrarErro('Por favor, preencha todos os campos')
    return
  }

  if (bioma != biomaAnterior) {
    novaConversa()        // limpa historico + tela
    biomaAnterior = bioma // e registra o bioma novo
  }

  salvarChave(apiKey)

  askButton.disabled = true
  askButton.textContent = 'Perguntando...'
  askButton.classList.add('loading')

  questionInput.value = ''

  try {
    adicionarMensagem(question, 'user')
    mostrarDigitando(true)
    const text = await perguntarAI(question, bioma, apiKey)
    mostrarDigitando(false)
    adicionarMensagem(text, 'model')
  } catch (error) {
    mostrarDigitando(false)   // senão os pontinhos ficam presos pra sempre
    console.error('Erro: ', error)
    mostrarErro(error instanceof TypeError
      ? 'Falha de conexão. Verifique sua internet e tente novamente.'
      : error.message)
  } finally {
    askButton.disabled = false
    askButton.textContent = "Perguntar"
    askButton.classList.remove('loading')
  }
}

// RESTAURA a chave salva nesta sessão (se houver)
apiKeyInput.value = carregarChave()

form.addEventListener('submit', enviarFormulario)
