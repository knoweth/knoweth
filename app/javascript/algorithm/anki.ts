import moment, { Duration, Moment } from "moment";
import Knowledge, { LearningStep } from "../data/knowledge";
import ReviewQuality from "./review-quality";

export const INTERVAL_LEARNING_ONE = moment.duration(1, "minute");
export const INTERVAL_LEARNING_TWO = moment.duration(10, "minutes");
export const INTERVAL_REP_ONE = moment.duration(1, "day");
export const INTERVAL_REP_TWO = moment.duration(4, "days");

export const DEFAULT_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;
const EASY_BONUS = 1.3; // 130%

export function createUnreviewedKnowledge(): Knowledge {
  return {
    easeFactor: DEFAULT_EASE_FACTOR,
    learningStep: LearningStep.NEW,
    repetitions: 0,
    interval: INTERVAL_REP_ONE,
    lastReview: moment(), // todo is this right lol
  };
}

/**
 * Changes ease factor.
 * @param current Current ease factor of the knowledge
 * @param delta Requested change in ease factor
 */
function changeEaseFactor(current: number, delta: number) {
  return Math.min(current + delta, MIN_EASE_FACTOR);
}

function getGraduatingInterval(graduatedEarly: boolean) {
  // TODO adjust the review interval (adjRevIvl) to make it better in
  // some way as Anki does
  if (graduatedEarly) {
    return INTERVAL_REP_TWO;
  } else {
    return INTERVAL_REP_ONE;
  }
}

/**
 * Reschedules a learning card that has graduated for the first time.
 *
 * @param card           the card that has just graduated
 * @param graduatedEarly whether the card graduated "early", e.g. by
 *                       clicking ReviewQuality#EASY on it.
 */
function rescheduleGraduated(
  knowledge: Knowledge,
  graduatedEarly: boolean
): Knowledge {
  return {
    ...knowledge,
    learningStep: LearningStep.GRADUATED,
    interval: getGraduatingInterval(graduatedEarly),
    easeFactor: DEFAULT_EASE_FACTOR,
  };
}

function answerLearning(
  knowledge: Knowledge,
  quality: ReviewQuality
): Knowledge {
  switch (quality) {
    case ReviewQuality.EASY:
      // Immediate graduation
      // Reschedule as a review card
      return rescheduleGraduated(knowledge, true);
    case ReviewQuality.GOOD:
      // Move one step toward graduation
      knowledge = { ...knowledge, learningStep: knowledge.learningStep + 1 };
      if (knowledge.learningStep === LearningStep.GRADUATED) {
        return rescheduleGraduated(knowledge, false);
      } else {
        return knowledge;
      }
    case ReviewQuality.HARD:
    // Hard is not actually implemented in Anki's schedv1 algorithm
    // so for our purposes we will just consider it an AGAIN
    case ReviewQuality.AGAIN:
      return {
        ...knowledge,
        learningStep: LearningStep.LEARNING_ONE,
        interval: INTERVAL_REP_ONE,
      };
  }
}

function rescheduleLapse(knowledge: Knowledge): Knowledge {
  // TODO leech, dynamic decks, etc.
  // The card is placed into relearning mode, the ease is
  // decreased by 20 percentage points (that is, 20 is subtracted
  // from the ease value, which is in units of percentage points),
  // and the current interval is multiplied by the value of new
  // interval (this interval will be used when the card exits
  // relearning mode).
  // Set interval to max(minimum interval, card_interval * lapse_multiplier)
  // Which is hardcoded at 1 day (which is the default minimum interval)
  // since lapse_multiplier is also 0 by default
  return {
    ...knowledge,
    interval: INTERVAL_REP_ONE,
    easeFactor: changeEaseFactor(knowledge.easeFactor, -0.2),
    learningStep: LearningStep.LEARNING_TWO,
  };
}

/**
 * Returns an interval of max(newInterval, greaterThan + 1 day). That is,
 * the interval must be at least one day longer than greaterThan.
 * <p>
 * This is done to constrain the interval so that, e.g. the GOOD interval
 * isn't shorter than the HARD interval.
 *
 * @param newInterval the interval to use as a baseline value, given that
 *                    the returned interval will be newInterval or one day
 *                    longer than greaterThan (whichever is larger).
 * @param greaterThan the returned interval will be at least one day longer
 *                    than this interval
 * @return max(newInterval, greaterThan + 1 day)
 */
