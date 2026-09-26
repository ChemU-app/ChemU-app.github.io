function randomDecimal(min, max, step = 1, decimalPlaces = 0) {
  if (step <= 0) step = 1;

  const scale = 10 ** decimalPlaces;
  const minInt = Math.ceil(min * scale);
  const maxInt = Math.floor(max * scale);
  const stepInt = Math.round(step * scale);

  const validValues = [];

  for (let value = minInt; value <= maxInt; value += stepInt) {
    validValues.push(value);
  }

  const selectedValue =
    validValues[Math.floor(Math.random() * validValues.length)];

  // Generate one random digit per digit in the formatted result.
  const formatted = Math.abs(selectedValue / scale).toFixed(decimalPlaces);
  const [wholePart, fractionalPart] = formatted.split(".");

  const randomizeDigits = (text) =>
    [...text]
      .map(() => Math.floor(Math.random() * 10))
      .join("");

  const randomizedWholePart = randomizeDigits(wholePart).replace(/^0+/, "");

  // Keep at least one digit if every generated digit was zero.
  const resultWholePart = randomizedWholePart || "0";

  if (decimalPlaces === 0) {
    return `${selectedValue < 0 ? "-" : ""}${resultWholePart}`;
  }

  const randomizedFractionalPart = randomizeDigits(fractionalPart);

  return `${selectedValue < 0 ? "-" : ""}${resultWholePart}.${randomizedFractionalPart}`;
}

function generateScientificNumber({
  coefficientMin,
  coefficientMax,
  coefficientStep,
  coefficientDecimalPlaces,
  exponentMin,
  exponentMax,
}) {

  const coefficient = randomNumber(
    coefficientMin,
    coefficientMax,
    coefficientStep,
    coefficientDecimalPlaces
  );

  const exponent = randomInteger(exponentMin, exponentMax);

  return {
    coefficient,
    exponent,
    value: coefficient * 10 ** exponent,
    scientificNotation: `${coefficient}e${exponent}`,
  };
}

function randomInteger(min, max) {
/*  if (!Number.isInteger(min) || !Number.isInteger(max)) {
    throw new Error("Exponent bounds must be integers");
  }

  if (max < min) {
    throw new Error("exponentMax must be greater than or equal to exponentMin");
  }*/

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomNumber(min, max, step = 1, decimalPlaces = 0) {
  if (step <= 0) {
    throw new Error("coefficientStep must be greater than 0");
  }

  if (max < min) {
    throw new Error(
      "coefficientMax must be greater than or equal to coefficientMin"
    );
  }

  const scale = 10 ** decimalPlaces;
  const minInt = Math.ceil(min * scale);
  const maxInt = Math.floor(max * scale);
  const stepInt = Math.round(step * scale);

  const numberOfSteps = Math.floor((maxInt - minInt) / stepInt);
  const randomStep = Math.floor(Math.random() * (numberOfSteps + 1));

  const value = minInt + randomStep * stepInt;

  return Number((value / scale).toFixed(decimalPlaces));
}


module.exports = {
	randomDecimal,
	generateScientificNumber,
};
