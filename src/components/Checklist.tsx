
"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Rocket, CalendarDays, CalendarCheck, AlertTriangle, CheckCircle2, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  {
    id: "setup",
    titulo: "Configuração Inicial",
    subtitulo: "Faça uma vez para estruturar o negócio",
    icon: <Rocket className="w-5 h-5" />,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    tasks: [
      { id: "s1", text: "Emitir CCMEI (Certificado de MEI)", detail: "Guarde o PDF, ele é o seu contrato social." },
      { id: "s2", text: "Abrir Conta Digital PJ", detail: "Indispensável para não misturar CPF e CNPJ." },
      { id: "s3", text: "Configurar Emissor de NFS-e Nacional", detail: "Fazer o cadastro e criar 'Serviços Favoritos'." },
      { id: "s4", text: "Verificar Inscrição Municipal", detail: "Consultar se sua prefeitura exige alvará ou nota manual." },
    ],
  },
  {
    id: "mensal",
    titulo: "Rotina Mensal",
    subtitulo: "Todo mês para evitar multas e juros",
    icon: <CalendarDays className="w-5 h-5" />,
    color: "text-primary",
    bgColor: "bg-primary/10",
    tasks: [
      { id: "m1", text: "Pagar o DAS (Imposto)", detail: "Vence todo dia 20. Coloque em débito automático." },
      { id: "m2", text: "Relatório Mensal de Receitas", detail: "Planilhar todas as vendas (com e sem nota)." },
      { id: "m3", text: "Transferir Pró-labore", detail: "Da conta PJ para a PF. Pague-se primeiro!" },
      { id: "m4", text: "Separar Notas de Compra", detail: "Guardar NFs de tudo que a empresa comprou (insumos/equipamentos)." },
    ],
  },
  {
    id: "anual",
    titulo: "Obrigações Anuais",
    subtitulo: "O fechamento do seu ano fiscal",
    icon: <CalendarCheck className="w-5 h-5" />,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    tasks: [
      { id: "a1", text: "Enviar DASN-SIMEI", detail: "Declaração de faturamento bruto (Jan até Maio)." },
      { id: "a2", text: "Revisar Limite (81k)", detail: "Conferir se o faturamento anual exige migração para ME." },
      { id: "a3", text: "Imposto de Renda PF", detail: "Declarar os lucros distribuídos (isenção do MEI)." },
    ],
  },
  {
    id: "seguranca",
    titulo: "Blindagem de Caixa",
    subtitulo: "Boas práticas de sobrevivência",
    icon: <AlertTriangle className="w-5 h-5" />,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    tasks: [
      { id: "sg1", text: "Regra do 100%", detail: "Todo dinheiro de cliente entra na PJ, nunca na PF." },
      { id: "sg2", text: "Reserva de Emergência", detail: "Manter 6 meses de custos fixos no CDB de liquidez diária." },
      { id: "sg3", text: "Check de Notas Fiscais", detail: "Emitiu para todo CNPJ? Toda empresa exige nota." },
    ],
  },
];

export function Checklist() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleTask = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getProgress = (tasks: { id: string }[]) => {
    const completed = tasks.filter(t => checkedItems[t.id]).length;
    return (completed / tasks.length) * 100;
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-10">
      <header>
        <h2 className="text-xl font-headline font-bold flex items-center gap-2">
          <ListChecks className="w-6 h-6 text-primary" />
          Checklist de Operação MEI
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie suas tarefas fundamentais. Marque o que já foi feito para acompanhar sua evolução.
        </p>
      </header>

      <div className="grid gap-6">
        {SECTIONS.map((section) => {
          const progress = getProgress(section.tasks);
          return (
            <Card key={section.id} className="overflow-hidden border-border/60">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", section.bgColor, section.color)}>
                      {section.icon}
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold">{section.titulo}</CardTitle>
                      <CardDescription className="text-xs">{section.subtitulo}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className={cn("font-code", progress === 100 ? "bg-primary/20 text-primary border-primary/50" : "")}>
                    {progress.toFixed(0)}%
                  </Badge>
                </div>
                <Progress value={progress} className="h-1.5" />
              </CardHeader>
              <CardContent className="grid gap-4">
                {section.tasks.map((task) => (
                  <div 
                    key={task.id} 
                    className={cn(
                      "flex items-start gap-4 p-3 rounded-xl transition-all duration-200 border border-transparent",
                      checkedItems[task.id] ? "bg-secondary/20 opacity-60" : "hover:bg-secondary/40 hover:border-border/50"
                    )}
                  >
                    <Checkbox 
                      id={task.id} 
                      checked={checkedItems[task.id]} 
                      onCheckedChange={() => toggleTask(task.id)}
                      className="mt-1"
                    />
                    <div className="grid gap-1 cursor-pointer" onClick={() => toggleTask(task.id)}>
                      <label 
                        htmlFor={task.id} 
                        className={cn(
                          "text-sm font-bold leading-none cursor-pointer",
                          checkedItems[task.id] && "line-through text-muted-foreground"
                        )}
                      >
                        {task.text}
                      </label>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {task.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex gap-4 items-center">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-sm text-primary">Dica de Gestão Profissional</h4>
          <p className="text-xs text-muted-foreground leading-relaxed mt-1">
            Mantenha este checklist aberto toda segunda-feira de manhã. 15 minutos de revisão aqui evitam 15 horas de dor de cabeça com a Receita Federal no futuro.
          </p>
        </div>
      </div>
    </div>
  );
}
