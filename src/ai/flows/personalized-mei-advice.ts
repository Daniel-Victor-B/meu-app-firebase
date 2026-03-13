'use server';

/**
 * @fileOverview Consultoria de IA de Elite para MEI.
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
  try {
    console.log('Dados recebidos na Server Action:', input);

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return {
        summary: "Erro: chave da API não configurada. Adicione OPENROUTER_API_KEY no arquivo .env para ativar a inteligência.",
        distributionAdvice: ["Configure sua API Key"],
        meiLimitAdvice: ["Chave ausente"],
        optimizationSuggestions: ["Verifique o arquivo .env"]
      };
    }

    const model = await getAvailableFreeModel(apiKey);
    
    const prompt = `
Você é um consultor financeiro de elite, especialista em Microempreendedores Individuais (MEI) brasileiros. Sua análise deve ser cirúrgica, estratégica e focada em resultados de alto nível.

Analise o negócio "${input.nomeNegocio || 'MEI em Ascensão'}".

PERFIL ESTRATÉGICO DO NEGÓCIO:
- Ramo de Atuação: ${input.ramo}
- Modelo de Negócio: ${input.modeloNegocio}
- Canais de Venda: ${input.canaisVenda?.join(', ') || 'Não informados'}
- Ticket Médio Atual: R$ ${input.ticketMedio}
- Base de Clientes Ativos: ${input.numClientes}
- Principal Gargalo/Desafio: ${input.desafio}
- Objetivo Estratégico (Meta): ${input.meta}

INDICADORES FINANCEIROS REAIS (LIVRO DE CAIXA):
- Faturamento Mensal Médio: R$ ${input.faturamentoMensal}
- Custos Operacionais Totais: R$ ${input.custosOperacionais}
- Pró-labore Definido: R$ ${input.prolabore}
- Tempo de Operação Analisado: ${input.mesesFaturamento} meses
- Teto MEI Restante: R$ ${input.meiLimiteAnual}

SUA MISSÃO COMO CONSULTOR DE ELITE:
1. Forneça um veredito tático direto no campo "summary". Analise se o Ticket Médio é condizente com o Ramo e o Modelo de Negócio para atingir a Meta de "${input.meta}". Seja incisivo.
2. No campo "distributionAdvice", sugira uma alocação de capital agressiva baseada no Modelo de Negócio (Ex: B2B exige mais fôlego de caixa que B2C).
3. No campo "meiLimitAdvice", avalie o risco de desenquadramento baseado no faturamento atual vs tempo restante no ano.
4. No campo "optimizationSuggestions", dê 3 sugestões práticas focadas nos Canais de Venda para otimizar a margem de lucro.

IMPORTANTE: Responda APENAS um JSON válido. Não inclua explicações fora do JSON.
Estrutura esperada:
{
  "summary": "String com veredito estratégico e justificado",
  "distributionAdvice": ["Array de 3 strings"],
  "meiLimitAdvice": ["Array de 2 strings"],
  "optimizationSuggestions": ["Array de 3 strings"]
}
`;

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
    
    // Limpeza de blocos de código se houver
    content = content.trim();
    if (content.startsWith("```json")) {
      content = content.replace(/^```json/, "").replace(/```$/, "");
    } else if (content.startsWith("```")) {
      content = content.replace(/^```/, "").replace(/```$/, "");
    }
    
    const parsed = JSON.parse(content.trim());

    return {
      summary: parsed.summary || "Análise concluída com sucesso.",
      distributionAdvice: Array.isArray(parsed.distributionAdvice) ? parsed.distributionAdvice : ["Verifique sua alocação de custos."],
      meiLimitAdvice: Array.isArray(parsed.meiLimitAdvice) ? parsed.meiLimitAdvice : ["Mantenha o faturamento sob controle."],
      optimizationSuggestions: Array.isArray(parsed.optimizationSuggestions) ? parsed.optimizationSuggestions : ["Considere diversificar seus canais."]
    };

  } catch (error: any) {
    console.error("Erro crítico na Server Action:", error);
    return {
      summary: "Falha técnica ao processar a análise. O sistema não conseguiu processar os dados da IA no momento. Tente gerar novamente.",
      distributionAdvice: ["Erro na consulta"],
      meiLimitAdvice: ["Falha técnica"],
      optimizationSuggestions: ["Tente novamente em instantes"]
    };
  }
}
