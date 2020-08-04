const path = require("path");
const fs = require("fs");

// Based on https://github.com/CMU-Perceptual-Computing-Lab/openpose/blob/master/doc/output.md#keypoint-ordering-in-cpython
// To use this, multiply the index of a body part by 3 as values in pose_keypoints_2d are as follows [x-coordinate, y-coordinate, confidence.....] for each body part from the mapping
const bodyMapping = [
  "Nose",
  "Neck",
  "RShoulder",
  "RElbow",
  "RWrist",
  "LShoulder",
  "LElbow",
  "LWrist",
  "MidHip",
  "RHip",
  "RKnee",
  "RAnkle",
  "LHip",
  "LKnee",
  "LAnkle",
  "REye",
  "LEye",
  "REar",
  "LEar",
  "LBigToe",
  "LSmallToe",
  "LHeel",
  "RBigToe",
  "RSmallToe",
  "RHeel",
  "Background",
];

const keypointDirName = "side_part_candidates"; // All keypoints for a video must be saved in a directory named this
const bodyPart = "LWrist"; // Body part to analyse

// Loops through all files, reads the JSON in and saves it into a map
const setupFilesMap = async () => {
  const allFiles = [];
  const filesMap = {};
  await new Promise((resolve) => {
    fs.readdir(keypointDirName, (err, files) => {
      files.forEach((file) => {
        allFiles.push(file);
        const filename = file.substr(0, file.indexOf("."));
        filesMap[filename] = JSON.parse(
          fs.readFileSync(path.join(keypointDirName, file), "utf-8")
        );
      });
      resolve();
    });
  });
  // Logging all keypoints from all files for "MidHip"
  console.log(`\n\nBody Part: ${bodyPart}`);
  // console.table(getAllKeypointsByBodyPart(filesMap, bodyPart));
  const leftShoulderKeypoints = getAllKeypointsByBodyPart(
    filesMap,
    "LShoulder"
  );
  const rightShoulderKeypoints = getAllKeypointsByBodyPart(
    filesMap,
    "RShoulder"
  );
  const leftFootKeypoints = getAllKeypointsByBodyPart(filesMap, "LAnkle");
  const rightFootKeypoints = getAllKeypointsByBodyPart(filesMap, "RAnkle");
  getKeypointsDistanceDifference(leftShoulderKeypoints, rightShoulderKeypoints);
  getKeypointsDistanceDifference(leftFootKeypoints, rightFootKeypoints);
  // console.table(leftShoulderKeypoints);
  // console.table(rightShoulderKeypoints);
  // console.table(leftFootKeypoints);
  // console.table(rightFootKeypoints);
  return "done";
};

const getAllKeypointsByBodyPart = (filesMap, bodyPart) => {
  const index = bodyMapping.indexOf(bodyPart) * 3;
  return Object.values(filesMap).map((fileValues, i) => {
    return {
      x: fileValues.people[0].pose_keypoints_2d[index],
      y: fileValues.people[0].pose_keypoints_2d[index + 1],
      confidence: fileValues.people[0].pose_keypoints_2d[index + 2],
    };
    // return fileValues.people[0].pose_keypoints_2d.slice(index, index + 3);
  });
};

const getKeypointsDistanceDifference = (leftKeypoints, rightKeypoints) => {
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
  console.table(values);
  return values;
};

setupFilesMap()
  .then((res) => console.log("done with response", res))
  .catch((err) => console.log("An error occurred", err));
