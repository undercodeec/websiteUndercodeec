const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('CRM login does not expose or hardcode the authorized operator email', () => {
  const loginSource = fs.readFileSync(
    path.join(__dirname, '..', 'src', 'app', 'admin', 'crm', 'login', 'page.jsx'),
    'utf8',
  );

  assert.doesNotMatch(loginSource, /const\s+CRM_OPERATOR_EMAIL\s*=/);
  assert.doesNotMatch(loginSource, /gerencia@undercodeec\.com/i);
  assert.match(loginSource, /const \[email, setEmail\] = useState\(""\)/);
  assert.match(loginSource, /requestAccessCode\(email\.trim\(\)\)/);
  assert.match(loginSource, /loginWithCode\(\{ email: email\.trim\(\), code: code\.trim\(\) \}\)/);
});
