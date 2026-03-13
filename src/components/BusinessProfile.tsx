"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useBusiness } from "@/contexts/BusinessContext";
import { Briefcase, Info, Zap, ShieldCheck } from "lucide-react";

export function BusinessProfile() {
  const { businessData, updateBusinessData } = useBusiness();

  const ramos = [
    "Alimentação (restaurante, lanchonete, delivery)",
    "Comércio varejista (loja física)",
    "E-commerce / Negócio digital (loja virtual, infoprodutos)",
    "Serviços presenciais (consultoria, estética, oficina)",
    "Serviços online (freelancer, consultoria online, desenvolvimento)",
    "Indústria / Artesanato",
    "Transporte / Mobilidade",
    "Outros"
  ];

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-10">
      <Card className="border-primary/20 bg-card/40 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
        <CardHeader className="pt-8 px-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-2xl text-primary shadow-lg shadow-primary/10">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-headline font-bold">Perfil do Negócio</CardTitle>
              <CardDescription className="text-xs uppercase tracking-widest font-bold text-muted-foreground/60">Configuração de Identidade Empresarial</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-10 space-y-8">
          <div className="grid gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <Info className="w-4 h-4 text-primary" />
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                  Ramo de atividade principal:
                </Label>
              </div>
              <Select 
                value={businessData.ramo} 
                onValueChange={(val) => updateBusinessData({ ramo: val })}
              >
                <SelectTrigger className="w-full bg-background/50 border-primary/20 h-14 rounded-2xl text-sm font-bold transition-all focus:ring-primary/40 shadow-inner">
                  <SelectValue placeholder="Selecione o ramo" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border shadow-2xl">
                  {ramos.map((r) => (
                    <SelectItem key={r} value={r} className="text-xs font-medium py-3">
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {businessData.ramo === "Outros" && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">
                  Especifique seu ramo:
                </Label>
                <Input 
                  placeholder="Ex: Consultoria em TI para o Agro"
                  value={businessData.outroRamo}
                  onChange={(e) => updateBusinessData({ outroRamo: e.target.value })}
                  className="h-14 bg-background/50 border-primary/20 rounded-2xl font-bold px-6 shadow-inner"
                />
              </div>
            )}
          </div>

          <div className="p-5 rounded-2xl bg-secondary/30 border border-border/50 flex gap-4 items-start">
            <Zap className="w-5 h-5 text-primary shrink-0 mt-1" />
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-primary tracking-widest">Impacto Estratégico</p>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed italic">
                A informação do ramo permite que nossa IA identifique gargalos específicos do seu setor, como margens de lucro padrão para comércio ou potencial de escala em serviços digitais.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="p-8 rounded-[32px] bg-primary/5 border border-primary/20 flex flex-col md:flex-row items-center gap-6">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="space-y-1 text-center md:text-left">
          <h4 className="font-bold text-sm tracking-tight">Privacidade e Blindagem</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Seus dados são armazenados localmente e usados exclusivamente para processar as análises da Consultoria de IA em tempo real.
          </p>
        </div>
      </section>
    </div>
  );
}
