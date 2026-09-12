"""
Rendu des graphiques Analytics avec matplotlib.

Les figures sont produites côté serveur en SVG, puis servies par
routers/analytics.py. Le SVG est préféré au PNG : texte net à toutes les tailles,
poids réduit, et pas de flou sur écran haute densité.

Deux jeux de couleurs vibrantes sont fournis, un par thème de l'interface.
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
    """Couleurs d'un thème avec palette multicolore vibrante."""
    surface: str
    texte: str
    texte_doux: str
    grille: str
    serie_1: str
    serie_2: str
    rampe: Tuple[str, ...]
    couleurs: Tuple[str, ...]


PALETTES: Dict[str, Palette] = {
    "light": Palette(
        surface="#ffffff",
        texte="#0f172a",
        texte_doux="#64748b",
        grille="#e2e8f0",
        serie_1="#0284c7",  # Bleu cyan vif
        serie_2="#e11d48",  # Rose rubis vif
        rampe=("#f8fafc", "#e0e7ff", "#c7d2fe", "#a5b4fc", "#38bdf8", "#34d399", "#f59e0b", "#e11d48"),
        couleurs=(
            "#0284c7",  # Bleu Océan
            "#10b981",  # Vert Émeraude
            "#8b5cf6",  # Violet
            "#f59e0b",  # Ambre
            "#ec4899",  # Rose Magenta
            "#06b6d4",  # Cyan Électrique
            "#e11d48",  # Rouge Corail
            "#6366f1",  # Indigo
        ),
    ),
    "dark": Palette(
        surface="#13131a",
        texte="#f8fafc",
        texte_doux="#94a3b8",
        grille="#252532",
        serie_1="#38bdf8",  # Cyan éclatant
        serie_2="#fb7185",  # Rose fluo
        rampe=("#13131a", "#1e1b4b", "#3730a3", "#4338ca", "#06b6d4", "#10b981", "#fbbf24", "#f43f5e"),
        couleurs=(
            "#38bdf8",  # Cyan Lumineux
            "#34d399",  # Vert Menthe
            "#a78bfa",  # Violet Lavande
            "#fbbf24",  # Ambre Doré
            "#f472b6",  # Rose Néon
            "#22d3ee",  # Turquoise
            "#fb7185",  # Corail Vif
            "#818cf8",  # Indigo Électrique
        ),
    ),
}

JOURS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]

LARGEUR_PLEINE = 11.0  # cartes sur toute la largeur (trafic, carte horaire)
LARGEUR_DEMI = 5.6     # cartes en demi-colonne (classements)
MIN_EMPLACEMENTS = 4


def get_palette(theme: Optional[str]) -> Palette:
    return PALETTES.get((theme or "light").lower(), PALETTES["light"])


def _nouvelle_figure(palette: Palette, largeur: float, hauteur: float):
    """Figure et axes avec le fond, la grille et les axes déjà mis en forme."""
    figure, axes = plt.subplots(figsize=(largeur, hauteur), dpi=100)
    figure.patch.set_facecolor(palette.surface)
    axes.set_facecolor(palette.surface)

    axes.grid(True, color=palette.grille, linewidth=0.8, linestyle="-", zorder=0)
    axes.set_axisbelow(True)

    for cote in ("top", "right"):
        axes.spines[cote].set_visible(False)
    for cote in ("left", "bottom"):
        axes.spines[cote].set_color(palette.grille)
        axes.spines[cote].set_linewidth(0.8)

    axes.tick_params(colors=palette.texte_doux, labelsize=9, length=0)
    axes.yaxis.set_major_locator(MaxNLocator(integer=True))
    return figure, axes


def _vers_svg(figure) -> str:
    """Sérialise la figure en SVG et libère la mémoire de matplotlib."""
    try:
        figure.tight_layout()
    except Exception:
        pass

    tampon = io.StringIO()
    figure.savefig(
        tampon,
        format="svg",
        facecolor=figure.get_facecolor(),
        transparent=False,
    )
    plt.close(figure)
    return tampon.getvalue()


