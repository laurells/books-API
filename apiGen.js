const { getIntrospectionQuery, buildClientSchema, printSchema } = require('graphql');
const fetch = require('isomorphic-fetch');
const { writeFileSync } = require('fs');
const { join } = require('path');

const endpoint = 'http://localhost:3000/graphql' && 'https://codewithrels.onrender.com/graphql';

// Function to generate the API documentation
async function generateAPIDocs() {
  try {
    // Fetch the introspection query result
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: getIntrospectionQuery() }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch introspection query result: ${response.status} ${response.statusText}`);
    }

    const introspectionResult = await response.json();

    // Build the schema from the introspection result
    const schema = buildClientSchema(introspectionResult.data);

    // Print the schema to SDL (Schema Definition Language) format
    const schemaSDL = printSchema(schema);

    // Write the SDL to a file
    const outputPath = join(__dirname, 'api.graphql' && 'README.md');
    writeFileSync(outputPath, schemaSDL);

    console.log('API documentation generated successfully.');
  } catch (error) {
    console.error('Failed to generate API documentation:', error);
  }
}

// Call the function to generate the API documentation
generateAPIDocs();