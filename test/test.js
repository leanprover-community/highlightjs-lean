const assert = require('assert');
const fs = require("fs");
const hljs = require('highlight.js');
const leanHljs = require('../src/languages/lean.js');

describe('lean hljs', function() {
  hljs.registerLanguage('lean', leanHljs);

  [
    'lean3',
    'lean4'
  ].forEach((fixture) => {
    it(`should detect and highlight ${fixture}.txt correctly`, function() {
      const inputPath = `test/markup/lean/${fixture}.txt`;
      const expectedPath = `test/markup/lean/${fixture}.expected.txt`;
      const source = fs.readFileSync(inputPath, 'utf-8');
      const expected = fs.readFileSync(expectedPath, 'utf-8');

      const highlighted = hljs.highlightAuto(source);

      assert.equal(highlighted.language, 'lean');
      assert.equal(highlighted.value, expected);
    });
  });
});