def _message_vide(palette: Palette, texte: str, largeur: float = 5.6, hauteur: float = 2.4) -> str:
    """Cartouche affiché quand la période ne contient aucune donnée."""
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
# 1. Trafic quotidien — deux séries vibrantes (Cyan & Rose vif)
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

    # Remplissages et courbes vibrantes
    axes.fill_between(x, vues, color=palette.serie_1, alpha=0.18, zorder=1)
    axes.plot(x, vues, color=palette.serie_1, linewidth=2.5, zorder=3, label="Pages vues")
    axes.plot(x, visiteurs, color=palette.serie_2, linewidth=2.5, zorder=3, label="Visiteurs uniques")

    if len(jours) <= 31:
        axes.plot(x, vues, "o", color=palette.serie_1, markersize=5,
                  markeredgecolor=palette.surface, markeredgewidth=1.8, zorder=4)
        axes.plot(x, visiteurs, "o", color=palette.serie_2, markersize=5,
                  markeredgecolor=palette.surface, markeredgewidth=1.8, zorder=4)

    if any(vues):
        i_max = max(range(len(vues)), key=lambda i: vues[i])
        axes.annotate(
            f"{vues[i_max]}",
            xy=(i_max, vues[i_max]),
            xytext=(0, 10), textcoords="offset points",
            ha="center", color=palette.serie_1, fontsize=9.5, fontweight="bold",
        )

    pas = max(1, len(jours) // 10)
    axes.set_xticks(list(x)[::pas])
    axes.set_xticklabels([jours[i] for i in list(x)[::pas]], rotation=0)
    axes.set_ylim(bottom=0, top=max(max(vues), max(visiteurs), 1) * 1.22)

    legende = axes.legend(
        loc="upper left", frameon=False, fontsize=9.5,
        labelcolor=palette.texte, handlelength=1.8,
    )
    for texte in legende.get_texts():
        texte.set_color(palette.texte)

    return _vers_svg(figure)


# ---------------------------------------------------------------------------
# 2. Carte horaire — magnitude multicolore vibrante
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

    rampe = LinearSegmentedColormap.from_list("trafic_vibrant", list(palette.rampe))
    image = axes.imshow(matrice, cmap=rampe, aspect="auto", interpolation="nearest", vmin=0)

    axes.set_yticks(range(7))
    axes.set_yticklabels(JOURS_FR, color=palette.texte, fontweight="bold")
    axes.set_xticks(range(0, 24, 3))
    axes.set_xticklabels([f"{h:02d}h" for h in range(0, 24, 3)])

    for cote in ("left", "bottom"):
        axes.spines[cote].set_visible(False)

    barre = figure.colorbar(image, ax=axes, pad=0.015, fraction=0.03)
    barre.locator = MaxNLocator(integer=True, nbins=5)
    barre.update_ticks()
    barre.outline.set_visible(False)
    barre.ax.tick_params(colors=palette.texte_doux, labelsize=8, length=0)
    barre.set_label("Pages vues", color=palette.texte_doux, fontsize=9)

    return _vers_svg(figure)


# ---------------------------------------------------------------------------
# 3. Classements — barres horizontales multicolores vibrantes
# ---------------------------------------------------------------------------

def chart_barres_horizontales(
    libelles: Sequence[str],
    valeurs: Sequence[int],
    theme: Optional[str] = None,
    message_vide: str = "Aucune donnée sur la période",
    hauteur_par_barre: float = 0.44,
) -> str:
    palette = get_palette(theme)
    if not libelles or not any(valeurs):
        return _message_vide(palette, message_vide)

    emplacements = max(len(libelles), MIN_EMPLACEMENTS)
    hauteur = max(2.0, 0.85 + hauteur_par_barre * emplacements)
    figure, axes = _nouvelle_figure(palette, LARGEUR_DEMI, hauteur)

    axes.grid(False)
    axes.xaxis.grid(True, color=palette.grille, linewidth=0.8)

    y = range(len(libelles))
    # Couleurs variées et vives pour chaque barre
    couleurs_barres = [palette.couleurs[i % len(palette.couleurs)] for i in range(len(libelles))]
    axes.barh(y, valeurs, color=couleurs_barres, height=0.62, zorder=2)

    axes.set_yticks(list(y))
    axes.set_yticklabels([_tronquer(l) for l in libelles], fontsize=9)
    axes.set_ylim(emplacements - 0.5, -0.5)
    axes.tick_params(axis="y", colors=palette.texte)

    maximum = max(valeurs)
    marge = maximum * 0.02
    for index, valeur in enumerate(valeurs):
        axes.text(
            valeur + marge, index, str(valeur),
            va="center", ha="left",
            color=palette.texte_doux, fontsize=9, fontweight="bold",
        )
    axes.set_xlim(0, maximum * 1.15)
    axes.set_xticks([])
    axes.spines["bottom"].set_visible(False)

    return _vers_svg(figure)


# ---------------------------------------------------------------------------
# 4. Petits multiples — Navigateurs & Systèmes en couleurs distinctes
# ---------------------------------------------------------------------------

def chart_technologies(
    navigateurs: Sequence[Tuple[str, int]],
    systemes: Sequence[Tuple[str, int]],
    theme: Optional[str] = None,
) -> str:
    palette = get_palette(theme)
    if not navigateurs and not systemes:
        return _message_vide(palette, "Aucune donnée technique sur la période")

    lignes = max(len(navigateurs), len(systemes), MIN_EMPLACEMENTS)
    hauteur = max(2.2, 1.0 + 0.36 * lignes)

    figure, panneaux = plt.subplots(1, 2, figsize=(LARGEUR_DEMI, hauteur), dpi=100)
    figure.patch.set_facecolor(palette.surface)

    for i_pan, (axes, donnees, titre) in enumerate(((panneaux[0], navigateurs, "Navigateurs"),
                                                    (panneaux[1], systemes, "Systèmes"))):
        axes.set_facecolor(palette.surface)
        axes.set_title(titre, color=palette.texte, fontsize=10, pad=10, loc="left", fontweight="bold")
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
        
        offset = 0 if i_pan == 0 else 3
        couleurs_barres = [palette.couleurs[(i + offset) % len(palette.couleurs)] for i in range(len(libelles))]
        axes.barh(y, valeurs, color=couleurs_barres, height=0.6, zorder=2)
        axes.set_yticks(list(y))
        axes.set_yticklabels([_tronquer(l, 18) for l in libelles], fontsize=9)
        axes.tick_params(axis="y", colors=palette.texte)
        axes.set_ylim(lignes - 0.5, -0.5)

        maximum = max(valeurs)
        for index, valeur in enumerate(valeurs):
            axes.text(valeur + maximum * 0.03, index, str(valeur),
                      va="center", ha="left", color=palette.texte_doux, fontsize=9, fontweight="bold")
        axes.set_xlim(0, maximum * 1.2)
        axes.set_xticks([])

    figure.tight_layout()
    return _vers_svg(figure)


# ---------------------------------------------------------------------------
# 5. Largeurs d'écran — bandes responsive colorées
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
            largeur=LARGEUR_PLEINE,
            hauteur=2.85,
        )

    figure, axes = _nouvelle_figure(palette, LARGEUR_PLEINE, 2.85)
    axes.grid(False)
    axes.yaxis.grid(True, color=palette.grille, linewidth=0.8, linestyle="-", zorder=0)

    def _formater_palier(libelle_brut: str) -> str:
        if " · " in libelle_brut:
            parties = libelle_brut.split(" · ")
            return f"{parties[1].strip().capitalize()}\n{parties[0].strip()}"
        return libelle_brut

    categories = [_formater_palier(r[0]) for r in repartition]
    valeurs = [r[1] for r in repartition]
    total = sum(valeurs) or 1
    x = range(len(categories))
    couleurs = [palette.couleurs[i % len(palette.couleurs)] for i in range(len(categories))]

    axes.bar(x, valeurs, color=couleurs, width=0.48, zorder=2)
    axes.set_xticks(list(x))
    axes.set_xticklabels(categories, fontsize=9.5, color=palette.texte)
    axes.tick_params(axis="x", colors=palette.texte, pad=6)
    axes.tick_params(axis="y", colors=palette.texte_doux, labelsize=9)

    max_val = max(valeurs) or 1
    axes.set_ylim(0, max_val * 1.25)
    axes.spines["left"].set_visible(False)
    axes.spines["bottom"].set_color(palette.grille)

    for index, val in enumerate(valeurs):
        if val > 0:
            pct = f"{(val / total) * 100:.0f}%"
            axes.text(
                index, val + max_val * 0.025, f"{val} ({pct})",
                ha="center", va="bottom", color=palette.texte, fontsize=9.5, fontweight="bold",
            )

    return _vers_svg(figure)

