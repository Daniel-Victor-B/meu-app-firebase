
"use client"

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Landmark, 
  CreditCard, 
  TrendingUp, 
  Info, 
  ShieldCheck, 
  Wallet, 
  HelpCircle, 
  Zap, 
  Lock, 
  ArrowDownRight, 
  Share2 
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

const CONTAS = [
  {
    id: "pj-op",
    label: "PJ Operacional",
    tipo: "CONTA CORRENTE (CNPJ)",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/20",
    icon: <Settings className="w-5 h-5" />,
    desc: "A Central de Comando. É por aqui que o oxigênio (dinheiro) entra no negócio.",
    sugestao: "Nubank PJ, Inter, PagBank ou Cora",
    detalhes: [
      "Faturamento Bruto: Receba 100% dos seus pagamentos aqui (PIX, Cartão, Boleto).",
      "Obrigações Fiscais: O pagamento do DAS deve ser feito exclusivamente por esta conta.",
      "Custos de Escala: Ferramentas, anúncios e insumos são pagos aqui.",
      "Base de Dados: Seu extrato aqui é a prova real do seu faturamento para o governo."
    ],
    proTip: "Nunca use o cartão de débito desta conta para gastos de mercado ou lazer. Blindagem total."
  },
  {
    id: "pj-res",
    label: "PJ Reserva",
    tipo: "RESERVA ESTRATÉGICA (CNPJ)",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    icon: <Lock className="w-5 h-5" />,
    desc: "O Pulmão Financeiro. Garante que o CNPJ sobreviva a qualquer tempestade.",
    sugestao: "CDB de Liquidez Diária (100% CDI)",
    detalhes: [
      "Capital de Giro: Dinheiro que pertence à empresa para emergências ou baixas sazonais.",
      "Meta de Segurança: Acumule o equivalente a 6 meses dos seus custos operacionais totais.",
      "Autonomia: Ter reserva permite que você negocie melhor com fornecedores.",
      "Crescimento: É o fundo que financiará novos equipamentos sem necessidade de empréstimos."
    ],
    proTip: "A reserva deve estar em um local de fácil resgate, mas separado da conta do dia a dia."
  },
  {
    id: "pf-sal",
    label: "PF Pró-labore",
    tipo: "SALÁRIO (PF/CPF)",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    icon: <CreditCard className="w-5 h-5" />,
    desc: "Seu Salário Executivo. O valor fixo que recompensa o seu esforço mensal.",
    sugestao: "Sua conta bancária pessoal favorita",
    detalhes: [
      "Disciplina Mensal: Transfira o mesmo valor no mesmo dia (Ex: Todo dia 05).",
      "Comprovação de Renda: O comprovante desta transferência é o seu holerite oficial.",
      "Lazer e Aluguel: Seus gastos de vida saem exclusivamente desta conta.",
      "Foco: Com salário fixo, você para de 'assaltar' o caixa da empresa para pagar boletos."
    ],
    proTip: "Defina um valor que cubra seu custo de vida básico. Aumente-o apenas quando a empresa escalar."
  },
  {
    id: "pf-inv",
    label: "PF Investimentos",
    tipo: "RIQUEZA (PF/CPF)",
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/20",
    icon: <TrendingUp className="w-5 h-5" />,
    desc: "A Fábrica de Liberdade. Onde o lucro do MEI vira riqueza pessoal.",
    sugestao: "Corretoras de Valores (XP, BTG, Rico)",
    detalhes: [
      "Distribuição de Lucro: O prêmio trimestral por gerir bem o seu negócio.",
      "Isenção de IR: O lucro distribuído do MEI é isento de imposto sob regras específicas.",
      "Independência: Use para investir em ações, FIIs ou previdência privada.",
      "Fruição: É daqui que sai o dinheiro para realizar sonhos e grandes aquisições."
    ],
    proTip: "Considere transferir 50% do lucro acumulado para esta conta a cada 90 dias."
  },
];

