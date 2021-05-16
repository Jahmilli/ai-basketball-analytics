module.exports = {
  api: {
    port: 3003,
  },
  database: {
    type: "postgres",
    // Would be more ideal to pass this in as config per env but seeing as there's no proper CI and env config this is okay.
    // Also only accessible from within the VPC from a specific SG so it's safe...
    host: "ai-basketball.cwlop5aflogk.ap-southeast-2.rds.amazonaws.com",
    port: 5432,
  }
};
