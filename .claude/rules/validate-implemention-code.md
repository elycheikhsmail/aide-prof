# 🧱 **Rule : Processus de validation après implémentation**

**Objectif :** Après chaque implémentation d’une tâche, s’assurer que le code reste stable, non cassé, que le build fonctionne et que les tests E2E pertinents passent.

---

## **1. Vérification TypeScript**

* L’agent doit exécuter la commande de vérification TS (ex : `tsc --noEmit`).
* L’implémentation est invalide si la compilation TS échoue.

---

## **2. Build du projet**

* L’agent doit exécuter :
  **`bun run build`**
* Le build doit se terminer **sans aucune erreur**.
* Si le build échoue, l’agent doit corriger avant de continuer.

---

## **3. Tests E2E existants**

* L’agent doit identifier les fichiers dont le code a été modifié.
* En se basant sur la correspondance source ↔ tests E2E, l’agent doit exécuter **uniquement les tests E2E pertinents**, par exemple :

  * modification dans `src/auth/login.ts` → exécuter `e2e/auth/login.spec.ts`
* Tous les tests concernés doivent passer.

---

## **4. Création ou mise à jour de tests E2E**

* Si la tâche introduit un nouveau flux métier, une nouvelle fonctionnalité ou une modification fonctionnelle :
  → **Créer ou mettre à jour un test E2E correspondant.**
* Le test peut être créé **avant (TDD)** ou **après**, mais doit exister avant la validation finale.
* Le test doit être stable, clair et représenter le comportement utilisateur attendu.

---

## **5. Critères d’acceptation**

L’implémentation est considérée valide seulement si :

* ✔ TypeScript compile sans erreur
* ✔ `bun run build` réussit
* ✔ Les tests E2E pertinents passent
* ✔ Un test E2E existe pour tout nouveau comportement
* ✔ Aucun test, build ou workflow existant n’est cassé
* ✔ Le périmètre modifié est entièrement couvert par tests + build + TS
 