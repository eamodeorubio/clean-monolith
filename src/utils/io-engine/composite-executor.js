export default (executors) => (sideEffect) => {
  const executor = executors[sideEffect.kind];
  if (typeof executor !== 'function') {
    return Promise.reject({
      error: 'MISSING_EXECUTOR',
      details: sideEffect.kind,
    });
  }
  return executor(sideEffect);
};
