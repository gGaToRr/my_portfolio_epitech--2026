"""
Rendu des graphiques Analytics avec matplotlib.

Les figures sont produites côté serveur en SVG, puis servies par
routers/analytics.py. Le SVG est préféré au PNG : texte net à toutes les tailles,
poids réduit, et pas de flou sur écran haute densité.

Deux jeux de couleurs sont fournis, un par thème de l'interface. Un graphique
rendu côté serveur ne peut pas s'adapter tout seul au thème du lecteur, la page
demande donc explicitement la variante voulue.

La palette suit les règles habituelles de lisibilité :
  - teintes catégorielles attribuées dans un ordre fixe, jamais recyclées ;
  - une seule teinte pour une série unique — colorer les barres selon leur
    valeur rejouerait en couleur ce que la longueur dit déjà ;
  - une rampe monochrome clair->foncé pour les magnitudes (la carte horaire) ;
  - grille discrète, marques fines, étiquettes directes plutôt qu'une valeur
    sur chaque point.
L'écart des deux séries du graphique de trafic a été vérifié pour les
déficiences de vision des couleurs (protanopie/tritanopie) dans les deux thèmes.
"""
import io
import math
from dataclasses import dataclass
from typing import Dict, List, Optional, Sequence, Tuple

import matplotlib

# Backend non interactif : indispensable, le serveur n'a aucun affichage.
# À définir avant l'import de pyplot.
matplotlib.use("Agg")

import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.colors import LinearSegmentedColormap  # noqa: E402
from matplotlib.ticker import MaxNLocator  # noqa: E402


@dataclass(frozen=True)
class Palette:
    """Couleurs d'un thème. Les rôles sont nommés, jamais les teintes en dur."""
    surface: str
    texte: str
    texte_doux: str
    grille: str
    serie_1: str
    serie_2: str
    rampe: Tuple[str, ...]


# Les surfaces reprennent exactement celles des cartes du panneau (App.css) :
# une figure sur fond blanc posée dans une carte sombre se verrait comme un
# rectangle rapporté. Les valeurs sont le résultat de la composition des cartes
# semi-transparentes sur le fond de page.
PALETTES: Dict[str, Palette] = {
    "light": Palette(
        surface="#fefeff",
        texte="#0f172a",
        texte_doux="#64748b",
        grille="#e2e8f0",
        serie_1="#2a78d6",
        serie_2="#eb6834",
        rampe=("#eef4fc", "#cde2fb", "#9ec5f4", "#6da7ec", "#3987e5", "#256abf", "#184f95"),
    ),
    "dark": Palette(
        surface="#17171d",
        texte="#e2e2e2",
        texte_doux="#9b9b9d",
        grille="#2a2a2f",
        serie_1="#3987e5",
        serie_2="#d95926",
        rampe=("#1a1a22", "#12303a", "#184f95", "#256abf", "#3987e5", "#6da7ec", "#9ec5f4"),
    ),
}

JOURS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]

# Largeurs de dessin, en pouces, accordées aux emplacements de la grille de la
# page. Une figure large réduite de moitié par le navigateur verrait la taille
# de son texte divisée d'autant : mieux vaut la dessiner à sa taille d'affichage.
LARGEUR_PLEINE = 11.0  # cartes sur toute la largeur (trafic, carte horaire)
LARGEUR_DEMI = 5.6     # cartes en demi-colonne (classements)

# Nombre minimal de lignes réservées sur un classement horizontal, pour que
# l'épaisseur d'une barre ne dépende pas du nombre d'entrées.
MIN_EMPLACEMENTS = 4


def get_palette(theme: Optional[str]) -> Palette:
    return PALETTES.get((theme or "light").lower(), PALETTES["light"])


def _nouvelle_figure(palette: Palette, largeur: float, hauteur: float):
    """Figure et axes avec le fond, la grille et les axes déjà mis en forme."""
    figure, axes = plt.subplots(figsize=(largeur, hauteur), dpi=100)
    figure.patch.set_facecolor(palette.surface)
    axes.set_facecolor(palette.surface)

    # Grille en filet, une nuance au-dessus du fond, jamais en pointillés :
    # le pointillé se lit comme un seuil ou une projection alors que ce n'est
    # qu'un repère.
    axes.grid(True, color=palette.grille, linewidth=0.8, linestyle="-", zorder=0)
    axes.set_axisbelow(True)

    for cote in ("top", "right"):
        axes.spines[cote].set_visible(False)
    for cote in ("left", "bottom"):
        axes.spines[cote].set_color(palette.grille)
        axes.spines[cote].set_linewidth(0.8)

    axes.tick_params(colors=palette.texte_doux, labelsize=9, length=0)

    # Les valeurs tracées sont toutes des comptages : une graduation à 0,5 vue
    # n'existe pas et brouille la lecture sur les petits volumes.
    axes.yaxis.set_major_locator(MaxNLocator(integer=True))
    return figure, axes


