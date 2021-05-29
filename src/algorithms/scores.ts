import {
  IScores,
  multiAxisThreshold,
  singleAxisThreshold,
  cosineThreshold,
} from "./algorithms";
import {Result} from "../entity/Results"
export const getScoreAvg = (score: any) => {
  let avgScore = 0;
  for (const index in score) {
    avgScore += score[index].values;
  }
  avgScore = avgScore / score.length;

  return avgScore;
};

export const calculateScore = (scores: IScores, userId: string) : Result => {
  const result = new Result();
  const multiScore = Math.abs(scores.multiAxisScore - multiAxisThreshold);
  const singleScore = Math.abs(scores.singleAxisScore - singleAxisThreshold);
  const cosineScore = Math.abs(scores.multiAxisScore - cosineThreshold);
  result.user_id = userId;
  result.score_prep = multiScore.toString();
  result.score_exec = singleScore.toString();
  result.score_follow = cosineScore.toString();
  return result;
};
