import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

// ALTCHA
const ALTCHA_API_KEY = process.env.ALTCHA_API_KEY;
const ALTCHA_API_URL = process.env.ALTCHA_API_URL || 'https://eu.altcha.org/api/v1/classify';
const ALTCHA_REFERRER = process.env.ALTCHA_REFERRER || 'http://localhost';

// AKISMET
const AKISMET_API_KEY = process.env.AKISMET_API_KEY;
const AKISMET_API_URL = process.env.AKISMET_API_URL || 'https://rest.akismet.com/1.1/comment-check';
const AKISMET_BLOG = process.env.AKISMET_BLOG || 'http://example.com';

// CLEANTALK
const CLEANTALK_API_URL = process.env.CLEANTALK_API_URL || 'https://moderate.cleantalk.org/api2.0';
const CLEANTALK_API_KEY = process.env.CLEANTALK_API_KEY;

// MODERATIONAPI
const MODERATIONAPI_API_URL =
	process.env.MODERATIONAPI_API_URL || 'https://moderationapi.com/api/v1/moderate/text';
const MODERATIONAPI_API_KEY = process.env.MODERATIONAPI_API_KEY;

// OOPSPAM
const OOPSPAM_API_URL = process.env.OOPSPAM_API_URL || 'https://api.oopspam.com/v1/spamdetection';
const OOPSPAM_API_KEY = process.env.OOPSPAM_API_KEY;

// CHATGPT
const CHATGPR_API_KEY = process.env.CHATGPR_API_KEY;
const CHATGPT_SYSTEM_PROMPT = `
You are a spam classification API.
You classify text data for common spam words, profanitites, and un-natural inputs which are not expected to be used in business communications.

When provided with an input in JSON, classify the data and output a valid JSON object
with a numerical "score" expressed as a positive integer between 0...5 indicating how likely the input is spam.

Example output:
{
  "score": 0
}
`;

const PLATFORM_FUNCTIONS = {
	ALTCHA: makeAltchaRequest,
	AKISMET: makeAkismetRequest,
	CLEANTALK: makeCleantalkRequest,
	MODERATIONAPI: makeModerationAPIRequest,
	OOPSPAM: makeOopspamRequest,
	CHATGPT: makeChatGPTRequest
};
const USER_IP = '127.0.0.1';
const PLATFORMS = (process.env.PLATFORMS || '')
	.split(',')
	.map((p) => p.trim())
	.filter((p) => !!p);

const chatgpt = CHATGPR_API_KEY
	? createOpenAI({
			apiKey: CHATGPR_API_KEY
	  })('gpt-3.5-turbo')
	: null;

export interface IPayload {
	email?: string;
	ipAddress?: string;
	text?: string;
}

export interface IResult {
	classification?: TClassification | null;
	duration: number;
	error?: string | number | null;
	score?: number | null;
}

export interface ISample extends IPayload {}

export type TClassification = 'GOOD' | 'BAD';

export async function runLatency(iterations: number = 5) {
	for (const platform in PLATFORM_FUNCTIONS) {
		if (PLATFORMS.length && !PLATFORMS.includes(platform)) {
			continue;
		}
		const fn = PLATFORM_FUNCTIONS[platform];
		const results: [number, boolean][] = [];
		for (let i = 0; i < iterations; i++) {
			const { duration, error } = await fn({
				text: 'Hello, is this spam?'
			});
			results.push([duration, !!error]);
		}
		console.log(`${platform} Latency (average):`);
		console.log(results.reduce((acc, [d]) => acc + d, 0) / iterations, 'ms');
		console.log(
			results.reduce((acc, [_, e]) => acc + (e ? 1 : 0), 0),
			'errors'
		);
		console.log('---');
	}
}

export async function runTest(name: string, testSamples: ISample[], expected: TClassification) {
	const score: Record<string, number> = {};
	console.log(`= ${name} =`);
	for (const platform in PLATFORM_FUNCTIONS) {
		if (PLATFORMS.length && !PLATFORMS.includes(platform)) {
			continue;
		}
		const fn = PLATFORM_FUNCTIONS[platform];
		console.log(`${platform}:`);
		for (let i = 0; i < testSamples.length; i++) {
			const result: IResult = await fn(testSamples[i]);
			const passed = result.classification === expected;
			score[platform] = (score[platform] || 0) + (passed ? 1 : 0);
			console.log(
				`${i + 1}:`,
				!result.classification ? '(error)' : passed ? '✅' : '❌',
				result.duration,
				'ms'
			);
		}
		console.log(
			'Score:',
			score[platform] ? Math.floor((score[platform] / testSamples.length) * 100) : 0,
			'%'
		);
		console.log('---');
	}
	console.log('');
	return score;
}

