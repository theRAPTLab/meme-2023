/*//////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  Unit YAML Validation Module

  Uses AJV (Another JSON Schema Validator) to validate unit YAML data
  structure. Defines discrete schemas for different unit components:
  - resources: PDF/media resources
  - ratings: Rating scale definitions
  - commentTypes: Comment prompts and formats
  - criteria: Evaluation criteria

  Units are defined in the /units directory, each in its own subdirectory
  with a YAML file(s).  Resources (e.g. PDFs) are stored in a subfolder
  within the unit directory.

  Example unit structure:
      units/
        unit1/
          unit1.yaml
          resources/
            evidence.pdf
            evidence.html
        unit2/
          unit2.yaml
          resources/
            evidence.pdf

  Multiple YAML files can be used in a unit directory to separate concerns,
  e.g. unit1.yaml, resources.yaml, ratings.yaml, commentTypes.yaml
  All YAML files are merged together when loading a unit, with later files
  overriding earlier ones in case of conflicts.  For example, if you want
  to use the same commentTypes in multiple units, you could create a
  shared commentTypes.yaml file and include it in each unit directory.

  Example unit structure:
      units/
        algae/
          library.yaml
          ecosystemCommentTypes.yaml
          resources/
            evidence.pdf
            evidence.html
        fish/
          fishresources.yaml
          ecosystemCommentTypes.yaml
          resources/
            evidence.pdf

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * //////////////////////////////////////*/

const Ajv = require('ajv');

/// CONSTANTS /////////////////////////////////////////////////////////////////
///	- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const PROMPTS = require('./util/prompts');
const { CCRIT: CC, CR } = PROMPTS;

const ajv = new Ajv({ allErrors: true, strict: false });

/// SCHEMA DEFINITIONS ////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const resourceSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer', minimum: 1 },
    label: { type: 'string', minLength: 1 },
    notes: { type: 'string' },
    type: {
      type: 'string',
      enum: ['simulation', 'assumption', 'idea', 'report', 'question', 'other']
    },
    url: { type: 'string', minLength: 1 }
  },
  required: ['id', 'label', 'type', 'url'],
  additionalProperties: false
};

const ratingSchema = {
  type: 'object',
  properties: {
    label: { type: 'string', minLength: 1 },
    rating: { type: 'integer' },
    svgdefKey: { type: 'string', minLength: 1 }
  },
  required: ['label', 'rating', 'svgdefKey'],
  additionalProperties: false
};

const promptSchema = {
  type: 'object',
  properties: {
    format: {
      type: 'string',
      enum: ['text', 'dropdown', 'checkbox', 'radio', 'likert', 'discrete-slider']
    },
    prompt: { type: 'string', minLength: 1 },
    help: { type: 'string' },
    helpIgnore: { type: 'string' },
    feedback: { type: 'string' },
    options: {
      type: 'array',
      items: { type: 'string' },
      minItems: 1
    }
  },
  required: ['format', 'prompt'],
  additionalProperties: false
};

const commentTypeSchema = {
  type: 'object',
  properties: {
    slug: { type: 'string', pattern: '^[a-z][a-z0-9_]*$' },
    label: { type: 'string', minLength: 1 },
    prompts: {
      type: 'array',
      items: promptSchema,
      minItems: 1
    }
  },
  required: ['slug', 'label', 'prompts'],
  additionalProperties: false
};

const unitSchema = {
  type: 'object',
  properties: {
    label: { type: 'string', minLength: 1 },
    resources: {
      type: 'array',
      items: resourceSchema
    },
    ratings: {
      type: 'array',
      items: ratingSchema
    },
    commentTypes: {
      type: 'array',
      items: commentTypeSchema
    },
    preferences: {
      type: 'object',
      additionalProperties: true
    }
  },
  required: ['label'],
  additionalProperties: false
};

/// COMPILE VALIDATORS ////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const validateResource = ajv.compile(resourceSchema);
const validateRating = ajv.compile(ratingSchema);
const validateCommentType = ajv.compile(commentTypeSchema);
const validateUnit = ajv.compile(unitSchema);

/// API MODULE ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const VALIDATION = {};

VALIDATION.ValidateUnit = function (unitData, unitId = 'unknown') {
  const isValid = validateUnit(unitData);

  if (!isValid) {
    const errors = validateUnit.errors
      .map(err => {
        const field = err.instancePath
          ? err.instancePath.substring(1)
          : err.schemaPath;
        return `${field}: ${err.message}`;
      })
      .join('\n');
    throw new Error(`${CC}${errors}${CR}`);
  }

  // Additional validation for individual arrays
  if (unitData.resources) {
    unitData.resources.forEach((resource, index) => {
      const valid = validateResource(resource);
      if (!valid) {
        const errors = validateResource.errors
          .map(
            err =>
              `resource[${index}].${err.instancePath.substring(1) || err.dataPath}: ${err.message}`
          )
          .join('\n');
        throw new Error(`${CC}${errors}${CR}`);
      }
    });
  }

  if (unitData.ratings) {
    unitData.ratings.forEach((rating, index) => {
      const valid = validateRating(rating);
      if (!valid) {
        const errors = validateRating.errors
          .map(
            err =>
              `rating[${index}].${err.instancePath.substring(1) || err.dataPath}: ${err.message}`
          )
          .join('\n');
        throw new Error(`${CC}${errors}${CR}`);
      }
    });
  }

  if (unitData.commentTypes) {
    unitData.commentTypes.forEach((commentType, index) => {
      const valid = validateCommentType(commentType);
      if (!valid) {
        const errors = validateCommentType.errors
          .map(
            err =>
              `commentType[${index}].${err.instancePath.substring(1) || err.dataPath}: ${err.message}`
          )
          .join('\n');
        throw new Error(`${CC}${errors}${CR}`);
      }
    });
  }

  return true;
};

/// EXPORT MODULE /////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
module.exports = VALIDATION;
