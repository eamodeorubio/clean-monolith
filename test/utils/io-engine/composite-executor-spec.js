import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import newCompositeExecutor from '../../../src/utils/io-engine/composite-executor';

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('A composite executor', () => {
  let executors, compositeExecutor;
  beforeEach(() => {
    executors = {
      'MONGO_QUERY': sinon.stub(),
      'HTTP_FETCH': sinon.stub(),
      'MYSQL_QUERY': true
    };
    compositeExecutor = newCompositeExecutor(executors);
  });

  describe('delegates to the executor specified in the side effect', () => {
    it('when there is no executor for that side effect, a rejected promise is returned', async () => {
      const nonExisting = 'MYSQL_QUERY';

      // NOTE: chai (and not chai-as-promised) does not do deep equality for throws.
      // that's why we need to test it this way
      try {
        await compositeExecutor({kind: nonExisting});
        throw 'Should have failed';
      } catch (err) {
        expect(err).to.deep.equal({
          error: 'MISSING_EXECUTOR',
          details: nonExisting,
        });
      }
    });

    it('when the executor succeeds then will return its result', async () => {
      const kind = 'HTTP_FETCH';
      const expectedResult = 'ok';
      executors[kind].returns(Promise.resolve(expectedResult));
      const sideEffect = {kind: kind, parameters: {a: 1, b: 2}};

      await expect(compositeExecutor(sideEffect)).to.be.eventually.equal(expectedResult);

      expect(executors[kind]).to.have.been.calledWithExactly(sideEffect);
      // noinspection BadExpressionStatementJS
      expect(executors['MONGO_QUERY']).not.to.have.been.calledOnce;
    });

    it('when the executor fails then will re-throw the error', async () => {
      const kind = 'MONGO_QUERY';
      const error = 'ooooppsss!';
      executors[kind].returns(Promise.reject(error));
      const sideEffect = {kind: kind, parameters: {x: 1, y: 2}};

      await expect(compositeExecutor(sideEffect)).to.be.rejectedWith(error);

      expect(executors[kind]).to.have.been.calledWithExactly(sideEffect);
      // noinspection BadExpressionStatementJS
      expect(executors['HTTP_FETCH']).not.to.have.been.calledOnce;
    });
  })
});