def _vers_svg(figure) -> str:
    """Sérialise la figure en SVG et libère la mémoire de matplotlib."""
    # tight_layout() plutôt que bbox_inches="tight" au moment d'enregistrer :
    # le second recadre sur le contenu, si bien que la taille finale du SVG
    # dépend de la longueur des libellés. La page l'affiche en largeur 100 %,
    # donc une figure recadrée se retrouvait étirée d'un facteur variable et son
    # texte grossissait d'autant. En conservant la taille déclarée, le rapport
    # d'affichage reste proche de 1:1.
    try:
        figure.tight_layout()
    except Exception:
        # Certaines dispositions (grille avec barre de couleur) ne s'y prêtent
        # pas ; la figure reste alors telle quelle, ce qui est acceptable.
        pass

    tampon = io.StringIO()
    figure.savefig(
        tampon,
        format="svg",
        facecolor=figure.get_facecolor(),
        transparent=False,
    )
    # Sans close(), chaque appel laisserait une figure en mémoire : sur un
    # endpoint interrogé en boucle, la fuite est franche.
    plt.close(figure)
    return tampon.getvalue()


def _message_vide(palette: Palette, texte: str, largeur: float = 5.6, hauteur: float = 2.4) -> str:
    """
    Cartouche affiché quand la période ne contient aucune donnée.

    Mieux qu'un graphique aux axes vides : celui-ci ressemble à une panne, alors
    qu'une absence de visite est une information en soi.
    """
    figure, axes = plt.subplots(figsize=(largeur, hauteur), dpi=100)
    figure.patch.set_facecolor(palette.surface)
    axes.set_facecolor(palette.surface)
    axes.axis("off")
    axes.text(
        0.5, 0.5, texte,
        ha="center", va="center",
        color=palette.texte_doux, fontsize=11,
        transform=axes.transAxes,
    )
    return _vers_svg(figure)


def _tronquer(valeur: str, maximum: int = 30) -> str:
    valeur = str(valeur)
    return valeur if len(valeur) <= maximum else valeur[: maximum - 1] + "…"


# ---------------------------------------------------------------------------
# 1. Trafic quotidien — deux séries de même unité, donc un seul axe
# ---------------------------------------------------------------------------

