/*
Language: Lean
Author: Patrick Massot
Category: scientific
Description: Language definition for Lean theorem prover
*/

module.exports = function(hljs) {
  var COMMON_KEYWORDS =
    'axiom axioms by calc class coinductive constant constants decreasing_by def deriving ' +
    'do else end example export extends forall from fun hiding if import in include inductive ' +
    'infix infixl infixr instance lemma let local match module mutual namespace nonrec notation ' +
    'omit open out parameter parameters partial postfix prefix precedence private protected ' +
    'public renaming section set_option structure termination_by theorem then universe universes ' +
    'unsafe using variable variables where with';

  var LEAN4_KEYWORDS =
    'abbrev alias declare_syntax_cat elab elab_rules inline macro macro_rules nomatch opaque scoped syntax';

  // Lean 3 compatibility: commands that are not part of Lean 4.
  var LEAN3_KEYWORDS =
    'abbreviation begin definition exposing hypothesis meta prelude reserve run_cmd theory';

  var COMMON_BUILT_INS =
    'Prop Sort Type assumption at by_cases by_contra by_contradiction cases constructor contradiction ' +
    'dsimp exact exfalso intro intros left letI norm_num obtain propext refine rename revert right ' +
    'rfl ring rw simp simpa split subst symm trans try';

  // Lean 3 compatibility: tactics and commands mostly seen in Lean 3 code.
  var LEAN3_BUILT_INS =
    'abstract ac_refl ac_reflexivity all_goals any_goals apply apply_instance apply_with assume ' +
    'cc clear congr congr_arg congr_n continue delta destruct done dunfold eapply econstructor ' +
    'erw exacts existsi fail_if_success fapply finish funext generalize guard_hyp guard_target ' +
    'have induction injection injections introv left right rcases refl repeat replace rewrite rwa ' +
    'show simp_intros skip solve1 specialize substs success_if_fail suffices swap symmetry ' +
    'transitivity trivial unfold unfold1 unfold_coes unfold_projs';

  // Use Lean's letter-like ranges, excluding operators such as λ, Π, Σ, ×, and ÷.
  // See isLetterLike/isIdRest in Lean's src/Init/Meta/Defs.lean.
  var LEAN_IDENT_START = /[A-Za-z_\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u017F\u0391-\u039F\u03A1-\u03A2\u03A4-\u03A9\u03B1-\u03BA\u03BC-\u03FB\u1F00-\u1FFE\u2100-\u214F]/u.source.slice(0, -1);
  // Spell out the supplementary range: Highlight.js also parses regexes without
  // the Unicode flag when counting groups, so a code-point range would fail there.
  for (var codePoint = 0x1D49C; codePoint <= 0x1D59F; codePoint++) {
    LEAN_IDENT_START += String.fromCodePoint(codePoint);
  }
  LEAN_IDENT_START += ']';
  // Keep the legacy superscript continuations accepted by the Lean 3 grammar.
  var LEAN_IDENT_CONTINUE = LEAN_IDENT_START.slice(0, -1) + /[0-9!?'\u2079\u207F\u2080-\u2089\u2090-\u209C\u1D62-\u1D6A\u2C7C]/u.source.slice(1);
  var LEAN_IDENT_RE = new RegExp('(?:' + LEAN_IDENT_START + LEAN_IDENT_CONTINUE + '*|«[^»\\n]+»)', 'u');
  var LEAN_NAME_RE = new RegExp(LEAN_IDENT_RE.source + '(?:\\.' + LEAN_IDENT_RE.source + ')*', 'u');
  function keywordBegin(words) {
    return new RegExp('(?<!' + LEAN_IDENT_CONTINUE + '|\\.)(?:' + words.split(' ').join('|') +
      ')(?!' + LEAN_IDENT_CONTINUE + '|\\.)', 'u');
  }

  var LEAN_KEYWORDS = {
    $pattern: new RegExp('#?' + LEAN_NAME_RE.source + '|λ|∀|Π|∃|⨁|:=?|=>', 'u'),
    keyword:
      COMMON_KEYWORDS + ' ' + LEAN4_KEYWORDS + ' ' + LEAN3_KEYWORDS,
    built_in:
      COMMON_BUILT_INS + ' ' + LEAN3_BUILT_INS,
    literal:
      'false true tt ff',
    meta:
      '#check #eval #exit #guard_msgs #help #print #reduce #synth noncomputable',
    section:
      'section namespace end',
    sorry:
      'sorry admit',
    symbol:
      'λ ∀ ∃ Π ⨁ :='
  };

  // Consume whole names so that a keyword or numeral inside one is not a token.
  var LEAN_IDENTIFIER = {
    begin: new RegExp('#?' + LEAN_NAME_RE.source, 'u'),
    keywords: LEAN_KEYWORDS,
    relevance: 0
  };

  var LEAN_NUMBER = {
    className: 'number',
    variants: [
      { begin: /0x[0-9A-Fa-f]+/ },
      { begin: /0b[01]+/ }
    ]
  };

  var LEAN_CHAR = {
    className: 'string',
    begin: /'(?:\\[\\"'0abfnrtv]|\\x[0-9A-Fa-f]{2}|\\u[0-9A-Fa-f]{4}|[^'\\])'/
  };

  var LEAN_RAW_STRING = {
    className: 'string',
    // A backreference consumes exactly the opening hash count, leaving any
    // subsequent hashes outside the string. An unfinished literal extends to EOF.
    begin: /r(#*)"[\s\S]*?(?:"\1|(?![\s\S]))/
  };

  var QUOTED_SYMBOL = {
    className: 'symbol',
    begin: /``?[^ \t\n\r()[\]{}:,;]+/,
    relevance: 0
  };

  var GUILLEMET_IDENTIFIER = {
    className: 'title',
    begin: /«[^»\n]+»/u,
    relevance: 0
  };

  var DASH_COMMENT = hljs.COMMENT('--', '$');
  var MULTI_LINE_COMMENT = hljs.COMMENT(/\/-/, /-\//, {
    contains: ['self']
  });
  var DOC_COMMENT = {
    className: 'doctag',
    begin: /\/-[-!]/,
    end: /-\//,
    contains: [MULTI_LINE_COMMENT]
  };

  var LEAN_LEXICAL_MODES = [
    LEAN_RAW_STRING,
    hljs.QUOTE_STRING_MODE,
    LEAN_CHAR,
    LEAN_NUMBER,
    hljs.NUMBER_MODE,
    DASH_COMMENT,
    DOC_COMMENT,
    MULTI_LINE_COMMENT,
    QUOTED_SYMBOL,
    GUILLEMET_IDENTIFIER
  ];

  // Each variant closes only on its matching bracket; all three may nest.
  var LEAN_PARAMS = {
    className: 'params',
    variants: [
      { begin: /\(/, end: /\)/ },
      { begin: /\[/, end: /\]/ },
      { begin: /\{/, end: /\}/ }
    ],
    keywords: LEAN_KEYWORDS,
    contains: LEAN_LEXICAL_MODES.concat([LEAN_IDENTIFIER]),
    relevance: 0
  };
  LEAN_PARAMS.contains.push(LEAN_PARAMS);

  var ATTRIBUTE_DECORATOR = {
    className: 'meta',
    begin: '@\\[',
    end: '\\]'
  };

  var ATTRIBUTE_LINE = {
    className: 'meta',
    begin: '^attribute',
    end: '$'
  };

  var LEAN_DEFINITION = {
    className: 'theorem',
    begin: keywordBegin('abbrev abbreviation axiom class coinductive constant def definition elab example inductive instance lemma macro opaque structure syntax theorem'),
    end: /(:=|=>|:)/,
    excludeEnd: true,
    contains: LEAN_LEXICAL_MODES.concat([
      {
        className: 'keyword',
        begin: keywordBegin('extends')
      },
      {
        className: 'keyword',
        begin: keywordBegin('where'),
        endsParent: true
      },
      hljs.inherit(hljs.TITLE_MODE, {
        begin: LEAN_NAME_RE
      }),
      LEAN_PARAMS,
      {
        className: 'symbol',
        begin: /:=|=>|:/,
        endsParent: true
      },
    ]),
    keywords: LEAN_KEYWORDS,
    relevance: 0
  };

  var LEAN_FIELD_DECLARATION = {
    className: 'title',
    // Indentation must not scan through subsequent lines.
    begin: new RegExp('^[ \\t]*(?!(?:by|do|elab_rules|for|from|have|if|let|letI|match|return|show|suffices)(?!' +
      LEAN_IDENT_CONTINUE + '))' + LEAN_IDENT_RE.source + '(?=[ \\t]*:)', 'u'),
    relevance: 0
  };

  var LEAN_CONSTRUCTOR_DECLARATION = {
    className: 'title',
    begin: new RegExp('^[ \\t]*\\|[ \\t]*' + LEAN_IDENT_RE.source, 'u'),
    relevance: 0
  };

  return {
    name: "lean",
    unicodeRegex: true,
    keywords: LEAN_KEYWORDS,
    contains: LEAN_LEXICAL_MODES.concat([
      LEAN_DEFINITION,
      LEAN_FIELD_DECLARATION,
      LEAN_CONSTRUCTOR_DECLARATION,
      ATTRIBUTE_DECORATOR,
      ATTRIBUTE_LINE,
      LEAN_IDENTIFIER,
      { begin: /⟨/ } // relevance booster
    ])
  };
}
