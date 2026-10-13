const fs = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'src', 'app', 'page.tsx');
let source = fs.readFileSync(file, 'utf8');

// Repair the GradingView early-return block. The source must close the
// explicit if block before declaring `awards` and rendering the second branch.
source = source.replace('if(!p.selected)return <>', 'if(!p.selected){return <>');
source = source.replace('No grading modules configured.</div></div></>;', 'No grading modules configured.</div></>;');
source = source.replace('</>;\n  const awards=', '</>;}\n  const awards=');

fs.writeFileSync(file, source);
console.log('MartialTrack: GradingView JSX normalized.');
