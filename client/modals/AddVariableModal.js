// AddVariableModal.tsx

import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

/*import {
  QuestionVariable,
  VariableType
} from "./types/variables";

type Props = {
  visible: boolean;
  variables: QuestionVariable[];
  setVariables: React.Dispatch<
    React.SetStateAction<QuestionVariable[]>
  >;
  onClose: () => void;
};*/

const typeOptions = [
  { label: "Element", value: "element" },
  { label: "Formula", value: "formula" },
  { label: "Integer", value: "integer" },
  { label: "Decimal", value: "decimal" },
  { label: "Scientific number", value: "scientificNumber" },
  { label: "Choice", value: "choice" },
  { label: "Matching set", value: "matchingSet" }
];

const elementOptions = [
  "H",
  "He",
  "C",
  "N",
  "O",
  "F",
  "Ne",
  "Na",
  "Mg",
  "Al",
  "Si",
  "P",
  "S",
  "Cl",
  "Ar",
  "K",
  "Ca",
  "Fe",
  "Cu",
  "Zn",
  "As",
  "Ag",
  "Au",
  "W",
  "Ni"
];

const formulaOptions = [
  "H2",
  "H2O",
  "CH4",
  "CO2",
  "HCl",
  "NH3",
  "C2H6",
  "C6H12O6"
];

//varsM
//isAddVar

