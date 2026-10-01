const VARIABLE_TYPE_DEF = {
	element: ["name", "symbol", "molarMass", "atomicNumber", "neutrons", "protons", "electrons", "charge", "chargeElectrons"],
	integer: ["value"],
	decimal: ["value"],
	scientificNumber: ["value", "scientificNotation", "coefficient", "exponent"],
	formula: ["formula", "molarMass", "totalAtomsPerMolecule"],
};

module.exports = {
	VARIABLE_TYPE_DEF,
};
