
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Landmark, CreditCard, TrendingUp, ArrowRight, HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const CONTAS = [
  {
    id: "pj-op",
    label: "PJ Operacional",
    tipo: "EMPRESA",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/20",
    icon: <Settings className="w-5 h-5" />,
    desc: "Recebe faturamento bruto. Paga custos, DAS e Pró-labore.",
    sugestao: "Nubank PJ / Inter / PagBank",
    detalhes: [
      "Faturamento Bruto: Todo PIX de cliente deve cair aqui primeiro.",
      "Imposto DAS: Pague sempre por esta conta para facilitar o controle fiscal.",
      "Custos Fixos: Assinaturas de ferramentas e materiais saem daqui.",
      "Extrato Mensal: Essencial para sua Declaração Anual de MEI."
    ]
  },
  {
    id: "pj-res",
    label: "PJ Reserva",
    tipo: "EMPRESA",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    icon: <Landmark className="w-5 h-5" />,
    desc: "Colchão financeiro da empresa. Ideal ter 6 meses de custos.",
    sugestao: "CDB de liquidez diária (100% CDI)",
    detalhes: [
      "Patrimônio do Negócio: Dinheiro que pertence ao CNPJ, não à você.",
      "Segurança: Protege sua operação em meses de baixa ou emergências.",
      "Separação: Não use para gastos do dia a dia. É um fundo de reserva.",
      "Crescimento: No futuro, use para investir em novos equipamentos."
    ]
  },
  {
    id: "pf-sal",
    label: "PF Pró-labore",
    tipo: "PESSOAL",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    icon: <CreditCard className="w-5 h-5" />,
    desc: "Seu salário fixo mensal. Transferido da PJ todo dia 5.",
    sugestao: "Conta corrente PF (sua preferência)",
    detalhes: [
      "Disciplina: Transfira sempre o mesmo valor no mesmo dia.",
      "Comprovação de Renda: O extrato de recebimento serve como seu holerite.",
      "Paz Mental: Seus gastos pessoais (aluguel, mercado) saem exclusivamente daqui.",
      "Regra de Ouro: Nunca pague o mercado direto na conta PJ."
    ]
  },
  {
    id: "pf-inv",
    label: "PF Investimentos",
    tipo: "PESSOAL",
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/20",
    icon: <TrendingUp className="w-5 h-5" />,
    desc: "Lucro Real (Extra). Foco em patrimônio de longo prazo.",
    sugestao: "Corretora (XP, BTG, Rico, NuInvest)",
    detalhes: [
      "Distribuição de Lucro: O que sobra após reserva e salário.",
      "Patrimônio PF: Dinheiro livre para seus sonhos e futuro.",
      "Isenção: Lucros de MEI são isentos de IR sob certas regras.",
      "Liberdade: Use para aposentadoria ou grandes objetivos pessoais."
    ]
  },
];

const FLUXO = [
  { de: "Cliente paga", para: "PJ Operacional", color: "text-indigo-500" },
  { de: "PJ Operacional", para: "Custos + DAS + Pró-labore", color: "text-orange-500" },
  { de: "Sobra mensal", para: "PJ Reserva (Roxo)", color: "text-purple-500" },
  { de: "Lucro trimestral", para: "PF Investimentos (Verde)", color: "text-primary" },
];

const FAQS_CONTAS = [
  {
    q: "Posso usar minha conta pessoal para receber dos clientes?",
    a: "Não é recomendado. Embora o MEI e a pessoa física tenham o mesmo patrimônio legal, a mistura de extratos dificulta muito a comprovação de renda para empréstimos e a declaração anual do DASN-SIMEI. Ter uma conta PJ separada traz profissionalismo e clareza fiscal."
  },
  {
    q: "Como comprovo minha renda pessoal sendo MEI?",
    a: "Sua melhor ferramenta é o extrato bancário da sua conta PF mostrando as transferências mensais fixas vindas da sua conta PJ (o Pró-labore). Bancos e imobiliárias aceitam o extrato bancário de 3 a 6 meses como comprovante de rendimentos estáveis."
  },
  {
    q: "Paguei uma conta pessoal na conta PJ. Tem problema?",
    a: "Um erro isolado não é o fim do mundo, mas evite que vire rotina. Fiscalmente, isso é chamado de 'confusão patrimonial'. Se precisar de dinheiro para algo pessoal, transfira da PJ para a PF e pague pela sua conta pessoal."
  }
];

export function AccountGuide() {
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-16">
      <div className="text-sm text-muted-foreground leading-relaxed">
        A clareza financeira do MEI começa na separação total entre pessoa física e jurídica. 
        Use este modelo de 4 contas para nunca mais misturar dinheiro. **Clique em cada conta para ver as dicas práticas.**
      </div>

      <Accordion type="single" collapsible className="w-full space-y-4">
        {CONTAS.map((c) => (
          <AccordionItem 
            key={c.id} 
            value={c.id} 
            className={`border rounded-xl px-1 bg-card/50 overflow-hidden ${c.borderColor}`}
          >
            <AccordionTrigger className="hover:no-underline py-5 px-4 group">
              <div className="flex gap-4 items-start text-left">
                <div className={`${c.bgColor} ${c.color} p-3 rounded-xl flex-shrink-0 transition-transform group-data-[state=open]:scale-110`}>
                  {c.icon}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-headline font-bold text-lg">{c.label}</h4>
                    <Badge variant="outline" className={`${c.color} ${c.bgColor} border-transparent text-[10px] font-bold`}>
                      {c.tipo}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 group-data-[state=open]:hidden">
                    {c.desc}
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-5 pt-2">
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
                  <p className="text-sm text-foreground font-medium mb-3">{c.desc}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Onde abrir:</span>
                    <span className={`text-[11px] font-bold ${c.color}`}>{c.sugestao}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    <HelpCircle className="w-3 h-3" />
                    Guia Prático de Operação
                  </div>
                  <ul className="grid gap-2.5">
                    {c.detalhes.map((d, i) => (
                      <li key={i} className="flex gap-3 text-xs text-muted-foreground leading-relaxed">
                        <div className={`w-1 h-1 rounded-full ${c.color} mt-1.5 shrink-0`} />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Card className="bg-secondary/30 border-dashed">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Fluxo Inteligente de Dinheiro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {FLUXO.map((f, i) => (
              <div key={i} className="flex items-center gap-3 group">
                <div className="w-1.5 h-1.5 rounded-full bg-border group-hover:bg-primary transition-colors" />
                <span className="text-xs text-muted-foreground min-w-[100px]">{f.de}</span>
                <ArrowRight className="w-3 h-3 text-muted-foreground/50" />
                <span className={`text-xs font-bold ${f.color}`}>{f.para}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
