const {ELEMENTS, COMPOUNDS} = require('../data/elements');
const prisma = require('../lib/prisma');
const {
  parseBrackets, resolveAll, renderContent,
  evaluateAnswer, generateDistractors, buildDynamicChoices,
} = require('../lib/questionTemplate');

async function getStudentCourses(req, res) {
  const studentId = req.user.sub;

  const enrollments = await prisma.studentCourse.findMany({
    where: { studentId },
    include: {
      course: true,
      currentSection: { select: { id: true, name: true } },
    },
    orderBy: { course: { name: 'asc' } },
  });

  res.json(enrollments.map(e => ({
    id: e.course.id,
    name: e.course.name,
    currentPoints: e.currentPoints,
    lifetimePoints: e.lifetimePoints,
    streak: e.streak,
    currentSectionId: e.currentSectionId,
    currentSection: e.currentSection,
  })));
}

async function getStudentCourseProgress(req, res) {
  const { courseId } = req.params;
  const studentId = req.user.sub;

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return res.status(404).json({ error: 'Course not found' });

  const enrollment = await prisma.studentCourse.findUnique({
    where: { studentId_courseId: { studentId, courseId } },
  });
  if (!enrollment) return res.status(403).json({ error: 'Not enrolled in this course' });

  const chapters = await prisma.chapter.findMany({
    where: { courseId },
    include: { sections: { select: { id: true } } },
  });
  const sectionIds = chapters.flatMap(ch => ch.sections.map(s => s.id));

  const completions = await prisma.studentSection.findMany({
    where: { studentId, sectionId: { in: sectionIds }, completedAt: { not: null } },
  });

  res.json({
    courseId,
    currentPoints: enrollment.currentPoints,
    lifetimePoints: enrollment.lifetimePoints,
    streak: enrollment.streak,
    currentSectionId: enrollment.currentSectionId,
    totalSections: sectionIds.length,
    completedSections: completions.length,
    sections: completions.map(c => ({
      sectionId: c.sectionId,
      completedAt: c.completedAt,
      score: c.score,
    })),
  });
}


//	OOOOOOOOOOOOOOO
//
//
function finalizeAnswers(data, res, vars) {
  if (!Array.isArray(data)) {
    data = [[data]];
  }
   return data.map(row =>
    row.map(item =>
      evaluateAnswer(
        item,
	res,
        vars
      )
    )
  );
/*  console.log(data)

  const subscriptDigits = {
    0: '₀',
    1: '₁',
    2: '₂',
    3: '₃',
    4: '₄',
    5: '₅',
    6: '₆',
    7: '₇',
    8: '₈',
    9: '₉',
    '+': '₊',
    '-': '₋',
    '=': '₌',
    '(': '₍',
    ')': '₎',
  };

  function getVariableValue(index, property) {
    const variable = vars[index];

    if (variable == null) {
      return undefined;
    }

    if (
      typeof variable === 'object' &&
      variable[property] !== undefined
    ) {
      return variable[property];
    }

    if (
      typeof variable === 'object' &&
      variable.elm != null &&
      typeof variable.elm === 'object' &&
      variable.elm[property] !== undefined
    ) {
      return variable.elm[property];
    }

    return undefined;
  }

  function stringifyValue(value) {
    if (value == null) {
      return '';
    }

    if (typeof value === 'object') {
      if (value.name != null) {
        return String(value.name);
      }

      if (value.symbol != null) {
        return String(value.symbol);
      }

      if (value.value != null) {
        return String(value.value);
      }
    }

    return String(value);
  }

  function replaceVariables(answer) {
    return answer.replace(
      /\[(\d+)\.([A-Za-z_$][\w$]*)\]/g,
      (match, index, property) => {
        const value = getVariableValue(
          Number(index),
          property
        );

        return value === undefined
          ? match
          : stringifyValue(value);
      }
    );
  }

  function replaceSubscripts(answer) {
    return answer.replace(
      /_\(([^()]*)\)/g,
      (_, value) =>
        value
          .split('')
          .map(character =>
            subscriptDigits[character] ?? character
          )
          .join('')
    );
  }

  function evaluateMath(answer) {
    const trimmed = answer.trim();

    if (trimmed === '') {
      return answer;
    }

    const expression = trimmed.replace(
      /\^\(([^()]*)\)/g,
      '**($1)'
    );

    if (
      !/^[\d\s()+\-*/  /*%.eE]+$/.test(expression)
    ) {
      return answer;
    }

    const result = Function(
      `"use strict"; return (${expression});`
    )();

    return Number.isFinite(result)
      ? result
      : answer;
  }

  return data.map(answerGroup => {
    if (!Array.isArray(answerGroup)) {
      return [];
    }

    return answerGroup
      .map(answer => {
        if (answer == null || answer === '') {
          return answer;
        }

        if (typeof answer !== 'string') {
          return answer;
        }

        try {
          const replacedAnswer =
            replaceVariables(answer);

          const answerWithSubscripts =
            replaceSubscripts(replacedAnswer);

          const evaluatedAnswer =
            evaluateMath(answerWithSubscripts);

          if (
            evaluatedAnswer == null ||
            Number.isNaN(evaluatedAnswer) ||
            (
              typeof evaluatedAnswer === 'string' &&
              evaluatedAnswer.trim().toLowerCase() === 'nan'
            )
          ) {
            return answer;
          }

          return evaluatedAnswer;
        } catch {
          return answer;
        }
      })
      .filter(answer => {
        if (answer == null) {
          return false;
        }

        return !(
          typeof answer === 'string' &&
          answer.trim().toLowerCase() === 'nan'
        );
      });
  });*/
}



