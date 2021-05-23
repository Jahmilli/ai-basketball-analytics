import {
  multiAxisThreshold,
  singleAxisThreshold,
  cosineThreshold,
} from "./algorithms";

export const getFeedbackMultiAxis = (multiAxisResult: any) => {
  let avgMultiAxis = 0;
  // console.log('rightWristKeypoints', rightWristKeypoints);
  for (const index in multiAxisResult) {
    avgMultiAxis += multiAxisResult[index].values;
  }
  avgMultiAxis = avgMultiAxis / multiAxisResult.length;
  console.log(
    "Average alignment distance between feet and shoulders is: ",
    avgMultiAxis
  );

  switch(true){
    case (avgMultiAxis <= 100):
      return "Perfect feet & shoulder alignment and distancing";
    case (avgMultiAxis <= 300):
      return "Great feet & shoulder alignment, can be improved slightly";
    case (avgMultiAxis <= 700):
      return "Okay feet & shoulder alignment, can be improved";
    case(avgMultiAxis <= 1300):
      return "Bad feet & shoulder alignment. Shoulder and feet alignment was too far apart; aim for feet to be a little less than shoulder width";
    default:
      return "Keep trying! Focus on your shoulder and feet alignmnet prior to the shot, aiming for feet to be a little less than shoulder width"
  }
};

export const getFeedbackSingleAxis = (singleAxisResult: any) => {
  let avgSingleAxis = 0;
  // console.log('rightWristKeypoints', rightWristKeypoints);
  for (const index in singleAxisResult) {
    avgSingleAxis += singleAxisResult[index].values;
  }
  avgSingleAxis = avgSingleAxis / singleAxisResult.length;
  console.log(
    "Average axis alignment of shooting elbow, hip and knee is: ",
    avgSingleAxis
  );
  
  switch(true){
    case (avgSingleAxis <= 100):
      return "Perfect alignment down your shooting arm and base with your elbow, knee & hip aligned towards the basket";
    case (avgSingleAxis <= 300):
      return "Great alignment down your shooting arm and base with your elbow, knee & hip aligned towards the basket; can be improved slightly";
    case (avgSingleAxis <= 700):
      return "Okay alignment down your shooting arm and base with your elbow, knee & hip aligned towards the basket; can be improved";
    case(avgSingleAxis <= 1300):
      return "Bad alignment down your shooting arm and base with your elbow, knee & hip NOT aligned towards the basket. Bring the elbow & knee in line with the shooting hip to be directly facing the hoop";
    default:
      return "Keep trying! Focus on the alignment of your shooting arm keeping your elbow tucked in line with your knee and hip all facing towards the hoop"
  }
};

export const getFeedbackCosine = (cosineResult: any) => {
  let avgAngle = 0;
  for (const index in cosineResult) {
    avgAngle += cosineResult[index];
  }
  avgAngle = avgAngle / cosineResult.length;
  console.log("Average Angle at elbow is: ", avgAngle);

  switch(true){
    case (avgAngle >= 165):
      return "Perfct follow through"
    case (avgAngle >= 160):
      return "Good follow through; can be improved slightly";
    case (avgAngle >= 130):
      return "Okay follow through; can be improved";
    case (avgAngle >= 100):
      return "Bad follow through; Fully extend your arm towards the basket on your follow through and hold it until ball reaches the basket";
    default:
      return "Keep trying! Focus on your arm extension and ball release with your arm being fully extended towards the basket on your follow through and hold it until ball reaches the basket";
  };
}
