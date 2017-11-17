import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import newEngine from '../../../src/utils/io-engine';

chai.use(chaiAsPromised);

describe('An IO Engine', () => {
  describe('creates an async "task" function from a given generator', () => {
    describe('when the task is executed', () => {
      it('passes the supplied parameters to the generator', async () => {
        const engine = newEngine(() => Promise.resolve());

        let params = null;

        const task = engine(function* (...args) {
          params = [...args];
          yield;
        });

        await task(1,
          ['a', 'b'],
          {a: true, b: false},
          null,
          undefined
        );

        expect(params).to.deep.equal([
          1,
          ['a', 'b'],
          {a: true, b: false},
          null,
          undefined
        ]);
      });

      it('iterates the generator until it is finished', async () => {
        const engine = newEngine(() => Promise.resolve());

        let nextCallCount = 0;

        const task = engine(function* () {
          nextCallCount++;
          yield;
          nextCallCount++;
          yield;
          nextCallCount++;
          yield;
          nextCallCount++;
        });

        await task();

        expect(nextCallCount).to.equal(4);
      });

      describe('when a single effect is yielded, it uses the executor to perform it', async () => {
        it('if successful then the yield returns the result of the side effect', async () => {
          const duplicator = (sideEffect) => Promise.resolve((sideEffect * 2).toString());
          const engine = newEngine(duplicator);
          const results = [];

          const task = engine(function* () {
            results.push(yield 2);
            results.push(yield 4);
            results.push(yield 8);
          });

          await task();

          expect(results).to.deep.equal([
            '4',
            '8',
            '16'
          ]);
        });

        it('if failed then the yield throws the error from the side effect', async () => {
          const error = "some dummy error";
          const brokenExecutor = (sideEffect) => {
            if (sideEffect === "should be ok")
              return Promise.resolve("ok");
            return Promise.reject(error);
          };
          const engine = newEngine(brokenExecutor);
          const results = [];

          const task = engine(function* () {
            try {
              results.push(yield 'should be ok');
              results.push(yield 'will fail');
              results.push(yield 'should be ok');
            } catch (e) {
              results.push(e);
              return "rescued!";
            }
          });

          await expect(task()).to.be.eventually.equal("rescued!");

          expect(results).to.deep.equal([
            'ok',
            error
          ]);
        });
      });

      describe('when an array of effects is yielded, it uses the executor to perform them in parallel', () => {
        it('if all of the side effects are successful then the yield returns the array with their results', async () => {
          const duplicator = (sideEffect) => Promise.resolve((sideEffect * 2).toString());
          const engine = newEngine(duplicator);
          const results = [];

          const task = engine(function* () {
            results.push(yield [2]);
            results.push(yield []);
            results.push(yield [8, 3, 5]);
          });

          await task();

          expect(results).to.deep.equal([
            ['4'],
            [],
            ['16', '6', '10']
          ]);
        });

        it('if one of the side effects failed then the yield throws the error from that side effect', async () => {
          const error = "some dummy error";
          const brokenExecutor = (sideEffect) => {
            if (sideEffect !== "will fail")
              return Promise.resolve("ok");
            return Promise.reject(error);
          };
          const engine = newEngine(brokenExecutor);
          const results = [];

          const task = engine(function* () {
            try {
              results.push(yield ['should be ok', 'this one too']);
              results.push(yield ['good', 'will fail', 'better']);
              results.push(yield ['nice', 'clean']);
            } catch (e) {
              results.push(e);
              return "rescued!";
            }
          });

          await expect(task()).to.be.eventually.equal("rescued!");

          expect(results).to.deep.equal([
            ['ok', 'ok'],
            error
          ]);
        });
      });

      describe('returns a promise', () => {
        it('if generator finished successfully, the promise will be fulfilled with the returned value', async () => {
          const expectedResult = "Hello world!";
          const engine = newEngine(() => Promise.resolve());

          const task = engine(function* () {
            yield;
            return expectedResult;
          });

          const result = await task();

          expect(result).to.equal(expectedResult);
        });

        it('if generator thrown, it will be cancelled and the promise will be failed with the thrown error', async () => {
          const error = "some error";
          const engine = newEngine(() => Promise.resolve());
          let cancelledAfterThrow = true;

          const task = engine(function* () {
            yield 1;
            throw error;
            // noinspection UnreachableCodeJS
            cancelledAfterThrow = false;
            yield 2;
            cancelledAfterThrow = false;
            return "ok!";
          });

          await expect(task()).to.be.rejectedWith(error);
          // noinspection BadExpressionStatementJS
          expect(cancelledAfterThrow).to.be.ok;
        });
      });
    });

    it('several executions of the task are not intermixed', async () => {
      const engine = newEngine((sideEffect) => Promise.resolve(sideEffect * 2));

      const task = engine(function* (seed) {
        const twiceSeed = yield seed;
        return seed + twiceSeed;
      });

      const results = await Promise.all([
        task(3),
        task(7),
        task(5),
      ]);

      expect(results).to.deep.equal([
        9,
        21,
        15
      ]);
    });
  });
});