function normalizeForChecking(finalizedAnswers) {
  if (!Array.isArray(finalizedAnswers)) {
    return [];
  }

  return finalizedAnswers.map(answerGroup => {
    if (!Array.isArray(answerGroup)) {
      return [];
    }

    return answerGroup.map(answer =>
    String(answer)
  .toLowerCase()
  .replace(/^[\s\p{P}]+|[\s\p{P}]+$/gu, '')
    );
  });
}



function parseJsonValue(value, fallback = {}) {
  if (value == null) return fallback;

  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  return value;
}

function shuffle(array) {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] = [
      result[j],
      result[i],
    ];
  }

  return result;
}

function randomInteger(min, max) {
  min = Math.ceil(Number(min));
  max = Math.floor(Number(max));

  if (
    !Number.isFinite(min) ||
    !Number.isFinite(max)
  ) {
    return 0;
  }

  if (max < min) {
    [min, max] = [max, min];
  }

  return (
    Math.floor(
      Math.random() * (max - min + 1)
    ) + min
  );
}

function normalizeQuestionCount(value) {
  const count = Number(value);

  if (!Number.isFinite(count) || count < 0) {
    return 0;
  }

  return Math.floor(count);
}

function questionHasTag(question, tagName) {
  return Array.isArray(question.tags)
    ? question.tags.some(
        tag => tag.name === tagName
      )
    : false;
}

function isDynamicQuestion(question) {
  return (
    String(question?.type ?? '').toUpperCase() ===
    'DYNAMIC'
  );
}

function isMultipleChoiceQuestion(question) {
  return (
    String(question?.questionType ?? '').toUpperCase() ===
    'M'
  );
}

function isFillInBlankQuestion(question) {
  return (
    String(question?.questionType ?? '').toUpperCase() ===
    'F'
  );
}

function isNaLike(value) {
  return (
    value == null ||
    value === 'NA' ||
    value?.type === 'NA'
  );
}

function isNanLike(value) {
  if (typeof value === 'number') {
    return Number.isNaN(value);
  }

  return (
    typeof value === 'string' &&
    value.trim().toLowerCase() === 'nan'
  );
}

