function randomDecimal(min, max, step, decimalPlaces) {
  if (step <= 0) step = 1;
 // if (max < min) throw new Error("max must be greater than or equal to min");

  const scale = 10 ** decimalPlaces;
  const minInt = Math.ceil(min * scale);
  const maxInt = Math.floor(max * scale);
  const stepInt = Math.round(step * scale);

  const steps = Math.floor((maxInt - minInt) / stepInt);
  const value = minInt + Math.floor(Math.random() * (steps + 1)) * stepInt;
  console.log("+++++++++++++++++debug");
  console.log(scale);
  console.log(value);
  console.log(steps);
  console.log(minInt);
  console.log(maxInt);
  //const value = minInt + Math.floor(Math.random());
  return Number((value / scale).toFixed(decimalPlaces));
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
