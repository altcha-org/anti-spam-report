import { delay, runTest } from './shared.js';
import tests from './tests.js';

const TEST_DELAY = process.env.TEST_DELAY || '25000';

const scores: Record<string, number> = {};
const testsArr = Object.entries(tests);

let totalSamples = 0;

for (let i = 0; i < testsArr.length; i++) {
	const test = testsArr[i][1];
	const [name, testSamples, expected] = test;
	const results = await runTest(name, testSamples, expected);
	totalSamples += testSamples.length;
	for (const platform in results) {
		scores[platform] = (scores[platform] || 0) + results[platform];
	}
	if (i < testsArr.length - 1) {
		await delay(+TEST_DELAY);
	}
}

console.log('');
console.log('Overall accuracy:');
for (const platform in scores) {
	const score = scores[platform];
	console.log(
		`${platform}:`,
		score ? Math.floor((score / totalSamples) * 100) : 0,
		'%',
		`(${score} / ${totalSamples})`
	);
}

export {};
