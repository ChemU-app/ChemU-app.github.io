function createCompound({ allowedFormulas }) {
  let selectedFormulas = allowedFormulas;
  if (!Array.isArray(selectedFormulas) || selectedFormulas.length === 0) {
    throw new Error("selectedFormulas must be a non-empty array.");
  }

  // Pick one formula at random
  const formula =
    selectedFormulas[Math.floor(Math.random() * selectedFormulas.length)];

  if (typeof formula !== "string" || formula.trim() === "") {
    throw new Error("Each formula must be a non-empty string.");
  }

  // Atomic masses in g/mol
  const atomicMasses = {
    H: 1.008,
    He: 4.003,
    Li: 6.94,
    Be: 9.012,
    B: 10.81,
    C: 12.011,
    N: 14.007,
    O: 15.999,
    F: 18.998,
    Ne: 20.18,
    Na: 22.99,
    Mg: 24.305,
    Al: 26.982,
    Si: 28.085,
    P: 30.974,
    S: 32.06,
    Cl: 35.45,
    K: 39.098,
    Ar: 39.948,
    Ca: 40.078,
    Fe: 55.845,
    Cu: 63.546,
    Zn: 65.38,
    Br: 79.904,
    Ag: 107.868,
    I: 126.904,
    Ba: 137.327,
    Au: 196.967,
    Hg: 200.592,
    Pb: 207.2
  };

  // Matches element symbols such as H, O, Na, or Cl,
  // optionally followed by a number.
  const parts = formula.match(/[A-Z][a-z]?\d*/g);

  if (!parts || parts.join("") !== formula) {
    throw new Error(`Invalid chemical formula: ${formula}`);
  }

  let molarMass = 0;
  let totalAtomsPerMolecule = 0;

  for (const part of parts) {
    const elementMatch = part.match(/^([A-Z][a-z]?)(\d*)$/);
    const [, element, countText] = elementMatch;

    const count = countText === "" ? 1 : Number(countText);
    const atomicMass = atomicMasses[element];

    if (atomicMass === undefined) {
      throw new Error(`Unknown element: ${element}`);
    }

    molarMass += atomicMass * count;
    totalAtomsPerMolecule += count;
  }

  return {
    formula,
    molarMass: Number(molarMass.toFixed(3)),
    totalAtomsPerMolecule
  };
}

module.exports={
	createCompound,
}
