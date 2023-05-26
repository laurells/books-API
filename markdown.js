const MarkdownIt = require('markdown-it');
const fs = require('fs').promises;
const path = require('path');

module.exports = async (schema, documents, ) => {
  const md = new MarkdownIt();

  const content = `
# API Documentation

## Types

${md.render(renderTypes(schema))}

## Queries

${md.render(renderQueries(schema, documents))}

## Mutations

${md.render(renderMutations(schema, documents))}
`;

const resolvedOutputFile = path.resolve(__dirname, '../README.md'); // Resolve the output file path

  await writeFile(resolvedOutputFile, content);
};

function renderTypes(schema) {
  const types = schema.getTypeMap();
  let typesContent = '';

  Object.values(types).forEach((type) => {
    // Skip introspection types
    if (type.name.startsWith('__')) return;

    typesContent += `### ${type.name}\n\n`;
    typesContent += 'Fields:\n\n';

    Object.values(type.getFields()).forEach((field) => {
      typesContent += `- **${field.name}**: ${field.type}\n`;
    });

    typesContent += '\n';
  });

  return typesContent;
}

function renderQueries(schema, documents) {
  const queries = documents.filter((doc) => doc.kind === 'OperationDefinition' && doc.operation === 'query');
  let queriesContent = '';

  queries.forEach((query) => {
    queriesContent += `### ${query.name.value}\n\n`;

    if (query.variableDefinitions && query.variableDefinitions.length > 0) {
      queriesContent += 'Variables:\n\n';

      query.variableDefinitions.forEach((variable) => {
        queriesContent += `- **${variable.variable.name.value}**: ${variable.type}\n`;
      });

      queriesContent += '\n';
    }

    queriesContent += 'Fields:\n\n';

    query.selectionSet.selections.forEach((selection) => {
      queriesContent += `- ${selection.name.value}\n`;
    });

    queriesContent += '\n';
  });

  return queriesContent;
}

function renderMutations(schema, documents) {
  const mutations = documents.filter((doc) => doc.kind === 'OperationDefinition' && doc.operation === 'mutation');
  let mutationsContent = '';

  mutations.forEach((mutation) => {
    mutationsContent += `### ${mutation.name.value}\n\n`;

    if (mutation.variableDefinitions && mutation.variableDefinitions.length > 0) {
      mutationsContent += 'Variables:\n\n';

      mutation.variableDefinitions.forEach((variable) => {
        mutationsContent += `- **${variable.variable.name.value}**: ${variable.type}\n`;
      });

      mutationsContent += '\n';
    }

    mutationsContent += 'Fields:\n\n';

    mutation.selectionSet.selections.forEach((selection) => {
      mutationsContent += `- ${selection.name.value}\n`;
    });

    mutationsContent += '\n';
  });

  return mutationsContent;
}

async function writeFile(path, content) {
    try {
      await fs.writeFile(path, content);
      console.log('File written successfully.');
    } catch (error) {
      console.error('Error writing file:', error);
      throw new Error('Failed to write file.');
    }
  }
