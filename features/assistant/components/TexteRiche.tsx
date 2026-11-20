// ============================================================
// features/assistant/components/TexteRiche.tsx
// Rendu sûr d'un texte de FAQ : paragraphes, listes, **gras**
// (aucun HTML injecté)
// ============================================================

import { Fragment } from "react";

type Groupe = { type: "p" | "ol" | "ul"; lignes: string[] };

function enLigne(texte: string) {
  return texte.split(/(\*\*[^*]+\*\*)/g).map((morceau, i) =>
    morceau.startsWith("**") && morceau.endsWith("**") ? (
      <strong key={i} className="font-bold text-agilly-black">
        {morceau.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={i}>{morceau}</Fragment>
    ),
  );
}

function grouper(texte: string): Groupe[] {
  const groupes: Groupe[] = [];
  for (const ligne of texte.split("\n")) {
    if (!ligne.trim()) {
      groupes.push({ type: "p", lignes: [] }); // séparateur de paragraphe
      continue;
    }
    const type: Groupe["type"] = /^\d+\.\s/.test(ligne) ? "ol" : ligne.startsWith("- ") ? "ul" : "p";
    const contenu = type === "ol" ? ligne.replace(/^\d+\.\s/, "") : type === "ul" ? ligne.slice(2) : ligne;
    const dernier = groupes[groupes.length - 1];
    if (dernier && dernier.type === type && type !== "p") dernier.lignes.push(contenu);
    else groupes.push({ type, lignes: [contenu] });
  }
  return groupes.filter((g) => g.lignes.length > 0);
}

export function TexteRiche({ texte }: { texte: string }) {
  return (
    <div className="space-y-2">
      {grouper(texte).map((g, i) => {
        if (g.type === "ol") {
          return (
            <ol key={i} className="space-y-1.5">
              {g.lignes.map((l, j) => (
                <li key={j} className="flex gap-2">
                  <span className="shrink-0 w-5 h-5 flex items-center justify-center bg-orange-100 text-agilly-primary text-[10px] font-extrabold mt-px">
                    {j + 1}
                  </span>
                  <span>{enLigne(l)}</span>
                </li>
              ))}
            </ol>
          );
        }
        if (g.type === "ul") {
          return (
            <ul key={i} className="space-y-1">
              {g.lignes.map((l, j) => (
                <li key={j} className="flex gap-2">
                  <span className="shrink-0 w-1.5 h-1.5 bg-agilly-primary mt-[7px]" />
                  <span>{enLigne(l)}</span>
                </li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{enLigne(g.lignes[0])}</p>;
      })}
    </div>
  );
}
