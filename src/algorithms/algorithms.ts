interface IKeypoint {
  x: number;
  y: number;
}
interface IVector {
  u: number;
  v: number;
}
interface IResults {
  ELWLResults: number[],
  ElSLResults: number[],
}

// Based on algorithm from "Alignment Between Feet & Shoulder"
export const getMultiAxisAlignment = (leftKeypoints: IKeypoint[], rightKeypoints: IKeypoint[]) => {
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

export const getSingleAxisAlignment = (leftKeypoints: IKeypoint[], rightKeypoints: IKeypoint[]) => {
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

export const getVectors = (leftKeypoints: IKeypoint[], rightKeypoints: IKeypoint[]): IVector[] => {
  if (leftKeypoints.length !== rightKeypoints.length) {
    console.warn(
      `Left keypoints (${leftKeypoints.length}) is different to right keypoints (${rightKeypoints.length})`
    );
    throw new Error("Varied lengths");
  }

  const values = [];
  for (const index in leftKeypoints) {
    const u = leftKeypoints[index].y - rightKeypoints[index].y;
    const v = leftKeypoints[index].x - rightKeypoints[index].x; // This should be Z axis...
    values.push({ u, v });
  }
  // console.table(values);
  return values;
};

export const getDotProduct = (vector1: IVector[], vector2: IVector[]): number[] => {
  if (Object.keys(vector1).length !== Object.keys(vector2).length) {
    console.warn(
      `Vector 1 keypoints (${Object.keys(vector1).length
      }) is different to Vector 2 keypoints (${Object.keys(vector2).length})`
    );
    throw new Error("Varied lengths");
  }

  const values = [];
  for (const index in vector1) {
    const result =
      vector1[index].u * vector1[index].v + vector2[index].u * vector2[index].v;
    values.push(result);
  }
  return values;
};

export const getVectorRoots = (vector1: IVector[], vector2: IVector[]): IResults => {
  if (Object.keys(vector1).length !== Object.keys(vector2).length) {
    console.warn(
      `Vector 1 keypoints (${Object.keys(vector1).length
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

export const getCosine = (dotProductResultsArr: number[], vectorRootsArr: IResults) => {
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

// module.exports = {
//   getMultiAxisAlignment,
//   getSingleAxisAlignment,
//   getVectors,
//   getDotProduct,
//   getVectorRoots,
//   getCosine,
// };
