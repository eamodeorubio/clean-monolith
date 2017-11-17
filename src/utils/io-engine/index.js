export default (executor) => {
  const performEffect = async (oneOrManyEffects) => {
    if (Array.isArray(oneOrManyEffects)) {
      return await Promise.all(oneOrManyEffects.map(executor));
    }
    return await executor(oneOrManyEffects);
  };

  return (generator) => async (...initParams) => {
    const g = generator(...initParams);

    let step = g.next();
    while (!step.done) {
      try {
        step = g.next(await performEffect(step.value));
      } catch (e) {
        step = g.throw(e);
      }
    }
    return step.value;
  };
};
