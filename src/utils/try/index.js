export const success = (result) => ({
  ok: true,
  result
});

export const failure = (...errors) => ({
  ok: false,
  errors
});