def chart_trafic_quotidien(
    jours: Sequence[str],
    vues: Sequence[int],
    visiteurs: Sequence[int],
    theme: Optional[str] = None,
) -> str:
    palette = get_palette(theme)
    if not jours or not any(vues):
        return _message_vide(palette, "Aucune visite sur la période")

    figure, axes = _nouvelle_figure(palette, LARGEUR_PLEINE, 3.4)
    x = range(len(jours))

    axes.fill_between(x, vues, color=palette.serie_1, alpha=0.13, zorder=1)
    axes.plot(x, vues, color=palette.serie_1, linewidth=2, zorder=3, label="Pages vues")
    axes.plot(x, visiteurs, color=palette.serie_2, linewidth=2, zorder=3, label="Visiteurs uniques")

    # Marqueurs seulement si la période est courte : au-delà, ils se collent.
    if len(jours) <= 31:
        axes.plot(x, vues, "o", color=palette.serie_1, markersize=4,
                  markeredgecolor=palette.surface, markeredgewidth=1.5, zorder=4)
        axes.plot(x, visiteurs, "o", color=palette.serie_2, markersize=4,
                  markeredgecolor=palette.surface, markeredgewidth=1.5, zorder=4)

    # Étiquette directe sur le seul point qui compte — le maximum — plutôt
    # qu'une valeur sur chaque point, illisible dès une dizaine de jours.
    if any(vues):
        i_max = max(range(len(vues)), key=lambda i: vues[i])
        axes.annotate(
            f"{vues[i_max]}",
            xy=(i_max, vues[i_max]),
            xytext=(0, 9), textcoords="offset points",
            ha="center", color=palette.texte, fontsize=9, fontweight="bold",
        )

    # Au plus 10 dates en abscisse, sinon les libellés se chevauchent.
    pas = max(1, len(jours) // 10)
    axes.set_xticks(list(x)[::pas])
    axes.set_xticklabels([jours[i] for i in list(x)[::pas]], rotation=0)
    # 18 % d'air au-dessus : l'étiquette du maximum est posée hors de la courbe
    # et serait rognée maintenant que la figure n'est plus recadrée après coup.
    axes.set_ylim(bottom=0, top=max(max(vues), max(visiteurs), 1) * 1.18)

    legende = axes.legend(
        loc="upper left", frameon=False, fontsize=9,
        labelcolor=palette.texte_doux, handlelength=1.6,
    )
    for texte in legende.get_texts():
        texte.set_color(palette.texte_doux)

    return _vers_svg(figure)


# ---------------------------------------------------------------------------
# 2. Carte horaire — magnitude, donc une rampe monochrome
# ---------------------------------------------------------------------------

def chart_heures_affluence(
    matrice: Sequence[Sequence[int]],
    theme: Optional[str] = None,
) -> str:
    """matrice[jour_semaine][heure] — 7 lignes x 24 colonnes."""
    palette = get_palette(theme)
    total = sum(sum(ligne) for ligne in matrice) if matrice else 0
    if not total:
        return _message_vide(palette, "Pas encore assez de visites pour dégager des horaires")

    figure, axes = _nouvelle_figure(palette, LARGEUR_PLEINE, 3.1)
    axes.grid(False)

    rampe = LinearSegmentedColormap.from_list("trafic", list(palette.rampe))
    image = axes.imshow(matrice, cmap=rampe, aspect="auto", interpolation="nearest", vmin=0)

    axes.set_yticks(range(7))
    axes.set_yticklabels(JOURS_FR)
    axes.set_xticks(range(0, 24, 3))
    axes.set_xticklabels([f"{h:02d}h" for h in range(0, 24, 3)])

    for cote in ("left", "bottom"):
        axes.spines[cote].set_visible(False)

    # Légende d'échelle : sans elle, une rampe de magnitude n'est pas lisible.
    barre = figure.colorbar(image, ax=axes, pad=0.015, fraction=0.03)
    barre.locator = MaxNLocator(integer=True, nbins=5)
    barre.update_ticks()
    barre.outline.set_visible(False)
    barre.ax.tick_params(colors=palette.texte_doux, labelsize=8, length=0)
    barre.set_label("Pages vues", color=palette.texte_doux, fontsize=9)

    return _vers_svg(figure)


# ---------------------------------------------------------------------------
# 3. Classements — une série, donc une seule teinte
# ---------------------------------------------------------------------------

def chart_barres_horizontales(
    libelles: Sequence[str],
    valeurs: Sequence[int],
    theme: Optional[str] = None,
    message_vide: str = "Aucune donnée sur la période",
    hauteur_par_barre: float = 0.42,
) -> str:
    palette = get_palette(theme)
    if not libelles or not any(valeurs):
        return _message_vide(palette, message_vide)

    # Au moins quatre emplacements réservés en ordonnée, même s'il y a moins de
    # barres : sans cela, une seule entrée produisait une barre épaisse comme la
    # carte entière, qui se lit comme un bloc de couleur et non comme une mesure.
    emplacements = max(len(libelles), MIN_EMPLACEMENTS)
    hauteur = max(2.0, 0.85 + hauteur_par_barre * emplacements)
    figure, axes = _nouvelle_figure(palette, LARGEUR_DEMI, hauteur)

    # Grille verticale seulement : sur des barres horizontales, les lignes
    # horizontales doubleraient les barres sans rien apporter.
    axes.grid(False)
    axes.xaxis.grid(True, color=palette.grille, linewidth=0.8)

    y = range(len(libelles))
    # Une seule teinte pour toute la série : la longueur porte déjà la valeur.
    axes.barh(y, valeurs, color=palette.serie_1, height=0.62, zorder=2)

    axes.set_yticks(list(y))
    axes.set_yticklabels([_tronquer(l) for l in libelles], fontsize=9)
    axes.set_ylim(emplacements - 0.5, -0.5)  # bornes inversées : le plus grand en haut
    axes.tick_params(axis="y", colors=palette.texte)

    # Valeur posée au bout de chaque barre, à l'extérieur : jamais dedans, où
    # elle serait rognée sur les barres courtes.
    maximum = max(valeurs)
    marge = maximum * 0.02
    for index, valeur in enumerate(valeurs):
        axes.text(
            valeur + marge, index, str(valeur),
            va="center", ha="left",
            color=palette.texte_doux, fontsize=9,
        )
    axes.set_xlim(0, maximum * 1.14)
    axes.set_xticks([])
    axes.spines["bottom"].set_visible(False)

    return _vers_svg(figure)


# ---------------------------------------------------------------------------
# 4. Petits multiples — deux classements côte à côte
# ---------------------------------------------------------------------------

def chart_technologies(
    navigateurs: Sequence[Tuple[str, int]],
    systemes: Sequence[Tuple[str, int]],
    theme: Optional[str] = None,
) -> str:
    """
    Deux panneaux indépendants plutôt qu'un graphique à deux axes.

    Navigateurs et systèmes sont deux répartitions distinctes : les superposer
    sur une échelle commune inventerait une comparaison qui n'existe pas.
    """
    palette = get_palette(theme)
    if not navigateurs and not systemes:
        return _message_vide(palette, "Aucune donnée technique sur la période")

    lignes = max(len(navigateurs), len(systemes), MIN_EMPLACEMENTS)
    hauteur = max(2.2, 1.0 + 0.36 * lignes)

    figure, panneaux = plt.subplots(1, 2, figsize=(LARGEUR_DEMI, hauteur), dpi=100)
    figure.patch.set_facecolor(palette.surface)

    for axes, donnees, titre in ((panneaux[0], navigateurs, "Navigateurs"),
                                 (panneaux[1], systemes, "Systèmes")):
        axes.set_facecolor(palette.surface)
        axes.set_title(titre, color=palette.texte, fontsize=10, pad=10, loc="left")
        for cote in ("top", "right", "bottom"):
            axes.spines[cote].set_visible(False)
        axes.spines["left"].set_color(palette.grille)
        axes.spines["left"].set_linewidth(0.8)
        axes.xaxis.grid(True, color=palette.grille, linewidth=0.8)
        axes.set_axisbelow(True)
        axes.tick_params(colors=palette.texte_doux, labelsize=9, length=0)

        if not donnees:
            axes.axis("off")
            axes.text(0.5, 0.5, "—", ha="center", va="center",
                      color=palette.texte_doux, transform=axes.transAxes)
            continue

        libelles = [d[0] for d in donnees]
        valeurs = [d[1] for d in donnees]
        y = range(len(libelles))
        axes.barh(y, valeurs, color=palette.serie_1, height=0.6, zorder=2)
        axes.set_yticks(list(y))
        axes.set_yticklabels([_tronquer(l, 18) for l in libelles], fontsize=9)
        axes.tick_params(axis="y", colors=palette.texte)
        axes.set_ylim(lignes - 0.5, -0.5)

        maximum = max(valeurs)
        for index, valeur in enumerate(valeurs):
            axes.text(valeur + maximum * 0.03, index, str(valeur),
                      va="center", ha="left", color=palette.texte_doux, fontsize=9)
        axes.set_xlim(0, maximum * 1.2)
        axes.set_xticks([])

    figure.tight_layout()
    return _vers_svg(figure)


# ---------------------------------------------------------------------------
# 5. Largeurs d'écran — bandes ordonnées
# ---------------------------------------------------------------------------

BANDES_ECRAN: Tuple[Tuple[str, int, int], ...] = (
    ("< 480 px · mobile", 0, 480),
    ("480 – 768 px · grand mobile", 480, 768),
    ("768 – 1024 px · tablette", 768, 1024),
    ("1024 – 1440 px · portable", 1024, 1440),
    ("1440 – 1920 px · bureau", 1440, 1920),
    ("> 1920 px · grand écran", 1920, 10 ** 9),
)


def repartir_largeurs(largeurs: Sequence[Optional[int]]) -> List[Tuple[str, int]]:
    """Range les largeurs de fenêtre dans les paliers responsive habituels."""
    compteurs = [0] * len(BANDES_ECRAN)
    for largeur in largeurs:
        if not largeur:
            continue
        for index, (_, mini, maxi) in enumerate(BANDES_ECRAN):
            if mini <= largeur < maxi:
                compteurs[index] += 1
                break
    return [(BANDES_ECRAN[i][0], n) for i, n in enumerate(compteurs)]


def chart_largeurs_ecran(
    repartition: Sequence[Tuple[str, int]],
    theme: Optional[str] = None,
) -> str:
    palette = get_palette(theme)
    if not repartition or not any(n for _, n in repartition):
        return _message_vide(
            palette,
            "Largeurs d'écran collectées à partir des prochaines visites",
        )

    figure, axes = _nouvelle_figure(palette, LARGEUR_DEMI, 2.9)
    axes.grid(False)
    axes.xaxis.grid(True, color=palette.grille, linewidth=0.8)

    libelles = [r[0] for r in repartition]
    valeurs = [r[1] for r in repartition]
    y = range(len(libelles))

    # Bandes conservées dans l'ordre des tailles, y compris les vides : leur
    # absence est justement l'information (aucune visite mobile, par exemple).
    axes.barh(y, valeurs, color=palette.serie_1, height=0.6, zorder=2)
    axes.set_yticks(list(y))
    axes.set_yticklabels(libelles, fontsize=9)
    axes.tick_params(axis="y", colors=palette.texte)
    axes.invert_yaxis()

    maximum = max(valeurs) or 1
    for index, valeur in enumerate(valeurs):
        if valeur:
            axes.text(valeur + maximum * 0.02, index, str(valeur),
                      va="center", ha="left", color=palette.texte_doux, fontsize=9)
    axes.set_xlim(0, maximum * 1.14)
    axes.set_xticks([])
    axes.spines["bottom"].set_visible(False)

    return _vers_svg(figure)