export async function makeAltchaRequest(payload: IPayload): Promise<IResult> {
	const start = performance.now();
	const resp = await fetch(ALTCHA_API_URL, {
		body: JSON.stringify(payload),
		headers: {
			authorization: `Bearer ${ALTCHA_API_KEY}`,
			'content-type': 'application/json',
			referer: ALTCHA_REFERRER
		},
		method: 'POST'
	});
	const duration = Math.floor(performance.now() - start);
	if (resp.status !== 200) {
		console.log('Server responded with', resp.status);
		return {
			duration,
			error: resp.status
		};
	}
	const result = await resp.json();
	return {
		classification: result.classification === 'BAD' ? 'BAD' : ('GOOD' as TClassification),
		duration,
		score: result.score
	};
}

export async function makeAkismetRequest(payload: IPayload): Promise<IResult> {
	const data = new URLSearchParams();
	data.append('api_key', AKISMET_API_KEY || '');
	data.append('blog', AKISMET_BLOG || '');
	data.append('user_ip', payload.ipAddress || USER_IP);
	if (payload.email) {
		data.append('comment_author_email', payload.email);
	}
	if (payload.text) {
		data.append('comment_type', 'comment');
		data.append('comment_content', payload.text);
	}
	const start = performance.now();
	const resp = await fetch(AKISMET_API_URL, {
		body: data.toString(),
		headers: {
			'content-type': 'application/x-www-form-urlencoded'
		},
		method: 'POST'
	});
	const duration = Math.floor(performance.now() - start);
	if (resp.status !== 200) {
		console.log('Server responded with', resp.status);
		return {
			duration,
			error: resp.status
		};
	}
	const result = await resp.text();
	return {
		classification:
			result === 'true' ? 'BAD' : ((result === 'false' ? 'GOOD' : null) as TClassification | null),
		duration
	};
}

export async function makeChatGPTRequest(payload: IPayload): Promise<IResult> {
	const start = performance.now();
	const { text } = await generateText({
		model: chatgpt!,
		messages: [
			{
				role: 'system',
				content: CHATGPT_SYSTEM_PROMPT
			},
			{
				role: 'user',
				content: JSON.stringify(payload)
			}
		]
	});
	const duration = Math.floor(performance.now() - start);
	const json = JSON.parse(text);
	return {
		classification:
			json.score >= 3 ? 'BAD' : ((json.score < 3 ? 'GOOD' : null) as TClassification | null),
		duration
	};
}

export async function makeCleantalkRequest(payload: IPayload): Promise<IResult> {
	const start = performance.now();
	const resp = await fetch(CLEANTALK_API_URL, {
		body: JSON.stringify({
			auth_key: CLEANTALK_API_KEY,
			method_name: 'check_message',
			sender_email: payload.email || 'johny.five1234@gmail.com',
			sender_ip: payload.ipAddress || '127.0.0.1',
			message: payload.text,
			js_on: true,
			submit_time: Math.floor(Date.now() / 1000)
		}),
		headers: {
			'content-type': 'application/json'
		},
		method: 'POST'
	});
	const duration = Math.floor(performance.now() - start);
	if (resp.status !== 200) {
		console.log('Server responded with', resp.status);
		return {
			duration,
			error: resp.status
		};
	}
	const result = await resp.json();
	return {
		classification:
			result.allow === 0 ? 'BAD' : ((result.allow === 1 ? 'GOOD' : null) as TClassification | null),
		duration
	};
}

export async function makeModerationAPIRequest(payload: IPayload): Promise<IResult> {
	const start = performance.now();
	const resp = await fetch(MODERATIONAPI_API_URL, {
		body: JSON.stringify({
			value: payload.text
		}),
		headers: {
			'content-type': 'application/json',
			authorization: 'Bearer ' + MODERATIONAPI_API_KEY!
		},
		method: 'POST'
	});
	const duration = Math.floor(performance.now() - start);
	if (resp.status !== 200) {
		console.log('Server responded with', resp.status);
		return {
			duration,
			error: resp.status
		};
	}
	const result = await resp.json();
	return {
		classification:
			result.flagged === true
				? 'BAD'
				: ((result.flagged === false ? 'GOOD' : null) as TClassification | null),
		duration
	};
}

export async function makeOopspamRequest(payload: IPayload): Promise<IResult> {
	const start = performance.now();
	const resp = await fetch(OOPSPAM_API_URL, {
		body: JSON.stringify({
			email: payload.email,
			senderIP: payload.ipAddress,
			content: payload.text
		}),
		headers: {
			'content-type': 'application/json',
			'X-Api-Key': OOPSPAM_API_KEY!
		},
		method: 'POST'
	});
	const duration = Math.floor(performance.now() - start);
	if (resp.status !== 200) {
		console.log('Server responded with', resp.status);
		return {
			duration,
			error: resp.status
		};
	}
	const result = await resp.json();
	return {
		classification:
			result.Score >= 3 ? 'BAD' : ((result.Score < 3 ? 'GOOD' : null) as TClassification | null),
		duration
	};
}

export async function delay(ms: number) {
	await new Promise((resolve) => setTimeout(() => resolve(void 0), ms));
}
