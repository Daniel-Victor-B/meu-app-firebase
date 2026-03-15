
"use client"

import { useState } from "react";
import { useBusiness } from "@/contexts/BusinessContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Calendar, 
  ShieldCheck, 
  ExternalLink, 
  Info, 
  CheckCircle2, 
  AlertTriangle,
  CreditCard,
  FileCheck,
  Building,
  Key,
  Globe,
  Youtube,
  GraduationCap
} from "lucide-react";
import Image from "next/image";
import { formatCurrency } from "@/lib/formatters";

export function BureaucraticGuide() {
  const { businessData } = useBusiness();
  const [activeTab, setActiveTab] = useState("nfs-e");

  const calcularDAS = () => {
    const ramo = businessData.ramo.toLowerCase();
    if (ramo.includes('comércio') || ramo.includes('indústria') || ramo.includes('alimentação')) return 76;
    if (ramo.includes('serviços')) return 81;
    if (ramo.includes('transporte')) return 86;
    return 81; // Padrão serviços
  };

  const dasValue = calcularDAS();

  const sections = [
    {
      id: "nfs-e",
      label: "Nota Fiscal",
      icon: <FileText className="w-4 h-4" />,
      title: "Emissão de NFS-e Nacional",
      description: "O MEI deve emitir nota fiscal sempre que vender para empresas (CNPJ).",
      officialLink: "https://www.nfse.gov.br",
      videoUrl: "https://www.youtube.com/embed/PjRreV0fP6c", // Exemplo de vídeo explicativo
      steps: [
        "Acesse o Portal NFS-e Nacional com sua conta Gov.br (Prata ou Ouro).",
        "Configure seu e-mail e telefone no menu de configurações (engrenagem).",
        "Cadastre seus 'Serviços Favoritos' para facilitar a emissão.",
        "Utilize a 'Emissão Simplificada' para faturar rapidamente."
      ],
      warning: "Para vendas para Pessoas Físicas (CPF), a nota é opcional, a menos que o cliente exija."
    },
    {
      id: "das",
      label: "Guia DAS",
      icon: <CreditCard className="w-4 h-4" />,
      title: "Pagamento Mensal do DAS",
      description: "Sua única obrigação financeira fixa. Garante sua previdência e regularidade.",
      officialLink: "https://www.gov.br/mei/pt-br/servicos/pagamento-do-das",
      videoUrl: "https://www.youtube.com/embed/fAEv38zS93w",
      steps: [
        "Acesse o PGMEI no portal oficial do Governo.",
        "Informe seu CNPJ.",
        "Selecione o ano vigente e os meses em aberto.",
        "Pague via PIX (QR Code) para compensação imediata."
      ],
      special: {
        label: "Cálculo por Ramo",
        value: `R$ ${dasValue},00`,
        detail: `Baseado no seu ramo: ${businessData.ramo}`
      }
    },
    {
      id: "declaracao",
      label: "DASN-SIMEI",
      icon: <FileCheck className="w-4 h-4" />,
      title: "Declaração Anual de Faturamento",
      description: "Obrigatória para todos os MEIs, mesmo que não tenham faturado nada no ano.",
      officialLink: "https://www.gov.br/mei/pt-br/servicos/declaracao-anual-de-faturamento",
      videoUrl: "https://www.youtube.com/embed/5U2BvJqW3jY",
      steps: [
        "Soma todo o seu faturamento bruto do ano anterior (vendas com e sem nota).",
        "Acesse o portal DASN-SIMEI entre Janeiro e Maio.",
        "Informe o valor total e se teve funcionários.",
        "Guarde o recibo de entrega — ele é sua prova de renda oficial."
      ],
      warning: "O prazo termina sempre em 31 de Maio. O atraso gera multa automática de R$ 50,00."
    },
    {
      id: "alvara",
      label: "Alvará & Licenças",
      icon: <Building className="w-4 h-4" />,
      title: "Alvará de Funcionamento",
      description: "O MEI é dispensado de alvará prévio, mas deve cumprir as normas municipais.",
      officialLink: "https://www.gov.br/empresas-e-negocios/pt-br/redesim/abrir-uma-empresa",
      steps: [
        "O CCMEI (Certificado do MEI) serve como alvará provisório.",
        "Ao abrir, você concorda com o Termo de Ciência e Responsabilidade.",
        "Verifique no site da sua prefeitura se há exigências específicas para vigilância sanitária ou bombeiros.",
        "Mantenha seu CCMEI sempre impresso e disponível na sede do negócio."
      ]
    },
    {
      id: "certificado",
      label: "Certificado Digital",
      icon: <Key className="w-4 h-4" />,
      title: "Certificado Digital (e-CNPJ)",
      description: "Sua assinatura eletrônica com validade jurídica. Opcional, mas recomendado para alta performance.",
      steps: [
        "O Certificado Tipo A1 (arquivo) é o mais comum e dura 12 meses.",
        "Permite assinar contratos digitalmente sem precisar de cartório.",
        "Facilita o acesso a portais mais complexos da Receita Federal.",
        "Escolha uma autoridade certificadora credenciada (Ex: Serasa, Certisign, Soluti)."
      ]
    }
  ];

  const currentSection = sections.find(s => s.id === activeTab) || sections[0];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-headline font-bold">Guia MEI de Elite</h2>
            <p className="text-sm text-muted-foreground font-medium">Sua central de inteligência burocrática e fiscal.</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 px-3 py-1 font-black text-[10px] tracking-widest uppercase">
          Versão {new Date().getFullYear()}.1
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 h-auto p-1 bg-secondary/20 border border-border/50 rounded-2xl">
          {sections.map(s => (
            <TabsTrigger key={s.id} value={s.id} className="flex flex-col gap-1 py-3 text-[10px] md:text-xs">
              {s.icon}
              <span className="hidden sm:inline">{s.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <Card className="border-border/50 shadow-xl overflow-hidden bg-card/60 backdrop-blur-sm">
              <CardHeader className="border-b bg-secondary/10">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-headline font-bold text-foreground">{currentSection.title}</CardTitle>
                    <CardDescription className="text-xs font-medium">{currentSection.description}</CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 rounded-full text-[10px] font-black uppercase tracking-widest"
                    onClick={() => window.open(currentSection.officialLink, "_blank")}
                  >
                    <Globe className="w-3 h-3" />
                    Portal Oficial
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-8 space-y-8">
                {currentSection.special && (
                  <div className="flex items-center gap-4 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 group hover:bg-amber-500/10 transition-all">
                    <div className="p-3 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-amber-600/60">{currentSection.special.label}</div>
                      <div className="text-2xl font-black text-amber-600">{currentSection.special.value}</div>
                      <div className="text-[10px] font-medium text-muted-foreground">{currentSection.special.detail}</div>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Protocolo Passo a Passo</h4>
                  </div>
                  <div className="grid gap-4">
                    {currentSection.steps.map((step, i) => (
                      <div key={i} className="flex gap-4 group">
                        <div className="w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center text-[10px] font-bold shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                          {i + 1}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed font-medium group-hover:text-foreground transition-colors">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {currentSection.warning && (
                  <div className="flex gap-4 p-5 bg-destructive/5 border border-destructive/20 rounded-2xl">
                    <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
                    <p className="text-xs text-destructive/80 font-bold leading-relaxed">{currentSection.warning}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Youtube className="w-4 h-4 text-red-500" />
                  <CardTitle className="text-sm font-bold uppercase tracking-widest">Vídeo Tutorial</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0 border-t">
                {currentSection.videoUrl ? (
                  <div className="aspect-video w-full">
                    <iframe 
                      src={currentSection.videoUrl}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="Tutorial MEI"
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-secondary/50 flex flex-col items-center justify-center p-8 text-center gap-3">
                    <Info className="w-8 h-8 text-muted-foreground/30" />
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Vídeo aula indisponível para este tópico</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-dashed border-2 border-border/50 bg-transparent hover:bg-secondary/10 transition-all group">
              <CardContent className="p-6 text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ExternalLink className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <h5 className="font-bold text-sm">Acessar Portal do Empreendedor</h5>
                  <p className="text-[10px] text-muted-foreground font-medium">Link oficial do governo federal para todos os serviços MEI.</p>
                </div>
                <Button 
                  className="w-full rounded-xl h-11 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                  onClick={() => window.open("https://www.gov.br/mei", "_blank")}
                >
                  Ir para o site do Governo
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </Tabs>

      <section className="p-8 rounded-[40px] bg-secondary/20 border-2 border-dashed border-border/50 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Blindagem Fiscal Ativa</span>
        </div>
        <h4 className="text-xl font-black tracking-tight">Precisa de ajuda com a Declaração?</h4>
        <p className="text-xs text-muted-foreground font-medium max-w-lg mx-auto">
          Utilize nossa aba de **AI Advice** para receber orientações personalizadas sobre sua transição para ME ou como otimizar seus impostos.
        </p>
      </section>
    </div>
  );
}
