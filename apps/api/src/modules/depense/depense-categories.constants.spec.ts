import { DepenseCategorie } from '@prisma/client';
import {
  DEPENSE_CATEGORIE_RULES,
  DEPENSE_CATEGORIES,
} from './depense-categories.constants';

describe('expense category rules', () => {
  it('defines an explicit budget impact for every persisted category', () => {
    expect(Object.keys(DEPENSE_CATEGORIE_RULES)).toEqual(
      expect.arrayContaining(Object.values(DepenseCategorie)),
    );

    expect(DEPENSE_CATEGORIE_RULES.MATERIEL.budgetImpact).toBe('MATERIAUX');
    expect(DEPENSE_CATEGORIE_RULES.MAIN_OEUVRE.budgetImpact).toBe(
      'MAIN_OEUVRE',
    );
    expect(DEPENSE_CATEGORIE_RULES.SOUS_TRAITANCE.budgetImpact).toBe(
      'MAIN_OEUVRE',
    );
    expect(DEPENSE_CATEGORIE_RULES.TRANSPORT.budgetImpact).toBeNull();
    expect(DEPENSE_CATEGORIE_RULES.AUTRE.budgetImpact).toBeNull();
  });

  it('keeps legacy categories readable without allowing new manual entries', () => {
    const legacyCategories = DEPENSE_CATEGORIES.filter(
      ({ disponibleEnSaisie }) => !disponibleEnSaisie,
    );

    expect(legacyCategories.map(({ code }) => code)).toEqual(
      expect.arrayContaining(['TRANSPORT', 'AUTRE']),
    );
    expect(
      legacyCategories.every(({ label }) => label.includes('historique')),
    ).toBe(true);
  });
});
