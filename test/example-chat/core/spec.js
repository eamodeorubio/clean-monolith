import {expect} from 'chai';
import {success, failure} from '../../../src/utils/try';
import {create, forbidden} from '../../../src/example-chat/core';

// const typeError = (details) => ({
//   error: 'TYPE_ERROR',
//   details
// });
// const createChatAction = (action) => {
//   // TODO: we need to have a library for all these pesky validations
//   const errors = [];
//   if(action === null || typeof action !== 'object')
//     errors.push(typeError({
//       expected: 'CreateChatAction',
//       actual: typeof action,
//     }));
//   else {
//     if (typeof action.id !== 'string')
//       errors.push(typeError({
//         field: 'id',
//         expected: 'string',
//         actual: typeof action.id,
//       }));
//     if (typeof action.title !== 'string')
//       errors.push(typeError({
//         field: 'title',
//         expected: 'string',
//         actual: typeof action.title,
//       }));
//     if (action.actor === null || typeof action.actor !== 'object') {
//       errors.push(typeError({
//         field: 'actor',
//         expected: 'User',
//         actual: typeof action.actor,
//       }));
//     }
//     if (action.actor && typeof action.actor.id !== 'string') {
//       errors.push(typeError({
//         field: 'actor',
//         expected: 'User',
//         actual: typeof action.actor,
//         errors: [typeError({
//           field: 'id',
//           expected: 'string',
//           actual: typeof action.actor.id,
//         })]
//       }));
//     }
//   }
//   if (errors.length > 0)
//     return failure(errors);
//
//   return success({
//     id: action.id,
//     title: action.title,
//     actor: {id: action.actor.id},
//   });
// };
// describe('chat action factory', () => {
//   it('success', () => {
//     const result = createChatAction({
//       id: 'some id',
//       title: 'A cool chat',
//       actor: {id: 'some actor'},
//     });
//
//     expect(result).to.be.deep.equal({
//       ok: true,
//       result: {
//         id: 'some id',
//         title: 'A cool chat',
//         actor: {id: 'some actor'},
//       }
//     })
//   });
//
//   describe('failure scenarios', () => {
//     describe('action is not an object', () => {
//       it('like a boolean', () => {
//         const result = createChatAction(true);
//         expect(result).to.be.deep.equal({
//           ok: false,
//           errors: [{
//             error: 'TYPE_ERROR', details: {
//               expected: 'CreateChatAction',
//               actual: 'boolean',
//             }
//           }],
//         });
//       });
//
//       it('like an undefined', () => {
//         const result = createChatAction();
//         expect(result).to.be.deep.equal({
//           ok: false,
//           errors: [{
//             error: 'TYPE_ERROR', details: {
//               expected: 'CreateChatAction',
//               actual: 'undefined',
//             }
//           }],
//         });
//       });
//     });
//     describe('bad field types', () => {
//       it('id is not a string', () => {
//         const result = createChatAction({
//           id: 2,
//           title: 'A cool chat',
//           actor: {id: 'some actor'},
//         });
//
//         expect(result).to.be.deep.equal({
//           ok: false,
//           errors: [{
//             error: 'TYPE_ERROR', details: {
//               field: 'id',
//               expected: 'string',
//               actual: 'number',
//             }
//           }],
//         });
//       });
//
//       it('title is not string', () => {
//         const result = createChatAction({
//           id: 'some id',
//           title: true,
//           actor: {id: 'some actor'},
//         });
//
//         expect(result).to.be.deep.equal({
//           ok: false,
//           errors: [
//             {
//               error: 'TYPE_ERROR', details: {
//               field: 'title',
//               expected: 'string',
//               actual: 'boolean',
//             }
//             }],
//         });
//       });
//
//       it('actor without id', () => {
//         const result = createChatAction({
//           id: 'some id',
//           title: 'A cool chat',
//           actor: {},
//         });
//
//         expect(result).to.be.deep.equal({
//           ok: false,
//           errors: [{
//             error: 'TYPE_ERROR', details: {
//               field: 'actor',
//               expected: 'User',
//               actual: 'object',
//               errors: [
//                 {
//                   error: 'TYPE_ERROR',
//                   details: {
//                     field: 'id',
//                     expected: 'string',
//                     actual: 'undefined',
//                   }
//                 }
//               ]
//             }
//           }],
//         });
//       });
//
//       it('no actor', () => {
//         const result = createChatAction({
//           id: 'some id',
//           title: 'A cool chat'
//         });
//
//         expect(result).to.be.deep.equal({
//           ok: false,
//           errors: [{
//             error: 'TYPE_ERROR', details: {
//               field: 'actor',
//               expected: 'User',
//               actual: 'undefined',
//             }
//           }],
//         });
//       });
//
//       it('no actor, id and title', () => {
//         const result = createChatAction({});
//
//         expect(result).to.have.own.property('ok', false);
//         expect(result).to.have.property('errors').that.have.deep.members([
//           {
//             error: 'TYPE_ERROR',
//             details: {
//               field: 'actor',
//               expected: 'User',
//               actual: 'undefined',
//             }
//           },
//           {
//             error: 'TYPE_ERROR',
//             details: {
//               field: 'id',
//               expected: 'string',
//               actual: 'undefined',
//             }
//           },
//           {
//             error: 'TYPE_ERROR',
//             details: {
//               field: 'title',
//               expected: 'string',
//               actual: 'undefined',
//             }
//           }]);
//       });
//     });
//   });
// });

describe('Chat business logic', () => {

  describe('Creating a chat', () => {
    const actor = {};
    const createChatAction = {
      id: 'some chat id',
      title: 'A cool chat',
      actor,
    };
    describe('success scenarios', () => {
      const expectedChat = {
        id: 'some chat id',
        owner: actor,
        title: 'A cool chat',
        messageThreads: {},
        participants: [actor],
      };

      it('given that the chat does not exist, an new empty chat using the actor as owner will be returned', () => {
        const result = create(undefined, createChatAction);

        expect(result).to.be.deep.equal(success(expectedChat));
      });

      it('given that the chat already exists, and the actor is the same as the owner, nothing will be done', () => {
        const currentChat = {...expectedChat};

        const result = create(currentChat, createChatAction);

        expect(result).to.be.deep.equal(success(expectedChat));
      });
    });

    describe('failure scenarios', () => {
      it('given that the chat already exists, but the actor is not the same as the owner, a forbidden result will be returned', () => {
        const actor = {id: 'user1'};
        const createChatAction = {
          id: 'some chat id',
          title: 'A cool chat',
          actor,
        };
        const currentChat = {
          id: 'some chat id',
          owner: {id: 'userA'},
          title: 'A cool chat',
          messageThreads: {},
          participants: [{id: 'userA'}],
        };

        const result = create(currentChat, createChatAction);

        expect(result).to.be.deep.equal(failure(forbidden(actor)));
      });
    });
  });

  describe('Adding a comment', () => {
    it('there is no chat for this comment');
    it('there is a chat for this comment');
  });

  describe('Replying to a comment', () => {
    it('success');
    it('there is no comment to reply to');
  });

});
