const fs = require('fs');
require('dotenv').config();
// import { writeFile } from 'fs'; if you are using a typescript file

const environmentFile = `
  OPEN_AI_ORG_ID=${process.env.OPEN_AI_ORG_ID ?? ''}
  OPEN_AI_PROJECT_ID=${process.env.OPEN_AI_PROJECT_ID ?? ''}
  OPEN_AI_API_KEY=${process.env.OPEN_AI_API_KEY ?? ''}
`;

// Generate environment.ts file
fs.writeFile('.env', environmentFile, function (err) {
  if (err) {
    throw console.error(err);
  } else {
    console.log('environment file generated');
  }
});


/*
Run npm node set-env.js (or npm ts-node set-env.ts) to generate your file
*/
