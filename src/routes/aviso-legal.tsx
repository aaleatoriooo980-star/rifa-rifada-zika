import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { ArrowLeft, AlertTriangle, ShieldX, Scale } from "lucide-react";

export const Route = createFileRoute("/aviso-legal")({
  head: () => ({
    meta: [
      { title: "Aviso Legal — CampanhaFácil" },
      {
        name: "description",
        content:
          "Aviso legal e isenção de responsabilidade da plataforma CampanhaFácil. Leia antes de participar.",
      },
    ],
  }),
  component: AvisoLegalPage,
});

function AvisoLegalPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao início
        </Link>

        <h1 className="font-display text-3xl font-bold sm:text-4xl">Aviso Legal</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Última atualização: julho de 2026
        </p>

        {/* Alert boxes */}
        <div className="mt-8 space-y-4">
          <div className="flex gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <ShieldX className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-destructive mb-1">Sem vínculo com Loteria Federal ou Caixa Econômica Federal</p>
              <p className="text-foreground/80">
                A CampanhaFácil <strong>não é</strong>, não representa, não é afiliada, parceira ou autorizada pela
                Caixa Econômica Federal, pela Loteria Federal ou por qualquer órgão governamental. Qualquer uso desta
                plataforma que sugira tal vínculo é proibido e passível de sanções legais.
              </p>
            </div>
          </div>

          <div className="flex gap-3 rounded-xl border border-amber-400/30 bg-amber-50/30 dark:bg-amber-900/10 p-4">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-amber-700 dark:text-amber-400 mb-1">Não somos uma operação de apostas (bet)</p>
              <p className="text-foreground/80">
                Esta plataforma <strong>não é</strong> uma casa de apostas, não opera apostas esportivas de quota fixa e
                não possui licença de operação de jogos de azar. Não realizamos sorteios por conta própria.
              </p>
            </div>
          </div>

          <div className="flex gap-3 rounded-xl border border-blue-400/30 bg-blue-50/30 dark:bg-blue-900/10 p-4">
            <Scale className="h-5 w-5 shrink-0 text-blue-500 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-blue-700 dark:text-blue-400 mb-1">Responsabilidade exclusiva do Organizador</p>
              <p className="text-foreground/80">
                Toda campanha publicada nesta plataforma é de responsabilidade exclusiva do seu criador (Organizador).
                A CampanhaFácil atua como ferramenta tecnológica neutra e não se responsabiliza pelo conteúdo,
                legalidade ou execução das campanhas.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 max-w-none space-y-8 text-sm leading-relaxed text-foreground/90">

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">1. Natureza Jurídica da Plataforma</h2>
            <p className="mb-2">
              A CampanhaFácil é uma plataforma de tecnologia (SaaS — Software as a Service) que fornece ferramentas
              de gestão para campanhas promocionais numeradas. Não somos:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Uma loteria federal ou estadual;</li>
              <li>Uma casa de apostas esportivas (bet);</li>
              <li>Uma entidade beneficente ou filantrópica;</li>
              <li>Um intermediário financeiro ou processador de pagamentos;</li>
              <li>Um organizador de sorteios ou rifas.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">2. Conformidade Legal dos Organizadores</h2>
            <p className="mb-2">
              De acordo com a legislação brasileira (Lei nº 5.768/1971 e Decreto nº 70.951/1972), a realização de
              sorteios com venda de bilhetes numerados exige autorização prévia da
              <strong> Secretaria de Prêmios e Apostas (SPA)</strong> do Ministério da Fazenda.
            </p>
            <p className="mb-2">
              A CampanhaFácil exige que todos os Organizadores declarem, ao aceitar os Termos de Uso, que
              possuem ou estão em processo de obtenção das autorizações legais necessárias para a realização de suas campanhas.
            </p>
            <p>
              O descumprimento desta obrigação é de responsabilidade exclusiva do Organizador, sujeitando-o às
              sanções previstas em lei, incluindo multas e responsabilização criminal.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">3. Isenção de Responsabilidade</h2>
            <p className="mb-2">A CampanhaFácil não se responsabiliza por:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Ilegalidade de campanhas publicadas por Organizadores;</li>
              <li>Não entrega de prêmios por parte dos Organizadores;</li>
              <li>Fraudes, golpes ou estelionatos praticados por Organizadores;</li>
              <li>Problemas decorrentes de pagamentos realizados diretamente aos Organizadores;</li>
              <li>Danos morais, materiais ou financeiros sofridos pelos Participantes;</li>
              <li>Ações de fiscalização ou autuação por parte de órgãos governamentais contra Organizadores.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">4. Recomendação aos Participantes</h2>
            <p className="mb-2">
              Antes de participar de qualquer campanha, recomendamos que o Participante:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Verifique a reputação e a idoneidade do Organizador;</li>
              <li>Confirme se a campanha possui autorização dos órgãos competentes;</li>
              <li>Não realize pagamentos em chaves PIX ou contas desconhecidas sem verificação prévia;</li>
              <li>Guarde comprovantes de pagamento e comunicações com o Organizador;</li>
              <li>Em caso de suspeita de fraude, registre Boletim de Ocorrência e denuncie ao PROCON e ao Ministério Público.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">5. Denúncias e Canais de Fiscalização</h2>
            <p className="mb-2">
              Caso identifique campanhas suspeitas, irregulares ou fraudulentas, você pode:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Reportar à CampanhaFácil pelo e-mail: <strong>[denuncias@campanhafacil.com.br — a preencher]</strong>;</li>
              <li>Contatar o <strong>PROCON</strong> do seu estado;</li>
              <li>Registrar denúncia no <strong>Ministério Público Estadual</strong>;</li>
              <li>Contatar a <strong>Secretaria de Prêmios e Apostas (SPA)</strong> do Ministério da Fazenda.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">6. Conteúdo Informativo</h2>
            <p>
              As informações disponíveis nesta plataforma têm caráter meramente informativo e operacional.
              Nada neste site constitui assessoria jurídica, financeira ou fiscal. Para questões legais relacionadas
              à realização de campanhas promocionais, consulte um advogado especializado.
            </p>
          </section>
        </div>

        <div className="mt-10 flex flex-wrap gap-4 text-sm text-muted-foreground border-t pt-6">
          <Link to="/termos-de-uso" className="hover:text-foreground transition-colors">
            ← Termos de Uso
          </Link>
          <Link to="/politica-de-privacidade" className="hover:text-foreground transition-colors">
            ← Política de Privacidade
          </Link>
        </div>
      </main>
    </div>
  );
}
