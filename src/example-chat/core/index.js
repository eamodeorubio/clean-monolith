import {success, failure} from '../../utils/try';

const createChatState = ({id, actor, title}) => ({
  id,
  title,
  owner: actor,
  messageThreads: {},
  participants: [actor],
});

export const forbidden = (actor) => ({
  error: 'FORBIDDEN',
  details: actor
});

export const create = (state, action ) => {
  if (state) {
    if (state.owner.id !== action.actor.id)
      return failure(forbidden(action.actor));
    return success(state);
  }
  return success(createChatState(action));
};
