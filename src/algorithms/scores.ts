import {
  IScores,
  multiAxisThreshold,
  singleAxisThreshold,
  cosineThreshold,
} from "./algorithms";
export const getScoreAvg = (score: any) => {
  let avgScore = 0;
  for (const index in score) {
    avgScore += score[index].values;
  }
  avgScore = avgScore / score.length;

  return avgScore;
};

export const calculateScore = (scores: IScores) => {
  const multiScore = Math.abs(scores.multiAxisScore - multiAxisThreshold);
  const singleScore = Math.abs(scores.singleAxisScore - singleAxisThreshold);
  const cosineScore = Math.abs(scores.multiAxisScore - cosineThreshold);
  return {
    multiScore,
    singleScore,
    cosineScore,
  };
};
