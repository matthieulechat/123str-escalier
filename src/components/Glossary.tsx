import { CollapsibleCard } from './Section.tsx'

const TERMS: [string, string][] = [
  ['Contremarche (CM)', 'Face verticale entre deux marches. Hauteur h = hauteur à monter ÷ nombre de contremarches.'],
  ['Marche / giron (g)', 'Partie horizontale où l’on pose le pied. Le giron est sa profondeur, mesurée sur la ligne de foulée.'],
  ['Nez de marche', 'Arête avant de la marche, à l’aplomb de la face finie de la contremarche.'],
  ['Ligne de foulée', 'Trajet théorique de la personne qui monte : au milieu de l’emmarchement, ou à 50 cm du jour au-delà de 1 m.'],
  ['Emmarchement', 'Largeur utile de l’escalier, du jour au mur.'],
  ['Jour / collet', 'Côté intérieur du tournant (limon intérieur). Le collet est le giron mesuré le long du jour : le plus petit côté d’une marche balancée.'],
  ['Balancement (herse)', 'Répartition progressive des marches autour du tournant pour éviter des collets trop étroits. Ligne de séparation : axe du tournant, chaque moitié est balancée sur sa volée.'],
  ['NF / NB', 'Niveau fini (sol carrelé, chape…) / niveau brut (dessus béton). NB = NF − épaisseur de finition.'],
  ['CM brute', 'Hauteur béton à couler. Courante = h ; la 1re vaut h − finition marche + finition sol bas, la dernière h − finition palier + finition marche.'],
  ['Paillasse', 'Dalle inclinée en béton qui porte les marches. Épaisseur mesurée perpendiculairement à la pente, sous les angles rentrants.'],
  ['Blondel', 'Règle de confort : 60 < 2h + g < 64 cm, avec h ≤ 18 cm et g ≥ 24 cm.'],
]

const Glossary = () => (
  <CollapsibleCard title="Lexique" defaultOpen>
    <dl className="grid gap-x-6 gap-y-2 text-sm md:grid-cols-2">
      {TERMS.map(([t, d]) => (
        <div key={t}>
          <dt className="font-semibold">{t}</dt>
          <dd className="text-muted-foreground">{d}</dd>
        </div>
      ))}
    </dl>
  </CollapsibleCard>
)

export default Glossary
