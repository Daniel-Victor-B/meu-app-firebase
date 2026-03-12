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

const MEI_DAS_FIXO = 76;
const MEI_LIMITE_80_PERCENT = 0.8;

const PersonalizedMeiAdvicePromptInputSchema = PersonalizedMeiAdviceInputSchema.extend({
  dasFixo: z.number(),
  totalDespesasMensais: z.number(),
  sobraMensal: z.number(),
  valorReserva: z.number(),
  lucroDisponivel: z.number(),
  faturamentoAnualProjetado: z.number(),
  faturamentoAcumuladoNoAno: z.number(),
  percentualLimiteProjetado: z.number(),
  percentualLimiteAcumulado: z.number(),
  restanteNoLimite: z.number(),
  limite80Percent: z.number(),
});

const personalizedMeiAdvicePrompt = ai.definePrompt({
  name: 'personalizedMeiAdvicePrompt',
  input: {schema: PersonalizedMeiAdvicePromptInputSchema},
  output: {schema: PersonalizedMeiAdviceOutputSchema},
  prompt: `Você é um consultor financeiro especializado em Microempreendedores Individuais (MEI) no Brasil. Sua função é analisar os dados financeiros fornecidos e oferecer conselhos práticos e personalizados para otimizar a distribuição do faturamento, gerenciar o limite anual do MEI e identificar oportunidades de crescimento, ou alertar sobre riscos.

Com base nos seguintes dados e cálculos realizados:

Faturamento Mensal: R\${{{faturamentoMensal}}}
Custos Operacionais: R\${{{custosOperacionais}}}
Pró-labore: R\${{{prolabore}}}
Reserva sobre Sobra (%): {{{reservaPct}}}%
Meses com Faturamento no Ano: {{{mesesFaturamento}}} meses
Limite Anual MEI: R\${{{meiLimiteAnual}}}

Cálculos Financeiros:
DAS Fixo Mensal: R\${{{dasFixo}}}
Total de Despesas Mensais (Custos + DAS + Pró-labore): R\${{{totalDespesasMensais}}}
Sobra Mensal (Faturamento - Total Despesas): R\${{{sobraMensal}}}
Valor da Reserva (se houver sobra): R\${{{valorReserva}}}
Lucro Disponível (Sobra - Reserva): R\${{{lucroDisponivel}}}

Projeção Anual:
Faturamento Anual Projetado: R\${{{faturamentoAnualProjetado}}}
Faturamento Acumulado no Ano: R\${{{faturamentoAcumuladoNoAno}}}
Percentual do Limite Anual Projetado: {{{percentualLimiteProjetado}}}%
Percentual do Limite Anual Acumulado: {{{percentualLimiteAcumulado}}}%
Restante no Limite Anual: R\${{{restanteNoLimite}}}

Se o faturamento anual projetado exceder R\${{{limite80Percent}}} (80% do limite anual), um alerta é acionado para considerar a migração para ME.

Por favor, forneça o aconselhamento financeiro e sugestões de otimização no formato JSON, conforme o schema de saída definido. Seja direto, prático e claro.`,
});

const personalizedMeiAdviceFlow = ai.defineFlow(
  {
    name: 'personalizedMeiAdviceFlow',
    inputSchema: PersonalizedMeiAdviceInputSchema,
    outputSchema: PersonalizedMeiAdviceOutputSchema,
  },
  async (input) => {
    const totalDespesasMensais = input.custosOperacionais + MEI_DAS_FIXO + input.prolabore;
    const sobraMensal = Math.max(0, input.faturamentoMensal - totalDespesasMensais);
    const valorReserva = Math.round((sobraMensal * input.reservaPct) / 100);
    const lucroDisponivel = sobraMensal - valorReserva;

    const faturamentoAnualProjetado = input.faturamentoMensal * 12;
    const faturamentoAcumuladoNoAno = input.faturamentoMensal * input.mesesFaturamento;
    const percentualLimiteProjetado = Math.round((faturamentoAnualProjetado / input.meiLimiteAnual) * 100);
    const percentualLimiteAcumulado = Math.round((faturamentoAcumuladoNoAno / input.meiLimiteAnual) * 100);
    const restanteNoLimite = Math.max(0, input.meiLimiteAnual - faturamentoAcumuladoNoAno);
    const limite80Percent = input.meiLimiteAnual * MEI_LIMITE_80_PERCENT;

    const promptInput = {
      ...input,
      dasFixo: MEI_DAS_FIXO,
      totalDespesasMensais,
      sobraMensal,
      valorReserva,
      lucroDisponivel,
      faturamentoAnualProjetado,
      faturamentoAcumuladoNoAno,
      percentualLimiteProjetado,
      percentualLimiteAcumulado,
      restanteNoLimite,
      limite80Percent,
    };

    const {output} = await personalizedMeiAdvicePrompt(promptInput);
    return output!;
  }
);

export async function personalizedMeiAdvice(
  input: PersonalizedMeiAdviceInput
): Promise<PersonalizedMeiAdviceOutput> {
  return personalizedMeiAdviceFlow(input);
}
