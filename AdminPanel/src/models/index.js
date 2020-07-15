// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Question, Answer, ChatMessage } = initSchema(schema);

export {
  Question,
  Answer,
  ChatMessage
};