export function AddVariableModal({
  visible,
  variables,
  setVariables,
  onClose
}: Props) {
  const [type, setType] = useState({key:"element"});
  const [name, setName] = useState("");

  const [selectedElements, setSelectedElements] = useState(
    []
  );
  const [selectedFormulas, setSelectedFormulas] = useState(
    []
  );

  const [min, setMin] = useState("1");
  const [max, setMax] = useState("100");
  const [step, setStep] = useState("1");
  const [decimalPlaces, setDecimalPlaces] = useState("2");

  const [coefficientMin, setCoefficientMin] = useState("1");
  const [coefficientMax, setCoefficientMax] = useState("9.99");
  const [coefficientStep, setCoefficientStep] = useState("0.01");
  const [coefficientDecimalPlaces, setCoefficientDecimalPlaces] =
    useState("2");
  const [exponentMin, setExponentMin] = useState("20");
  const [exponentMax, setExponentMax] = useState("26");

  const [optionsText, setOptionsText] = useState("");
  const [itemsText, setItemsText] = useState("");
  const [answersText, setAnswersText] = useState("");

  const resetForm = () => {
    setType("element");
    setName("");
    setSelectedElements([]);
    setSelectedFormulas([]);
    setMin("1");
    setMax("100");
    setStep("1");
    setDecimalPlaces("2");
    setCoefficientMin("1");
    setCoefficientMax("9.99");
    setCoefficientStep("0.01");
    setCoefficientDecimalPlaces("2");
    setExponentMin("20");
    setExponentMax("26");
    setOptionsText("");
    setItemsText("");
    setAnswersText("");
  };

  const toggleValue = (
    value: string,
    values: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  };

  const makeUniqueId = () => {
    const base = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");

    const fallback = `${type}_${Date.now()}`;

    let id = base || fallback;
    let counter = 2;

    while (variables.some((variable) => variable.id === id)) {
      id = `${base || type}_${counter}`;
      counter += 1;
    }

    return id;
  };

  const saveVariable = () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    const base = {
      id: makeUniqueId(),
      name: trimmedName,
      type
    };

    let newVariable: QuestionVariable;

    if (type === "element") {
      newVariable = {
        ...base,
        type: "element",
        allowedElements:
          selectedElements.length > 0
            ? selectedElements
            : elementOptions
      };
    } else if (type === "formula") {
      newVariable = {
        ...base,
        type: "formula",
        allowedFormulas:
          selectedFormulas.length > 0
            ? selectedFormulas
            : formulaOptions
      };
    } else if (type === "integer") {
      newVariable = {
        ...base,
        type: "integer",
        min: Number(min),
        max: Number(max),
        step: Number(step)
      };
    } else if (type === "decimal") {
      newVariable = {
        ...base,
        type: "decimal",
        min: Number(min),
        max: Number(max),
        step: Number(step),
        decimalPlaces: Number(decimalPlaces)
      };
    } else if (type === "scientificNumber") {
      newVariable = {
        ...base,
        type: "scientificNumber",
        coefficientMin: Number(coefficientMin),
        coefficientMax: Number(coefficientMax),
        coefficientStep: Number(coefficientStep),
        coefficientDecimalPlaces: Number(
          coefficientDecimalPlaces
        ),
        exponentMin: Number(exponentMin),
        exponentMax: Number(exponentMax)
      };
    } else if (type === "choice") {
      newVariable = {
        ...base,
        type: "choice",
        options: splitLines(optionsText),
        randomizeOptions: true
      };
    } else {
      newVariable = {
        ...base,
        type: "matchingSet",
        items: splitLines(itemsText),
        answers: splitLines(answersText),
        shuffleItems: true,
        shuffleAnswers: true
      };
    }

    // Important: functional update prevents stale-state problems.
    setVariables((currentVariables) => [
      ...currentVariables,
      newVariable
    ]);

    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>Add variable</Text>

            <Text style={styles.label}>Variable name</Text>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Example: sampleMass"
              style={styles.input}
              autoCapitalize="none"
            />

            <Text style={styles.label}>Variable type</Text>

            <View style={styles.typeList}>
              {typeOptions.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => setType(option.value)}
                  style={[
                    styles.typeButton,
                    type === option.value &&
                      styles.selectedTypeButton
                  ]}
                >
                  <Text
                    style={
                      type === option.value
                        ? styles.selectedTypeText
                        : undefined
                    }
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {type === "element" && (
              <ElementFields
                selectedElements={selectedElements}
                onToggle={(value) =>
                  toggleValue(
                    value,
                    selectedElements,
                    setSelectedElements
                  )
                }
              />
            )}

            {type === "formula" && (
              <FormulaFields
                selectedFormulas={selectedFormulas}
                onToggle={(value) =>
                  toggleValue(
                    value,
                    selectedFormulas,
                    setSelectedFormulas
                  )
                }
              />
            )}

            {type === "integer" && (
              <NumberFields
                min={min}
                max={max}
                step={step}
                setMin={setMin}
                setMax={setMax}
                setStep={setStep}
              />
            )}

            {type === "decimal" && (
              <DecimalFields
                min={min}
                max={max}
                step={step}
                decimalPlaces={decimalPlaces}
                setMin={setMin}
                setMax={setMax}
                setStep={setStep}
                setDecimalPlaces={setDecimalPlaces}
              />
            )}

            {type === "scientificNumber" && (
              <ScientificFields
                coefficientMin={coefficientMin}
                coefficientMax={coefficientMax}
                coefficientStep={coefficientStep}
                coefficientDecimalPlaces={
                  coefficientDecimalPlaces
                }
                exponentMin={exponentMin}
                exponentMax={exponentMax}
                setCoefficientMin={setCoefficientMin}
                setCoefficientMax={setCoefficientMax}
                setCoefficientStep={setCoefficientStep}
                setCoefficientDecimalPlaces={
                  setCoefficientDecimalPlaces
                }
                setExponentMin={setExponentMin}
                setExponentMax={setExponentMax}
              />
            )}

            {type === "choice" && (
              <>
                <Text style={styles.label}>
                  Options, one per line
                </Text>

                <TextInput
                  value={optionsText}
                  onChangeText={setOptionsText}
                  multiline
                  style={[styles.input, styles.multiline]}
                  placeholder={"More atoms\nFewer atoms\nEqual"}
                />
              </>
            )}

            {type === "matchingSet" && (
              <>
                <Text style={styles.label}>
                  Items, one per line
                </Text>

                <TextInput
                  value={itemsText}
                  onChangeText={setItemsText}
                  multiline
                  style={[styles.input, styles.multiline]}
                />

                <Text style={styles.label}>
                  Answers, one per line
                </Text>

                <TextInput
                  value={answersText}
                  onChangeText={setAnswersText}
                  multiline
                  style={[styles.input, styles.multiline]}
                />
              </>
            )}

            <View style={styles.footer}>
              <Pressable
                style={[styles.footerButton, styles.cancelButton]}
                onPress={onClose}
              >
                <Text>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.footerButton, styles.addButton]}
                onPress={saveVariable}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function splitLines(value) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function ElementFields({
  selectedElements,
  onToggle
}) {
  return (
    <>
      <Text style={styles.label}>
        Allowed elements, or leave empty for all
      </Text>

      <View style={styles.chipContainer}>
        {elementOptions.map((element) => {
          const selected = selectedElements.includes(element);

          return (
            <Pressable
              key={element}
              onPress={() => onToggle(element)}
              style={[
                styles.chip,
                selected && styles.selectedChip
              ]}
            >
              <Text>{element}</Text>
            </Pressable>
          );
        })}
      </View>
    </>
  );
}


