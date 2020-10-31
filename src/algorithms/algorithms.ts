interface IKeypoint {
  x: number;
  y: number;
}
interface IVector {
  u: number;
  v: number;
}
interface IResults {
  ELWLResults: number[];
  ElSLResults: number[];
}

// Bens stuff
const multiAxisThreshold = 20;
const singleAxisThreshold = 25;
const cosineThreshold = -0.9659258262890682867497431997289;

//Find index of Max hip value
const getEIndex = (midHipKeypoints: any) => {
  let eIndex = 0;
  // console.log('midHipKeypoints', midHipKeypoints);
  for (let x = 0; x < midHipKeypoints.length; x++) {
    //console.log('mid hip' + x + ' ', midHipKeypoints[x].y);
    if (midHipKeypoints[x].y > midHipKeypoints[eIndex].y)
      eIndex = x;
  }
  console.log('e index is', eIndex);
  return eIndex;
};

//Find index of Min wrist value
const getFIndex = (rightWristKeypoints: any, eIndex: number) => {
  let fIndex = eIndex;
  // console.log('rightWristKeypoints', rightWristKeypoints);
  for (let x = eIndex; x < rightWristKeypoints.length; x++) {
    if (rightWristKeypoints[x].y < rightWristKeypoints[fIndex].y)
      fIndex = x;
  }
  console.log('f index is', fIndex);
  return fIndex;
};

//Returns the differences between DSLSR & DFLFR
//Difference Shoulder left Shoulder right & Difference Foot left Foot Right
const getAllDifferences = (
  eIndex: number,
  shoulderResult: any,
  footResult: any
) => {
  const values = [];
  const isGreaterThan0 = eIndex - 10;
  for (let x = isGreaterThan0 ? eIndex - 10 : 0; x < eIndex; x++) {
    values.push(Math.abs(shoulderResult[x] - footResult[x]));
  }

  //const index = bodyMapping.indexOf(bodyPart) * 3;
  return Object.values(values).map((values, i) => {
    return {
      values: values,
    };
    // return fileValues.people[0].pose_keypoints_2d.slice(index, index + 3);
  });
};

//Returns the total difference in right side axis alignment
//DEH + DSH + DKH = minimum distance to axis D
//Distance Elbow Hip + Distance Shoulder Hip + Distance Knee Hip
// const getAllDifferencesSingle = (
//   elbowHipResult: any,
//   shoulderHipResult: any,
//   kneeHipResult: any
// ) => {
//   const values = [];
//   for (let x = eIndex; x < fIndex; x++) {
//     values.push(elbowHipResult[x] + shoulderHipResult[x] + kneeHipResult[x]);
//   }

//   //const index = bodyMapping.indexOf(bodyPart) * 3;
//   return Object.values(values).map((values, i) => {
//     return {
//       values: values,
//     };
//     // return fileValues.people[0].pose_keypoints_2d.slice(index, index + 3);
//   });
// };

//Returns the total difference in right side axis alignment
//DEH + DKH = minimum distance to axis D
//Distance Elbow Hip +  Distance Knee Hip
const getAllDifferencesSingleAlt = (
  eIndex: number,
  fIndex: number,
  elbowHipResult: any,
  kneeHipResult: any
) => {
  const values = [];
  for (let x = eIndex; x < fIndex; x++) {
    values.push(elbowHipResult[x] + kneeHipResult[x]);
  }

  //const index = bodyMapping.indexOf(bodyPart) * 3;
  return Object.values(values).map((values, i) => {
    return {
      values: values,
    };
    // return fileValues.people[0].pose_keypoints_2d.slice(index, index + 3);
  });
};

/*
    leftShoulderKeypoints,
    leftFootKeypoints,
    leftElbowKeypoints,
    leftHipKeypoints,
    leftKneeKeypoints,
    leftWristKeypoints,
    rightShoulderKeypoints,
    rightFootKeypoints,
    rightElbowKeypoints,
    rightHipKeypoints,
    rightKneeKeypoints,
    rightWristKeypoints
*/
// old stuff
export const callStuff = (keypoints: any) => {
  let eIndex = getEIndex(keypoints.midHipKeypoints);
  let fIndex = getFIndex(keypoints.rightWristKeypoints, eIndex);

  const shoulderResult = getMultiAxisAlignment(
    keypoints.leftShoulderKeypoints,
    keypoints.rightShoulderKeypoints
  ); // (1)
  const footResult = getMultiAxisAlignment(
    keypoints.leftFootKeypoints,
    keypoints.rightFootKeypoints
  ); // (2)
  const multiAxisResult = getAllDifferences(eIndex, shoulderResult, footResult);
  console.log("multiaxis result", multiAxisResult);

  const valuesElbowHip = getSingleAxisAlignment(
    keypoints.rightElbowKeypoints,
    keypoints.rightHipKeypoints
  ); // (3)
  const valuesKneeHip = getSingleAxisAlignment(
    keypoints.rightKneeKeypoints,
    keypoints.rightHipKeypoints
  ); // (4)
  //Only used for extra alignment analysis but no necessary
  //const valuesShoulderHip = getSingleAxisAlignment(keypoints.rightShoulderKeypoints, keypoints.rightHipKeypoints); // (5)
  //const valuesFootHip = getSingleAxisAlignment(keypoints.rightFootKeypoints, keypoints.rightHipKeypoints); // (5)
  const singleAxisResult = getAllDifferencesSingleAlt(
    eIndex,
    fIndex,
    valuesElbowHip,
    valuesKneeHip
  );
  console.log("singleAxis result", singleAxisResult);

  const vector1 = getVectors(
    fIndex,
    keypoints.rightWristKeypoints,
    keypoints.rightElbowKeypoints
  ); // (6)
  const vector2 = getVectors(
    fIndex,
    keypoints.rightShoulderKeypoints,
    keypoints.rightElbowKeypoints
  ); // (7)

  const dotProductResult = getDotProduct(vector1, vector2); // (8)
  const roots = getVectorRoots(vector1, vector2); // (9, 10)
  const cosResult = getCosine(dotProductResult, roots); // (11)
  console.table(cosResult);
};

