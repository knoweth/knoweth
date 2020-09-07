import {
  processRepetition,
  createUnreviewedKnowledge,
  INTERVAL_LEARNING_ONE,
  INTERVAL_LEARNING_TWO,
  INTERVAL_REP_ONE,
  DEFAULT_EASE_FACTOR,
  getNextReview,
} from "./anki";
import ReviewQuality from "./review-quality";
import { LearningStep } from "../data/knowledge";
import moment from "moment";

it("continual good interval tests", () => {
  let k = createUnreviewedKnowledge();
  k = processRepetition(k, ReviewQuality.AGAIN, 0);
  expect(k.repetitions).toBe(1);
  expect(k.learningStep).toBe(LearningStep.LEARNING_ONE);
  expect(getNextReview(k)).toEqual(INTERVAL_LEARNING_ONE);
  k = processRepetition(k, ReviewQuality.GOOD, 0);
  expect(k.learningStep).toBe(LearningStep.LEARNING_TWO);
  expect(getNextReview(k)).toEqual(INTERVAL_LEARNING_TWO);
  k = processRepetition(k, ReviewQuality.GOOD, 0);
  expect(k.learningStep).toBe(LearningStep.GRADUATED);
  expect(getNextReview(k)).toEqual(INTERVAL_REP_ONE);
  k = processRepetition(k, ReviewQuality.GOOD, 0);
  expect(getNextReview(k)).toEqual(moment.duration(3, "days"));
  k = processRepetition(k, ReviewQuality.GOOD, 0);
  expect(getNextReview(k).asMilliseconds()).toEqual(
    moment.duration(5, "days").asMilliseconds()
  );

  // Ease factor should be unchanged after repeated Goods
  expect(k.easeFactor).toBe(DEFAULT_EASE_FACTOR);
});

it("learning cards should not change ease factor", () => {
  let k = createUnreviewedKnowledge();
  k = processRepetition(k, ReviewQuality.AGAIN, 0);
  expect(getNextReview(k)).toBe(INTERVAL_LEARNING_ONE);
  // Saying "again" in the learning period should not change the ease factor
  expect(k.easeFactor).toBe(DEFAULT_EASE_FACTOR);
  k = processRepetition(k, ReviewQuality.AGAIN, 0);
  expect(k.easeFactor).toBe(DEFAULT_EASE_FACTOR);
});

it("correctly processes lapsed card", () => {
  let k = createUnreviewedKnowledge();
  k = processRepetition(k, ReviewQuality.AGAIN, 0);
  expect(getNextReview(k)).toEqual(INTERVAL_LEARNING_ONE);
  k = processRepetition(k, ReviewQuality.GOOD, 0);
  expect(getNextReview(k)).toEqual(INTERVAL_LEARNING_TWO);
  k = processRepetition(k, ReviewQuality.GOOD, 0);
  expect(getNextReview(k)).toEqual(INTERVAL_REP_ONE);
  k = processRepetition(k, ReviewQuality.AGAIN, 0);
  expect(getNextReview(k)).toEqual(INTERVAL_LEARNING_TWO);
  expect(k.interval).toEqual(INTERVAL_REP_ONE);
});
