
'use server';

/**
 * @fileOverview Agente de Atualização de Conteúdo Burocrático para o MEI.
 * Pesquisa e estrutura informações atualizadas sobre obrigações fiscais.
 */

async function getAvailableFreeModel(apiKey: string): Promise<string> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    const data = await response.json();
    const freeModels = data.data
      ?.filter((model: any) => model.id.endsWith(':free'))
      .map((model: any) => model.id) || [];
    if (freeModels.length > 0) return freeModels[0];
    return 'meta-llama/llama-3.2-3b-instruct:free';
  } catch {
    return 'meta-llama/llama-3.2-3b-instruct:free';
  }
}

export type DynamicGuideContent = {
  title: string;
  description: string;
  steps: string[];
  warning?: string;
  officialLink: string;
  specialValue?: string;
  error?: string;
};

export async function fetchUpdatedMeiGuide(topicId: string, businessData: any): Promise<DynamicGuideContent> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return {
      title: "Erro de Configuração",
      description: "Chave da API não configurada.",
      steps: [],
      officialLink: "#",
      error: "OPENROUTER_API_KEY missing"
    };
  }

  const searchTopicMap: Record<string, string> = {
    'antes-formalizar': 'pontos essenciais antes de abrir MEI e benefícios suspensos',
    'formalizacao': 'como abrir empresa MEI passo a passo gratuito portal do empreendedor',
    'impedimentos': 'quem não pode ser MEI impedimentos e restrições legais',
    'documentos': 'documentos necessários para formalização MEI',
    'capital-social': 'o que colocar no capital social do MEI e valor mínimo',
    'atividades-permitidas': 'atividades permitidas MEI Anexo XI lista CNAEs',
    'endereco': 'endereço do negócio MEI e consulta prévia na prefeitura',
    'ccmei': 'como emitir certificado CCMEI oficial comprovante de inscrição',
    'pagamento-das': 'pagamento de contribuição mensal DAS MEI guia 2026',
    'relatorio-mensal': 'relatorio mensal de receitas brutas MEI como preencher e arquivar',
    'declaracao-anual': 'declaração anual de faturamento DASN-SIMEI prazo e passos',
    'emissao-nf': 'emissão de nota fiscal de serviço eletrônica NFS-e nacional para MEI',
    'arquivar-notas': 'arquivamento de notas fiscais MEI prazo e obrigatoriedade',
    'direitos-previdenciarios': 'direitos e benefícios INSS para MEI em 2026',
    'aposentadoria': 'aposentadoria por idade MEI regras carência e idade',
    'auxilio-doenca': 'auxilio-doença incapacidade temporária MEI perícia e carência',
    'salario-maternidade': 'salário-maternidade MEI gestante e adotante regras 2026',
    'pensao-morte': 'pensão por morte MEI dependentes e carência',
    'auxilio-reclusao': 'auxílio-reclusão MEI para dependentes baixa renda',
    'pgmei': 'portal PGMEI serviços consulta débitos e parcelamentos',
    'atualizacao-cadastral': 'alteração de dados cadastrais MEI portal do empreendedor',
    'emissao-ccmei': 'emissão de segunda via do certificado CCMEI',
    'consultar-debitos': 'como consultar débitos e pendências fiscais MEI',
    'regularizar-debitos': 'como regularizar dívidas MEI e opções de parcelamento',
    'contratar-empregado': 'contratação de funcionário MEI regras salário e custos',
    'obrigacoes-trabalhistas': 'obrigações trabalhistas MEI empregador FGTS e eSocial',
    'desenquadramento': 'desenquadramento MEI por excesso de faturamento migração para ME',
    'baixa-mei': 'como fechar empresa MEI baixa definitiva e declaração de extinção',
    'faq-geral': 'perguntas frequentes MEI governo oficial respostas atualizadas'
  };

  const topicDescription = searchTopicMap[topicId] || topicId;

  const prompt = `
Você é um consultor jurídico e contábil especialista em MEI (Microempreendedor Individual).
Sua missão é fornecer informações 100% atualizadas (baseadas no cenário de 2026) sobre o tópico: "${topicDescription}".

CONTEXTO DO NEGÓCIO DO USUÁRIO:
- Ramo: ${businessData.ramo}
- Nome: ${businessData.nomeNegocio}
- Nicho: ${businessData.nicho}

PRIORIDADE DE PESQUISA:
Use exclusivamente dados dos portais oficiais: gov.br/empresas-e-negocios e Receita Federal.

ESTRUTURA DE RESPOSTA (JSON):
{
  "title": "Título curto e profissional",
  "description": "Breve explicação do que o MEI precisa saber agora",
  "steps": ["Array com 4-6 passos práticos e diretos"],
  "warning": "Um alerta crítico sobre multas, prazos ou golpes (opcional)",
  "officialLink": "URL mais direta e oficial do governo (gov.br) para este serviço",
  "specialValue": "Valor atualizado se aplicável (ex: valor DAS, limite faturamento)"
}

Responda APENAS JSON puro. Sem markdown ou explicações.
`;

  try {
    const model = await getAvailableFreeModel(apiKey);
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) throw new Error(`OpenRouter Error: ${response.status}`);

    const data = await response.json();
    let contentStr = data.choices?.[0]?.message?.content || "{}";
    
    // Limpeza de Markdown
    contentStr = contentStr.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const parsed = JSON.parse(contentStr);

    return {
      title: parsed.title || "Guia Atualizado",
      description: parsed.description || "Informações obtidas via IA.",
      steps: Array.isArray(parsed.steps) ? parsed.steps : [],
      warning: parsed.warning,
      officialLink: parsed.officialLink || "https://www.gov.br/empresas-e-negocios/pt-br/empreendedor",
      specialValue: parsed.specialValue
    };
  } catch (error: any) {
    console.error('Erro no update do guia:', error);
    return {
      title: "Falha na Pesquisa",
      description: "Não foi possível conectar com o agente de pesquisa.",
      steps: [],
      officialLink: "#",
      error: error.message
    };
  }
}
