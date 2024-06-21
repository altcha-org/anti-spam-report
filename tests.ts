import samples from './samples/';
import type { ISample, TClassification } from './shared.js';

export default {
	legit: ['English Legitimate', samples.legit, 'GOOD'],
	germanlegit: ['German - Legitimate', samples.germanlegit, 'GOOD'],
	spanishlegit: ['Spanish - Legitimate', samples.spanishlegit, 'GOOD'],
	frenchlegit: ['French - Legitimate', samples.frenchlegit, 'GOOD'],
	italianlegit: ['Italian - Legitimate', samples.italianlegit, 'GOOD'],
	dutchlegit: ['Dutch - Legitimate', samples.dutchlegit, 'GOOD'],
	portugueselegit: ['Portuguese - Legitimate', samples.portugueselegit, 'GOOD'],
	germanspam: ['German - Spam', samples.germanspam, 'BAD'],
	spanishspam: ['Spanish - Spam', samples.spanishspam, 'BAD'],
	frenchspam: ['French - Spam', samples.frenchspam, 'BAD'],
	italianspam: ['Italian - Spam', samples.italianspam, 'BAD'],
	dutchspam: ['Dutch - Spam', samples.dutchspam, 'BAD'],
	portuguesespam: ['Portuguese - Spam', samples.portuguesespam, 'BAD'],
	pills: ['Pills and Drugs', samples.pills, 'BAD'],
	profanity: ['Profanity', samples.profanity, 'BAD'],
	harmful: ['Harmful (SQL/HTML injection)', samples.harmful, 'BAD'],
	fakeemail: ['Fake Email Address', samples.fakeemail, 'BAD'],
	random: ['Random characters', samples.random, 'BAD'],
	tor: ['TOR', samples.tor, 'BAD']
} satisfies Record<string, [string, ISample[], TClassification]>;