function selectQuestionsByTag(
  questions,
  questionsPerTag
) {
  const selectedQuestions = [];
  const selectedQuestionIds = new Set();

  for (const [
    tagName,
    requestedValue,
  ] of Object.entries(questionsPerTag)) {
    const matchingQuestions = questions.filter(
      question =>
        questionHasTag(question, tagName)
    );

    if (matchingQuestions.length === 0) {
      continue;
    }

    const requestedCount =
      normalizeQuestionCount(requestedValue);

    const targetCount =
      requestedCount <= 0 ||
      requestedCount > matchingQuestions.length
        ? matchingQuestions.length
        : requestedCount;

    const shuffledMatches =
      shuffle(matchingQuestions);

    const unusedMatches =
      shuffledMatches.filter(
        question =>
          !selectedQuestionIds.has(question.id)
      );

    const previouslySelectedMatches =
      shuffledMatches.filter(question =>
        selectedQuestionIds.has(question.id)
      );

    const tagSelection = unusedMatches.slice(
      0,
      targetCount
    );

    while (tagSelection.length < targetCount) {
      const source =
        previouslySelectedMatches.length > 0
          ? previouslySelectedMatches
          : shuffledMatches;

      if (source.length === 0) {
        break;
      }

      tagSelection.push(
        source[
          (tagSelection.length -
            unusedMatches.length) %
            source.length
        ]
      );
    }

    for (const question of tagSelection) {
      selectedQuestions.push(question);
      selectedQuestionIds.add(question.id);
    }
  }

  return selectedQuestions;
}

function generateVariableSets(
  question,
  numberOfSets
) {
  const varTypes = Array.isArray(question.varTypes)
    ? question.varTypes
    : [];

  const varMins = Array.isArray(question.varMin)
    ? question.varMin
    : [];

  const varMaxs = Array.isArray(question.varMax)
    ? question.varMax
    : [];

  const variableParameters = varTypes.map(
    (type, index) => ({
      type,
      min: Number(varMins[index]),
      max: Number(varMaxs[index]),
    })
  );

  const variableSets = [];
  const usedSignatures = new Set();

  const maxUniqueAttempts = Math.max(
    numberOfSets * 20,
    50
  );

  let attempts = 0;

  function createVariableSet() {
    return variableParameters.map(parameter => {
      switch (parameter.type) {
        case 'NA':
          return {
            type: 'NA',
            value: null,
          };

        case 'Number':
          return {
            type: 'Number',
            num: randomInteger(
              parameter.min,
              parameter.max
            ),
          };

        case 'Element': {
          const minIndex = Math.max(
            0,
            Number(parameter.min) - 1
          );

          const maxIndex = Math.min(
            ELEMENTS.length - 1,
            Number(parameter.max) - 1
          );

          const elementIndex = randomInteger(
            minIndex,
            maxIndex
          );

          return {
            type: 'Element',
            elm: ELEMENTS[elementIndex],
          };
        }
	case 'Compound':{
	  const minIndex = Math.max(
            0,
            Number(parameter.min) - 1
          );

          const maxIndex = Math.min( 
            COMPOUNDS.length - 1,
            Number(parameter.max) - 1
          );

          const elementIndex = randomInteger(
            minIndex,
            maxIndex
          );

          return {
            type: 'Compound',
            com: COMPOUNDS[elementIndex],
          };
	}

        default:
          return {
            type: parameter.type,
          };
      }
    });
  }

  while (
    variableSets.length < numberOfSets &&
    attempts < maxUniqueAttempts
  ) {
    attempts++;

    const variableSet = createVariableSet();
    const signature = JSON.stringify(variableSet);

    if (!usedSignatures.has(signature)) {
      usedSignatures.add(signature);
      variableSets.push(variableSet);
    }
  }

  while (variableSets.length < numberOfSets) {
    variableSets.push(createVariableSet());
  }

  return variableSets;
}

function cleanDynamicAnswerGroups(answerGroups) {
  if (!Array.isArray(answerGroups)) {
    return [];
  }

  return answerGroups.map(answerGroup => {
    if (!Array.isArray(answerGroup)) {
      return answerGroup;
    }

    return answerGroup.filter(answer => {
      return !isNanLike(answer);
    });
  });
}

function cleanDynamicChoices(choices) {
  if (!Array.isArray(choices)) {
    return [];
  }

  return choices.filter(choice => {
    if (choice == null) {
      return false;
    }

    if (typeof choice !== 'object') {
      return !isNanLike(choice);
    }

    return !Object.values(choice).some(
      value => isNanLike(value)
    );
  });
}



const superscriptMap = {
  "-": "⁻",
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹"
};

function toSuperscript(value) {
  return String(value)
    .split("")
    .map(char => superscriptMap[char] ?? char)
    .join("");
}

