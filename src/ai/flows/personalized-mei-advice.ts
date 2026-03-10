'use server';
/**
 * @fileOverview Um fluxo Genkit que oferece aconselhamento financeiro personalizado para MEI.
 *
 * - personalizedMeiAdvice - Uma função que orquestra o processo de aconselhamento financeiro.
 * - PersonalizedMeiAdviceInput - O tipo de entrada para a função personalizedMeiAdvice.
 * - PersonalizedMeiAdviceOutput - O tipo de retorno para a função personalizedMeiAdvice.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedMeiAdviceInputSchema = z.object({
  faturamentoMensal: z
    .number()
    .describe('O faturamento mensal atual em BRL (valor positivo).')
    .min(0),
  custosOperacionais: z
    .number()
    .describe('Os custos operacionais mensais em BRL (valor não negativo).')
    .min(0),
  prolabore: z
    .number()
    .describe('O valor do pró-labore mensal em BRL (valor não negativo).')
    .min(0),
  reservaPct: z
    .number()
    .describe(
      'A porcentagem da sobra do faturamento mensal que é destinada à reserva da empresa (0-100).'
    )
    .min(0)
    .max(100),
  mesesFaturamento: z
    .number()
    .describe(
      'O número de meses com faturamento registrado no ano corrente (0-12).'
    )
    .min(0)
    .max(12),
  meiLimiteAnual: z
    .number()
    .describe('O limite de faturamento anual para MEI em BRL (valor positivo).')
    .min(0),
});
export type PersonalizedMeiAdviceInput = z.infer<
  typeof PersonalizedMeiAdviceInputSchema
>;

const PersonalizedMeiAdviceOutputSchema = z.object({
  summary: z
    .string()
    .describe('Um resumo geral da situação financeira do MEI.'),
  distributionAdvice: z
    .array(z.string())
    .describe('Sugestões para otimizar a distribuição do faturamento mensal.'),
  meiLimitAdvice: z
    .array(z.string())
    .describe(
      'Conselhos para gerenciar o limite anual do MEI e evitar o desenquadramento.'
    ),
  optimizationSuggestions: z
    .array(z.string())
    .describe('Sugestões adicionais para otimização financeira e crescimento.'),
});
export type PersonalizedMeiAdviceOutput = z.infer<
  typeof PersonalizedMeiAdviceOutputSchema
>;

export async function personalizedMeiAdvice(
  input: PersonalizedMeiAdviceInput
): Promise<PersonalizedMeiAdviceOutput> {
  return personalizedMeiAdviceFlow(input);
}

const MEI_DAS_FIXO = 75; // Valor fixo do DAS
const MEI_LIMITE_80_PERCENT = 0.8;

const personalizedMeiAdvicePrompt = ai.definePrompt({
  name: 'personalizedMeiAdvicePrompt',
  input: {schema: PersonalizedMeiAdviceInputSchema},
  output: {schema: PersonalizedMeiAdviceOutputSchema},
  prompt: `Você é um consultor financeiro especializado em Microempreendedores Individuais (MEI) no Brasil. Sua função é analisar os dados financeiros fornecidos e oferecer conselhos práticos e personalizados para otimizar a distribuição do faturamento, gerenciar o limite anual do MEI e identificar oportunidades de crescimento, ou alertar sobre riscos.

Com base nos seguintes dados:

Faturamento Mensal: R\${{{faturamentoMensal}}}
Custos Operacionais: R\${{{custosOperacionais}}}
Pró-labore: R\${{{prolabore}}}
Reserva sobre Sobra (%): {{{reservaPct}}}%
Meses com Faturamento no Ano: {{{mesesFaturamento}}} meses
Limite Anual MEI: R\${{{meiLimiteAnual}}}

Considere os seguintes cálculos para sua análise:

DAS Fixo Mensal: R\$${MEI_DAS_FIXO}
Total de Despesas Mensais (Custos + DAS + Pró-labore): R\${{math 'add' custosOperacionais MEI_DAS_FIXO prolabore}}
Sobra Mensal (Faturamento - Total Despesas): R\${{math 'sub' faturamentoMensal (math 'add' custosOperacionais MEI_DAS_FIXO prolabore)}}
Valor da Reserva (se houver sobra): R\${{math 'round' (math 'mul' (math 'div' (math 'sub' faturamentoMensal (math 'add' custosOperacionais MEI_DAS_FIXO prolabore)) 100) reservaPct)}}
Lucro Disponível (Sobra - Reserva): R\${{math 'sub' (math 'sub' faturamentoMensal (math 'add' custosOperacionais MEI_DAS_FIXO prolabore)) (math 'round' (math 'mul' (math 'div' (math 'sub' faturamentoMensal (math 'add' custosOperacionais MEI_DAS_FIXO prolabore)) 100) reservaPct))}}

Faturamento Anual Projetado (Faturamento Mensal * 12): R\${{math 'mul' faturamentoMensal 12}}
Faturamento Acumulado no Ano (Faturamento Mensal * Meses Faturamento): R\${{math 'mul' faturamentoMensal mesesFaturamento}}
Percentual do Limite Anual Projetado: {{math 'round' (math 'mul' (math 'div' (math 'mul' faturamentoMensal 12) meiLimiteAnual) 100)}}%
Percentual do Limite Anual Acumulado: {{math 'round' (math 'mul' (math 'div' (math 'mul' faturamentoMensal mesesFaturamento) meiLimiteAnual) 100)}}%
Restante no Limite Anual: R\${{math 'sub' meiLimiteAnual (math 'mul' faturamentoMensal mesesFaturamento)}}

Se o faturamento anual projetado exceder R\${{math 'mul' meiLimiteAnual MEI_LIMITE_80_PERCENT}} (80% do limite anual), um alerta é acionado para considerar a migração para ME.

Por favor, forneça o aconselhamento financeiro e sugestões de otimização no formato JSON, conforme o schema de saída definido. Seja direto, prático e claro.`,
});

const personalizedMeiAdviceFlow = ai.defineFlow(
  {
    name: 'personalizedMeiAdviceFlow',
    inputSchema: PersonalizedMeiAdviceInputSchema,
    outputSchema: PersonalizedMeiAdviceOutputSchema,
  },
  async (input) => {
    // Helper for Handlebars to perform basic math operations
    ai.handlebars.registerHelper('math', function (lvalue, operator, rvalue) {
      lvalue = parseFloat(lvalue);
      rvalue = parseFloat(rvalue);

      return {
        'add': lvalue + rvalue,
        'sub': lvalue - rvalue,
        'mul': lvalue * rvalue,
        'div': lvalue / rvalue,
        'mod': lvalue % rvalue,
        'round': Math.round(lvalue)
      }[operator];
    });

    const {output} = await personalizedMeiAdvicePrompt(input);
    return output!;
  }
);