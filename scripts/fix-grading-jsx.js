const fs = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'src', 'app', 'page.tsx');
let source = fs.readFileSync(file, 'utf8');

// Use an explicit block around GradingView's early return. This avoids the
// TSX parser ambiguity that caused the Vercel "Unterminated regexp literal"
// error at the function boundary.
source = source.replace(
  'if(!p.selected)return <>',
  'if(!p.selected){return <>'
);

source = source.replace(
  'No grading modules configured.</div></div></>;',
  'No grading modules configured.</div></>;'
);

fs.writeFileSync(file, source);
console.log('MartialTrack: GradingView JSX normalized.');