const FLUXO_VISUAL = [
  { de: "Clientes", para: "PJ Operacional", desc: "Faturamento Bruto", status: "Entrada" },
  { de: "PJ Operacional", para: "Custos & DAS", desc: "Obrigações", status: "Saída" },
  { de: "PJ Operacional", para: "PF Pró-labore", desc: "Seu Salário (Pró-labore)", status: "Retirada" },
  { de: "PJ Operacional", para: "PJ Reserva", desc: "Segurança", status: "Reserva" },
  { de: "PJ Operacional", para: "PF Investimentos", desc: "Riqueza (Trimestral)", status: "Lucro" },
];

const FAQS_CONTAS = [
  {
    q: "O que é 'Confusão Patrimonial'?",
    a: "É quando você usa a PJ Operacional para gastos pessoais. Isso é o maior erro do MEI. Além de dificultar o controle, em casos judiciais, você perde a proteção do CNPJ e seus bens pessoais podem ser tomados para pagar dívidas do negócio."
  },
  {
    q: "Posso usar a PJ Operacional para pagar o boleto do meu cartão pessoal?",
    a: "Jamais. O caminho correto é: transferir o Pró-labore da PJ Operacional para sua conta PF Pró-labore, e aí sim pagar seu cartão pessoal. Mantenha os trilhos separados."
  },
  {
    q: "Como comprovar renda sendo MEI?",
    a: "Os melhores documentos são: 1. Sua Declaração Anual (DASN-SIMEI). 2. Extratos mensais da PJ Operacional que mostram o faturamento regular. 3. Extratos da conta PF Pró-labore mostrando os recebimentos constantes de Pró-labore."
  }
];

