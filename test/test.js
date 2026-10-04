const assert = require('assert');
const fs = require("fs");
const hljs = require('highlight.js');
const core = require('highlight.js/lib/core').newInstance();
const { performance } = require('perf_hooks');
const leanHljs = require('../src/languages/lean.js');

core.registerLanguage('lean', leanHljs);
core.debugMode();

function highlight(source) {
  return core.highlight(source, { language: 'lean', ignoreIllegals: true }).value;
}

function mark(scope, html) {
  return `<span class="hljs-${scope}">${html}</span>`;
}

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
      assert.equal(highlight(source), expected);
    });
  });

  it('does not repeatedly scan blank lines as declaration indentation', function() {
    const source = '\n'.repeat(64000) + 'x';
    highlight('def warmup := 0');
    const start = performance.now();
    assert.equal(highlight(source), source);
    // A generous limit for an input that previously took several seconds.
    assert.ok(performance.now() - start < 1000, 'blank-line highlighting took over one second');
  });

  it('keeps preceding blank lines out of field and constructor titles', function() {
    assert.equal(highlight('\n\n  field : Nat'), '\n\n' + mark('title', '  field') + ' : Nat');
    assert.equal(highlight('\n\n  | ctor : T'), '\n\n' + mark('title', '  | ctor') + ' : T');
  });

  it('protects quoted tokens in syntax, macro, and elaborator declarations', function() {
    for (const declaration of [
      'syntax ":" term : term',
      'macro ":" x:term : term => `(id $x)',
      'elab ":" : term => pure (Lean.mkNatLit 0)',
      'syntax "=>" term : term',
      'syntax "where" term : term'
    ]) {
      const output = highlight(declaration + '\n#check Nat');
      const token = declaration.match(/"([^"]*)"/)[1].replace('>', '&gt;');
      assert.ok(output.includes(mark('string', '&quot;' + token + '&quot;')), declaration);
      assert.ok(output.endsWith('\n' + mark('meta', '#check') + ' Nat'), declaration);
    }
  });

  it('protects comments in declaration headers', function() {
    for (const comment of ['/- ") : where /- nested -/ -/', '-- ") : where']) {
      const output = highlight('def f ' + comment + '\n(n : Nat) : Nat := n');
      assert.ok(output.includes(mark('params', '(n : Nat)')));
      assert.ok(output.endsWith(' Nat ' + mark('symbol', ':=') + ' n'));
      assert.ok(output.includes(mark('comment', comment.replace('"', '&quot;').replace(
        '/- nested -/', mark('comment', '/- nested -/')
      ))));
    }
  });

  it('does not recognize keywords or numbers inside identifiers', function() {
    for (const name of [
      'αsyntax', 'αdef', 'αif', "if'", 'match?', 'Type!', "def'", 'theorem?',
      'syntax!', 'ε0', 'x0xff', 'Foo.syntax', 'Foo.αdef', '𝒜syntax', 'xⱼdef'
    ]) {
      assert.equal(highlight('#check ' + name + '\n#check Nat'),
        mark('meta', '#check') + ' ' + name.replace("'", '&#x27;') + '\n' + mark('meta', '#check') + ' Nat');
    }
    assert.equal(highlight('«syntax»'), mark('title', '«syntax»'));
    assert.ok(highlight("def where' := 0").includes(mark('title', 'where&#x27;')));
  });

  it('still recognizes real declarations and keywords', function() {
    assert.equal(highlight('def αsyntax := 1'),
      mark('theorem', mark('keyword', 'def') + ' ' + mark('title', 'αsyntax') + ' ' + mark('symbol', ':=')) +
      ' ' + mark('number', '1'));
    assert.equal(highlight('if true then 1 else 0'),
      mark('keyword', 'if') + ' ' + mark('literal', 'true') + ' ' + mark('keyword', 'then') +
      ' ' + mark('number', '1') + ' ' + mark('keyword', 'else') + ' ' + mark('number', '0'));
    assert.equal(highlight('true×false'), mark('literal', 'true') + '×' + mark('literal', 'false'));
    assert.equal(highlight('λx, x'), mark('symbol', 'λ') + 'x, x');
  });

  it('restores omitted Lean 3 and shared vocabulary', function() {
    assert.equal(highlight('begin'), mark('keyword', 'begin'));
    for (const word of [
      'abstract', 'assumption', 'dsimp', 'norm_num', 'propext', 'refl', 'replace', 'ring',
      'simp_intros', 'symmetry', 'try', 'unfold_coes', 'unfold_projs'
    ]) {
      assert.equal(highlight(word), mark('built_in', word));
    }
    assert.equal(highlight(':='), mark('symbol', ':='));
  });

  it('matches arbitrary raw-string delimiters without interpreting their contents', function() {
    for (const count of [0, 1, 3, 4, 8, 64]) {
      const hashes = '#'.repeat(count);
      const body = count === 0 ? 'no escapes\\' : 'literal "' + '#'.repeat(count - 1) + ' -- def :=';
      const raw = 'r' + hashes + '"' + body + '"' + hashes;
      assert.equal(highlight(raw + '\n#check Nat'),
        mark('string', raw.replace(/"/g, '&quot;')) + '\n' + mark('meta', '#check') + ' Nat');
    }
  });

  it('keeps raw-string delimiters independent between uses and contexts', function() {
    const first = 'r####"a "# b"####';
    const second = 'r#"c " d"#';
    const output = highlight(first + '\ndef f (s : String := ' + second + ') : String := s');
    assert.ok(output.startsWith(mark('string', first.replace(/"/g, '&quot;'))));
    assert.ok(output.includes(mark('string', second.replace(/"/g, '&quot;')) + ')</span>'));
    assert.ok(output.endsWith(' String ' + mark('symbol', ':=') + ' s'));
    assert.equal(highlight('r#"text"##check Nat'),
      mark('string', 'r#&quot;text&quot;#') + mark('meta', '#check') + ' Nat');
    assert.equal(highlight('r####"unfinished "# -- not a comment'),
      mark('string', 'r####&quot;unfinished &quot;# -- not a comment'));
  });

  it('nests block comments inside both documentation forms', function() {
    for (const opener of ['/--', '/-!']) {
      const nested = mark('comment', '/- inner ' + mark('comment', '/- deep -/') + ' tail -/');
      assert.equal(highlight(opener + ' outer /- inner /- deep -/ tail -/ end -/\n#check Nat'),
        mark('doctag', opener + ' outer ' + nested + ' end -/') + '\n' + mark('meta', '#check') + ' Nat');
    }
  });

  it('balances nested parameter brackets of every kind', function() {
    const params = '(h : ' + mark('symbol', '∀') + ' ' + mark('params', '{α : ' + mark('built_in', 'Type') + '}') +
      ' ' + mark('params', '[Inhabited ' + mark('params', '(α × α)') + ']') + ', α)';
    assert.equal(highlight('def f (h : ∀ {α : Type} [Inhabited (α × α)], α) : Nat := 0'),
      mark('theorem', mark('keyword', 'def') + ' ' + mark('title', 'f') + ' ' + mark('params', params) +
        ' ' + mark('symbol', ':')) + ' Nat ' + mark('symbol', ':=') + ' ' + mark('number', '0'));
  });

  it('protects strings, characters, and comments inside parameters', function() {
    for (const [value, html] of [
      ['"([{}]) : where"', mark('string', '&quot;([{}]) : where&quot;')],
      ["')'", mark('string', '&#x27;)&#x27;')],
      ['r####"a " ) ] } : where"####', mark('string', 'r####&quot;a &quot; ) ] } : where&quot;####')],
      ['0 /- ) ] } : /- nested -/ -/', mark('number', '0') + ' ' +
        mark('comment', '/- ) ] } : ' + mark('comment', '/- nested -/') + ' -/')]
    ]) {
      const output = highlight('def f (x := ' + value + ') : Nat := 0');
      assert.ok(output.includes(mark('params', '(x ' + mark('symbol', ':=') + ' ' + html + ')')), value);
      assert.ok(output.endsWith(' Nat ' + mark('symbol', ':=') + ' ' + mark('number', '0')), value);
    }
    assert.equal(highlight("'🦀'"), mark('string', '&#x27;🦀&#x27;'));
  });
});
