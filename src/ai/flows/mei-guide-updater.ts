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
    'nfs-e': 'emissão de nota fiscal de serviço eletrônica NFS-e para MEI em 2026',
    'das': 'pagamento do DAS MEI valor e guia PGMEI 2026',
    'declaracao': 'declaração anual de faturamento DASN-SIMEI MEI 2026',
    'abrir': 'formalização e abertura de MEI passo a passo gratuito',
    'baixar': 'como fechar ou dar baixa no CNPJ MEI corretamente',
    'direitos': 'benefícios e direitos INSS para MEI em 2026',
    'carne-leao': 'imposto de renda e carnê-leão para pessoa física MEI',
    'alvara': 'alvará de funcionamento e dispensa para MEI',
    'certificado': 'certificado digital e-CNPJ para MEI necessidade e tipos'
  };

  const topicDescription = searchTopicMap[topicId] || topicId;

  const prompt = `
Você é um consultor jurídico e contábil especialista em MEI (Microempreendedor Individual).
Sua missão é fornecer informações 100% atualizadas (baseadas no cenário de 2026) sobre o tópico: "${topicDescription}".

CONTEXTO DO NEGÓCIO DO USUÁRIO:
- Ramo: ${businessData.ramo}
- Nome: ${businessData.nomeNegocio}
- Local/Foco: ${businessData.nicho}

ESTRUTURA DE RESPOSTA (JSON):
{
  "title": "Título curto e profissional",
  "description": "Breve explicação do que o MEI precisa saber agora",
  "steps": ["Array com 4-6 passos práticos"],
  "warning": "Um alerta crítico sobre multas ou prazos (opcional)",
  "officialLink": "URL mais direta e oficial do governo (gov.br)",
  "specialValue": "Valor atualizado do DAS ou limite se aplicável (opcional)"
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
      officialLink: parsed.officialLink || "https://www.gov.br/mei",
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
