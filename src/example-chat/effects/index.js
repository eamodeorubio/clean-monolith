export const fetchUser = (id) => ({
  kind: 'FETCH_USER',
  id,
});

export const fetchChat = (id) => ({
  kind: 'FETCH_CHAT',
  id,
});

export const saveChat = (chat) => ({
  kind: 'SAVE_CHAT',
  chat,
});
