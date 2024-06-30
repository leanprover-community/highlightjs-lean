const assert = require('assert');
const fs = require("fs");
const hljs = require('highlight.js');
const leanHljs = require('../src/languages/lean.js');

describe('lean hljs', function() {
  it('should detect and highlight test.lean.txt correctly', function() {
    hljs.registerLanguage('lean', leanHljs);

    const testLean = fs.readFileSync('test/markup/lean/lean.txt', 'utf-8');
    const testLeanExpected = fs.readFileSync('test/markup/lean/lean.expected.txt', 'utf-8');

    const highlighted = hljs.highlightAuto(testLean);

    assert.equal(highlighted.language, 'lean');
    assert.equal(highlighted.value, testLeanExpected);
  });
});