function FormulaFields({
  selectedFormulas,
  onToggle
}) {
  return (
    <>
      <Text style={styles.label}>
        Allowed formulas, or leave empty for all
      </Text>

      <View style={styles.chipContainer}>
        {formulaOptions.map((formula) => {
          const selected = selectedFormulas.includes(formula);

          return (
            <Pressable
              key={formula}
              onPress={() => onToggle(formula)}
              style={[
                styles.chip,
                selected && styles.selectedChip
              ]}
            >
              <Text>{formula}</Text>
            </Pressable>
          );
        })}
      </View>
    </>
  );
}

function NumberFields({
  min,
  max,
  step,
  setMin,
  setMax,
  setStep
}) {
  return (
    <>
      <NumberInput label="Minimum" value={min} onChange={setMin} />
      <NumberInput label="Maximum" value={max} onChange={setMax} />
      <NumberInput label="Step" value={step} onChange={setStep} />
    </>
  );
}

function DecimalFields({
  min,
  max,
  step,
  decimalPlaces,
  setMin,
  setMax,
  setStep,
  setDecimalPlaces
}) {
  return (
    <>
      <NumberFields
        min={min}
        max={max}
        step={step}
        setMin={setMin}
        setMax={setMax}
        setStep={setStep}
      />

      <NumberInput
        label="Decimal places"
        value={decimalPlaces}
        onChange={setDecimalPlaces}
      />
    </>
  );
}

function ScientificFields(props) {
  return (
    <>
      <NumberInput
        label="Coefficient minimum"
        value={props.coefficientMin}
        onChange={props.setCoefficientMin}
      />

      <NumberInput
        label="Coefficient maximum"
        value={props.coefficientMax}
        onChange={props.setCoefficientMax}
      />

      <NumberInput
        label="Coefficient step"
        value={props.coefficientStep}
        onChange={props.setCoefficientStep}
      />

      <NumberInput
        label="Coefficient decimal places"
        value={props.coefficientDecimalPlaces}
        onChange={props.setCoefficientDecimalPlaces}
      />

      <NumberInput
        label="Exponent minimum"
        value={props.exponentMin}
        onChange={props.setExponentMin}
      />

      <NumberInput
        label="Exponent maximum"
        value={props.exponentMax}
        onChange={props.setExponentMax}
      />
    </>
  );
}

function NumberInput({
  label,
  value,
  onChange
}) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType="numeric"
        style={styles.input}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.45)"
  },
  modal: {
    maxHeight: "92%",
    backgroundColor: "white",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 20
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 18
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 6
  },
  input: {
    borderWidth: 1,
    borderColor: "#cfcfcf",
    borderRadius: 7,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: "top"
  },
  typeList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  typeButton: {
    borderWidth: 1,
    borderColor: "#cfcfcf",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  selectedTypeButton: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb"
  },
  selectedTypeText: {
    color: "white"
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7
  },
  chip: {
    borderWidth: 1,
    borderColor: "#cfcfcf",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 16
  },
  selectedChip: {
    backgroundColor: "#bfdbfe",
    borderColor: "#2563eb"
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 24
  },
  footerButton: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 7
  },
  cancelButton: {
    backgroundColor: "#e5e7eb"
  },
  addButton: {
    backgroundColor: "#2563eb"
  },
  addButtonText: {
    color: "white",
    fontWeight: "600"
  }
});