// Based on algorithm from "Alignment Between Feet & Shoulder"
export const getMultiAxisAlignment = (
  leftKeypoints: IKeypoint[],
  rightKeypoints: IKeypoint[]
) => {
  if (leftKeypoints.length !== rightKeypoints.length) {
    console.warn(
      `Left keypoints (${leftKeypoints.length}) is different to right keypoints (${rightKeypoints.length})`
    );
    throw new Error("Varied lengths");
  }

  const values = [];
  for (const index in leftKeypoints) {
    const xVal = leftKeypoints[index].x - rightKeypoints[index].x;
    const yVal = leftKeypoints[index].y - rightKeypoints[index].y;
    const result = Math.sqrt(Math.pow(xVal, 2) + Math.pow(yVal, 2));
    values.push(result);
  }
  return values;
};

export const getSingleAxisAlignment = (
  leftKeypoints: IKeypoint[],
  rightKeypoints: IKeypoint[]
) => {
  if (leftKeypoints.length !== rightKeypoints.length) {
    console.warn(
      `Left keypoints (${leftKeypoints.length}) is different to right keypoints (${rightKeypoints.length})`
    );
    throw new Error("Varied lengths");
  }

  const values = [];
  for (const index in leftKeypoints) {
    const lKeypoint = leftKeypoints[index].x;
    const rKeypoint = rightKeypoints[index].x;

    // Do we need to do sqrt of pow??????? O.o
    const result = Math.sqrt(Math.pow(lKeypoint - rKeypoint, 2));
    values.push(result);
  }
  // console.table(values);
  return values;
};

export const getVectors = (
  fIndex: number,
  leftKeypoints: IKeypoint[],
  rightKeypoints: IKeypoint[]
): IVector[] => {
  if (leftKeypoints.length !== rightKeypoints.length) {
    console.warn(
      `Left keypoints (${leftKeypoints.length}) is different to right keypoints (${rightKeypoints.length})`
    );
    throw new Error("Varied lengths");
  }

  const values = [];
  const isGreaterThanMax = fIndex + 20 < leftKeypoints.length - 1;
  const loopTo = isGreaterThanMax ? fIndex + 20 : leftKeypoints.length-1;
  // console.log('isGreaterThanMax is', isGreaterThanMax);
  // console.log('loopToo', loopTo);
  for (
    let i = fIndex;
    i < loopTo;
    i++
  ) {
    const u = leftKeypoints[i].y - rightKeypoints[i].y;
    const v = leftKeypoints[i].x - rightKeypoints[i].x; // This should be Z axis...
    values.push({ u, v });
  }
  // console.table(values);
  return values;
};

export const getDotProduct = (
  vector1: IVector[],
  vector2: IVector[]
): number[] => {
  if (Object.keys(vector1).length !== Object.keys(vector2).length) {
    console.warn(
      `Vector 1 keypoints (${
        Object.keys(vector1).length
      }) is different to Vector 2 keypoints (${Object.keys(vector2).length})`
    );
    throw new Error("Varied lengths");
  }

  const values = [];
  for (const index in vector1) {
    const result =
      vector1[index].u * vector2[index].u + vector1[index].v * vector2[index].v;
    values.push(result);
  }
  return values;
};

export const getVectorRoots = (
  vector1: IVector[],
  vector2: IVector[]
): IResults => {
  if (Object.keys(vector1).length !== Object.keys(vector2).length) {
    console.warn(
      `Vector 1 keypoints (${
        Object.keys(vector1).length
      }) is different to Vector 2 keypoints (${Object.keys(vector2).length})`
    );
    throw new Error("Varied lengths");
  }

  const values1 = []; // For (9)
  const values2 = []; // For 10
  for (const index in vector1) {
    const u1 = vector1[index].u;
    const u2 = vector2[index].u;
    const v1 = vector1[index].v;
    const v2 = vector2[index].v;

    const result1 = Math.sqrt(Math.pow(u1, 2) + Math.pow(v1, 2));
    const result2 = Math.sqrt(Math.pow(u2, 2) + Math.pow(v2, 2));
    values1.push(result1);
    values2.push(result2);
  }
  return {
    ELWLResults: values1,
    ElSLResults: values2,
  };
};

export const getCosine = (
  dotProductResultsArr: number[],
  vectorRootsArr: IResults
) => {
  if (dotProductResultsArr.length !== vectorRootsArr.ELWLResults.length) {
    console.warn(
      `Dot Product Results Arr (${dotProductResultsArr.length}) is different to vectorRootsArr (${vectorRootsArr.ELWLResults.length})`
    );
    throw new Error("Varied lengths");
  }
  const results = [];
  for (const index in dotProductResultsArr) {
    results.push(
      dotProductResultsArr[index] /
        (vectorRootsArr.ELWLResults[index] * vectorRootsArr.ElSLResults[index])
    );
  }
  return results;
};