function formatNumber(value, sigFigures) {
  if(sigFigures == 0) return value;
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return value;
  }

  const scientific = number.toExponential(sigFigures - 1);
  const [coefficient, exponent] = scientific.split("e");
  return `${coefficient}x10${toSuperscript(Number(exponent))}`;
}

function convertNumbers(data, sigFigures) {
  if (sigFigures === 0) {
    return data;
  }

  const numberRegex =
    /[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?/g;

  if (typeof data === "string") {
    return data.replace(numberRegex, match => {
      return formatNumber(match, sigFigures);
    });
  }

  if (Array.isArray(data)) {
    return data.map(item => convertNumbers(item, sigFigures));
  }

  return data;
}




async function processDynamicQuestion({
  question,
  studentId,
}) {

  const sigFigures = question?.sigFigures ?? 0;

  const isMultipleChoice =
    isMultipleChoiceQuestion(question);

  const isFillInBlank =
    isFillInBlankQuestion(question);

  const distractorCount =
    question.distractorCount ?? 3;

  const numberOfVariableSets =
    isMultipleChoice
      ? distractorCount + 1
      : 1;

  const variableSets = generateVariableSets(
    question,
    numberOfVariableSets
  );

  const variables = variableSets[0];

  const brackets = parseBrackets(
    question.content
  );

  const resolutions = resolveAll(brackets);

  const resolvedContent = renderContent(
    question.content,
    brackets,
    variables
  );

  if (isFillInBlank) {
//	JUMP
    const originalAnswers =
      question?.dynFiBAnswers?.data;
    const finalizedAnswers = finalizeAnswers(
      originalAnswers,
      resolutions,
      variables
    );

    const answerGroups =
      Array.isArray(finalizedAnswers)
        ? finalizedAnswers
        : [[String(finalizedAnswers)]];

    const numerics = convertNumbers(answerGroups, sigFigures);
    const cleanedAnswers =
      cleanDynamicAnswerGroups(numerics);
    const choices =
      normalizeForChecking(cleanedAnswers);
    return {
      ...question,
      content: resolvedContent,
      choices,
    };
  }

  if (isMultipleChoice) {
    const correctValue = convertNumbers(evaluateAnswer(
      question.answerExpression,
      resolutions,
      variables
    ), sigFigures);

    const safeCorrectValue = isNanLike(correctValue)
      ? question.answerExpression
      : correctValue;

    const distractors = generateDistractors(
      safeCorrectValue,
      resolutions,
      brackets,
      question.answerExpression,
      distractorCount,
      variableSets
    );

    const dynamicChoices = buildDynamicChoices(
      safeCorrectValue,
      distractors
    );

    const cleanedChoices =
      cleanDynamicChoices(convertNumbers(dynamicChoices, sigFigures));

    await prisma.questionResolution.upsert({
      where: {
        studentId_questionId: {
          studentId,
          questionId: question.id,
        },
      },
      update: {
        resolvedContent,
        choicesJson: JSON.stringify(
          cleanedChoices
        ),
        createdAt: new Date(),
      },
      create: {
        studentId,
        questionId: question.id,
        resolvedContent,
        choicesJson: JSON.stringify(
          cleanedChoices
        ),
      },
    });

    return {
      ...question,
      content: resolvedContent,
      choices: cleanedChoices.map(
        ({ isCorrect, ...choice }) => choice
      ),
    };
  }

  return {
    ...question,
    content: resolvedContent,
    choices: question.choices.map(
      ({ isCorrect, ...choice }) => choice
    ),
  };
}

async function processQuestion({
  question,
  studentId,
}) {
  if (!isDynamicQuestion(question)) {
    return {
      ...question,
      choices: question.choices.map(
        ({ isCorrect, ...choice }) => choice
      ),
    };
  }

  return processDynamicQuestion({
    question,
    studentId,
  });
}

async function getStudentSectionQuestions(req, res) {
  try {
    const { sectionId } = req.params;
    const studentId = req.user.sub;

    const section = await prisma.section.findUnique({
      where: {
        id: sectionId,
      },
    });

    if (!section) {
      return res.status(404).json({
        error: 'Section not found',
      });
    }

    const chapter = await prisma.chapter.findUnique({
      where: {
        id: section.chapterId,
      },
    });

    if (!chapter) {
      return res.status(404).json({
        error: 'Chapter not found',
      });
    }

    const enrollments =
      await prisma.studentEnrollment.findMany({
        where: {
          studentId,
        },
      });

    const courseClassIds = enrollments.map(
      enrollment => enrollment.courseClassId
    );

    const matchingCourseClasses =
      await prisma.courseClass.findMany({
        where: {
          id: {
            in: courseClassIds,
          },
          courseId: chapter.courseId,
        },
      });

    if (matchingCourseClasses.length > 1) {
      return res.status(403).json({
        error: 'Class Search error',
      });
    }

    const enrollment = matchingCourseClasses[0];

    if (!enrollment) {
      return res.status(403).json({
        error: 'Not enrolled in this course',
      });
    }

    const allQuestions =
      await prisma.question.findMany({
        where: {
          id: {
            in: section.questionIds,
          },
        },
        include: {
          choices: true,
          tags: true,
        },
      });

    const questionsPerTag = parseJsonValue(
      section.questionsPerTag,
      {}
    );

    let questions;

    if (
      questionsPerTag &&
      typeof questionsPerTag === 'object' &&
      !Array.isArray(questionsPerTag) &&
      Object.keys(questionsPerTag).length > 0
    ) {
      questions = selectQuestionsByTag(
        allQuestions,
        questionsPerTag
      );
    } else {
      questions = shuffle(allQuestions);
    }

    const processedQuestions =
      await Promise.all(
        questions.map(question =>
          processQuestion({
            question,
            studentId,
          })
        )
      );

    let questionNumber = Number(
      section.questionNumber ?? 0
    );

    if (
      !Number.isFinite(questionNumber) ||
      questionNumber <= 0 ||
      questionNumber >= processedQuestions.length
    ) {
      return res.json(
        shuffle(processedQuestions)
      );
    }

    questionNumber = Math.floor(questionNumber);

    const shuffledQuestions =
      shuffle(processedQuestions);

    const result = shuffledQuestions.slice(
      0,
      questionNumber
    );

    while (
      result.length < questionNumber &&
      processedQuestions.length > 0
    ) {
      result.push(
        processedQuestions[
          result.length %
            processedQuestions.length
        ]
      );
    }

    return res.json(result);
  } catch (error) {
    console.error(
      'Error getting student section questions:',
      error
    );

    return res.status(500).json({
      error: 'Failed to get section questions',
    });
  }
}






/*async function getStudentSectionQuestions(req, res) {
  const { sectionId } = req.params;
  const studentId = req.user.sub;

  const section = await prisma.section.findUnique({ where: { id: sectionId } });
  if (!section) return res.status(404).json({ error: 'Section not found' });

  const chapter = await prisma.chapter.findUnique({ where: { id: section.chapterId } });

   const enrollments = await prisma.studentEnrollment.findMany({
    where: {
      studentId: studentId, // your local var
    },
   });

   const courseClassIds = enrollments.map(e => e.courseClassId);
   const matchingCourseClasses = await prisma.courseClass.findMany({
    where: {
     id: { in: courseClassIds },
     courseId: chapter.courseId, // <-- adjust field name if different
    },
   });

   if(matchingCourseClasses.length > 1) return res.status(403).json({error: 'Class Search error'});
   let enrollment = matchingCourseClasses[0];
   if (!enrollment) return res.status(403).json({ error: 'Not enrolled in this course' });
  const questions = await prisma.question.findMany({
    where: { id: { in: section.questionIds } },
    include: { choices: true },
  });
  const processedQuestions = await Promise.all(questions.map(async (q) => {
    if (q.type !== 'DYNAMIC') {
      return { ...q, choices: q.choices.map(({ isCorrect, ...choice }) => choice) };
    }
    if(q.questionType == "M"){
     const count = q.distractorCount ?? 3;
     let varParms = [];
     let vars = [];
     let usedElements = new Set();
     let usedNumbers = new Set();
     {
      let i = 0;
      while(i < q.varTypes.length){
       varParms.push({type:q.varTypes[i], min:Number(q.varMin[i]), max:Number(q.varMax[i])});
       i++;
      }
      let j=0;
      while(j < count+1){
       let tVars = [];
       i=0;
       while(i < varParms.length){
        switch(varParms[i].type){
        case "NA":{
         tVars.push({type:"NA"});
 	break;
        }
        case "Number":{
         let num = (Math.random() * (varParms[i].max-1 - varParms[i].min-1 + 1)) + varParms[i].min-1;
 	while(usedNumbers.has(num)){
          num = (Math.random() * (varParms[i].max-1 - varParms[i].min-1 + 1)) + varParms[i].min-1;
 	}
 	tVars.push({type: "Number", num: num});
 	usedNumbers.add(num);
 	break;
        }
        case "Element":{
         let elementIndex = Math.floor(Math.random() * (varParms[i].max-1 - varParms[i].min-1 + 1)) + varParms[i].min-1;
 	 while(usedElements.has(ELEMENTS[elementIndex].name)){
 	  elementIndex = Math.floor(Math.random() * (varParms[i].max -1 - varParms[i].min-1 + 1)) + varParms[i].min-1;
 	 }
 	tVars.push({type:"Element", elm: ELEMENTS[elementIndex]});
 	 usedElements.add(ELEMENTS[elementIndex].name);
	 break;
        }
        }
        i++;
       }
       vars.push(tVars);
       j++;
      }
     }
     const brackets = parseBrackets(q.content);
     const resolutions = resolveAll(brackets);
     const resolvedContent = renderContent(q.content, brackets, vars[0]);
     const correctValue = evaluateAnswer(q.answerExpression, resolutions, vars[0]);
     const distractors = generateDistractors(correctValue, resolutions, brackets, q.answerExpression, count, vars);
     const dynamicChoices = buildDynamicChoices(correctValue, distractors);

     await prisma.questionResolution.upsert({
       where: { studentId_questionId: { studentId, questionId: q.id } },
       update: { resolvedContent, choicesJson: JSON.stringify(dynamicChoices), createdAt: new Date() },
       create: { studentId, questionId: q.id, resolvedContent, choicesJson: JSON.stringify(dynamicChoices) },
     });

     return {
       ...q,
       content: resolvedContent,
       choices: dynamicChoices.map(({ isCorrect, ...c }) => c),
     };
   } else {

     let varParms = [];
     let vars = [];
     let usedElements = new Set();
     let usedNumbers = new Set();
     {
      let i = 0;
      while(i < q.varTypes.length){
       varParms.push({type:q.varTypes[i], min:Number(q.varMin[i]), max:Number(q.varMax[i])});
       i++;
      }
      let j=0;
       let tVars = [];
       i=0;
       while(i < varParms.length){
        switch(varParms[i].type){
        case "NA":{
         tVars.push({type:"NA"});
        break;
        }
        case "Number":{
         let num = (Math.random() * (varParms[i].max-1 - varParms[i].min-1 + 1)) + varParms[i].min-1;
        while(usedNumbers.has(num)){
          num = (Math.random() * (varParms[i].max-1 - varParms[i].min-1 + 1)) + varParms[i].min-1;
        }
        tVars.push({type: "Number", num: num});
        usedNumbers.add(num);
        break;
        }
        case "Element":{
         let elementIndex = Math.floor(Math.random() * (varParms[i].max-1 - varParms[i].min-1 + 1)) + varParms[i].min-1;
         while(usedElements.has(ELEMENTS[elementIndex].name)){
          elementIndex = Math.floor(Math.random() * (varParms[i].max -1 - varParms[i].min-1 + 1)) + varParms[i].min-1;
         }
        tVars.push({type:"Element", elm: ELEMENTS[elementIndex]});
         usedElements.add(ELEMENTS[elementIndex].name);
         break;
        }
        }
        i++;
       }
       vars.push(tVars);
     }
     const brackets = parseBrackets(q.content);
     const resolutions = resolveAll(brackets);
     const resolvedContent = renderContent(q.content, brackets, vars[0]);
     const resAnswers = finalizeAnswers(q?.dynFiBAnswers?.data, resolutions, vars[0]);
     return {
       ...q,
       content: resolvedContent,
       choices: resAnswers,
     };

   };
  }));
   
  let qn = section?.questionNumber ?? "0";
  qn = Number(qn);
  if(qn == 0 || qn >= processedQuestions.length){
  for (let i = processedQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [processedQuestions[i], processedQuestions[j]] = [processedQuestions[j], processedQuestions[i]];
  }
  console.log(processedQuestions);
  res.json(processedQuestions);
  }else{
   let qs = [];
   let i = 0;
   while(i < qn){
    let rQ = Math.floor(Math.random() * processedQuestions.length);
    let k = 0;
    let insert = true;
    while(k < qs.length){
     if(qs[k].id == processedQuestions[rQ].id) insert = false;
     k++;
    }
    if(insert){
     qs.push(processedQuestions[rQ]);
     i++;
    }
   }
   res.json(qs);
  }
}*/

async function getStudentCourseChapters(req, res) {
  const { courseId } = req.params;
  const studentId = req.user.sub;

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return res.status(404).json({ error: 'Course not found' });
  const student = await prisma.student.findUnique({
   where: { id: studentId },
  });
 const enrollments = await prisma.studentEnrollment.findMany({
  where: {
     studentId: studentId, // your local var
   },
 });

 const courseClassIds = enrollments.map(e => e.courseClassId);
 const matchingCourseClasses = await prisma.courseClass.findMany({
   where: {
     id: { in: courseClassIds },
     courseId: courseId, // <-- adjust field name if different
   },
 });

 if(matchingCourseClasses.length > 1) return res.status(403).json({error: 'Class Search error'});
 let enrollment = matchingCourseClasses[0];
 if (!enrollment) return res.status(403).json({ error: 'Not enrolled in this course' });

  const chapters = await prisma.chapter.findMany({
    where: { courseId },
    orderBy: { orderIndex: 'asc' },
    include: {
      sections: {
        orderBy: { orderIndex: 'asc' },
        include: { _count: { select: { questions: true } } },
      },
    },
  });

  const sectionIds = chapters.flatMap(ch => ch.sections.map(s => s.id));
  const completions = await prisma.studentSection.findMany({
    where: { studentId, sectionId: { in: sectionIds } },
  });
  const completionMap = new Map(completions.map(c => [c.sectionId, c]));

  res.json(chapters.map(ch => ({
    id: ch.id,
    name: ch.name,
    description: ch.description,
    orderIndex: ch.orderIndex,
    sections: ch.sections.map(sec => {
      const completion = completionMap.get(sec.id);
      return {
        id: sec.id,
        name: sec.name,
        description: sec.description,
        orderIndex: sec.orderIndex,
        questionCount: sec._count.questions,
        completed: !!completion?.completedAt,
        score: completion?.score ?? null,
      };
    }),
  })));
}

async function patchStudentProfile(req, res) {
  const studentId = req.user.sub;
  const { name, profileImage } = req.body;

  if (name !== undefined && (!name || !name.trim())) {
    return res.status(400).json({ error: 'name cannot be blank' });
  }

  const data = {};
  if (name !== undefined) data.name = name.trim();
  if (profileImage !== undefined) data.profileImage = profileImage;

  if (!Object.keys(data).length) {
    return res.status(400).json({ error: 'Provide at least one field to update: name, profileImage' });
  }

  const student = await prisma.student.update({
    where: { id: studentId },
    data,
    omit: { password: true },
  });

  res.json(student);
}

async function getCourseLeaderboard(req, res) {
  const { courseId } = req.params;
  const { sub: userId, role } = req.user;

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return res.status(404).json({ error: 'Course not found' });

  if (role === 'TEACHER') {
    if (course.teacherId !== userId) return res.status(403).json({ error: 'You do not own this course' });
  } else {
    const enrollment = await prisma.studentCourse.findUnique({
      where: { studentId_courseId: { studentId: userId, courseId } },
    });
    if (!enrollment) return res.status(403).json({ error: 'Not enrolled in this course' });
  }

  const entries = await prisma.studentCourse.findMany({
    where: { courseId },
    orderBy: { currentPoints: 'desc' },
    include: { student: { omit: { password: true } } },
  });

  const todayUTC = new Date(new Date().toISOString().slice(0, 10));
  const yesterdayUTC = new Date(todayUTC);
  yesterdayUTC.setUTCDate(yesterdayUTC.getUTCDate() - 1);

  function liveStreak(e) {
    if (!e.lastActivityDate) return 0;
    const lastUTC = new Date(e.lastActivityDate.toISOString().slice(0, 10));
    return lastUTC.getTime() >= yesterdayUTC.getTime() ? e.streak : 0;
  }

  res.json(entries.map((e, i) => ({
    rank: i + 1,
    studentId: e.studentId,
    name: e.student.name,
    currentPoints: e.currentPoints,
    lifetimePoints: e.lifetimePoints,
    streak: liveStreak(e),
    isYou: e.studentId === userId,
  })));
}

async function getStudentBadges(req, res) {
  const studentId = req.user.sub;

  const studentBadges = await prisma.studentBadge.findMany({
    where: { studentId },
    include: { badge: true },
    orderBy: { dateAchieved: 'desc' },
  });

  res.json(studentBadges);
}

async function getCourseClassLeaderboard(req, res) {
  const { courseId, classId } = req.params;
  const { sub: userId, role } = req.user;

  const courseClass = await prisma.courseClass.findUnique({ where: { id: classId } });
  if (!courseClass || courseClass.courseId !== courseId) return res.status(404).json({ error: 'Class not found' });

  if (role === 'TEACHER') {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (course.teacherId !== userId) return res.status(403).json({ error: 'You do not own this course' });
  } else {
    const enrollment = await prisma.studentEnrollment.findUnique({
      where: { studentId_courseClassId: { studentId: userId, courseClassId: classId } },
    });
    if (!enrollment) return res.status(403).json({ error: 'Not enrolled in this class' });
  }

  const entries = await prisma.studentEnrollment.findMany({
    where: { courseClassId: classId },
    orderBy: { currentPoints: 'desc' },
    include: { student: { omit: { password: true } } },
  });

  const todayUTC = new Date(new Date().toISOString().slice(0, 10));
  const yesterdayUTC = new Date(todayUTC);
  yesterdayUTC.setUTCDate(yesterdayUTC.getUTCDate() - 1);

  function liveStreak(e) {
    if (!e.lastActivityDate) return 0;
    const lastUTC = new Date(e.lastActivityDate.toISOString().slice(0, 10));
    return lastUTC.getTime() >= yesterdayUTC.getTime() ? e.streak : 0;
  }

  res.json(entries.map((e, i) => ({
    rank: i + 1,
    studentId: e.studentId,
    name: e.student.name,
    currentPoints: e.currentPoints,
    lifetimePoints: e.lifetimePoints,
    streak: liveStreak(e),
    isYou: e.studentId === userId,
  })));
}

async function getStudentMe(req, res) {
  const studentId = req.user.sub;

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      name: true,
      email: true,
      activeTitle: true,
      weeklyMinuteGoal: true,
      enrollments: {
        select: {
          courseClassId: true,
          streak: true,
          lifetimePoints: true,
          currentPoints: true,
          courseClass: { select: { courseId: true, sectionNumber: true, meetingTimes: true, code: true } },
        },
      },
    },
  });

  if (!student) return res.status(404).json({ error: 'Student not found' });

  const enrollmentsWithRank = await Promise.all(
    student.enrollments.map(async (e) => {
      const ahead = await prisma.studentEnrollment.count({
        where: { courseClassId: e.courseClassId, currentPoints: { gt: e.currentPoints } },
      });
      return { ...e, rank: ahead + 1 };
    })
  );
  res.json({ ...student, enrollments: enrollmentsWithRank });
}

async function setWeeklyGoal(req, res) {
  const studentId = req.user.sub;
  const { weeklyMinuteGoal } = req.body;

  if (!Number.isInteger(weeklyMinuteGoal) || weeklyMinuteGoal < 1) {
    return res.status(400).json({ error: 'weeklyMinuteGoal must be a positive integer' });
  }

  const student = await prisma.student.update({
    where: { id: studentId },
    data: { weeklyMinuteGoal },
    select: { weeklyMinuteGoal: true },
  });

  res.json({ weeklyMinuteGoal: student.weeklyMinuteGoal });
}

module.exports = { getStudentMe, getStudentCourses, getStudentCourseProgress, getStudentSectionQuestions, getStudentCourseChapters, getStudentBadges, getCourseLeaderboard, getCourseClassLeaderboard, patchStudentProfile, setWeeklyGoal };
