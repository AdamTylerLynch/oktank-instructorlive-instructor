import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";





export declare class Question {
  readonly id: string;
  readonly question: string;
  readonly answers: string[];
  readonly answerId?: number;
  constructor(init: ModelInit<Question>);
  static copyOf(source: Question, mutator: (draft: MutableModel<Question>) => MutableModel<Question> | void): Question;
}

export declare class Answer {
  readonly id: string;
  readonly username: string;
  readonly answer?: number[];
  constructor(init: ModelInit<Answer>);
  static copyOf(source: Answer, mutator: (draft: MutableModel<Answer>) => MutableModel<Answer> | void): Answer;
}

export declare class ChatMessage {
  readonly id: string;
  readonly username: string;
  readonly message: string[];
  readonly course: number[];
  constructor(init: ModelInit<ChatMessage>);
  static copyOf(source: ChatMessage, mutator: (draft: MutableModel<ChatMessage>) => MutableModel<ChatMessage> | void): ChatMessage;
}