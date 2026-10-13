const fs = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'src', 'app', 'page.tsx');
let source = fs.readFileSync(file, 'utf8');

const malformed = '{!p.disciplines.length&&<div className="empty">No grading modules configured.</div></div></>;';
const fixed = '{!p.disciplines.length&&<div className="empty">No grading modules configured.</div></>;';

if (source.includes(malformed)) {
  source = source.replace(malformed, fixed);
  fs.writeFileSync(file, source);
  console.log('MartialTrack: repaired malformed GradingView JSX.');
} else {
  console.log('MartialTrack: GradingView JSX repair not needed.');
}
