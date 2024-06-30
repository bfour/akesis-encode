const fs = require('fs');
require('dotenv').config();
// import { writeFile } from 'fs'; if you are using a typescript file

const environmentFile = `
  AWS_KEY=${process.env.AWS_KEY ?? ''}
  AWS_SECRET=${process.env.AWS_SECRET ?? ''}
  AWS_REGION=${process.env.AWS_REGION ?? ''}
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
