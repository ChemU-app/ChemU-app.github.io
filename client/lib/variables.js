export const variableProperties = {
  element: [
    {
      key: "symbol",
      label: "Element symbol",
      format: "{{variable}}.symbol"
    },
    {
      key: "name",
      label: "Element name",
      format: "{{variable}}.name"
    },
    {
      key: "atomicNumber",
      label: "Atomic number",
      format: "{{variable}}.atomicNumber"
    },
    {
      key: "atomicMass",
      label: "Atomic mass",
      format: "{{variable}}.atomicMass"
    },
    {
      key: "electrons",
      label: "Electrons",
      format: "{{variable}}.electrons"
    },
    {
      key: "protons",
      label: "Protons",
      format: "{{variable}}.protons"
    },
  ],

  formula: [
    {
      key: "formula",
      label: "Chemical formula",
      format: "{{variable}}.formula"
    },
    {
      key: "molarMass",
      label: "Molar mass",
      format: "{{variable}}.molarMass"
    },
    {
      key: "totalAtomsPerMolecule",
      label: "Total atoms per molecule",
      format: "{{variable}}.totalAtomsPerMolecule"
    }
  ],

  integer: [
    {
      key: "value",
      label: "Number",
      format: "{{variable}}.value"
    }
  ],

  decimal: [
    {
      key: "value",
      label: "Decimal value",
      format: "{{variable}}.value"
    }
  ],

  scientificNumber: [
    {
      key: "value",
      label: "Full numeric value",
      format: "{{variable}}.value"
    },
    {
      key: "coefficient",
      label: "Coefficient",
      format: "{{variable}}.coefficient"
    },
    {
      key: "exponent",
      label: "Exponent",
      format: "{{variable}}.exponent"
    }
  ],

  choice: [
    {
      key: "selected",
      label: "Selected option",
      format: "{{variable}}.selected"
    }
  ],

  matchingSet: [
    {
      key: "items",
      label: "Matching items",
      format: "{{variable}}.items"
    },
    {
      key: "answers",
      label: "Matching answers",
      format: "{{variable}}.answers"
    }
  ]
};


export function getVariableProperties(
  variable
) {
  return variableProperties[variable.type];
}
