const _ = require('lodash');
const Promise = require('bluebird');

function abilityPlugin(schema, options = {}) {
  if (typeof options.name !== 'string') {
    throw new Error('name is required');
  }

  if (typeof options.verifier !== 'function') {
    throw new Error('verifier is required');
  }

  const actionName = `can${_.chain(options.name).camelCase().upperFirst().value()}`;

  schema.methods[actionName] = options.verifier;
  schema.methods[`${actionName}OrError`] = function (...args) {
    const error = options.error || new Error(`Action "${options.name}" is forbidden for the user in this scope`);

    return options.verifier.apply(this, args)
      .then((can) => {
        if (!can) {
          return Promise.reject(error);
        }

        return can;
      });
  };
}

module.exports = abilityPlugin;
