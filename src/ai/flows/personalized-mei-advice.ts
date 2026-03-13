'use server';

/**
 * @fileOverview Consultoria de IA para MEI.
 */

async function getAvailableFreeModel(apiKey: string): Promise<string> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    const data = await response.json();
    const freeModels = data.data
      .filter((model: any) => model.id.endsWith(':free'))
      .map((model: any) => model.id);
    if (freeModels.length > 0) return freeModels[0];
    return 'meta-llama/llama-3.2-3b-instruct:free';
  } catch {
    return 'meta-llama/llama-3.2-3b-instruct:free';
  }
}

export type PersonalizedMeiAdviceOutput = {
  summary: string;
  distributionAdvice: string[];
  meiLimitAdvice: string[];
  optimizationSuggestions: string[];
};

export async function personalizedMeiAdvice(input: {
  faturamentoMensal: number;
  custosOperacionais: number;
  prolabore: number;
  reservaPct: number;
  mesesFaturamento: number;
  meiLimiteAnual: number;
  ramo: string;
  nomeNegocio: string;
  modeloNegocio: string;
  canaisVenda: string[];
  ticketMedio: number;
  numClientes: number;
  desafio: string;
  meta: string;
}): Promise<PersonalizedMeiAdviceOutput> {
  console.log('Dados recebidos na Server Action:', input);

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return {
      summary: "Erro: chave da API não configurada. Adicione OPENROUTER_API_KEY no .env.local",
      distributionAdvice: ["Configure sua API Key"],
      meiLimitAdvice: ["Chave ausente"],
      optimizationSuggestions: ["Verifique o arquivo .env"]
    };
  }

  const model = await getAvailableFreeModel(apiKey);
  
  const prompt = `
Você é um consultor financeiro de elite, especialista em Microempreendedores Individuais (MEI) brasileiros.
Analise o negócio "${input.nomeNegocio || 'MEI sem nome'}".

PERFIL ESTRATÉGICO:
- Ramo: ${input.ramo}
- Modelo: ${input.modeloNegocio}
- Canais de Venda: ${input.canaisVenda?.join(', ') || 'Não informados'}
- Ticket Médio: R$ ${input.ticketMedio}
- Clientes Ativos: ${input.numClientes}
- Maior Desafio Atual: ${input.desafio}
- Meta Principal: ${input.meta}

DADOS FINANCEIROS (MÉDIAS):
- Faturamento: R$ ${input.faturamentoMensal}
- Custos Operacionais: R$ ${input.custosOperacionais}
- Pró-labore: R$ ${input.prolabore}
- Tempo de Operação: ${input.mesesFaturamento} meses
- Limite MEI: R$ ${input.meiLimiteAnual}

SUA MISSÃO:
1. Gere um veredito tático baseado na combinação entre o Ramo (${input.ramo}), o Modelo (${input.modeloNegocio}) e o Desafio (${input.desafio}).
2. Analise se o Ticket Médio de R$ ${input.ticketMedio} é condizente com a meta de "${input.meta}" para o ramo de ${input.ramo}.
3. Dê sugestões práticas de otimização focadas nos Canais de Venda utilizados.
4. No campo "summary", forneça um veredito direto, profissional e altamente estratégico.

Responda APENAS um JSON válido com as chaves:
- summary (string)
- distributionAdvice (array de strings)
- meiLimitAdvice (array de strings)
- optimizationSuggestions (array de strings)
`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter Error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0]?.message?.content || "";
    
    content = content.trim();
    if (content.startsWith("```json")) {
      content = content.replace(/^```json/, "").replace(/```$/, "");
    } else if (content.startsWith("```")) {
      content = content.replace(/^```/, "").replace(/```$/, "");
    }
    
    const parsed = JSON.parse(content.trim());
    return {
      summary: parsed.summary || "Análise concluída.",
      distributionAdvice: Array.isArray(parsed.distributionAdvice) ? parsed.distributionAdvice : ["Verifique sua alocação mensal."],
      meiLimitAdvice: Array.isArray(parsed.meiLimitAdvice) ? parsed.meiLimitAdvice : ["Mantenha o faturamento sob controle."],
      optimizationSuggestions: Array.isArray(parsed.optimizationSuggestions) ? parsed.optimizationSuggestions : ["Considere diversificar seus canais."]
    };
  } catch (error: any) {
    console.error("Erro na Server Action:", error);
    return {
      summary: "Erro técnico ao processar a análise. Verifique sua chave da API e a conexão com o servidor.",
      distributionAdvice: ["Erro na consulta"],
      meiLimitAdvice: ["Falha técnica"],
      optimizationSuggestions: ["Tente novamente mais tarde"]
    };
  }
}
