"""
Migrations additives légères pour SQLite.

`Base.metadata.create_all()` crée les tables absentes mais ne touche jamais à
celles qui existent déjà : une colonne ajoutée au modèle n'apparaît donc pas sur
une base en production, et la première requête échoue sur "no such column".

Ce module comble ce trou pour le seul cas dont le projet a besoin — l'ajout de
colonnes nullables — sans introduire Alembic pour trois champs. Chaque migration
est idempotente : elle vérifie la présence de la colonne avant de l'ajouter, donc
la relancer à chaque démarrage ne coûte qu'une lecture de schéma.

Les suppressions et renommages de colonnes ne sont volontairement pas gérés : ils
demandent une reconstruction de table, et c'est le moment de passer à un vrai
outil de migration.
"""
from typing import Dict, List, Tuple

from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine

from app.logger import log_error, log_success

# Colonnes ajoutées après la première mise en production, par table.
# Le type est écrit en SQL, tel qu'il sera passé à ALTER TABLE.
ADDITIVE_COLUMNS: Dict[str, List[Tuple[str, str]]] = {
    "page_views": [
        ("viewport_width", "INTEGER"),
        ("timezone", "VARCHAR(64)"),
    ],
}


def run_additive_migrations(engine: Engine) -> List[str]:
    """
    Ajoute les colonnes manquantes et retourne la liste de celles créées.

    Une table absente est ignorée sans erreur : create_all() la construira avec
    le schéma complet, la migration n'a alors rien à faire.
    """
    appliquees: List[str] = []
    inspecteur = inspect(engine)
    tables_existantes = set(inspecteur.get_table_names())

    for table, colonnes in ADDITIVE_COLUMNS.items():
        if table not in tables_existantes:
            continue

        deja_presentes = {c["name"] for c in inspecteur.get_columns(table)}

        for nom, type_sql in colonnes:
            if nom in deja_presentes:
                continue
            try:
                with engine.begin() as connexion:
                    # Les noms viennent d'une constante du module, jamais d'une
                    # entrée utilisateur : pas de paramétrage possible sur un DDL.
                    connexion.execute(text(f"ALTER TABLE {table} ADD COLUMN {nom} {type_sql}"))
                appliquees.append(f"{table}.{nom}")
            except Exception as erreur:
                log_error(
                    "migrations.py",
                    "run_additive_migrations",
                    f"Ajout de {table}.{nom} impossible : {erreur}",
                )

    if appliquees:
        log_success(
            "migrations.py",
            "run_additive_migrations",
            f"Schéma mis à jour : {', '.join(appliquees)}",
        )
    return appliquees
