import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Conversu Sales OS — plataforma comercial" },
      {
        name: "description",
        content:
          "Plataforma comercial da Conversu: pipeline, forecast, metas, parceiros e inteligência de vendas em um só lugar.",
      },
      { property: "og:title", content: "Conversu Sales OS — plataforma comercial" },
      {
        property: "og:description",
        content: "Pipeline, forecast, metas e parceiros em uma única operação comercial.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
});
