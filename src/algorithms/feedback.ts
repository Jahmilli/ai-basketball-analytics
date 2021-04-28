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
    return avgMultiAxis < multiAxisThreshold
      ? "Good feet and shoulder alignment and distancing"
      : "Shoulder and feet alignment was too far apart. Bring feet in to a little less than shoulder width";
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
    return avgSingleAxis < singleAxisThreshold
      ? "Good alignment down the shooting arm between elbow, hip and knee"
      : "Shooting side alignment was too spread. Bring the elbow and knee in line, facing toward the basket";
  };
  
  export const getFeedbackCosine = (cosineResult: any) => {
    let avgAngle = 0;
    // console.log('rightWristKeypoints', rightWristKeypoints);
    for (const index in cosineResult) {
      avgAngle += cosineResult[index];
    }
    avgAngle = avgAngle / cosineResult.length;
    console.log("Average Angle at elbow is: ", avgAngle);
    return avgAngle > cosineThreshold
      ? "Good extension that was held up for a good duration"
      : "Shooting arm was not fully extended and/or was not held toward basket for long enough. Fully extend arm towards the basket on follow through and hold it until ball reaches the basket";
  };