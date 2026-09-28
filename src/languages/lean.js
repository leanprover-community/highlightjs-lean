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
    'abbreviation definition exposing hypothesis meta prelude reserve run_cmd theory';

  var COMMON_BUILT_INS =
    'Prop Sort Type at by_cases by_contra by_contradiction cases constructor contradiction ' +
    'exact exfalso intro intros left letI obtain refine rename revert right rfl rw simp simpa ' +
    'split subst symm trans';

  // Lean 3 compatibility: tactics and commands mostly seen in Lean 3 code.
  var LEAN3_BUILT_INS =
    'ac_refl ac_reflexivity all_goals any_goals apply apply_instance apply_with assume ' +
    'cc clear congr congr_arg congr_n continue delta destruct done dunfold eapply econstructor ' +
    'erw exacts existsi fail_if_success fapply finish funext generalize guard_hyp guard_target ' +
    'have induction injection injections introv left right rcases repeat rewrite rwa show skip ' +
    'solve1 specialize substs success_if_fail suffices swap transitivity trivial unfold unfold1';

  var LEAN_KEYWORDS = {
    $pattern: /#?\w+|λ|∀|Π|∃|:=?|=>/u,
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
      'λ ∀ ∃ Π'
  };

  var LEAN_IDENT_RE = /(?:[A-Za-z_\u00C0-\u02AF\u0370-\u03FF\u1F00-\u1FFF\u2100-\u214F][\w\u00C0-\u02AF\u0370-\u03FF\u1F00-\u1FFF\u2100-\u214F\u207F-\u209C\u1D62-\u1D6A\u2079!?']*|«[^»\n]+»)/u;

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
    variants: [
      { begin: /r"/, end: /"/ },
      { begin: /r#"/, end: /"#/ },
      { begin: /r##"/, end: /"##/ },
      { begin: /r###"/, end: /"###/ }
    ]
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
  var DOC_COMMENT = {
    className: 'doctag',
    begin: /\/--/,
    end: /-\//
  };
  var MULTI_LINE_COMMENT = hljs.COMMENT(/\/-/, /-\//, {
    contains: ['self']
  });

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
    beginKeywords: 'abbrev abbreviation axiom class coinductive constant def definition elab example inductive instance lemma macro opaque structure syntax theorem',
    end: /(:=|=>|:)/,
    excludeEnd: true,
    contains: [
      {
        className: 'keyword',
        begin: /extends/,
        contains: [
          {
            className: 'symbol',
            begin: /:=/,
            endsParent: true
          },
        ]
      },
      {
        className: 'keyword',
        begin: /\bwhere\b/,
        endsParent: true
      },
      hljs.inherit(hljs.TITLE_MODE, {
        begin: LEAN_IDENT_RE
      }),
      {
        className: 'params',
        begin: /[([{]/, end: /[)\]}]/, endsParent: false,
        keywords: LEAN_KEYWORDS,
      },
      {
        className: 'symbol',
        begin: /:=|=>|:/,
        endsParent: true
      },
    ],
    keywords: LEAN_KEYWORDS
  };

  var LEAN_FIELD_DECLARATION = {
    className: 'title',
    begin: /^\s*(?!(?:by|do|elab_rules|for|from|have|if|let|letI|match|return|show|suffices)\b)(?:[A-Za-z_\u00C0-\u02AF\u0370-\u03FF\u1F00-\u1FFF\u2100-\u214F][\w\u00C0-\u02AF\u0370-\u03FF\u1F00-\u1FFF\u2100-\u214F\u207F-\u209C\u1D62-\u1D6A\u2079!?']*|«[^»\n]+»)(?=\s*:)/mu,
    relevance: 0
  };

  var LEAN_CONSTRUCTOR_DECLARATION = {
    className: 'title',
    begin: /^\s*\|\s*(?:[A-Za-z_\u00C0-\u02AF\u0370-\u03FF\u1F00-\u1FFF\u2100-\u214F][\w\u00C0-\u02AF\u0370-\u03FF\u1F00-\u1FFF\u2100-\u214F\u207F-\u209C\u1D62-\u1D6A\u2079!?']*|«[^»\n]+»)/mu,
    relevance: 0
  };

  return {
    name: "lean",
    keywords: LEAN_KEYWORDS,
    contains: [
      LEAN_RAW_STRING,
      hljs.QUOTE_STRING_MODE,
      LEAN_CHAR,
      LEAN_NUMBER,
      hljs.NUMBER_MODE,
      DASH_COMMENT,
      DOC_COMMENT,
      MULTI_LINE_COMMENT,
      QUOTED_SYMBOL,
      GUILLEMET_IDENTIFIER,
      LEAN_DEFINITION,
      LEAN_FIELD_DECLARATION,
      LEAN_CONSTRUCTOR_DECLARATION,
      ATTRIBUTE_DECORATOR,
      ATTRIBUTE_LINE,
      { begin: /⟨/ } // relevance booster
    ]
  };
}