function constrainedIntervalAfter(
  newInterval: Duration,
  greaterThan: Duration
) {
  const min = greaterThan.clone().add(1, "day");
  return min.asMilliseconds() > newInterval.asMilliseconds()
    ? min
    : newInterval;
}

/**
 * Returns the next ideal review interval for the given graduated card, with a
 * review of a given quality.
 *
 * @param card    the card reviewed (should have graduated)
 * @param quality the quality of the review
 * @return the interval until the next review
 */
function nextReviewInterval(
  knowledge: Knowledge,
  quality: ReviewQuality.EASY | ReviewQuality.GOOD | ReviewQuality.HARD,
  daysOverdue: number
): Duration {
  const easeFactor = knowledge.easeFactor;
  const currentInterval = knowledge.interval;
  // (interval + delay / 4) * 1.2
  const hardInterval = constrainedIntervalAfter(
    moment.duration(
      currentInterval.clone().add(daysOverdue, "days").asMilliseconds() * 1.2,
      "milliseconds"
    ),
    currentInterval
  );
  // (interval + delay / 2 ) * easeFactor
  const goodInterval = constrainedIntervalAfter(
    moment.duration(
      (currentInterval.clone().add(daysOverdue, "days").asMilliseconds() / 2) *
        easeFactor
    ),
    hardInterval
  );
  const easyInterval = constrainedIntervalAfter(
    moment.duration(
      currentInterval.clone().add(daysOverdue, "days").asMilliseconds() *
        easeFactor
    ),
    goodInterval
  );

  switch (quality) {
    case ReviewQuality.EASY:
      return easyInterval;
    case ReviewQuality.GOOD:
      return goodInterval;
    case ReviewQuality.HARD:
      return hardInterval;
  }
}

function answerReview(
  knowledge: Knowledge,
  quality: ReviewQuality,
  daysOverdue: number
): Knowledge {
  if (quality === ReviewQuality.AGAIN) {
    return rescheduleLapse(knowledge);
  }

  switch (quality) {
    case ReviewQuality.HARD:
      // The card’s ease is decreased by 15 percentage points and the
      // current interval is multiplied by 1.2.
      return {
        ...knowledge,
        easeFactor: changeEaseFactor(knowledge.easeFactor, -0.15),
        interval: nextReviewInterval(knowledge, quality, daysOverdue),
      };
    case ReviewQuality.EASY:
      return {
        ...knowledge,
        easeFactor: changeEaseFactor(knowledge.easeFactor, 0.15),
        interval: nextReviewInterval(knowledge, quality, daysOverdue),
      };
    case ReviewQuality.GOOD:
      return {
        ...knowledge,
        interval: nextReviewInterval(knowledge, quality, daysOverdue),
      };
  }
}

export function processRepetition(
  knowledge: Knowledge,
  quality: ReviewQuality,
  daysOverdue: number
): Knowledge {
  knowledge = {
    ...knowledge,
    repetitions: knowledge.repetitions + 1,
    lastReview: moment(),
  };
  if (knowledge.learningStep === LearningStep.NEW) {
    // Move to learning step one
    knowledge = { ...knowledge, learningStep: LearningStep.LEARNING_ONE };
  }

  if (
    knowledge.learningStep === LearningStep.LEARNING_ONE ||
    knowledge.learningStep === LearningStep.LEARNING_TWO
  ) {
    return answerLearning(knowledge, quality);
  } else {
    return answerReview(knowledge, quality, daysOverdue);
  }
}

export function shouldReviewToday(now: Moment, knowledge: Knowledge) {
  switch (knowledge.learningStep) {
    case LearningStep.GRADUATED:
      return now
        .startOf("day")
        .add(1, "day")
        .isAfter(knowledge.lastReview.clone().add(knowledge.interval));
    default:
      // Everything else (learning or new) should be reviewed today.
      return true;
  }
}

export function getNextReview(knowledge: Knowledge): Duration {
  switch (knowledge.learningStep) {
    case LearningStep.LEARNING_ONE:
      return INTERVAL_LEARNING_ONE;
    case LearningStep.LEARNING_TWO:
      return INTERVAL_LEARNING_TWO;
    case LearningStep.GRADUATED:
      return knowledge.interval;
    case LearningStep.NEW:
    default:
      throw new Error("Invalid learning step!");
  }
}
