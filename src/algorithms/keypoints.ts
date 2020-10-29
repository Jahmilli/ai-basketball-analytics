import path from "path";
import fs from "fs";
import { formatError } from "../utils/Logging";
import {
  getMultiAxisAlignment,
  getSingleAxisAlignment,
  getVectors,
  getDotProduct,
  getVectorRoots,
  getCosine,
} from "./algorithms";

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
  const filesMap: { [key: string]: any } = {};
  await new Promise((resolve, reject) => {
    fs.readdir(keypointDirName, (err, files) => {
      if (err) {
        console.warn(`An error occurred when reading directory ${formatError(err)}`);
        return reject(err);
      }
      files.forEach((file) => {
        allFiles.push(file);
        const filename = file.substr(0, file.indexOf("."));
        filesMap[filename] = JSON.parse(
          fs.readFileSync(path.join(keypointDirName, file), "utf-8")
        );
      });
      resolve(true);
    });
  });
  // Logging all keypoints from all files for "MidHip"
  console.log(`\n\nBody Part: ${bodyPart}`);
  // console.table(getAllKeypointsByBodyPart(filesMap, bodyPart));

  // Left
  const leftShoulderKeypoints = getAllKeypointsByBodyPart(
    filesMap,
    "LShoulder"
  );
  const leftFootKeypoints = getAllKeypointsByBodyPart(filesMap, "LAnkle");
  const leftElbowKeypoints = getAllKeypointsByBodyPart(filesMap, "LElbow");
  const leftHipKeypoints = getAllKeypointsByBodyPart(filesMap, "LHip");
  const leftKneeKeypoints = getAllKeypointsByBodyPart(filesMap, "LKnee");
  const leftWristKeypoints = getAllKeypointsByBodyPart(filesMap, "LWrist");
  // Right
  const rightFootKeypoints = getAllKeypointsByBodyPart(filesMap, "RAnkle");
  const rightShoulderKeypoints = getAllKeypointsByBodyPart(
    filesMap,
    "RShoulder"
  );

  getMultiAxisAlignment(leftShoulderKeypoints, rightShoulderKeypoints); // (1)
  getMultiAxisAlignment(leftFootKeypoints, rightFootKeypoints); // (2)

  getSingleAxisAlignment(leftElbowKeypoints, leftHipKeypoints); // (3)
  getSingleAxisAlignment(leftShoulderKeypoints, leftHipKeypoints); // (4)
  getSingleAxisAlignment(leftKneeKeypoints, leftHipKeypoints); // (5)

  const vector1 = getVectors(leftWristKeypoints, leftElbowKeypoints); // (6)
  const vector2 = getVectors(leftShoulderKeypoints, leftElbowKeypoints); // (7)

  const dotProductResult = getDotProduct(vector1, vector2); // (8)
  const roots = getVectorRoots(vector1, vector2); // (9, 10)
  const cosResult = getCosine(dotProductResult, roots); // (11)
  console.table(cosResult);

  return "done";
};

const getAllKeypointsByBodyPart = (filesMap: {[key: string]: any}, bodyPart: string) => {
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

setupFilesMap()
  .then((res) => console.log("done with response", res))
  .catch((err) => console.log("An error occurred", err));
