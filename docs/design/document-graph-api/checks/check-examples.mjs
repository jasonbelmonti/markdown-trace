import { checkInitialExample } from './check-initial-example.mjs';
import { checkCorpus } from './corpus/run.mjs';

const initialExample = checkInitialExample();
const corpus = checkCorpus();
console.log(JSON.stringify({ ...corpus, initialExample }, null, 2));
