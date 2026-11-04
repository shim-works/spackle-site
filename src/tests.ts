/*
 * The /tv run order. Each test is one page; "Next test" goes to the next one,
 * so the previous page's realm (and its library) is gone before the next
 * loads. A small TV can hold one of these at a time, not two.
 */
export interface Test {
  slug: string;
  name: string;
  blurb: string;
  /** Which summary tv-steps.js writes when the scripts call tvDone. */
  kind: 'workload' | 'speed' | 'react';
  /** Why the result means something, for anyone who goes looking. */
  paper: string;
  /** One or two plain lines under "What the test does". */
  about?: string;
}

export const TESTS: Test[] = [
  {
    slug: 'workload', kind: 'workload', paper: '/paper#method',
    name: 'Simulated front-end workload',
    blurb: 'Your app\'s busywork: hand-picked functions React uses, 100 renders deep. Coin toss picks who goes first.',
    about: 'Spread props. Diff keys. Find rows. Pad text. Parse a URL. Then take the average.',
  },
  {
    slug: 'speed', kind: 'speed', paper: '/paper#results',
    name: 'Polyfill speed comparison',
    blurb: 'Every polyfilled function, timed on its own in each library. A coin toss decides who goes first.',
    about: 'Runs 56 functions in both libraries, from Map and Set to padStart and URL. Each one runs 200 times, five rounds, averaged then compared.',
  },
  {
    slug: 'react', kind: 'react', paper: '/paper#results',
    name: 'A real React app',
    blurb: '<a href="https://krausest.github.io/js-framework-benchmark/current.html">js-framework-benchmark</a>, the standard speed test front-end frameworks are ranked on. React 18 on each library, back to back.',
    about: 'Its create, replace and clear tests, with its row data, timed to paint in a full-size window.',
  },
];
