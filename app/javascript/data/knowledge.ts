import { Duration, Moment } from "moment";

export enum LearningStep {
  NEW,
  LEARNING_ONE,
  LEARNING_TWO,
  GRADUATED,
}

export default interface Knowledge {
  easeFactor: number;
  interval: Duration;
  learningStep: LearningStep;
  repetitions: number;
  lastReview: Moment;
}
