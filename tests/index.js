const Promise = require('bluebird');
const expect = require('chai').expect;
const mongoose = require('mongoose');

const database = require('../utils/database');
const abilityPlugin = require('../index');

describe('Ability plugin', () => {
  function createDefaultAbility() {
    const schema = new mongoose.Schema();

    schema.plugin(abilityPlugin, {
      name: 'executeExample',
      verifier(example) {
        if (example === 'example') {
          return Promise.resolve(true);
        }

        return Promise.resolve(false);
      },
    });

    mongoose.model('Example', schema);
  }

  before(database.connect);

  it('should be able to define "can" method for ability correctly', () => {
    createDefaultAbility();

    const example = new mongoose.models.Example();

    return example
      .save()
      .then(() => {
        expect(typeof example.canExecuteExample).to.equal('function');

        return example.canExecuteExample('example');
      })
      .then((can) => {
        expect(can).to.equal(true);

        return example.canExecuteExample('foobar');
      })
      .then((can) => {
        expect(can).to.equal(false);
      });
  });

  it('should be able to define "canOrError" method for ability correctly', (done) => {
    createDefaultAbility();

    const example = new mongoose.models.Example();

    example
      .save()
      .then(() => {
        expect(typeof example.canExecuteExampleOrError).to.equal('function');

        return example.canExecuteExampleOrError('example');
      })
      .then((can) => {
        expect(can).to.equal(true);

        return example.canExecuteExampleOrError('foobar');
      })
      .then(
        () => {
          done(new Error('Expected to reject'));
        },
        (err) => {
          expect(err.message).to.equal('Action "executeExample" is forbidden for the user in this scope');
        }
      )
      .then(() => done())
      .catch(done);
  });

  afterEach(database.clean);

  afterEach(() => {
    delete mongoose.connection.models.Example;
  });

  after(database.disconnect);
});
