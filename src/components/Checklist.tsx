"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Rocket, CalendarDays, CalendarCheck, AlertTriangle, CheckSquare } from "lucide-react";

const SECTIONS = [
  {
    id: "abrir",
    titulo: "Foguete: Abrir o MEI",
    icon: <Rocket className="w-5 h-5 text-blue-500" />,
    cor: "text-blue-500",
    bgColor: "bg-blue-500/10",
    itens: [
      "Acesse o Portal do Empreendedor (gov.br/empresas-e-negocios)",
      "Certifique-se de ter conta gov.br Prata ou Ouro",
      "Escolha o CNAE correto para sua atividade principal",
      "Defina o endereço da empresa (pode ser residencial)",
      "Emita o CCMEI e guarde como comprovante do CNPJ",
      "Abra uma conta digital PJ para começar a receber dos clientes",
    ],
  },
  {
    id: "mensal",
    titulo: "Calendário: Tarefas Mensais",
    icon: <CalendarDays className="w-5 h-5 text-primary" />,
    cor: "text-primary",
    bgColor: "bg-primary/10",
    itens: [
      "Pague o DAS (Guia do Imposto) até o dia 20 de cada mês",
      "Preencha o Relatório Mensal de Receitas Brutas",
      "Transfira o Pró-labore para sua conta PF (pague-se primeiro!)",
      "Verifique se todas as notas fiscais foram emitidas corretamente",
      "Separe o percentual da reserva conforme planejado",
    ],
  },
  {
    id: "anual",
    titulo: "Cheque: Tarefas Anuais",
    icon: <CalendarCheck className="w-5 h-5 text-orange-500" />,
    cor: "text-orange-500",
    bgColor: "bg-orange-500/10",
    itens: [
      "Entregue a Declaração Anual (DASN-SIMEI) até 31 de Maio",
      "Verifique o faturamento acumulado total do ano anterior",
      "Reavalie seu plano de saúde e benefícios do INSS",
      "Considere a necessidade de migrar para ME se estiver crescendo",
      "Distribua os lucros acumulados para sua corretora (PF Investimentos)",
    ],
  },
  {
    id: "cuidados",
    titulo: "Alerta: Cuidados Vitais",
    icon: <AlertTriangle className="w-5 h-5 text-destructive" />,
    cor: "text-destructive",
    bgColor: "bg-destructive/10",
    itens: [
      "NUNCA use sua conta PF para receber de clientes da empresa",
      "Não ultrapasse o limite anual (isso gera multas pesadas)",
      "Não contrate mais de um funcionário como MEI",
      "Não seja sócio em outra empresa enquanto for MEI",
      "Guarde todos os comprovantes e notas por 5 anos",
    ],
  },
];

export function Checklist() {
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="text-sm text-muted-foreground">
        Acompanhe o passo a passo necessário para manter sua empresa em dia com o governo e com suas finanças.
      </div>

      <Accordion type="single" collapsible className="w-full space-y-4">
        {SECTIONS.map((section) => (
          <AccordionItem key={section.id} value={section.id} className="border rounded-xl px-4 bg-card/50">
            <AccordionTrigger className="hover:no-underline py-5">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${section.bgColor} ${section.cor}`}>
                  {section.icon}
                </div>
                <span className={`font-headline font-bold text-base ${section.cor}`}>
                  {section.titulo.split(': ')[1]}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-6">
              <ul className="space-y-3">
                {section.itens.map((item, idx) => (
                  <li key={idx} className="flex gap-3 items-start group">
                    <CheckSquare className="w-4 h-4 mt-1 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                    <span className="text-sm text-muted-foreground leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