export function AccountGuide() {
  const handleAccordionChange = (value: string) => {
    if (value) {
      // Timeout sincronizado com a animação para garantir que a altura final do layout seja detectada
      setTimeout(() => {
        const element = document.getElementById(`item-${value}`);
        if (element) {
          const elementRect = element.getBoundingClientRect();
          const absoluteElementTop = elementRect.top + window.pageYOffset;
          const menuOffset = 110; // Compensação para o menu fixo de abas

          window.scrollTo({
            top: absoluteElementTop - menuOffset,
            behavior: 'smooth'
          });
        }
      }, 300);
    }
  };

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500 pb-16">
      {/* Header Premium de Blindagem */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-indigo-500/30 blur-xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
        <Card className="relative bg-card/60 backdrop-blur-xl border-primary/20 overflow-hidden shadow-2xl">
          <CardContent className="pt-8 pb-8 px-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary rounded-2xl shadow-lg shadow-primary/30 text-primary-foreground">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-headline font-bold tracking-tight text-foreground">Arquitetura de Blindagem</h3>
                <p className="text-sm text-muted-foreground font-medium mt-1">O protocolo definitivo para separar o CPF do seu império PJ.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl border border-border/50 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              <Zap className="w-4 h-4 text-primary animate-pulse" />
              Regra de Ouro: Disciplina bancária gera liberdade financeira.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid de Contas Estratégicas */}
      <div className="grid gap-6">
        <div className="flex items-center gap-2 px-1">
          <Info className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Ecossistema de Gestão de 4 Contas</span>
        </div>

        <Accordion 
          type="single" 
          collapsible 
          className="w-full space-y-4"
          onValueChange={handleAccordionChange}
        >
          {CONTAS.map((c) => (
            <AccordionItem 
              key={c.id} 
              value={c.id} 
              id={`item-${c.id}`}
              className={`border rounded-2xl px-1 bg-card/40 transition-all hover:bg-card/80 shadow-sm ${c.borderColor}`}
            >
              <AccordionTrigger className="hover:no-underline py-6 px-5 group">
                <div className="flex gap-4 items-start text-left">
                  <div className={`${c.bgColor} ${c.color} p-4 rounded-2xl flex-shrink-0 transition-all group-data-[state=open]:scale-110 group-data-[state=open]:shadow-xl group-data-[state=open]:shadow-current/10`}>
                    {c.icon}
                  </div>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h4 className="font-headline font-bold text-lg tracking-tight leading-none">{c.label}</h4>
                      <Badge variant="outline" className={`${c.color} ${c.bgColor} border-transparent text-[8px] font-black px-2.5 py-0.5 tracking-wider uppercase`}>
                        {c.tipo}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium line-clamp-1 group-data-[state=open]:hidden italic">
                      {c.desc}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-8 pt-2">
                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-secondary/20 border-2 border-dashed border-border/40 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      {c.icon}
                    </div>
                    <p className="text-sm text-foreground font-bold mb-4 leading-relaxed relative z-10">{c.desc}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Onde Operar:</span>
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full ${c.bgColor} ${c.color} shadow-sm`}>{c.sugestao}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">
                      <Wallet className="w-3.5 h-3.5" />
                      Protocolos de Gestão
                    </div>
                    <ul className="grid gap-4">
                      {c.detalhes.map((d, i) => (
                        <li key={i} className="flex gap-4 text-xs text-muted-foreground leading-relaxed items-start group/li">
                          <div className={`w-2 h-2 rounded-full ${c.color} mt-1.5 shrink-0 shadow-lg group-hover/li:scale-125 transition-transform`} />
                          <span className="group-hover/li:text-foreground transition-colors">{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Separator className="bg-border/50" />

                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex gap-3 items-start">
                    <Zap className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase text-primary tracking-widest">Pro Tip</span>
                      <p className="text-xs text-muted-foreground font-medium italic leading-relaxed">{c.proTip}</p>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Fluxo de Capital Horizontal Premium */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            <h3 className="font-headline font-bold text-lg tracking-tight">Fluxo Mestre do Capital</h3>
          </div>
          <Badge className="bg-primary/20 text-primary border-none text-[9px] font-black uppercase">Path Optimization</Badge>
        </div>

        <Card className="bg-secondary/10 border-2 border-dashed border-border/60 overflow-hidden relative group shadow-inner">
          <CardContent className="p-8">
            <div className="relative space-y-8">
              <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-primary via-indigo-500 to-purple-500 opacity-20" />
              {FLUXO_VISUAL.map((f, i) => (
                <div key={i} className="flex items-center gap-6 group/item relative">
                  <div className="w-6 h-6 rounded-full bg-background border-2 border-border group-hover/item:border-primary transition-all duration-500 z-10 flex items-center justify-center shadow-xl">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 group-hover/item:bg-primary group-hover/item:scale-150 transition-all" />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 flex-1 py-1">
                    <div className="min-w-[150px]">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none">{f.de}</span>
                      <div className="flex items-center gap-2 mt-1">
                         <ArrowDownRight className="w-3 h-3 text-primary" />
                         <span className="text-xs font-bold text-foreground line-clamp-2 sm:line-clamp-1">{f.para}</span>
                      </div>
                    </div>
                    <div className="flex-1 flex items-center gap-4">
                      <div className="h-px flex-1 bg-border/40 hidden sm:block" />
                      <div className="text-right">
                        <div className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">{f.status}</div>
                        <div className="text-xs text-muted-foreground font-medium">{f.desc}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* FAQ de Autoridade */}
      <section className="space-y-6 pt-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary shadow-inner">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-xl tracking-tight">Blindagem Antirruído</h3>
            <p className="text-xs text-muted-foreground font-medium mt-1">As respostas que protegem seu patrimônio contra erros fiscais e contábeis.</p>
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-3">
          {FAQS_CONTAS.map((faq, idx) => (
            <AccordionItem key={idx} value={`faq-${idx}`} className="border rounded-2xl px-5 bg-card/40 shadow-sm hover:shadow-md transition-all hover:bg-card">
              <AccordionTrigger className="text-sm font-bold text-left hover:no-underline py-5 leading-relaxed group">
                <span className="group-hover:text-primary transition-colors">{faq.q}</span>
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed pb-6 pt-2 font-medium">
                <div className="flex gap-4">
                  <div className="w-1 h-full bg-primary/20 rounded-full" />
                  {faq.a}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}
