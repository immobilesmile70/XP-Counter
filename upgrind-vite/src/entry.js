import './main.js';
import './firebase.js';
import './TimerManager.js';
import './TaskManager.js';
import './xp.js';
import './leaderboard.js';
import './quotes.js';
import './profanity-filter.js';

import { inject } from '@vercel/analytics';
inject();

import zxcvbn from 'zxcvbn';
window.zxcvbn = zxcvbn;